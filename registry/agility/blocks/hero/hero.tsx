import type { ImageField, UnloadedModuleProps, URLField } from "@agility/nextjs"
import { AgilityPic } from "@/components/agility/agility-pic"
import { HeroBlock } from "@/components/agility/hero/hero-block"
import { getContentItem } from "@/lib/agility/get-content-item"
import { agilityComponent, agilityField } from "@/lib/agility/web-studio"

/** The Hero component model's fields, as the Content Fetch API returns them. */
interface IHero {
	heading: string
	description?: string
	callToAction?: URLField
	image?: ImageField
	imagePosition?: "left" | "right"
}

/**
 * Agility component `Hero`. Register it under that reference name in your component index.
 *
 * Its image is treated as the page's LCP image (eager, high fetch priority): a Hero opens the page, once.
 * Pass `priority={false}` if you place it lower down.
 */
export async function Hero({ module, languageCode, isPreview, priority = true }: UnloadedModuleProps & { priority?: boolean }) {
	const { fields, contentID } = await getContentItem<IHero>({
		contentID: module.contentid,
		languageCode,
		preview: isPreview,
	})

	return (
		<HeroBlock
			heading={fields.heading}
			description={fields.description}
			cta={fields.callToAction?.href ? fields.callToAction : undefined}
			mediaPosition={fields.imagePosition === "left" ? "left" : "right"}
			decorate={{ root: agilityComponent(contentID), field: agilityField }}
			media={
				fields.image?.url ? (
					<AgilityPic
						image={fields.image}
						priority={priority}
						fallbackWidth={640}
						sources={[
							{ media: "(min-width: 1280px)", width: 640 },
							{ media: "(min-width: 640px)", width: 640 },
							{ media: "(max-width: 639px)", width: 480 },
						]}
						className="h-auto w-full rounded-lg"
					/>
				) : undefined
			}
		/>
	)
}
