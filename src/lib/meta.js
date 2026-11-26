// Small helpers shared by anything that reads a post's meta.json — Title.svelte
// and Byline.svelte for what readers see, PostMeta.svelte for what crawlers
// read, ChartFrame for the licence line under each chart.
//
// These lived in two or three copies before; they're here so a licence added to
// the map below shows up everywhere at once.

// Known CC license codes -> their deed URL. Unrecognized codes (or none) print
// as plain text rather than becoming a broken or guessed link.
const LICENSE_URLS = {
	'CC-BY-4.0': 'https://creativecommons.org/licenses/by/4.0/',
	'CC-BY-SA-4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
	'CC-BY-NC-4.0': 'https://creativecommons.org/licenses/by-nc/4.0/',
	'CC-BY-NC-SA-4.0': 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
	'CC-BY-ND-4.0': 'https://creativecommons.org/licenses/by-nd/4.0/',
	'CC-BY-NC-ND-4.0': 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
	'CC0-1.0': 'https://creativecommons.org/publicdomain/zero/1.0/'
};

export function licenseUrl(license) {
	return LICENSE_URLS[license];
}

/** "CC-BY-4.0" -> "CC BY 4.0" */
export function licenseLabel(license) {
	return license?.replaceAll('-', ' ');
}

/**
 * Newest changelog date, or undefined when a post has never been revised.
 * Derived rather than stored, so adding a changelog entry is the only thing
 * needed to mark a post as updated.
 */
export function lastUpdated(changelog) {
	if (!changelog || changelog.length === 0) return undefined;
	return changelog.reduce((max, entry) => (entry.date > max ? entry.date : max), changelog[0].date);
}

/** Plain-English join — "A and B", or "A, B, and C" for three or more. */
export function formatAuthorList(authors = []) {
	if (authors.length <= 1) return authors[0] ?? '';
	if (authors.length === 2) return authors.join(' and ');
	return `${authors.slice(0, -1).join(', ')}, and ${authors[authors.length - 1]}`;
}

/**
 * The three ways a document in meta.json can relate to a post:
 *
 *   from      the post communicates a result from that work — an academic
 *             paper, an analysis repository, a report we are summarising.
 *   for       the graphics were made because that work needed them. This is
 *             about why the work was commissioned, not where it ended up: a
 *             chart reused in a brief six months later is a `resource`, since
 *             we can't reliably know every place a graphic gets used.
 *   resource  anything else directly related on the same topic — a video, a
 *             companion piece, a later publication that reused a chart.
 *
 * A document can be more than one. The common case is a SofC report we made
 * the graphics for and whose findings the post then summarises: `from` and
 * `for` together.
 */
export const RELATIONS = ['from', 'for', 'resource'];

// Heading for each combination that can occur, keyed by the relations present
// in `from, for, resource` order. Each document appears once, under the heading
// matching its full set — listing the same report twice would read as two works.
//
// Array rather than an object because the order here is the display order, and
// it should read from what the post is based on, through what it was made for,
// to everything else. Object key order would put `resource` third and every
// combination after it.
const RELATION_HEADINGS = [
	['from', 'Based on:'],
	['from,for', 'Based on, with graphics created for:'],
	['from,for,resource', 'Based on, with graphics created for:'],
	['for', 'Graphics created for:'],
	['for,resource', 'Graphics created for, and related to:'],
	['from,resource', 'Based on, and related to:'],
	['resource', 'Related material:']
];

/** `relation` may be a single value or several; always read it as a list. */
function relationsOf(doc) {
	return [doc.relation ?? []].flat().filter((r) => RELATIONS.includes(r));
}

/**
 * Documents grouped by their full set of relations, in a stable order, so the
 * byline reads from upstream to downstream regardless of authoring order.
 */
export function documentGroups(documents = []) {
	const groups = new Map();

	for (const doc of documents) {
		const key = RELATIONS.filter((r) => relationsOf(doc).includes(r)).join(',');
		if (!key) continue;
		if (!groups.has(key)) groups.set(key, []);
		groups.get(key).push(doc);
	}

	const order = RELATION_HEADINGS.map(([key]) => key);
	return [...groups]
		.sort((a, b) => order.indexOf(a[0]) - order.indexOf(b[0]))
		.map(([key, docs]) => ({
			heading: RELATION_HEADINGS.find(([k]) => k === key)?.[1],
			docs
		}));
}

/**
 * The image a page represents itself with in a social card, in order:
 *
 *   1. `card`, the post's own card.png (1200 × 630), when it has one. No alt
 *      text: it's a designed image identifying the post, and platforms print
 *      the title beside it.
 *   2. Otherwise the largest exported PNG of the first chart in charts.js, with
 *      that chart's alt text. On a figure page `charts` holds just that one
 *      chart, so the card is the chart being shared.
 *   3. Otherwise nothing: a card with no image beats one pointing at a file
 *      that doesn't exist, e.g. before `npm run export-pngs` has run.
 */
export function socialImage(charts = {}, card) {
	if (card) return { url: card };

	const first = Object.values(charts)[0];
	const largest = first?.images?.at(-1);
	return largest ? { url: largest.url, alt: first.alt } : undefined;
}
