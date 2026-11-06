/**
 * Web Studio decoration. Agility Web Studio (preview, hover outlines, click-to-edit, live editing) finds
 * content by these `data-agility-*` attributes. Spread them on the elements that render the content.
 *
 * Fields belong to the nearest enclosing boundary (`agilityComponent`, `agilityLinkedItem` or
 * `agilityListItem`), so `agilityField` never needs a contentID.
 *
 * @example
 * <section {...agilityComponent(contentID)}>
 *   <h1 {...agilityField("heading")}>{fields.heading}</h1>
 *   {items.map((it) => (
 *     <li key={it.contentID} {...agilityListItem(it.contentID)}>
 *       <span {...agilityField("title")}>{it.fields.title}</span>
 *     </li>
 *   ))}
 * </section>
 */

/** The root element of a component. */
export const agilityComponent = (contentID: number) => ({ "data-agility-component": contentID }) as const

/** An element that renders a field: pass the field's reference name, as the API returns it. */
export const agilityField = (fieldName: string) => ({ "data-agility-field": fieldName }) as const

/** A shared content item this component points at (it lives in its own container). */
export const agilityLinkedItem = (contentID: number) => ({ "data-agility-component": contentID }) as const

/** An item in this component's own nested list. */
export const agilityListItem = (contentID: number) => ({ "data-agility-nested-listitem": contentID }) as const
