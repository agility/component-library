# For agents

This repo describes a set of Agility CMS Component Models (the blocks a page is built from) and the Content
Models they use. Read it before choosing components for a page or a content model for new content.

## Choosing a component

1. Read [catalog.md](catalog.md) for the components grouped by job. Several look alike (four heroes, two
   testimonial components, two stats components, two logo strips); the catalog says how they differ.
2. Open the component's JSON in [`models/components/`](models/components/). When `agentGuidance` is set, follow
   it: `useWhen`, `avoidWhen`, `alternatives`, `placement`, `maxPerPage`, `fieldTips`.
3. The instance is the authority. If the instance says a component is disabled, deprecated or not allowed on a
   page model, don't use it, whatever this repo says.

## Choosing a content model

Same approach with [`models/content/`](models/content/). `listType` is `list` for a shared content list and
`item` for a single item.

## Field names

Field `name` is what the API and the code use. `label` is what an editor sees. A field whose `type` is
`Content` links to the content model named in `settings.ContentDefinition`.
