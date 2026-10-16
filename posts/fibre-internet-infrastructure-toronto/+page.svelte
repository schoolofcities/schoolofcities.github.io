<script>
	import ChartFrame from '$lib/ChartFrame.svelte';
	import charts from './charts.js';
	import meta from './meta.json';
	import FibreConstructionTotals from './charts/fibre-construction-totals.svelte';
	import BellPriceWithCompetitor from './charts/bell-price-with-competitor.svelte';
	import Footnote from '$lib/footnotes/Footnote.svelte';
	import Footnotes from '$lib/footnotes/Footnotes.svelte';
	import { createFootnoteStore } from '$lib/footnotes/footnoteUtils.js';

	const paperDoc = meta.documents.find((d) => d.type === 'paper');
	const brimiDoc = meta.documents.find((d) => d.type === 'project-site');

	const footnoteStore = createFootnoteStore();

	// The paper gives this as $1.4 billion; Bell's own announcement was $1.14 billion.
	const fBellInvestment = footnoteStore.addFootnote(
		"BCE Inc. (2015, August 6). BCE reports second quarter 2015 results [News release]. [URL](https://www.sec.gov/Archives/edgar/data/0000718940/000071894015000032/news_q215.htm)."
	);
	const fOccupancyFees = footnoteStore.addFootnote(
		[
			"Canadian Radio-television and Telecommunications Commission. (2001). *Decision CRTC 2001-23: Ledcor/Vancouver – Construction, operation and maintenance of transmission lines in Vancouver*. [URL](https://crtc.gc.ca/eng/archive/2001/dt2001-23.htm).",
			"On Ontario law, Mersereau (2026) cites the fees and charges regulation under the Municipal Act, 2001 ([O. Reg. 584/06](https://www.ontario.ca/laws/regulation/060584)) and s. 267(2) of the [City of Toronto Act, 2006](https://www.ontario.ca/laws/statute/06c11)."
		].join("\n\n")
	);
	const fWholesaleFibre = footnoteStore.addFootnote(
		[
			"Canadian Radio-television and Telecommunications Commission. (2024). *Telecom Regulatory Policy CRTC 2024-180*. [URL](https://crtc.gc.ca/eng/archive/2024/2024-180.htm).",
			"Canadian Radio-television and Telecommunications Commission. (2025). *Telecom Decision CRTC 2025-154*. [URL](https://crtc.gc.ca/eng/archive/2025/2025-154.htm)."
		].join("\n\n")
	);
</script>

<div class="text">

<p>
	Bell Canada did three-quarters of the fibre-internet construction permitted under Toronto's streets between 2012 and 2022: 2,319 of 3,096 kilometres, about 3.5 times as much as Rogers Communications. Beanfield, the only other company in the records, did 4%. And Bell and Rogers mostly built on different streets.
</p>

<p>
	These figures come from <a href={paperDoc.link} target="_blank" rel="noopener noreferrer">research by Michel Mersereau (2026), published in Telecommunications Policy</a>, using the City of Toronto's own records. Telecommunications companies need a City permit to dig up or build in streets and sidewalks, and the City records the company, the type of work, the streets, the length, and the dates of each one. Mersereau obtained ten years of these records through a freedom of information request. The same request to the federal telecom regulator, the Canadian Radio-television and Telecommunications Commission (CRTC), found no records. The charts on this page are adapted from the paper.
</p>

</div>

<ChartFrame meta={charts['fibre-construction-totals']} authors={meta.authors} license={meta.license} chartKey="fibre-construction-totals">
	<FibreConstructionTotals />
</ChartFrame>

<div class="text">

<p>
	Most of this construction happened in a short burst. Bell announced a $1.14 billion fibre-to-the-home investment in Toronto in 2015,<Footnote id={fBellInvestment} /> and its construction peaked at 1,198 km in 2017 alone.
</p>

<p>
	The records also show where each company built, and so how often residents could choose between two fibre networks on the same street. Matching the records by street name, Mersereau (2026) found that only 726 of 5,820 street segments (12.5%) had construction by both Bell and Rogers. The maps below plot the permit locations for each company. Bell built across the whole city, Rogers in fewer places, and Beanfield mostly along a few arterial roads. Only 11% of the streets where Bell or Rogers built had construction by both, scattered across the city with somewhat more in the northeast.
</p>

<!-- Map to come (being redesigned in QGIS). -->

<p>
	Mersereau (2026) reads this pattern as the two incumbents avoiding head-to-head competition: Bell extending its lead across the city, while Rogers and Beanfield focus on distinct parts of the market, such as apartment and condominium buildings. Mersereau also found that most of Rogers' projects were new construction, even though many were filed as cable pulled through existing conduit, and reads this as Rogers building its own network rather than using Bell's.
</p>

<p>
	The paper also points to what a second fibre network can mean for prices. In a 2024 presentation to the City, Beanfield showed Bell's two gigabit fibre plans listed at $130 and $140 per month at Toronto addresses without Beanfield service, and at $60 per month at nearby buildings where Beanfield also offers service. This comes from a small number of addresses compiled by a competitor of Bell, so it shows listed prices at those buildings rather than a citywide price gap.
</p>

<!-- </div>

<ChartFrame meta={charts['bell-price-with-competitor']} authors={meta.authors} license={meta.license} chartKey="bell-price-with-competitor">
	<BellPriceWithCompetitor />
</ChartFrame>

<div class="text"> -->

<p>
	All of this construction occupies public land. Since a 2001 CRTC decision and later changes to Ontario law, municipalities can recover the direct costs of telecom construction in their streets but cannot charge an occupancy fee for the space the infrastructure takes up.<Footnote id={fOccupancyFees} /> Mersereau (2026) argues this amounts to a public subsidy. At $24.50 per metre per year, the average of fees previously proposed or contracted in Toronto, Vancouver, and Edmonton, the infrastructure built in Toronto from 2012 to 2022 would be charged about $75.8 million a year, $56.8 million of it to Bell.
</p>

<p>
	The City already collects these records as part of coordinating construction in its streets, while the federal regulator has none. Mersereau (2026) argues that the CRTC should collect them from municipalities on a regular basis, both to track competition and to inform how the use of public space is valued.
</p>

<details class="details-block data-methods">
	<summary>About the data</summary>

	<p>
		The City of Toronto's Engineering &amp; Construction Services division coordinates all construction in the public right-of-way, and requires companies to submit each project as GIS data. In response to Mersereau's freedom of information request, the City released a spreadsheet of 9,856 records for the three companies with fibre construction in this period: Bell Canada, Rogers Communications, and Beanfield. TekSavvy, the fourth company offering fibre home internet in Toronto, resells access to other companies' networks and does not appear in the records.
	</p>

	<p>
		The totals in the first chart are from the paper's Tables 3 and 5. They cover all types of work: new buried cable and conduit, support structures such as handwells, vaults, and poles, aerial cable, and cable pulled through existing conduit. Where several records shared one permit and repeated the permit's total length, Mersereau kept the length only once. Bell's 2017 figure was derived from the paper's Table 7, which converts each year's construction into an estimated occupancy fee at $24.50 per metre; we divided by the same rate to recover kilometres. The fees behind that rate ($36 proposed in Vancouver, $17.50 contracted in Toronto, and $20 proposed in Edmonton) are each charged per metre per year, so we describe the $75.8 million total as an annual amount. The paper calls it a cumulative total fee.
	</p>

	<p>
		The maps use a version of the same City records that Mersereau's <a href={brimiDoc.link} target="_blank" rel="noopener noreferrer">Broadband Infrastructure Market Insights</a> project geocoded to street segments for its interactive map. We kept the City of Toronto's records with start years from 2012 to 2022. Some records could not be placed on a street and are not shown, and map lines follow street segments rather than the permitted cable lengths, so the maps show where companies built rather than how much. To mark streets where both Bell and Rogers built, we flagged Bell construction within 15 metres of Rogers construction. This differs from the paper's street-name matching, so the fourth map is not a direct picture of its 12.5% figure.
	</p>

	<p>
		Rogers' new construction is from the paper's reclassification of its records. Rogers filed most of its projects under the City's cable-pulling category, but Mersereau found that most of their descriptions refer to trenching, boring, or new conduit, and counted them as construction instead.
	</p>

	<p>
		The records start in 2012, so fibre built earlier is not included. That covers Rogers' and Bell's fibre to neighbourhood nodes from the 1990s and 2000s, and the roughly 500 km network Beanfield acquired from the former Toronto Hydro Telecom, which makes up much of Beanfield's footprint according to Mersereau (2026). The records also show where companies built in public space, not where fibre service is available. They exclude work on private property, such as wiring inside apartment buildings, and work that didn't require a construction permit. They also end in 2022, before the CRTC began requiring Bell and other large phone companies to give competitors access to their fibre networks in 2025.<Footnote id={fWholesaleFibre} />
	</p>
</details>

<Footnotes footnotes={footnoteStore.footnotes} />

</div>
