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
	"Mersereau, M. (2026). \"In the end, Bell always wins …\" A critical analysis of concentration in Toronto's fibre-internet service market. Telecommunications Policy, 50(3), 103086";

const charts = {
	'fibre-construction-totals': {
		title: "Bell accounted for three-quarters of fibre construction under Toronto's streets from 2012 to 2022",
		subtitle: 'Percent of fibre construction in the public right-of-way',
		source: `${paper}, Tables 3 and 5. Maps: City of Toronto capital works records, as geocoded by Broadband Infrastructure Market Insights (BRIMI), https://brimi.ca/.`,
		alt: "Unit chart made of two rows of 100 small marks, each mark one per cent of the total, coloured by company, with a map below that can be switched between the three companies, showing Bell's by default. Top row, length of fibre construction in Toronto's public right-of-way from 2012 to 2022: Bell Canada 75 marks (2,319 km), Rogers Communications 21 marks (660 km), Beanfield 4 marks (117 km). Bottom row, number of construction projects: Bell 74 marks (7,348 projects), Rogers 21 marks (2,048), Beanfield 5 marks (460). Each company's map shows the streets with its fibre construction permits. Bell: short blue segments densely cover the whole city. Rogers: red segments are sparser and patchier, spread across the city, with some longer lines in the east. Beanfield: green lines are fewer, many along arterial roads, including Steeles Avenue at the city's northern edge, with a cluster of short pieces downtown.",
		data: 'fibre-construction-totals.csv',
		widths: [360, 720],
		graphicVerb: 'adapted',
		note: 'Includes only work that required a City permit in the public right-of-way. Maps show where permits were located, not cable length, and include permits from 2012 to 2023.'
	},
	'fibre-construction-overlap': {
		title: 'Only a few Toronto streets had fibre construction by more than one company',
		subtitle: 'Streets with fibre construction permits in the public right-of-way by one company or by more than one, 2012–2023',
		source:
			'City of Toronto capital works records (2012–2023), as geocoded by Broadband Infrastructure Market Insights (BRIMI), https://brimi.ca/.',
		alt: "Map of Toronto showing streets with fibre construction permits from 2012 to 2023. Yellow lines, streets where only one of Bell, Rogers, or Beanfield built, cover the whole city. Purple lines, streets where more than one company built, are much less common: short segments scattered across the city, with a few longer stretches along arterial roads.",
		widths: [720, 1080],
		graphicVerb: 'created',
		// Figures from fibre_streets.py (projects/mini-maps-and-charts/fibre-construction-toronto); method is in the post's end note.
		note: "Of the 1,132 km of streets with any fibre permit (street length, not the permitted cable length in the first bar chart), about 13% had construction by more than one company. Some large permits that cover many streets appear as a short line, so the map misses some streets where companies built."
	}
};

export default resolveDownloads(charts, { dataUrls, pngUrls, embedMeta });
