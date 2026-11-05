# Next.js performance rules for these components

Every Next.js implementation in this library follows these rules. They come from building agilitycms.com on
Next.js 16 (App Router, Cache Components) to a Lighthouse 100 target, where they were measured, not assumed.

## Rendering

1. **Every page has a static shell.** Pages are statically generated with tag-based revalidation. A component
   in the page's critical path never reads `headers()`, `cookies()` or `searchParams`, and doesn't rely on a
   `<Suspense>` boundary or `useSearchParams`: React reveals a boundary on a timer that a busy phone holds back,
   which costs seconds of LCP. Browser-only state (a search query) is read from `window.location` in a client
   leaf.
2. **Server Components by default.** A Client Component is a leaf (`*.client.tsx`), never a provider wrapped
   around the tree.

## JavaScript

3. **Budget: 200 KB gzipped first-load JS per route**, and a PR fails if a route grows more than 5 KB. React 19
   and the Next.js client runtime alone are about 147 KB, so a component has little room.
4. **Put lazy boundaries in a client module.** A CMS site renders every page through one catch-all route that
   imports the whole component registry, so every Client Component reachable from it lands in first-load JS,
   rendered or not. `next/dynamic` in a Server Component does not split them. `next/dynamic` or `React.lazy`
   inside a `"use client"` module does. Keep one `lazy.client.tsx` that holds the boundaries for interactive
   components (carousels, comparison charts, forms, video players); SSR stays on, so the HTML is unchanged, and
   the chunk is preloaded only on pages that render the component.
5. **Better still, ship no JS.** An FAQ accordion is native `<details>` in a Server Component, not a client
   accordion.
6. **Never import a constant from a `"use client"` module into a Server Component.** It makes the whole module
   a client reference of the route, and it stays in first-load JS even behind a lazy boundary. Put shared
   constants in a plain module.
7. **Interaction-only UI loads on demand:** render the trigger on the server, load the dialog or drawer on idle,
   hover, focus or click.
8. **Third-party scripts never load at startup.**

## Images (the biggest LCP risk)

9. Every CMS image has explicit `width` and `height` (or an aspect-ratio box): **no layout shift from images**.
   Emit 1x/2x srcsets per breakpoint so hi-DPI screens are sharp without oversizing 1x screens.
10. **One LCP image per page** gets `loading="eager"` and `fetchpriority="high"`, usually the hero's. Everything
    else is lazy. Image-bearing components take a `priority?: boolean` prop so the page decides.
11. Request `?format=auto` (AVIF/WebP) from the Agility CDN with `sizes`/`srcset` widths that match the real
    layout. **Cap every width at the asset's own width:** the CDN upscales.
12. **No SVG over 200 KB.** The CDN serves SVG as is (no compression, no format conversion), and some design
    tools wrap a photo inside an SVG. Photos are JPEG or PNG; animated GIFs over 200 KB become MP4 `<video>`.

## Fonts, CSS and layout shift

13. One variable font, self-hosted with `next/font`, `display: swap`, subset to what you use. No icon fonts:
    icons are inline SVG.
14. Tailwind CSS, no runtime CSS-in-JS.
15. Reserve space for everything that loads late: menus overlay rather than push, embeds and iframes sit in
    fixed aspect-ratio wrappers, a cookie banner is `position: fixed`.

## Every component, always

Accessible, SEO and AEO friendly, correct at every screen width, and sharp on hi-DPI screens. These are
acceptance criteria, not polish.
