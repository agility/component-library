# Components to add

**Added 2026-11-05 as models** (no Next.js implementation yet): `CTABanner`, `FeatureGrid`, `MediaSplit`,
`AnnouncementBar`, `NewsletterSignup`, `ComparisonTable`, `Gallery`, `Steps`. Still to add: `RichText` (the
built-in Rich Text Area covers it today), `Timeline`, `VideoSection`.

What common block libraries have that this one doesn't yet, from a survey on 2026-11-05 of 11 libraries:
Tailwind Plus, Flowbite, HyperUI, Preline, Relume, Mantine UI, shadcnblocks, Aceternity / Magic UI, Payload's
website template, Sanity's page-builder template and Builder.io. "Libraries" is how many of the 11 have the
category.

| Candidate | Libraries | Typical fields | Easily confused with |
|---|---|---|---|
| `FeatureGrid` | 9 | heading, subheading, columns (2/3/4), items: icon or image, title, description, link | `BentoSection` (tiles of different sizes for showcase visuals); `StatsStrip` (number-led) |
| `CTABanner` | 9 | heading, body, primary and secondary CTA, background, alignment | `Hero` / `BackgroundHero` (open the page, once, H1); a CTA banner is mid- or end-page |
| `AnnouncementBar` | 8 | message, link, dismissible, variant, start and end date | `CTABanner` (a full section, not a one-line strip) |
| `MediaSplit` | 7 | eyebrow, heading, body, bullets, image or video, image position, CTA | `Hero` (once, at the top); a media split repeats down the page |
| `RichText` | 7 | heading, body, width | the built-in Rich Text Area |
| `NewsletterSignup` | 4 | heading, body, button text, list, consent text, success message | `ContactUs` (a multi-field enquiry form) |
| `Gallery` | 4 | heading, images with captions, layout, lightbox | `carousel` (one slide at a time) |
| `Timeline` | 4 | heading, items: date, title, description, image | `Steps` (a numbered process, not dated history) |
| `VideoSection` | 3 | heading, video, poster image, caption, autoplay | |
| `ComparisonTable` | 2 | heading, columns, rows: feature and values | `PricingTable` (plans and prices) |
| `Steps` | 1 | heading, steps: number, title, description, icon | `Timeline` |

Navigation and footers are in 8 of the 11, but in Agility they are site-wide content (the `Header` and
`Footer` content models), not components placed on a page.

**Naming:** our `Header` component is a section heading. Most libraries use "header" for site navigation, so
`SectionHeading` would be clearer for agents and people.
