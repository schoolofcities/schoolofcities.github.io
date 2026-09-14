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
			'79% of residents can reach a library within 30 minutes on foot, and 95% of residents can by public transit',
		source:
			'Toronto Public Libraries, City of Toronto, Toronto Transit Commission, OpenStreetMap (2026)',
		alt:
			"Two stacked maps of Toronto covering the same area, the upper one for walking and the lower one for public transit. Both shade a fine hexagon grid into three travel-time bands: dark blue under 15 minutes, mid blue 15 to 30 minutes, and pale blue 30 minutes or more. Yellow dots mark the 101 library branches, thin red lines the major transit routes, and dark outlines the 25 municipal wards, each labelled by number; Etobicoke, North York, East York, Scarborough and Downtown are named. On the walking map dark blue forms a small cluster around each branch, separated by broad pale-blue areas that are largest in western and southern Etobicoke, north-central North York, and northern and eastern Scarborough. On the transit map almost the whole city is mid or dark blue, with pale blue reduced to scattered pockets around the city's outer edges.",
		widths: [1080],
		graphicVerb: 'created'
	},
	'demographics-grid': {
		title: "Six population groups, mapped relative to library locations",
		subtitle:
			"Share of each census tract's population, with public library branches marked on every map",
		source: 'Census of Population, Statistics Canada (2021); Toronto Public Libraries',
		alt:
			"Six small maps of Toronto, each shading the city's census tracts into four classes by one population measure, with its own colour ramp and class breaks: visible minority in purple (breaks at 25, 50 and 75 per cent), low income in blue (30, 35, 40), recent immigrants in red (3, 6, 9), first-generation immigrants in teal (35, 50, 65), seniors aged 65 and over in navy (15, 17.5, 20), and children aged 0 to 14 in green (12, 14, 16). Yellow dots mark the public library branches on every panel. Every group is least present in the central corridor running from downtown out to the east end, but concentrations beyond it differ by group: the northwest is highest for low income and recent immigrants, Scarborough for visible minority and first-generation immigrants, and western Etobicoke for seniors.",
		widths: [360, 720, 1080],
		graphicVerb: 'created'
	},
	'travel-time-boxplot': {
		title: 'Travel time to the nearest library by demographic group',
		subtitle: "Every group's median is at or just slightly above the citywide median",
		source: 'Census of Population, Statistics Canada (2021); Toronto Public Libraries, City of Toronto, Toronto Transit Commission, OpenStreetMap (2026)',
		alt:
			"Two panels of horizontal box-and-whisker rows comparing travel time to the nearest library, one panel for walking on an axis running from 0 to about 40 minutes and one for public transit on a 0 to 30 minute axis. Each panel has seven rows: the total population in grey, then visible minority, low income, recent immigrants, first-generation immigrants, seniors aged 65 and over, and children aged 0 to 14, each in that group's own colour from the maps above. Every row shows the 10th and 90th percentiles as whisker ends, the 25th to 75th percentile as a box, and the median as a line inside the box. Within each panel the rows are near-identical: walking medians sit between 19 and 21 minutes and transit medians between 17 and 18, with every group's median within about a minute of the total population's. The walking distributions are much wider than the transit ones, spanning roughly 10 to 38 minutes against 10 to 27.",
		data: 'travel_time_percentiles.csv',
		widths: [360, 720],
		graphicVerb: 'created'
	}
};

export default resolveDownloads(charts, { dataUrls, pngUrls, embedMeta });
