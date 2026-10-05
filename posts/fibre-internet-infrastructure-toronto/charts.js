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
	'fibre-construction-by-year': {
		title: "Bell's fibre construction peaked in 2017, two years before Rogers'",
		subtitle: 'Kilometres of fibre construction started each year in the public right-of-way, 2014–2022',
		source: `${paper} Table 7.`,
		alt: "Three side-by-side column charts on the same scale, one per company, showing kilometres of fibre construction started each year in Toronto from 2014 to 2022. Each column is a stack of small marks, each worth 25 km. Bell Canada: almost nothing in 2014 and 2015, then 556 km in 2016, a peak of 1,198 km in 2017, 420 km in 2018, and under 90 km a year from 2019 on, 2,319 km in total. Rogers Communications: a gradual rise from 9 km in 2015 to a peak of 189 km in 2019, then 121 km in 2020 and close to zero in 2021 and 2022, 660 km in total. Beanfield: under 16 km a year until 2022, when it reaches 57 km, 117 km in total.",
		data: 'fibre-construction-by-year.csv',
		widths: [720],
		graphicVerb: 'created',
		note: "Annual lengths were derived by dividing the per-year occupancy fee estimates in the paper's Table 7 by the $24.50 per metre rate the paper applies; they sum to the totals in its Table 5. Years are permit start years. No lengths are attributed to 2012 or 2013."
	},
	'fibre-construction-map': {
		title: 'Bell and Rogers mostly built fibre on different streets',
		subtitle: 'Streets with fibre construction permits in the public right-of-way, 2012–2022',
		source:
			'City of Toronto capital works records (2012–2022), as geocoded by Broadband Infrastructure Market Insights (BRIMI), https://brimi.ca/; Mersereau (2026), Telecommunications Policy. Base map: City of Toronto Centreline; Statistics Canada 2021 census subdivision boundaries.',
		alt: "Map of Toronto, rotated to align with the street grid, showing streets where Bell Canada or Rogers Communications had fibre construction permits between 2012 and 2022. Blue lines show Bell-only streets, red lines Rogers-only streets, and purple lines streets where both companies built; a bar in the legend shows their shares of mapped street length as 59%, 29% and 12%. Blue and red lines are scattered across the whole city, mostly as short separate segments on different streets. Purple overlapping segments are much less common, appearing as short pieces throughout the city, with somewhat more in the northeast, in North York and Scarborough.",
		widths: [1080, 1440],
		graphicVerb: 'created',
		note: "Shows the permit records BRIMI could locate on a street; some records could not be mapped and are not shown. Line lengths on the map are street segments, not the permitted cable lengths used elsewhere on this page. Purple lines mark Bell construction within 15 metres of Rogers construction, a geometric match we computed; Mersereau (2026) matched by street name and found that 12.5% of street segments had construction by both companies. Legend percentages are each category's share of the total mapped street length for Bell and Rogers (1,010 km). Beanfield's construction is not shown."
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
