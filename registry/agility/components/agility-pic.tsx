import type { FC } from "react"
import type { ImageField } from "@agility/nextjs"

/** True when the URL points at an SVG, which the Image API's format=auto would rasterize. */
const isSvgUrl = (url: string | null | undefined): boolean => {
	if (!url) return false
	try {
		return new URL(url, "https://example.com").pathname.toLowerCase().endsWith(".svg")
	} catch {
		return url.toLowerCase().includes(".svg")
	}
}

// An art-directed <picture> against the Agility Image API: explicit width and height (no layout shift),
// 1x/2x sources capped at the asset's own width (the CDN upscales), SVGs untouched, and `priority` for
// the page's LCP image. Use it instead of AgilityPic from @agility/nextjs until those fixes ship there.

type AgilityImageSourceProps = Omit<
	React.DetailedHTMLProps<React.SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>,
	"srcSet"
>

export interface AgilityPicProps {
	/** An image from Agility. */
	image: ImageField
	/**
	 * The fallback width of the image output in the <img> tag after the sources.
	 * Renders if no sources match or the browser doesn't support <picture>.
	 */
	fallbackWidth?: number
	/** Alt text override — defaults to the image label from Agility. */
	alt?: string
	/** Per-media-selector sources (width/height on each source drive the Image API). */
	sources?: AgilityImageSourceProps[]
	/** true = this is the LCP image: eager + fetchpriority=high (first module only). */
	priority?: boolean
	/** Class for the <img>; sources inherit it. */
	className?: string
	/**
	 * The `sizes` attribute, for an image whose rendered width depends on the layout
	 * (a card in a responsive grid). With it, the fallback <img> gets a WIDTH-based
	 * srcset, so the browser picks a file for the size actually drawn; without it,
	 * the 1x/2x pair for `fallbackWidth`, which suits a fixed-width image.
	 */
	sizes?: string
}

/**
 * `sizes` for media in a detail page's `max-w-5xl` column (case study, post, guide,
 * partner): full width on a phone, 64rem at most. Without it a phone at 1.75x
 * took the 2x file of a 1024 fallback, 1880-2048px, for a ~400px-wide image.
 */
export const DETAIL_MEDIA_SIZES = "(min-width: 64rem) 64rem, 100vw"

/** Widths offered in a `sizes` srcset. */
const WIDTH_LADDER = [320, 480, 640, 960, 1280, 1600]

/**
 * Outputs a <picture> tag using the Agility Image API (?format=auto&w=).
 * SVGs are passed through untouched (format=auto would rasterize them).
 * Width/height are set from CMS-stored dimensions to prevent CLS.
 */
export const AgilityPic: FC<AgilityPicProps> = ({ image, alt, priority, className, sources, fallbackWidth, sizes }) => {
	if (!image?.url) return null

	let src = image.url
	let imgHeight: number | undefined = undefined
	let imgWidth: number | undefined = undefined

	const isSvg = isSvgUrl(image.url)
	const imageWidth = image.width ?? 0
	const imageHeight = image.height ?? 0

	if (!isSvg && fallbackWidth !== undefined && fallbackWidth > 0) {
		src = `${image.url}?format=auto&w=${fallbackWidth}`
	}

	if (fallbackWidth !== undefined && fallbackWidth > 0 && imageWidth > 0 && imageHeight > 0) {
		imgWidth = fallbackWidth
		imgHeight = Math.round(fallbackWidth / (imageWidth / imageHeight))
	}

	// hi-DPI: cap the 2x variant at the original asset width so we never upsize
	const cappedWidth = (w: number) => (imageWidth > 0 ? Math.min(w, imageWidth) : w)

	/** "url 1x, url@2x 2x" srcset for a target CSS width (raster images only) */
	const dprSrcSet = (w: number) => {
		const w1 = cappedWidth(w)
		const w2 = cappedWidth(w * 2)
		const oneX = `${image.url}?format=auto&w=${w1} 1x`
		return w2 > w1 ? `${oneX}, ${image.url}?format=auto&w=${w2} 2x` : oneX
	}

	/**
	 * Width-descriptor srcset for `sizes`. Capped at the asset's native width,
	 * because the Agility CDN UPSCALES: `w=4000` on a 940px original returns a
	 * 4000px file (measured 2026-10-09, 7x the bytes). With no native width known,
	 * the cap is twice the fallback width, the same ceiling the 1x/2x pair has.
	 */
	const widthSrcSet = () => {
		const cap = imageWidth > 0 ? imageWidth : (fallbackWidth ?? 640) * 2
		const top = Math.min(cap, WIDTH_LADDER[WIDTH_LADDER.length - 1])
		const widths = [...new Set([...WIDTH_LADDER.filter((w) => w < top), top])]
		return widths.map((w) => `${image.url}?format=auto&w=${w} ${w}w`).join(", ")
	}

	const imgSrcSet = isSvg || !fallbackWidth ? undefined : sizes ? widthSrcSet() : dprSrcSet(fallbackWidth)

	return (
		<picture>
			{sources?.map((source, index) => {
				let srcSet = image.url
				const sw = Number(source.width)
				const sh = Number(source.height)
				const key = `${image.url}-${index}`

				if (!isSvg && sw > 0 && !(sh > 0)) {
					// width-based source → emit 1x/2x pair for hi-DPI screens
					srcSet = dprSrcSet(sw)
				} else if (!isSvg && (sw > 0 || sh > 0)) {
					// explicit width and/or height — a fixed crop. Emit a 1x/2x pair for
					// hi-DPI, offering 2x only when the source asset is large enough for the
					// doubled crop (so we never upscale). Dimensions cap at the native size.
					const cropUrl = (w: number, h: number) =>
						`${image.url}?format=auto${w > 0 ? `&w=${w}` : ``}${h > 0 ? `&h=${h}` : ``}`
					const w1 = sw > 0 ? cappedWidth(sw) : 0
					const h1 = sh > 0 && imageHeight > 0 ? Math.min(sh, imageHeight) : sh
					const canDouble =
						(sw === 0 || imageWidth === 0 || sw * 2 <= imageWidth) &&
						(sh === 0 || imageHeight === 0 || sh * 2 <= imageHeight)
					srcSet = canDouble
						? `${cropUrl(w1, h1)} 1x, ${cropUrl(sw > 0 ? sw * 2 : 0, sh > 0 ? sh * 2 : 0)} 2x`
						: cropUrl(w1, h1)
				}

				return <source key={key} {...source} srcSet={srcSet} />
			})}

			<img
				loading={priority ? "eager" : "lazy"}
				fetchPriority={priority ? "high" : undefined}
				src={src}
				srcSet={imgSrcSet}
				sizes={imgSrcSet && sizes ? sizes : undefined}
				alt={alt ?? image.label ?? ""}
				className={className}
				width={imgWidth}
				height={imgHeight}
			/>
		</picture>
	)
}
