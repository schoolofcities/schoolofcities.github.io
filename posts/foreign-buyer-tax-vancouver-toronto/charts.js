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
	'policy-timeline': {
		title: 'Foreign buyer tax (FBT) policy timeline',
		subtitle: 'Key interventions in Ontario, British Columbia, and at the Federal level, 2015–2023',
		source: 'Song, T. (2025). Anti-immigration and the politics of housing affordability: Examining the evolution and housing market impacts of Foreign Buyer Taxes in British Columbia and Ontario. Journal of Urban Affairs',
		alt: 'Timeline chart showing foreign buyer tax and related housing policy changes in Ontario, British Columbia, and at the Federal level from 2015 to 2023',
		data: 'policy-timeline.csv',
		widths: [1080],
		graphicVerb: "adapted"
	},
	'homeownership-by-citizenship': {
		title: 'Home ownership rates among non-permanent residents declined in Vancouver and Toronto after foreign buyer taxes (FBT) were introduced',
		subtitle:
			'No similar decline for Canadian-born or permanent residents, or in Montreal and Edmonton, where no tax was introduced',
		source: 'Statistics Canada Table 43-10-0060-01 via Song, T. (2025). Anti-immigration and the politics of housing affordability: Examining the evolution and housing market impacts of Foreign Buyer Taxes in British Columbia and Ontario. Journal of Urban Affairs.',
		alt: 'Small multiples line chart showing owner-occupancy rates by citizenship status (Canadian-born, naturalized citizens and permanent residents, non-permanent residents) for Vancouver, Toronto, Montreal, and Edmonton CMAs from 2006 to 2021',
		data: 'homeownership-by-citizenship.csv',
		widths: [540, 1080],
		graphicVerb: "adapted"
	},
	'rent-gap': {
		title: 'Foreign buyer tax (FBT) did not deliver rental affordability in British Columbia or Ontario',
		subtitle:
			'British Columbia rents rose up to an estimated 12.7% faster than untaxed areas by 2019; Ontario saw little to no effect',
		source:
			'Song, T. (2025). Anti-immigration and the politics of housing affordability: Examining the evolution and housing market impacts of Foreign Buyer Taxes in British Columbia and Ontario. Journal of Urban Affairs. Log-point coefficients from dynamic difference-in-difference models in Table A1 were converted to percentages for this chart.',
		alt: 'Two side-by-side scatter plots showing the percentage gap in median rent between foreign-buyer-tax areas and untaxed areas, for British Columbia (2010-2021) and Ontario (2010-2021), with a marker for when each region introduced its tax',
		data: 'rent-gap.csv',
		widths: [540, 1080],
		graphicVerb: "created",
		note: "CMHC rental data excludes secondary rentals such as condos and houses rented out by their owners, so any demand that shifted specifically into that segment wouldn't be captured by this data. For British Columbia, the untaxed comparison group is limited to regions never subject to an FBT, which excludes regions where the tax was extended starting in 2018."
	}
};

export default resolveDownloads(charts, { dataUrls, pngUrls, embedMeta });
