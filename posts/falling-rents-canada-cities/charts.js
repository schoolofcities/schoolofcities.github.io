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

const rentSource =
	'Statistics Canada, Table 46-10-0092-01 (quarterly asking rents, two-bedroom apartments, census metropolitan areas) and Table 18-10-0005-01 (consumer price index).';

const charts = {
	'net-change-map': {
		title: 'After inflation, asking rents are above 2019 levels in every city except Toronto',
		source: rentSource,
		alt: "Map of 40 Canadian cities with an arrow for each, showing the net change in two-bedroom asking rent from the first quarter of 2019 to the first quarter of 2026, after inflation. Arrows point up and are longer and darker for larger increases, which are concentrated in Quebec and Atlantic Canada: Drummondville (+67%), Sherbrooke (+54%) and Halifax (+49%) are highest. Toronto's arrow is blue and points down, a decline of 14%. A toggle switches the view to nominal rents.",
		description: [
			'The graphic is a map of Canada with one arrow for each of 40 cities. The arrows fall into four size classes by the net change in each city’s two-bedroom asking rent from the first quarter of 2019 to the first quarter of 2026. After inflation, in 2025 dollars, the classes are under 10%, 10% to 25%, 25% to 40%, and 40% or more. Two cities are in the smallest class, 21 in the second, 10 in the third and 6 in the largest. Toronto is the only city with a decline, drawn as a blue arrow pointing down: −14.1%.',
			'The largest increases after inflation are in Drummondville (+66.8%), Sherbrooke (+54.1%), Halifax (+48.9%), St. John’s (+47.6%) and Moncton (+41.7%). Among the smallest are Edmonton (+2.9%) and Vancouver (+2.6%). Before adjusting for inflation, every city has an increase, from +3.9% in Toronto to +105.0% in Drummondville.',
			'Insets enlarge southern British Columbia, southern Ontario and southern Quebec, where cities are close together. A toggle above the map switches between the after-inflation and nominal views, and hovering over or tapping an arrow shows that city’s starting and latest rent.'
		],
		data: 'net-change-by-city.csv',
		widths: [360, 720],
		graphicVerb: 'created',
		note: 'Longer, darker arrows mean a larger increase; blue marks a decline. After-inflation changes restate each city’s Q1 2019 rent in 2025 dollars using its province’s consumer price index; the latest rent is left as is, since the index is not yet published beyond 2025. Cities need a Q1 2019 value and at least eight quarters of data, which leaves out Saguenay and Trois-Rivières.'
	},
	'city-rent-trajectories': {
		title: 'Most cities saw a steep climb in asking rents followed by a modest drop – but with several exceptions',
		source: rentSource,
		alt: "Small line charts of the net change in two-bedroom asking rent since the first quarter of 2019, after inflation, for Canada and each of 40 cities. Canada's line rises to a peak of 26% in the fourth quarter of 2023 and then slips to 17% by the first quarter of 2026. Vancouver, Calgary and Montréal follow the same climb and partial fall. Toronto never rises above its 2019 level and ends 14% below it. A few cities, such as Drummondville and Greater Sudbury, end at their highest level.",
		description: [
			'The graphic is a grid of small line charts, all on the same scale, each showing one city’s net change in two-bedroom asking rent from its own first-quarter 2019 level, quarter by quarter to the first quarter of 2026. A large panel for Canada and panels for Vancouver, Calgary, Toronto and Montréal come first, followed by the other 36 cities in alphabetical order. A grey line for Canada runs behind each city for comparison.',
			'After inflation, Canada’s line rises from 0% to a peak of +26.0% in the fourth quarter of 2023, then falls to +16.6%. Vancouver peaks at +23.4% (third quarter of 2023) and ends at +2.6%; Calgary peaks at +34.0% and ends at +15.6%; Montréal peaks at +43.9% and ends at +36.8%. Toronto never rises above its 2019 level and ends at −14.1%. Of the 40 cities, 35 end below their peak. The other five, Drummondville, Regina, Saskatoon, Greater Sudbury and Winnipeg, end at their highest level.',
			'Each line takes the colour of its city’s arrow on the map, with blue for a decline. A toggle switches between after-inflation and nominal rents, and hovering over or tapping a panel shows the city’s starting and latest rent and its peak.'
		],
		data: 'net-change-by-quarter.csv',
		widths: [360, 720],
		graphicVerb: 'created',
		note: 'Each line shows a city’s net change from its own Q1 2019 level, in 2025 dollars after inflation unless switched to nominal. Line colours match the arrows on the map; grey is Canada.'
	},
	'rent-change-histogram': {
		title: 'After inflation, average rents in occupied apartments fell in 47 of 280 city-years – for the most part, in 2021 and 2022',
		subtitle: 'Yearly change in the average rent in occupied purpose-built apartments, 40 cities, 2019–2025',
		source:
			'Canada Mortgage and Housing Corporation (CMHC), Rental Market Survey (October); Statistics Canada, Table 18-10-0005-01 (consumer price index).',
		alt: 'Stacked histogram of the yearly change in the average rent in occupied purpose-built apartments in 40 Canadian cities, 2019 to 2025, after inflation, in one-point bands, with one colour per year. Each block is one city in one year, 280 in all. The median change is +3.1%. Rents fell in 47 city-years, shaded to the left of zero, 35 of them in 2021 and 2022. Before adjusting for inflation, rents fell in only 5.',
		description: [
			'The graphic is a stacked histogram. The horizontal axis is the change in a city’s average rent in occupied purpose-built apartments since the previous October, in one-percentage-point bands. The vertical axis is the number of cities. Each block is one city in one year, coloured from amber for 2019 to dark purple for 2025, and the area left of zero is shaded as the side where rent falls.',
			'There are 280 city-years: 40 cities for each of the seven years from 2019 to 2025. After inflation, the median change is +3.1% and the average rent fell in 47 of the 280. Those 47 are 3 in 2019, 5 in 2020, 20 in 2021, 15 in 2022, 1 in 2023, 2 in 2024 and 1 in 2025. Before adjusting for inflation, the median is +6.0% and the average rent fell in 5 city-years.',
			'A toggle above the chart switches between after-inflation and nominal changes. Hovering over or tapping a block lists the cities in it, and the year key highlights one year at a time.'
		],
		data: 'rent-change-by-city-year.csv',
		widths: [360, 720],
		graphicVerb: 'created',
		note: 'Each October, the CMHC survey records the average rent in occupied purpose-built apartments of all unit types. A change in the average can also reflect new buildings entering the survey. Windsor and St. Catharines–Niagara are left out because their data cannot be used.'
	},
	'headline-context': {
		title: 'Headlines about falling rents were unlikely to give context about rental trends broadly',
		subtitle: 'Canadian news headlines about rents falling and rising, 2019–2026, by whether they give some context',
		source:
			'Headlines containing “rent” from 37 Canadian news outlets, January 2019 to March 2026, collected through Media Cloud and classified by a language model.',
		alt: 'Two bars of thin vertical lines, one line per news headline. Of 149 headlines about falling rents, 24 (16%) give some context, shown in red, and 125 give little, shown in grey. Of a random sample of 143 headlines about rising rents, 67 (47%) give some context. Hovering over or selecting a line shows the headline, its outlet and date, and a link to the article.',
		description: [
			'The graphic has two horizontal bars, one for headlines about rents falling and one for headlines about rents rising. Every headline is one thin vertical line, and each bar is split into the headlines that give some context, in red, and those that give little, in grey. Both bars use the same line width, so their lengths compare directly.',
			'A headline gives some context if it says the change is small or slowing, compares it with an earlier year, compares it with a peak or record, says rents are still high or unaffordable, or notes the opposite trend elsewhere. Of 149 headlines about falling rents, 24 (16.1%) give some context. Of the 143 headlines in a random sample of the 401 about rising rents, 67 (46.9%) do.',
			'Hovering over, tapping, or moving along a bar with the left and right arrow keys opens a card with the headline, the outlet, the date, the kind of context given, and a link to the article. All 292 headlines are in the downloadable data.'
		],
		data: 'headlines-classified.csv',
		widths: [360, 720],
		graphicVerb: 'created',
		note: 'A figure alone does not count as context, and only the headline is read, so an article may say more. The 149 falling headlines were re-read in a second, blind pass. The rising bar is a random sample of 143 of the 401 rising headlines, and its labels were not re-checked.'
	}
};

export default resolveDownloads(charts, { dataUrls, pngUrls, embedMeta });
