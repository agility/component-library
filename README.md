# Agility component library

Ready-made Agility CMS **Component Models** and **Content Models**, each with **agent guidance**: a short,
structured note that tells an AI agent when to use the model, when not to, and what to use instead.

Point your agent at this repo (start with [AGENTS.md](AGENTS.md)) and it can build pages from components it
understands, in an instance set up from these models.

| Folder | What's in it |
|---|---|
| [`models/components/`](models/components/) | One JSON file per Component Model: fields, description and `agentGuidance` |
| [`models/content/`](models/content/) | One JSON file per Content Model those components use |
| [`frameworks/nextjs/`](frameworks/nextjs/) | How each component renders in Next.js. Other frameworks will follow |
| [`evals/`](evals/) | Prompts and a runner that measure how well an agent picks components |
| [`catalog.md`](catalog.md) | The components grouped by job, with the look-alikes side by side |
| [`roadmap.md`](roadmap.md) | Components to add, from a survey of other block libraries |

## Status

**Early.** Twenty components come from Agility's 2026 Next.js demo site and eight were added from a survey of
other block libraries ([roadmap.md](roadmap.md)). **Every component has `agentGuidance` (version 1)**; content
models don't yet. Agility is adding a place to store guidance on models; until that ships, an agent can read it
here. It will be changed by what the [evals](evals/) show. The model JSON format is described in
[models/README.md](models/README.md).

## Installing into an instance

Not yet. An install script that creates these models in an Agility instance (through the Agility CLI or the
Management API) comes next. Until then the models can be created by hand or by an agent through the
[Agility MCP server](https://github.com/agility/mcp-server).

## License

[MIT](LICENSE).
