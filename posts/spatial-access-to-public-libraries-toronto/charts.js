import { resolveDownloads } from '$lib/downloads.js';

const dataUrls = import.meta.glob('./data/*', { eager: true, query: '?url', import: 'default' });
const pngUrls = import.meta.glob('./published/*/*.png', {
	eager: true,
	query: '?url',
	import: 'default'
});
const embedMeta = import.meta.glob('./published/*/embed.json', {
	eager: true,
	import: 'default'
});

const charts = {
	'spatial-access-map': {
		title: 'Proximity to public libraries in Toronto',
		subtitle:
			'Most Torontonians can reach a library within 30 minutes: 79% on foot, 95% by transit',
		source:
			'Toronto Public Library, City of Toronto, Toronto Transit Commission, OpenStreetMap (2026)',
		alt:
			"Two maps of Toronto showing travel time to the nearest public library, one for walking and one for public transit. On foot, short travel times form small clusters around each branch, with long times across much of the inner suburbs; by transit, almost the whole city is within 30 minutes.",
		widths: [1080],
		graphicVerb: 'created'
	},
	'demographics-grid': {
		title: "Six population groups, mapped relative to library locations",
		subtitle:
			"Share of each census tract's population, with public library branches marked on every map",
		source: 'Census of Population, Statistics Canada (2021); Toronto Public Library',
		alt:
			"Six small maps of Toronto, each showing one population group's share of every census tract, with library branches marked: visible minority, low income, recent immigrants, first-generation immigrants, seniors, and children. Where each group is concentrated differs, but all are least present in the central corridor from downtown to the east end.",
		widths: [360, 720, 1080],
		graphicVerb: 'created'
	},
	'travel-time-boxplot': {
		title: 'Travel time to the nearest library by demographic group',
		subtitle: "Every group's median is at or just slightly above the citywide median",
		source: 'Census of Population, Statistics Canada (2021); Toronto Public Library, City of Toronto, Toronto Transit Commission, OpenStreetMap (2026)',
		alt:
			"Box plots of travel time to the nearest library for the total population and six demographic groups, in one panel for walking and one for public transit. Within each panel the rows are nearly identical, with every group's median within about a minute of the total population's.",
		data: 'travel_time_percentiles.csv',
		widths: [360, 720],
		graphicVerb: 'created'
	}
};

export default resolveDownloads(charts, { dataUrls, pngUrls, embedMeta });
