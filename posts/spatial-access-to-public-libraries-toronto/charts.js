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
		title: 'Where six population groups live in relation to public libraries in Toronto',
		subtitle:
			'Visible minority, low income, recent immigrants, first-generation immigrants, seniors, and children',
		source: 'Census of Population, Statistics Canada (2021); Toronto Public Library',
		alt:
			"Six small maps of Toronto, each showing one population group's share of every census tract, with library locations marked: visible minority, low income, recent immigrants, first-generation immigrants, seniors, and children. Where each group is concentrated differs, but all are least present in the central corridor from downtown to the east end.",
		description: [
			'Each map shades census tracts in four classes, from the lowest to the highest share of residents in that group. Libraries are closest together downtown and in the older central city, and more spread out across the inner suburbs of Etobicoke, North York and Scarborough.',
			'Visible minority (under 25% to over 75% of residents): highest across the north of the city, in northern Etobicoke, northern North York and most of Scarborough, and lowest in Midtown, the Beaches, and parts of Etobicoke.',
			'Low income (under 30% to over 40%): highest in northern Etobicoke, parts of northern North York and northern Scarborough, with smaller pockets downtown and just east of the Don Valley, and lowest in Midtown and much of central and southern Etobicoke.',
			'Recent immigrants (under 3% to over 9%): highest in parts of the northern suburbs and along the downtown waterfront, and lowest in Midtown, the west end and eastern Scarborough.',
			'First-generation immigrants (under 35% to over 65%): a similar pattern to visible minority residents, highest across northern Etobicoke, North York and Scarborough, and lowest in the west and east ends near the lake.',
			'Seniors aged 65 and over (under 15% to over 20%): in patches across the city, with higher shares in parts of Scarborough, North York and central Etobicoke, and lower shares downtown.',
			'Children aged 0 to 14 (under 12% to over 16%): highest in the inner suburbs, especially Scarborough and northern and western Etobicoke, and lowest downtown and along the central waterfront.'
		],
		widths: [360, 720, 1080],
		graphicVerb: 'created'
	},
	'travel-time-boxplot': {
		title: 'Travel time to the nearest library by demographic group',
		subtitle: "Every group's median is at or just slightly above the City of Toronto median",
		source: 'Census of Population, Statistics Canada (2021); Toronto Public Library, City of Toronto, Toronto Transit Commission, OpenStreetMap (2026)',
		alt:
			"Box plots of travel time to the nearest library for the total population and six demographic groups, in one panel for walking and one for public transit. Within each panel the rows are nearly identical, with every group's median within about a minute of the total population's.",
		note: 'Travel times are in decimal minutes (0.1 minute = 6 seconds).',
		data: 'travel_time_percentiles.csv',
		widths: [360, 720],
		graphicVerb: 'created'
	}
};

export default resolveDownloads(charts, { dataUrls, pngUrls, embedMeta });
