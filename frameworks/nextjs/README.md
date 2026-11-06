# Next.js

Install a component with the shadcn CLI (see the [main README](../README.md#installing-a-component)). Its
source lives in [`../registry/agility/`](../registry/agility/) and is listed in
[`../registry.json`](../registry.json).

## How a component is built

Two layers, so the markup lives in exactly one place:

| File | What it does |
|---|---|
| `blocks/<name>/<name>-block.tsx` | Presentation only: props in, markup out. No Agility imports. Styled with shadcn theme tokens (`bg-muted`, `text-muted-foreground`, `buttonVariants`), so it takes on your theme |
| `blocks/<name>/<name>.tsx` | The Agility wrapper: fetches the content item, maps its fields onto the block's props, builds media with `AgilityPic`, and adds the Web Studio attributes. Register it in your component index under the model's reference name |

Shared items, installed automatically as dependencies:

| Item | What it is |
|---|---|
| `agility-lib` | `getAgilitySDK`, a cached `getContentItem` (Next.js Cache Components; needs `cacheComponents: true`), and the Web Studio helpers |
| `agility-pic` | A `<picture>` for Agility images with explicit width and height, 1x/2x sources capped at the asset's width, SVGs untouched, and `priority` for the LCP image |

Every component follows [PERFORMANCE.md](PERFORMANCE.md). Wrappers take the standard `UnloadedModuleProps`
from `@agility/nextjs`, so they work with Agility's Next.js starters.

## Ported so far

| Component | Status | Source it was ported from |
|---|---|---|
| `hero` | ✅ installable | the 2026 agilitycms.com rebuild, mapped onto this library's Hero model |
| the other 27 | to do | the 2026 site where it has an equivalent; otherwise [the Next.js demo site](https://github.com/agility/nextjs-demo-site-2026) at `83a9d8a`, refactored to the two layers above |

## Tested

`npx shadcn@latest add agility/component-library/hero` into a new `create-next-app` (Next.js 16.4,
shadcn 4.23): installs 7 files, 3 environment variable names and the model file; `tsc` and `next build` pass,
and the page prerenders as static. The image renders with `loading="eager"`, `fetchpriority="high"`, a
1x/2x `srcset` and explicit `width`/`height`.
