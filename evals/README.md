# Evals: does an agent pick the right component?

Every change to how models describe themselves to agents (descriptions, `agentGuidance`, deprecation, usage
counts) is scored against the same prompts before and after, so we keep what helps and drop what doesn't.

## What's here

- **[`prompts.jsonl`](prompts.jsonl):** 60 "build a page that…" prompts and 19 "add this content…" prompts,
  121 scored slots. A prompt describes what the page needs in plain words and never names a component. Each
  slot lists the **right** model, **acceptable** alternatives, and **wrong** look-alikes (another hero, the
  single quote instead of the wall of quotes, a disabled legacy form).
- **[`run.py`](run.py):** gives an agent each prompt in a fresh Claude Code session, with only the Agility MCP
  server's **read** tools, and asks for the components it would place, top to bottom, or the content model it
  would use, as JSON. It saves nothing to the instance.
- **[`score.py`](score.py):** per slot, right 2, acceptable 1, missing 0, look-alike −1, matched in order. A
  chosen component that's disabled on the instance counts as a rule violation.

## Running it

```bash
export AGILITY_EVAL_GUID=<instance set up from ../models>
export AGILITY_EVAL_TOKEN=<Agility token or PAT with read access>
python3 evals/run.py --label <name>             # --model sonnet by default; --only p01,c03 for a subset
python3 evals/score.py results/<name>
```

It needs the Claude Code CLI, signed in. A full run is 55 sessions, about 10 seconds and $0.15 each.

**Isolation.** Each session runs from an empty folder with Claude Code's built-in tools off, project and local
settings off, and only the Agility read tools allowed. The signed-in user's own global instructions still load
(a fully bare session needs an API key). Compare runs made by the same person.

## The instance

A copy of the instance the models in [`../models/`](../models/) came from, so its pages and content show how
the components are really used. On top of that, `LegacyHero`: Hero's fields and description, disabled, as
legacy duplicates usually are. Choosing it, or the two disabled legacy form builders, is a rule violation.
Availability rules (where a component may go) come later: this instance has one page model and one zone.

It also has the library's eight newer components (`CTABanner`, `FeatureGrid`, `MediaSplit`, `AnnouncementBar`,
`NewsletterSignup`, `ComparisonTable`, `Gallery`, `Steps`) with the thin names and descriptions in
[`instance-overrides.json`](instance-overrides.json) ("Banner", "Banner with heading and buttons."), as a
customer's catalog often has them. That's where guidance has something to fix.

## Scores

| Run | Date | Model | MCP | Guidance | Right | Score | Look-alikes | Violations |
|---|---|---|---|---|---|---|---|---|
| `baseline-mcp-2.11.0` (first 55 prompts, clean catalog) | 2026-11-05 | Sonnet | 2.11.0 | none | 82/84 (97.6%) | 163/168 | 1 | 1 |
| `baseline-lookalikes-mcp-2.11.0` | 2026-11-05 | Sonnet | 2.11.0 | none | 113/121 (93.4%) | 226/242 | 4 | 1 |
| `baseline-lookalikes-mcp-2.11.0-haiku` | 2026-11-05 | Haiku | 2.11.0 | none | 108/121 (89.3%) | 209/242 | 10 | 2 |
| `quickwins-mcp-2.12.0-preview` | 2026-11-05 | Sonnet | 2.12.0 (PR preview) | none | 112/121 (92.6%) | 223/242 | 4 | 0 |
| `quickwins-mcp-2.12.0-preview-haiku` | 2026-11-05 | Haiku | 2.12.0 (PR preview) | none | 109/121 (90.1%) | 216/242 | 6 | 1 |

**Baseline notes.** The one violation is the core gap: asked for a registration form, the agent chose a
*disabled* legacy form builder, because MCP 2.11.0 doesn't say a model is disabled. The other miss named the
`Posts` container instead of the `Post` model. Otherwise the agent chose right, because this instance's models
have clear names and good descriptions. **That's a ceiling:** on a catalog this clean there's little left for
guidance to fix, so the next runs need a harder catalog (more look-alikes, thinner descriptions), which is
what customers' catalogs look like.

**With the look-alikes,** both models mix up comparison tables (plans vs competitors), and Haiku opens pages
with the thinly described "Banner" (`CTABanner`) or "Image + Text" (`MediaSplit`) five times and picks the
disabled form builder twice. Those are the mistakes agent guidance and the disabled label are meant to fix.

**Quick wins** (MCP 2.12.0 lists descriptions and labels disabled models; no guidance yet): Sonnet stopped
choosing the disabled form builder; Haiku chose it once instead of twice, and fell for 6 look-alikes instead
of 10. The other changes are a point or two either way, which one run of each can't tell from noise. **From
here, run each configuration three times and compare the averages.**

