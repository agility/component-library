# Evals: does an agent pick the right component?

Not built yet. This is the design.

## What runs

- **An instance** set up from [`../models/`](../models/), plus one disabled component and availability rules on
  two components, so the evals also catch an agent choosing something the page won't accept.
- **Prompts** (`prompts.jsonl`): about 40 "build a page that…" prompts and 15 "add this content…" prompts. Each
  lists the expected model per zone, the acceptable alternatives, and the models that would be **wrong**
  (a look-alike, a disabled component, one not allowed on that page model).
- **A runner** that gives an agent the prompt and the Agility MCP server's **read** tools only, asks it to answer
  with the components it would place, per zone, as JSON, and saves nothing to the instance.
- **A scorer**: right, acceptable alternative, wrong look-alike, or rule violation, per slot, totalled per run.

## Why

Every change to how models describe themselves to agents (descriptions, `agentGuidance`, usage counts) is
scored against the same prompts before and after, so we keep what helps and drop what doesn't.
