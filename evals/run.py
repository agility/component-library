#!/usr/bin/env python3
"""
Run the component-selection evals: give an agent each prompt, let it read the instance through the Agility MCP
server (read tools only), and record which components or content model it would choose. Nothing is saved to
the instance.

    export AGILITY_EVAL_GUID=<instance guid>        # an instance set up from ../models
    export AGILITY_EVAL_TOKEN=<Agility token or PAT> # read access to that instance is enough
    python3 evals/run.py --label baseline-mcp-2.11.0
    python3 evals/score.py results/baseline-mcp-2.11.0

Needs the Claude Code CLI (`claude`), signed in. Each prompt runs in a fresh session from an empty folder,
with Claude Code's built-in tools off and only the Agility read tools allowed.
"""
import argparse, json, os, subprocess, sys, tempfile, time
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
READ_TOOLS = [
    "get_component_models", "get_component_model_details", "get_content_models", "get_content_model_details",
    "get_page_models", "get_containers", "get_sitemaps", "get_sitemap", "get_page", "get_content_items",
    "search_instance", "get_locales",
]

PAGE_SCHEMA = {
    "type": "object",
    "properties": {"components": {"type": "array", "items": {"type": "object", "properties": {
        "referenceName": {"type": "string"}, "purpose": {"type": "string"}}, "required": ["referenceName", "purpose"]}}},
    "required": ["components"],
}
CONTENT_SCHEMA = {
    "type": "object",
    "properties": {"referenceName": {"type": "string"}, "reason": {"type": "string"}},
    "required": ["referenceName", "reason"],
}

SYSTEM = """You are composing pages and content in an Agility CMS instance for a marketer.
Use the Agility tools to look at what the instance offers before you decide. Don't save anything.
Choose only from what exists on the instance, by its reference name."""

PAGE_TASK = """Instance: {guid}

Request: {prompt}

Decide which Component Models you would place on the page for this request, in order from top to bottom.
Answer with each component's reference name and the part of the request it covers."""

CONTENT_TASK = """Instance: {guid}

Request: {prompt}

Decide which Content Model the new content belongs in. Answer with its reference name."""


def run_one(item, args, mcp_config, workdir):
    kind = item["kind"]
    task = (PAGE_TASK if kind == "page" else CONTENT_TASK).format(guid=args.guid, prompt=item["prompt"])
    schema = PAGE_SCHEMA if kind == "page" else CONTENT_SCHEMA
    cmd = [
        args.claude, "-p", task,
        "--model", args.model,
        "--system-prompt", SYSTEM,
        "--tools", "",
        "--setting-sources", "",
        "--mcp-config", mcp_config, "--strict-mcp-config",
        "--allowedTools", *[f"mcp__agility__{t}" for t in READ_TOOLS],
        "--json-schema", json.dumps(schema),
        "--output-format", "json",
        "--no-session-persistence",
        "--max-turns", str(args.max_turns),
    ]
    started = time.time()
    proc = subprocess.run(cmd, cwd=workdir, capture_output=True, text=True, timeout=args.timeout)
    record = {"id": item["id"], "kind": kind, "seconds": round(time.time() - started, 1)}
    try:
        out = json.loads(proc.stdout)
        record["is_error"] = out.get("is_error")
        record["cost_usd"] = out.get("total_cost_usd")
        record["num_turns"] = out.get("num_turns")
        record["answer"] = out.get("structured_output")
        if record["answer"] is None:
            record["raw"] = out.get("result")
    except json.JSONDecodeError:
        record["is_error"] = True
        record["raw"] = (proc.stdout or proc.stderr)[-2000:]
    return record


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--label", required=True, help="results/<label>/ is written")
    ap.add_argument("--model", default="sonnet")
    ap.add_argument("--mcp-url", default="https://mcp.agilitycms.com/api/mcp")
    ap.add_argument("--only", help="comma-separated prompt ids")
    ap.add_argument("--parallel", type=int, default=4)
    ap.add_argument("--max-turns", type=int, default=12)
    ap.add_argument("--timeout", type=int, default=600)
    ap.add_argument("--claude", default=os.environ.get("CLAUDE_BIN", "claude"))
    args = ap.parse_args()

    args.guid = os.environ.get("AGILITY_EVAL_GUID")
    token = os.environ.get("AGILITY_EVAL_TOKEN")
    if not args.guid or not token:
        sys.exit("Set AGILITY_EVAL_GUID and AGILITY_EVAL_TOKEN.")

    items = [json.loads(l) for l in open(os.path.join(HERE, "prompts.jsonl"))]
    if args.only:
        wanted = set(args.only.split(","))
        items = [i for i in items if i["id"] in wanted]

    out_dir = os.path.join(HERE, "..", "results", args.label)
    os.makedirs(out_dir, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmp:
        mcp_config = os.path.join(tmp, "mcp.json")
        with open(mcp_config, "w") as f:
            json.dump({"mcpServers": {"agility": {"type": "http", "url": args.mcp_url,
                                                  "headers": {"Authorization": f"Bearer {token}"}}}}, f)
        workdir = os.path.join(tmp, "cwd")
        os.makedirs(workdir)

        with ThreadPoolExecutor(max_workers=args.parallel) as pool:
            for record in pool.map(lambda i: run_one(i, args, mcp_config, workdir), items):
                with open(os.path.join(out_dir, f"{record['id']}.json"), "w") as f:
                    json.dump(record, f, indent=2)
                status = "ERROR" if record.get("is_error") or record.get("answer") is None else "ok"
                print(f"{record['id']}  {status}  {record['seconds']}s  ${record.get('cost_usd') or 0:.3f}", flush=True)

    meta = {"label": args.label, "model": args.model, "mcp_url": args.mcp_url, "prompts": len(items),
            "ran_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
    with open(os.path.join(out_dir, "_run.json"), "w") as f:
        json.dump(meta, f, indent=2)


if __name__ == "__main__":
    main()
