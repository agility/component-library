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
| `min-dev-noguidance-haiku-{1,2,3}` (20 prompts, dev) | 2026-11-10 | Haiku ×3 | 2.13.0 (PR preview) | none | 30.0/33 avg | 57.0/66 avg | 2.67 | 0 |
| `min-dev-noguidance-sonnet-1` | 2026-11-10 | Sonnet | 2.13.0 (PR preview) | none | 30/33 | 57/66 | 3 | 0 |
| `min-dev-guidance-haiku-{1,2,3}` | 2026-11-10 | Haiku ×3 | 2.13.0 (PR preview) | blind-written | 31/33 (all three) | 60/66 (all three) | 2 | 0 |
| `min-dev-guidance-sonnet-1` | 2026-11-10 | Sonnet | 2.13.0 (PR preview) | blind-written | 31/33 | 60/66 | 2 | 0 |
| `min-dev-ownerfix-haiku-{1,2,3}` (6 prompts) | 2026-11-10 | Haiku ×3 | 2.13.0 (PR preview) | blind + 2 owner fixes | 12/12 (all three) | 24/24 | 0 | 0 |

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

### The minimum guidance eval (2026-11-10, dev)

**Set-up.** A dev copy of the eval instance (a dev test-instance lease cloned from the dev demo site, plus the eight
thin-named components and the disabled `LegacyHero`, copied from the production eval instance). **20 prompts:** the 12
that had ever failed in the runs above (p01, p06, p07, p18, p25, p26, p29, p52, p58, c01, c11, c12) and 8 controls that
always passed and use the same components (p02, p10, p17, p41, p44, p45, p47, p49). MCP 2.13.0 (PR #90's dev preview).
**The guidance was written blind:** a separate headless Claude session saw only the models' names, descriptions and
fields ([`writer-input-catalog.json`](../results/min-dev-guidance-inputs/writer-input-catalog.json)), never the prompts,
and wrote guidance for 32 models ([`guidance-blind.json`](../results/min-dev-guidance-inputs/guidance-blind.json)), as a
customer's developer would. `LegacyHero` was deprecated in favour of `Hero`.

**Results.**

| | Hard 12: score | Hard 12: look-alikes | Controls: score | Violations |
|---|---|---|---|---|
| Haiku, no guidance (avg of 3) | 41.0/50 | 2.67 | 16/16 | 0 |
| Haiku, guidance (avg of 3) | 44.0/50 | 2.00 | 16/16 | 0 |
| Sonnet, no guidance | 41/50 | 3 | 16/16 | 0 |
| Sonnet, guidance | 44/50 | 2 | 16/16 | 0 |

- **Guidance fixed the openers.** The thin "Banner" no longer opens a page (p01: 2 of 3 Haiku runs wrong → 0 of 3),
  and the plain title on a pricing page is chosen every time (p26 opener).
- **Guidance made the choice deterministic.** All three Haiku runs and the Sonnet run scored exactly the same with
  guidance; without it, Haiku ranged 55–60.
- **The two misses left are the guidance's own call.** Reading only the fields, the writer saw that `PricingTable`
  is driven by a JSON field and steered plan-feature grids to `ComparisonTable`; every run followed it (p18, p26
  compare). After correcting just those two models' guidance, as a site owner would on seeing it
  ([`guidance-owner-fix.json`](../results/min-dev-guidance-inputs/guidance-owner-fix.json); not blind), the six
  pricing and comparison prompts scored 12/12 in all three runs, competitor comparisons included.
- **The disabled form builder is no longer chosen even without guidance:** MCP 2.13.0 labels disabled models.

**Against the bar set beforehand** (Haiku look-alikes on the hard set down by half, no violations, controls within ±2):
look-alikes fell by a quarter (2.67 → 2.00), so the bar was **not met as written**; violations 0 and controls unchanged
were met. Every look-alike left came from what the guidance said, and fixing two entries cleared them, so agents
follow guidance closely: it's as good as what's written. That argues for Draft with AI plus a person's review, and for
reference guidance in our own starters.

**Size.** The `get_component_models` text on this instance: 2,883 bytes with no guidance (34 components, about 85 bytes
each); 7,425 bytes with guidance on 23 of them, about 197 bytes more per guided component. Fully guided, that's about
28 KB (~7k tokens) at 100 components and 55 KB (~14k tokens) at 200, against 8 KB and 17 KB without.

**Found while setting up** (fixed in neither PR yet): the Management API refuses every guidance write (400 "An item
with the same key has already been added. Key: Header") on an instance where a component and a content model share a
reference name; the dev copy's `Header` content model was renamed `SiteHeader` to run the eval. MCP's
`save_model_guidance` rejects `maxPerPage: null`, though the API accepts it.

