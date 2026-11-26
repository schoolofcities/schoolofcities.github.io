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

const askingSource =
	'Statistics Canada, Table 46-10-0092-01 (quarterly asking rents, two-bedroom apartments, census metropolitan areas) and Table 18-10-0004-01 (monthly consumer price index).';

const charts = {
	'net-change-map': {
		title: 'After inflation, asking rents are above 2019 levels in every city except Toronto',
		source: askingSource,
		alt: "Map of 40 Canadian cities with an arrow for each, showing the net change in two-bedroom asking rent from the first quarter of 2019 to the first quarter of 2026, after inflation. Arrows point up and are longer and darker for larger increases, which are concentrated in Quebec and Atlantic Canada: Drummondville (+63%), Sherbrooke (+51%) and Halifax (+46%) are highest. Toronto's arrow is blue and points down, a decline of 15%. A toggle switches the view to rents before inflation.",
		description: [
			'The graphic is a map of Canada with one arrow for each of 40 cities. The arrows fall into four size classes by the net change in each city’s two-bedroom asking rent from the first quarter of 2019 to the first quarter of 2026. After inflation, in first-quarter 2026 dollars, the classes are under 10%, 10% to 25%, 25% to 40%, and 40% or more. Three cities are in the smallest class, 21 in the second, 11 in the third and 4 in the largest. Toronto is the only city with a decline, drawn as a blue arrow pointing down: −15.3%.',
			'The largest increases after inflation are in Drummondville (+63.4%), Sherbrooke (+51.0%), Halifax (+45.5%), St. John’s (+45.0%) and Moncton (+39.0%). Among the smallest are Winnipeg (+9.3%), Edmonton (+1.1%) and Vancouver (+0.8%). Before adjusting for inflation, every city has an increase, from +3.9% in Toronto to +105.0% in Drummondville.',
			'Insets enlarge southern British Columbia, southern Ontario and southern Quebec, where cities are close together. A toggle above the map switches between the after-inflation and before-inflation views, and hovering over or tapping an arrow shows that city’s starting and latest rent.'
		],
		data: 'net-change-by-city.csv',
		widths: [360, 720],
		graphicVerb: 'created',
		note: 'Longer, darker arrows mean a larger increase; blue marks a decline. After inflation, each city’s Q1 2019 rent is restated in first-quarter 2026 dollars using its province’s monthly consumer price index. Cities need a Q1 2019 value and at least eight quarters of data, which leaves out Saguenay and Trois-Rivières.'
	},
	'city-rent-trajectories': {
		title: 'Most cities saw a steep climb in asking rents followed by a modest drop – but with several exceptions',
		source: askingSource,
		alt: "Small line charts of the net change in two-bedroom asking rent since the first quarter of 2019, after inflation, for Canada and each of 40 cities. Canada's line rises to a peak of 26% in the fourth quarter of 2023 and then slips to 15% by the first quarter of 2026. Vancouver, Calgary and Montréal follow the same climb and partial fall. Toronto never rises above its 2019 level and ends 15% below it. Only Saskatoon ends at its highest level.",
		description: [
			'The graphic is a grid of small line charts, all on the same scale, each showing one city’s net change in two-bedroom asking rent from its own first-quarter 2019 level, quarter by quarter to the first quarter of 2026. A large panel for Canada and panels for Vancouver, Calgary, Toronto and Montréal come first, followed by the other 36 cities, region by region from British Columbia to the Atlantic provinces and from west to east within each. A grey line for Canada runs behind each city for comparison, and small ticks along the bottom mark each year.',
			'After inflation, Canada’s line rises from 0% to a peak of +25.6% in the fourth quarter of 2023, then falls to +14.5%. Vancouver peaks at +22.5% (third quarter of 2023) and ends at +0.8%; Calgary peaks at +34.3% and ends at +13.5%; Montréal peaks at +43.5% and ends at +34.0%. Toronto never rises above its 2019 level and ends at −15.3%. Of the 40 cities, 39 end below their peak; Saskatoon ends at its highest level.',
			'Each line takes the colour of its city’s arrow on the map, with blue for a decline. A toggle switches between after-inflation and before-inflation rents, and hovering over or tapping a panel shows the city’s starting and latest rent and its peak.'
		],
		data: 'net-change-by-quarter.csv',
		widths: [360, 720],
		graphicVerb: 'created',
		note: 'Each line shows a city’s net change from its own Q1 2019 level, in first-quarter 2026 dollars after inflation unless switched to before inflation. Line colours match the arrows on the map. Grey is Canada: Statistics Canada’s own series for all census metropolitan areas combined, not an average of the cities shown.'
	},
	'asking-vs-paid': {
		title: 'Despite a decline in asking rents since late 2023, the rents primary-market tenants actually pay are largely still rising',
		source:
			'Statistics Canada, Table 46-10-0092-01 (two-bedroom asking rents, Q4 2023 to Q1 2026; Canada is all census metropolitan areas); Canada Mortgage and Housing Corporation (CMHC), Rental Market Survey (average rent in occupied purpose-built apartments, October 2023 to October 2025; Canada is the average of 40 metros weighted by rental units); Statistics Canada, Table 18-10-0004-01 (monthly consumer price index).',
		alt: 'Dumbbell chart of the change since late 2023 in asking rents and in the rents people pay, after inflation, for Canada and 12 cities. Across Canada, asking rents are down 9% and rents paid are up 8%. In all 12 cities, rents paid have risen more than asking rents: asking rents are down in 10 of them and rents paid are up in 11. The gap is widest in Québec City (asking −7%, paid +17%), Calgary (−16%, +7%), Montréal (−6%, +15%) and Vancouver (−16%, +3%). A toggle switches to before inflation.',
		description: [
			'The graphic is a dumbbell chart. Each row is a place, with a crimson dot for the change in its asking rent and a plum dot for the change in the average rent people pay in purpose-built rental apartments, joined by a line. Canada is the top row on a light grey band, followed by 12 cities sorted by how far rents paid are ahead of asking rents. The horizontal axis is the percentage change since late 2023, when asking rents peaked nationally: from the fourth quarter of 2023 to the first quarter of 2026 for asking rents, and from October 2023 to October 2025 for rents paid.',
			'After inflation, Canada’s asking rents are down 8.8% and rents paid are up 8.4%. Of the 12 cities, rents paid have risen more than asking rents in every one. Asking rents are down in 10 and rents paid are up in 11. Québec City is highest on the sorted list (asking −7%, paid +17%), followed by Calgary (−16%, +7%), Montréal (−6%, +15%), Vancouver (−16%, +3%), Kitchener (−12%, +6%), St. John’s (−5%, +10%), Halifax (−5%, +10%), Edmonton (−3%, +10%), Toronto (−12%, +1%), Ottawa (0%, +8%), Hamilton (−6%, 0%) and Winnipeg (+5%, +7%). Before inflation, Canada’s asking rents are down 4.5% and rents paid are up 13.0%.',
			'A toggle above the chart switches between after-inflation and before-inflation changes, and hovering over or tapping a row shows that place’s two figures.'
		],
		data: 'asking-vs-paid-change.csv',
		widths: [360, 720],
		graphicVerb: 'created',
		note: 'The two sources cover different units, so only changes are compared, never dollar levels. A change in the CMHC average can also reflect new buildings entering the survey. The Canada figure for rents paid averages the 40 metros with complete records, weighted by their rental units.'
	},
	'headline-context': {
		title: 'Headlines about falling rents were unlikely to give context about rental trends broadly',
		subtitle: 'Canadian news headlines about rents falling and rising, 2019–2026, by whether they give some context',
		source:
			'Headlines containing “rent” or “rents” from 41 Canadian news outlets, mostly CTV News, Toronto Star, Global News, The Globe and Mail and CBC (not every outlet in the country), January 2019 to March 2026, collected through Media Cloud and coded by two independent passes of a language model.',
		alt: 'Two bars of thin vertical lines, one line per news headline. Of 145 headlines about falling rents, 22 (15%) give some context, shown in red, and 123 give little, shown in grey. Of 360 headlines about rising rents, 38 (11%) give some context. Hovering over or selecting a line shows the headline, its outlet and date, and a link to the article.',
		description: [
			'The graphic has two horizontal bars, one for headlines about rents falling and one for headlines about rents rising. Every headline is one thin vertical line, and each bar is split into the headlines that give some context, in red, and those that give little, in grey. Both bars use the same line width and spacing, so their lengths compare directly.',
			'A headline gives some context if it says the change is small or slowing, that rents are still high or above an earlier level (or falling from a peak), that the trend differs elsewhere or for some people, that affordability tells a different story, or that the trend may not last. Of 145 headlines about falling rents, 22 (15.2%) give some context. Of 360 headlines about rising rents, 38 (10.6%) do.',
			'Hovering over, tapping, or moving along a bar with the left and right arrow keys opens a card with the headline, the outlet, the date, the kind of context given, and a link to the article. All 505 headlines are in the downloadable data.'
		],
		data: 'headlines-classified.csv',
		widths: [360, 720],
		graphicVerb: 'created',
		note: 'A figure alone, a record high, or a streak does not count as context, and only the headline is read, so an article may say more. Comparisons with an earlier level are coded as “still above” it, since after inflation rents are higher than in 2019 nearly everywhere; Toronto is the one city where they are lower.'
	}
};

export default resolveDownloads(charts, { dataUrls, pngUrls, embedMeta });
