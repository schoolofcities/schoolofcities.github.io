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

const source =
	'Statistics Canada, Building Permits Survey, Table 34-10-0292-01, Building permits, by type of structure and type of work (monthly, unadjusted).';

const charts = {
	'conversions-canada-trend': {
		title: 'Permits for new dwellings from building conversions in Canada more than doubled from 2018 to 2025',
		subtitle:
			'Conversions rose from 6% to 11% of new dwellings in issued building permits over this period',
		source,
		alt: 'A bar chart of yearly counts above a line chart of percent, sharing the years 2018 to 2025. Both rise over the period, with the biggest yearly increases in 2021 and 2024, and the percent levels off in 2025.',
		note: 'Dwelling units to be created according to building permits issued in each year. These are not starts or completions, as some permits won’t lead to construction. Counts are rounded to the nearest hundred.',
		data: ['canada-annual.csv', 'dwelling-units-created-monthly.csv'],
		widths: [360, 720],
		graphicVerb: 'created'
	},
	'conversions-by-cma': {
		title: 'Toronto accounted for nearly three in ten new dwellings from conversions in Canada',
		subtitle:
			'Total and percent of new dwellings from building conversions in each census metropolitan area, 2018 to 2025 (based on issued building permits)',
		source,
		alt: 'A bar chart of 39 census metropolitan areas, sorted by number of dwelling units from conversions, with bars coloured by percent from yellow (low) to purple (high). Montréal is second to Toronto. The highest percents are in smaller regions, such as Guelph and Greater Sudbury.',
		note: 'Dwelling units to be created according to building permits issued from 2018 to 2025, not dwelling units completed. Percent is of all permits for new dwelling units, from new construction and conversions.',
		data: ['conversions-by-cma.csv', 'dwelling-units-created-monthly.csv'],
		widths: [360, 720],
		graphicVerb: 'created'
	},
	'conversions-share-by-year': {
		title: 'Conversions as a percent of all new dwellings increased from 2018 to 2025 in six of the eight largest urban regions in Canada',
		subtitle:
			'Percent of new dwellings from conversions in issued building permits, eight largest census metropolitan areas, 2018 to 2025',
		source,
		alt: 'Eight small area charts, one per region, each showing the percent by year against a Canada reference line. Toronto reaches the highest percent, 21% in 2022. Vancouver stays below Canada’s percent in every year.',
		note: 'Dwelling units to be created according to building permits issued from 2018 to 2025, not dwelling units completed. Percent is of all permits for new dwelling units, from new construction and conversions.',
		data: 'conversions-share-by-year.csv',
		widths: [360, 720],
		graphicVerb: 'created'
	},
	'conversions-by-type-bars': {
		title: 'Most new dwellings from conversions in Canada come from splitting single dwellings into several',
		subtitle:
			'Percent of new dwellings created by converting existing buildings, by type of conversion, 2018 to 2025 (issued building permits)',
		source,
		alt: 'A unit chart with one vertical bar of 100 squares for Canada and for each of eight regions, split into three types of conversion. Single dwelling to multiple dwellings is over 70% in Toronto, Vancouver, Edmonton and Calgary, while multiple to multiple leads in Montréal and Québec and non-residential to residential in Winnipeg. Ottawa-Gatineau is more evenly split.',
		note: 'Dwelling units to be created according to building permits issued from 2018 to 2025. Conversions are the sum of three types of work: non-residential to residential, single dwelling to multiple dwellings, and multiple dwellings to multiple dwellings. Percents are rounded so that each bar adds to 100%. Totals are rounded to the nearest hundred.',
		data: 'conversions-by-cma.csv',
		widths: [360, 720, 1080],
		graphicVerb: 'created'
	}
};

export default resolveDownloads(charts, { dataUrls, pngUrls, embedMeta });
