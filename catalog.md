# Catalog

The components grouped by the job they do. Where two components look alike, the difference is spelled out:
those are the choices agents most often get wrong.

## Variants: the same component with something layered on

Three components are **another component plus personalization or an experiment**. They render the same way and
have the same fields as their base, plus a list of variants. Use the base unless the page needs the variants.

| Variant | Base | What it adds |
|---|---|---|
| `PersonalizedBackgroundHero` | `BackgroundHero` | `personalizedHeroItems`: one `PersonalizedHeroItem` per audience (`Audience`), each with its own heading, description, CTAs and background. Visitors outside every audience see the base fields |
| `ABTestHero` | `Hero` | `ExperimentKey` and `Variants` (`ABTestHeroItem`): alternative versions for an A/B test |
| `PersonalizedLogoStrip` | `LogoStrip` | Logos come from `CustomerProfile` items, so the strip can show companies matched to the visitor |

## Page openers

| Component | Use it for | Look-alike |
|---|---|---|
| `BackgroundHero` | The top of a page: heading, description, up to two CTAs, over a colour gradient or a full background image | `Hero` puts the image beside the text, not behind it |
| `Hero` | Heading, description, one CTA, with an image beside the text (left or right) | `BackgroundHero`; `Header` when there's no image or CTA |
| `Header` | A section heading: heading with optional subheading and description. No image, no CTA | Not the site header: that's the `Header` **content model** (navigation) |

## Proof

| Component | Use it for | Look-alike |
|---|---|---|
| `Testimonial` | One quote from one `TestimonialItem` | `Testimonials` |
| `Testimonials` | Several quotes with a heading and an optional CTA | `Testimonial` |
| `StatsStrip` | A centred heading and description over one row of stat tiles | `CompanyStats` |
| `CompanyStats` | A section title, heading and description beside stats, with an optional background image | `StatsStrip` |
| `LogoStrip` | A row of customer or partner logos with an optional CTA | `PersonalizedLogoStrip` (variant) |

## Features and media

| Component | Use it for |
|---|---|
| `BentoSection` | A heading over a grid of cards (`BentoCard`), each with a picture: screenshots, graphics |
| `FeatureGrid` | A heading over a grid of equal items (`FeatureItem`): icon, title, one sentence. Capabilities, benefits, integrations |
| `MediaSplit` | Text beside an image, part-way down a page, repeated and alternating sides. Not the page opener (that's `Hero`) |
| `Steps` | A numbered sequence (`StepItem`): how it works, what happens next |
| `carousel` | A heading over slides (`carouselSlide`) shown one at a time |
| `Gallery` | Images with captions (`GalleryImage`), all visible at once in a grid. `carousel` shows one at a time |

## Commercial

| Component | Use it for | Look-alike |
|---|---|---|
| `PricingCards` | Plans side by side as cards (`PricingTier`) | `PricingTable` |
| `PricingTable` | A feature-by-plan comparison grid, from JSON | `PricingCards` |
| `ComparisonTable` | Products, options or competitors compared feature by feature (`ComparisonRow`) | `PricingTable` compares *plans* |
| `FrequentlyAskedQuestions` | Questions and answers (`FAQItem`) | |
| `ContactUs` | A contact form with address, phone and email | `NewsletterSignup` |
| `NewsletterSignup` | An email-only subscribe form for a mailing list | `ContactUs` is for enquiries |
| `CTABanner` | A short call to action part-way down or at the end of a page: heading, a line, one or two buttons | The heroes open a page, once |
| `AnnouncementBar` | A one-line, time-limited notice above the page content | `CTABanner` is a full section |

## Blog and people

| Component | Use it for | Look-alike |
|---|---|---|
| `PostListing` | A paged list of blog posts. No fields: it lists `Post` items | `PostDetails` |
| `PostDetails` | One blog post, on the post's own page (a dynamic page) | `PostListing` |
| `TeamListing` | People, from `Author` items | |
