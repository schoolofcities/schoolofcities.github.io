<script>
	import ChartFrame from '$lib/ChartFrame.svelte';
	import charts from './charts.js';
	import meta from './meta.json';
	import FibreConstructionTotals from './charts/fibre-construction-totals.svelte';
	import FibreConstructionByYear from './charts/fibre-construction-by-year.svelte';
	import FibreConstructionMap from './charts/fibre-construction-map.svelte';
	import BellPriceWithCompetitor from './charts/bell-price-with-competitor.svelte';

	const paperDoc = meta.documents.find((d) => d.type === 'paper');
	const brimiDoc = meta.documents.find((d) => d.type === 'project-site');
</script>

<div class="text">

<p>
	Bell Canada accounted for three-quarters of the fibre-internet construction permitted under Toronto's streets between 2012 and 2022: 2,319 of 3,096 kilometres, about 3.5 times as much as Rogers Communications. Beanfield, the only other company in the records, accounted for 4%.
</p>

<p>
	These figures come from <a href={paperDoc.link} target="_blank" rel="noopener noreferrer">research by Michel Mersereau (2026), published in Telecommunications Policy</a>. Telecommunications companies need a City permit to dig up or build in streets and sidewalks, and the City of Toronto keeps a record of each one: the company, the type of work, the streets, the length, and the dates. Mersereau obtained ten years of these records through a freedom of information request. The same request to the federal telecom regulator, the Canadian Radio-television and Telecommunications Commission (CRTC), found no records. The charts on this page are adapted from the paper.
</p>

</div>

<ChartFrame meta={charts['fibre-construction-totals']} authors={meta.authors} license={meta.license} chartKey="fibre-construction-totals">
	<FibreConstructionTotals />
</ChartFrame>

<div class="text">

<p>
	Most of this construction happened in a short burst. Bell announced a $1.4 billion fibre-to-the-home investment in Toronto in 2015, and its permitted construction rose from almost nothing that year to 1,198 km in 2017 alone. Rogers' construction grew more slowly and peaked at 189 km in 2019. For both companies, the peak came before the COVID-19 pandemic, and construction had largely stopped by 2021.
</p>

</div>

<ChartFrame meta={charts['fibre-construction-by-year']} authors={meta.authors} license={meta.license} chartKey="fibre-construction-by-year">
	<FibreConstructionByYear />
</ChartFrame>

<div class="text">

<p>
	The records also show where each company built, and so how often residents could choose between two fibre networks on the same street. Matching the records by street name, Mersereau (2026) found that only 726 of 5,820 street segments (12.5%) had construction by both Bell and Rogers. The map below plots the permit locations. Bell and Rogers lines appear across the whole city, but mostly on different streets: 12% of the mapped street length has construction by both. Shared streets are scattered, with somewhat more in the northeast of the city.
</p>

</div>

<ChartFrame meta={charts['fibre-construction-map']} authors={meta.authors} license={meta.license} chartKey="fibre-construction-map">
	<FibreConstructionMap />
</ChartFrame>

<div class="text">

<p>
	Mersereau (2026) reads this pattern as the two incumbents avoiding head-to-head competition: Bell extending its lead across the city, while Rogers and Beanfield focus on distinct parts of the market, such as apartment and condominium buildings.
</p>

<p>
	The paper also points to what a second fibre network can mean for prices. In a 2024 presentation to the City, Beanfield showed Bell's two gigabit fibre plans listed at $130 and $140 per month at Toronto addresses without Beanfield service, and at $60 per month at nearby buildings where Beanfield also offers service. This comes from a small number of addresses compiled by a competitor of Bell, so it shows listed prices at those buildings rather than a citywide price gap.
</p>

</div>

<ChartFrame meta={charts['bell-price-with-competitor']} authors={meta.authors} license={meta.license} chartKey="bell-price-with-competitor">
	<BellPriceWithCompetitor />
</ChartFrame>

<div class="text">

<p>
	All of this construction occupies public land. Since a 2001 CRTC decision and later changes to Ontario law, municipalities can recover the direct costs of telecom construction in their streets but cannot charge an occupancy fee for the space the infrastructure takes up. Mersereau (2026) estimates that applying $24.50 per metre, the average of fees previously proposed or contracted in Toronto, Vancouver, and Edmonton, to the infrastructure built in Toronto from 2012 to 2022 would total about $75.8 million, $56.8 million of it from Bell. The paper argues that the CRTC should collect this kind of construction data from municipalities on a regular basis, both to track competition and to inform how the use of public space is valued.
</p>

<details class="details-block data-methods">
	<summary>About the data</summary>

	<p>
		The City of Toronto's Engineering &amp; Construction Services division coordinates all construction in the public right-of-way, and requires companies to submit each project as GIS data. In response to Mersereau's freedom of information request, the City released a spreadsheet of 9,856 records for the three companies with fibre construction in this period: Bell Canada, Rogers Communications, and Beanfield. TekSavvy, the fourth company offering fibre home internet in Toronto, resells access to other companies' networks and does not appear in the records.
	</p>

	<p>
		The totals in the first chart are from the paper's Tables 3 and 5. They cover all types of work: new buried cable and conduit, support structures such as handwells, vaults, and poles, aerial cable, and cable pulled through existing conduit. Where several records shared one permit and repeated the permit's total length, Mersereau kept the length only once. The annual figures in the second chart were derived from the paper's Table 7, which converts each year's construction into an estimated occupancy fee at $24.50 per metre. We divided those fees by the same rate to recover kilometres, and they sum to the paper's totals.
	</p>

	<p>
		The map uses a version of the same City records that Mersereau's <a href={brimiDoc.link} target="_blank" rel="noopener noreferrer">Broadband Infrastructure Market Insights</a> project geocoded to street segments for its interactive map. Some records could not be placed on a street and are not shown, and map lines follow street segments rather than the permitted cable lengths, so the map shows where companies built rather than how much. To mark streets where both companies built, we flagged Bell construction within 15 metres of Rogers construction. This differs from the paper's street-name matching, so the map is not a direct picture of its 12.5% figure.
	</p>

	<p>
		The records start in 2012, so fibre built earlier is not included. That covers Rogers' and Bell's fibre to neighbourhood nodes from the 1990s and 2000s, and the roughly 500 km network Beanfield acquired from the former Toronto Hydro Telecom, which makes up much of Beanfield's footprint according to Mersereau (2026). The records also show where companies built in public space, not where fibre service is available. They exclude work on private property, such as wiring inside apartment buildings, and work that didn't require a construction permit. They also end in 2022, before the CRTC's 2025 decision requiring large companies to give competitors access to their fibre networks.
	</p>
</details>

<p>
	Taken together, the City's own permit records show a fibre market built mostly by one company, in a burst of construction that ended before 2020, with little overlap between the two largest networks. Mersereau (2026) shows that these records, which are already collected by the City, can make that pattern visible to regulators and the public.
</p>

</div>
