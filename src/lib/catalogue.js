// One list of everything the home page lists: the posts built in this repo
// (posts/) and the work hosted elsewhere (links/), in the same shape, so the home page can treat them alike.
//
// Only each folder's meta.json and card.png are read here, not charts.js or the
// page bodies, so importing this adds very little to a page's JavaScript.
import { lastUpdated } from './meta.js';

const postMetas = import.meta.glob('/posts/*/meta.json', { eager: true, import: 'default' });
const postCards = import.meta.glob('/posts/*/card.png', { eager: true, query: '?url', import: 'default' });
const linkMetas = import.meta.glob('/links/*/meta.json', { eager: true, import: 'default' });
const linkCards = import.meta.glob('/links/*/card.png', { eager: true, query: '?url', import: 'default' });

const idOf = (path) => path.split('/')[2];

/**
 * `href` is a site path for a post (the page adds the base path) and a full
 * address for work hosted elsewhere. `updated` is the newest changelog date, or
 * the publication date when there isn't one.
 */
function toItem(id, meta, card, internal) {
	return {
		id,
		title: meta.title,
		type: meta.type,
		summary: meta.summary,
		authors: meta.authors ?? [],
		published: meta.published,
		updated: lastUpdated(meta.changelog) ?? meta.published,
		tags: meta.tags ?? [],
		geography: meta.geography ?? [],
		project: meta.project,
		href: internal ? `/posts/${id}/` : meta.url,
		external: !internal,
		card
	};
}

const items = [
	// A post still in development (protected) isn't public, so it isn't listed.
	...Object.entries(postMetas)
		.filter(([, meta]) => meta.protected === false)
		.map(([path, meta]) => toItem(idOf(path), meta, postCards[`/posts/${idOf(path)}/card.png`], true)),
	...Object.entries(linkMetas).map(([path, meta]) =>
		toItem(idOf(path), meta, linkCards[`/links/${idOf(path)}/card.png`], false)
	)
];

const projectTitles = Object.fromEntries(items.filter((i) => i.type === 'project').map((i) => [i.id, i.title]));

// The title of the project an item belongs to, so a search for the project finds its parts too.
for (const item of items) item.partOf = item.project ? projectTitles[item.project] : undefined;

/**
 * Most recently updated first (the publication date when there's no changelog),
 * then newest published, then title. The default order everywhere.
 */
const newestFirst = (a, b) =>
	b.updated.localeCompare(a.updated) || b.published.localeCompare(a.published) || a.title.localeCompare(b.title);

export const catalogue = items.sort(newestFirst);

export const TYPES = [
	['post', 'Post'],
	['feature', 'Story'],
	['explorer', 'Explorer'],
	['project', 'Collection']
];
/** A tag (stored lowercase) as it is shown: "public transit" becomes "Public Transit". */
export const capitalize = (tag) => tag.replace(/(^|[\s-])(\p{L})/gu, (_, gap, letter) => gap + letter.toUpperCase());

/** Every topic tag in use, with how many items carry it, alphabetical. */
export const topics = Object.entries(
	catalogue.reduce((counts, item) => {
		for (const tag of item.tags) counts[tag] = (counts[tag] ?? 0) + 1;
		return counts;
	}, {})
).sort((a, b) => a[0].localeCompare(b[0]));

/** Every place any item covers, alphabetical. */
export const places = [...new Set(catalogue.flatMap((item) => item.geography))].sort((a, b) => a.localeCompare(b));
