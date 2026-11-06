import "server-only"

import { cacheLife, cacheTag } from "next/cache"
import { connection } from "next/server"
import type { ContentItem } from "@agility/content-fetch"
import type { ContentItemRequestParams } from "@agility/content-fetch/dist/methods/getContentItem"
import { getAgilitySDK } from "@/lib/agility/agility-sdk"

export type GetContentItemParams = ContentItemRequestParams & {
	/** Read staging content instead of published. Preview reads are never cached. */
	preview?: boolean
}

/**
 * Get one content item. Published reads are cached (`"use cache"`) under the tag
 * `agility-content-<contentID>-<locale>`; invalidate that tag from your publish webhook. Preview reads
 * bypass the cache so editors always see their latest draft. Needs `cacheComponents: true` in next.config.
 */
export const getContentItem = async <T>({ preview = false, ...params }: GetContentItemParams) => {
	if (preview) {
		await connection()
		return fetchContentItem<T>(params, true)
	}
	return cachedContentItem<T>(params)
}

const cachedContentItem = async <T>(params: ContentItemRequestParams) => {
	"use cache"
	cacheTag(`agility-content-${params.contentID}-${params.languageCode || params.locale}`)
	// Long on purpose: the publish webhook is the real invalidation; the TTL is only a backstop.
	cacheLife("days")
	return fetchContentItem<T>(params, false)
}

const fetchContentItem = async <T>(params: ContentItemRequestParams, preview: boolean) =>
	(await getAgilitySDK(preview).getContentItem(params)) as ContentItem<T>
