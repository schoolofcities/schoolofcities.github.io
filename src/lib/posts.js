const metas = import.meta.glob('/posts/*/meta.json', { eager: true });
const charts = import.meta.glob('/posts/*/charts.js', { eager: true });

const slugOf = (p) => p.split('/')[2];

export const posts = Object.fromEntries(
	Object.entries(metas).map(([path, mod]) => [
		slugOf(path),
		{ meta: mod.default, charts: charts[`/posts/${slugOf(path)}/charts.js`].default }
	])
);

export const chartEntries = Object.entries(posts).flatMap(([slug, p]) =>
	Object.keys(p.charts).map((chart) => ({ slug, chart }))
);
