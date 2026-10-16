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
	"Mersereau, M. (2026). \"In the end, Bell always wins …\" A critical analysis of concentration in Toronto's fibre-internet service market. Telecommunications Policy, 50(3), 103086. Based on City of Toronto capital works records obtained through a freedom of information request.";

const charts = {
	'fibre-construction-totals': {
		title: "Bell accounted for three-quarters of fibre construction under Toronto's streets from 2012 to 2022",
		subtitle: 'Share of fibre construction in the public right-of-way, by length and by number of projects',
		source: `${paper} Tables 3 and 5.`,
		alt: "Unit chart made of two rows of 100 small marks, each mark one per cent of the total, coloured by company. Top row, length of fibre construction in Toronto's public right-of-way from 2012 to 2022: Bell Canada 75 marks (2,319 km), Rogers Communications 21 marks (660 km), Beanfield 4 marks (117 km). Bottom row, number of construction projects: Bell 75 marks (7,348 projects), Rogers 21 marks (2,048), Beanfield 5 marks (460).",
		data: 'fibre-construction-totals.csv',
		widths: [720],
		graphicVerb: 'adapted',
		note: 'Includes buried conduit, support structures (handwells, vaults, poles), aerial cable, and cable pulled through existing conduit. Duplicate lengths for multi-segment permits were removed. Only work requiring a City permit in the public right-of-way is included, not work on private property.'
	},
	'bell-price-with-competitor': {
		title: "Bell's listed fibre prices were less than half as high where Beanfield also offers service",
		subtitle: "Bell's listed monthly price for two gigabit fibre plans at nearby Toronto addresses with and without Beanfield service, as compiled by Beanfield in 2024",
		source:
			"Beanfield (2024), presentation to the City of Toronto Technology Services Division, as reproduced with permission in Table 6 of Mersereau, M. (2026). \"In the end, Bell always wins …\" A critical analysis of concentration in Toronto's fibre-internet service market. Telecommunications Policy, 50(3), 103086.",
		alt: "Chart of Bell's listed monthly prices for two gigabit fibre plans, drawn as stacks of banknotes, each note worth $10 a month. Gigabit Fibe 3.0 (up to 3 Gbps): a stack of 14 notes, $140 a month, at addresses without Beanfield, beside a stack of 6 notes, $60 a month, at addresses with Beanfield, topped by 8 dashed empty notes labelled $80 less (57%). Gigabit Fibe 1.5 (up to 1.5 Gbps): 13 notes, $130 a month, without Beanfield, beside 6 notes, $60 a month, with Beanfield, topped by 7 dashed notes labelled $70 less (54%).",
		data: 'bell-price-with-competitor.csv',
		widths: [720],
		graphicVerb: 'created',
		note: 'Prices are from screenshots of Bell listings at six addresses without Beanfield service (in and around Parkdale) and six nearby addresses with it (mostly in Liberty Village), compiled by Beanfield, a competitor of Bell. The date of the listings, and whether any were promotional prices, are not stated. These are listed prices at a small number of addresses, not a measure of prices citywide.'
	}
};

export default resolveDownloads(charts, { dataUrls, pngUrls, embedMeta });
