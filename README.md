# Agility component library

Ready-made Agility CMS **Component Models** and **Content Models**, each with **agent guidance**: a short,
structured note that tells an AI agent when to use the model, when not to, and what to use instead.

Point your agent at this repo (start with [AGENTS.md](AGENTS.md)) and it can build pages from components it
understands, in an instance set up from these models.

| Folder | What's in it |
|---|---|
| [`models/components/`](models/components/) | One JSON file per Component Model: fields, description and `agentGuidance` |
| [`models/content/`](models/content/) | One JSON file per Content Model those components use |
| [`registry/`](registry/) and [`registry.json`](registry.json) | Next.js source for each component, installable with the shadcn CLI |
| [`frameworks/nextjs/`](frameworks/nextjs/) | How the Next.js components are built, and which are ported yet |
| [`evals/`](evals/) | Prompts and a runner that measure how well an agent picks components |
| [`catalog.md`](catalog.md) | The components grouped by job, with the look-alikes side by side |
| [`roadmap.md`](roadmap.md) | Components to add, from a survey of other block libraries |

## Status

**Early.** Twenty components come from Agility's 2026 Next.js demo site and eight were added from a survey of
other block libraries ([roadmap.md](roadmap.md)). **Every component has `agentGuidance` (version 1)**; content
models don't yet. Agility is adding a place to store guidance on models; until that ships, an agent can read it
here. It will be changed by what the [evals](evals/) show. The model JSON format is described in
[models/README.md](models/README.md).

## Installing a component

This repo is a [shadcn registry](https://ui.shadcn.com/docs/registry). In a Next.js app set up for shadcn
(`npx shadcn@latest init`):

```bash
npx shadcn@latest add agility/component-library/hero
```

That adds the component's source to your app (a presentation-only block and its Agility wrapper), the shared
Agility data layer and image component, the npm packages they need, the Agility environment variable names
in `.env.local`, and the component's model definition in `agility/models/`. The code is yours to change.

Available now: `hero`. The other components are being ported; see [frameworks/nextjs/](frameworks/nextjs/).

Creating the model in your Agility instance is a separate step for now: use the definition in
`agility/models/` with the [Agility MCP server](https://github.com/agility/mcp-server) or the Agility CLI.

## License

[MIT](LICENSE).
