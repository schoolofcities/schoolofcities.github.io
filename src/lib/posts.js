const metas = import.meta.glob('/posts/*/meta.json', { eager: true });
const charts = import.meta.glob('/posts/*/charts.js', { eager: true });
// Each post's card image, where it has one: its social card (see socialImage
// in meta.js). Resolved to a built, fingerprinted URL.
const cards = import.meta.glob('/posts/*/card.png', { eager: true, query: '?url', import: 'default' });

const slugOf = (p) => p.split('/')[2];

export const posts = Object.fromEntries(
	Object.entries(metas).map(([path, mod]) => [
		slugOf(path),
		{
			meta: mod.default,
			charts: charts[`/posts/${slugOf(path)}/charts.js`].default,
			card: cards[`/posts/${slugOf(path)}/card.png`]
		}
	])
);

export const chartEntries = Object.entries(posts).flatMap(([slug, p]) =>
	Object.keys(p.charts).map((chart) => ({ slug, chart }))
);
