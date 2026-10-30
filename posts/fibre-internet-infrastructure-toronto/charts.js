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

const paper =
	"Mersereau, M. (2026). \"In the end, Bell always wins …\" A critical analysis of concentration in Toronto's fibre-internet service market. Telecommunications Policy";

const charts = {
	'fibre-construction-totals': {
		title: "Bell accounted for three-quarters of fibre construction under Toronto's streets from 2012 to 2022",
		subtitle: 'Percent of fibre construction in the public right-of-way',
		source: `Charts: ${paper}, Tables 3 and 5. Maps: City of Toronto capital works records, as geocoded by Broadband Infrastructure Market Insights (BRIMI), https://brimi.ca/.`,
		alt: "Two unit charts and a map showing each company's share of fibre construction in Toronto's public right-of-way from 2012 to 2022. Bell Canada accounts for about three-quarters of both construction length and number of projects, Rogers Communications about a fifth, and Beanfield under 5%. A map that can be switched between companies shows Bell's permits densely covering the whole city, and Rogers's and Beanfield's sparser.",
		data: 'fibre-construction-totals.csv',
		widths: [360, 720],
		graphicVerb: 'adapted',
		note: 'Includes only work that required a City permit in the public right-of-way. Maps show where permits were located, not cable length, and include permits from 2012 to 2023.'
	},
	'fibre-construction-overlap': {
		title: 'Few Toronto streets had fibre construction by more than one company',
		subtitle: 'Streets with fibre construction permits in the public right-of-way by one company or by more than one, 2012–2023',
		source:
			'City of Toronto capital works records (2012–2023), as geocoded by Broadband Infrastructure Market Insights (BRIMI), https://brimi.ca/.',
		alt: "Map of Toronto showing streets with fibre construction permits from 2012 to 2023. Yellow lines, streets where only one of Bell, Rogers, or Beanfield built, cover the whole city. Purple lines, streets where more than one company built, are much less common: short segments scattered across the city, with a few longer stretches along arterial roads.",
		widths: [720, 1080],
		graphicVerb: 'created',
		// Matching is done in fibre_streets.py (projects/mini-maps-and-charts/fibre-construction-toronto).
		note: 'A street counts as built by more than one company where permits from two or more companies fall within 12 metres of the same stretch of street for at least 20 metres, which leaves out most cross streets at intersections.'
	}
};

export default resolveDownloads(charts, { dataUrls, pngUrls, embedMeta });
