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
		title: 'Spatial access to public libraries in Toronto',
		subtitle: 'Shortest travel time to the nearest library by public transit and walking',
		source: 'Toronto Public Libraries, City of Toronto, Toronto Transit Commission (2026)',
		alt: 'Two maps of Toronto showing travel time to the nearest public library in three bands, under 15 minutes, 15 to 30 minutes, and 30 minutes or more, by walking and by public transit, with library locations and major transit lines overlaid.',
		widths: [1080],
		graphicVerb: 'created'
	},
	'demographics-grid': {
		title: "Six demographic groups across Toronto's census tracts, mapped alongside library locations",
		subtitle: 'Each map shades census tracts by population share: visible minority, low income, recent and first-generation immigrants, seniors, and children',
		source: 'Census of Population, Statistics Canada (2021); Toronto Public Libraries',
		alt: 'Six small maps of Toronto census tracts, each shaded by a different demographic measure — visible minority, low income, recent immigrants, first-generation immigrants, seniors, and children — with public library locations marked as dots on every map.',
		widths: [1080],
		graphicVerb: 'created'
	},
	'travel-time-boxplot': {
		title: 'Travel time to the nearest library by demographic group',
		subtitle: "Every group's median is at or slightly above the citywide median",
		source: 'Census of Population, Statistics Canada (2021); Toronto Public Libraries',
		alt: 'Two box-and-whisker charts, walking and public transit, comparing travel time to the nearest library across demographic groups and the overall population, one row per group, showing the 10th, 25th, 50th (median), 75th, and 90th percentiles.',
		data: 'travel_time_percentiles.csv',
		widths: [1080],
		graphicVerb: 'created'
	}
};

export default resolveDownloads(charts, { dataUrls, pngUrls, embedMeta });
