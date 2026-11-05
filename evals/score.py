#!/usr/bin/env python3
"""
Score a run of evals/run.py.

    python3 evals/score.py results/<label> [--disabled FormBuilder,AgilityFormBuilder,...] [--json]

Per slot: right 2, acceptable alternative 1, missing 0, wrong look-alike -1. Slots are matched in order
against the components the agent chose, each chosen component used once. A chosen component in --disabled
(or "known" models from --known when given) counts as a rule violation.
"""
import argparse, glob, json, os

HERE = os.path.dirname(os.path.abspath(__file__))


def score_item(item, record, disabled, known):
    answer = record.get("answer") or {}
    if item["kind"] == "page":
        chosen = [c.get("referenceName", "") for c in answer.get("components", [])]
    else:
        chosen = [answer.get("referenceName", "")] if answer.get("referenceName") else []
    lower = lambda s: s.lower()
    used = [False] * len(chosen)
    slots = []
    for slot in item["slots"]:
        verdict, pick = "missing", None
        for bucket, name in (("right", "right"), ("acceptable", "acceptable"), ("wrong", "lookalike")):
            want = set(map(lower, slot[bucket]))
            for i, c in enumerate(chosen):
                if not used[i] and c.lower() in want:
                    used[i], verdict, pick = True, name, c
                    break
            if pick:
                break
        slots.append({"slot": slot["slot"], "verdict": verdict, "picked": pick})
    violations = [c for c in chosen if c.lower() in disabled or (known and c.lower() not in known)]
    return {"id": item["id"], "kind": item["kind"], "chosen": chosen, "slots": slots, "violations": violations,
            "error": bool(record.get("is_error")) or not answer}


POINTS = {"right": 2, "acceptable": 1, "missing": 0, "lookalike": -1}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("run_dir")
    ap.add_argument("--disabled", default="FormBuilder,AgilityFormBuilder")
    ap.add_argument("--known", help="comma-separated reference names that exist on the instance")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    disabled = set(x.strip().lower() for x in args.disabled.split(",") if x.strip())
    known = set(x.strip().lower() for x in args.known.split(",")) if args.known else None
    items = {json.loads(l)["id"]: json.loads(l) for l in open(os.path.join(HERE, "prompts.jsonl"))}

    scored = []
    for path in sorted(glob.glob(os.path.join(args.run_dir, "*.json"))):
        if os.path.basename(path).startswith("_"):
            continue
        record = json.load(open(path))
        if record["id"] in items:
            scored.append(score_item(items[record["id"]], record, disabled, known))

    totals = {k: 0 for k in POINTS}
    for s in scored:
        for slot in s["slots"]:
            totals[slot["verdict"]] += 1
    n_slots = sum(totals.values())
    points = sum(POINTS[k] * v for k, v in totals.items())
    summary = {
        "prompts": len(scored), "slots": n_slots, "errors": sum(s["error"] for s in scored),
        **totals, "violations": sum(len(s["violations"]) for s in scored),
        "score": points, "max": 2 * n_slots, "pct": round(100 * points / (2 * n_slots), 1) if n_slots else 0,
        "right_pct": round(100 * totals["right"] / n_slots, 1) if n_slots else 0,
    }

    if args.json:
        print(json.dumps({"summary": summary, "items": scored}, indent=2))
        return
    print(json.dumps(summary))
    for s in scored:
        bad = [x for x in s["slots"] if x["verdict"] != "right"]
        if bad or s["violations"] or s["error"]:
            print(f"  {s['id']}: " + "; ".join(f"{x['slot']}={x['verdict']}({x['picked']})" for x in bad)
                  + (f" VIOLATIONS {s['violations']}" if s["violations"] else "") + (" ERROR" if s["error"] else ""))


if __name__ == "__main__":
    main()
