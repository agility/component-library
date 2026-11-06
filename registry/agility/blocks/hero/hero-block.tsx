import type { ReactNode } from "react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface HeroLink {
	href: string
	text: string
	/** "_blank" opens a new window. */
	target?: string
}

export interface HeroBlockProps {
	heading: string
	description?: string
	cta?: HeroLink
	/** The image (or video) beside the text. Built by the caller, so this block stays CMS-free. */
	media?: ReactNode
	/** Which side the media is on from the `lg` breakpoint. Below it, the text always comes first. */
	mediaPosition?: "left" | "right"
	/** Attributes for the root element and for each field's element (Web Studio uses these). */
	decorate?: { root?: object; field?: (name: string) => object }
}

/**
 * The page's opening section: a headline, a short paragraph and one button, with media beside the text.
 * Presentation only; `hero.tsx` maps Agility content onto it. The text comes first in the DOM whichever
 * side the media is on, so screen readers and crawlers read the headline first.
 */
export function HeroBlock({ heading, description, cta, media, mediaPosition = "right", decorate }: HeroBlockProps) {
	const field = decorate?.field ?? (() => ({}))
	const mediaLeft = mediaPosition === "left"

	return (
		<section {...decorate?.root} className="border-b border-border">
			<div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
				<div className={cn(mediaLeft && "lg:order-2")}>
					<h1 {...field("heading")} className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
						{heading}
					</h1>
					{description && (
						<p {...field("description")} className="mt-4 max-w-xl text-lg text-muted-foreground">
							{description}
						</p>
					)}
					{cta?.href && (
						<div className="mt-8">
							{cta.target === "_blank" ? (
								<a {...field("callToAction")} href={cta.href} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: "lg" })}>
									{cta.text}
								</a>
							) : (
								<Link {...field("callToAction")} href={cta.href} className={buttonVariants({ size: "lg" })}>
									{cta.text}
								</Link>
							)}
						</div>
					)}
				</div>
				<div {...field("image")} className={cn(mediaLeft && "lg:order-1")}>
					{media ?? <div aria-hidden="true" className="aspect-video w-full rounded-lg border border-border bg-muted" />}
				</div>
			</div>
		</section>
	)
}
