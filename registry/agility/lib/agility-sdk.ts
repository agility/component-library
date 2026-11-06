import "server-only"

import agility from "@agility/content-fetch"

/**
 * An Agility Content Fetch API client for published or preview (staging) content.
 *
 * `isPreview` is an explicit argument, never read from `draftMode()` here: under Cache Components,
 * `draftMode()` is request-time state, and reading it in the data layer would stop every content read
 * from being cached. Resolve preview once per request and pass it down as a boolean.
 */
export const getAgilitySDK = (isPreview: boolean) =>
	agility.getApi({
		guid: process.env.AGILITY_GUID,
		apiKey: isPreview ? process.env.AGILITY_API_PREVIEW_KEY : process.env.AGILITY_API_FETCH_KEY,
		isPreview,
	})
