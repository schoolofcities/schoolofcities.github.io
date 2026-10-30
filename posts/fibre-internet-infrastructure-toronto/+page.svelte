<script>
	import ChartFrame from '$lib/ChartFrame.svelte';
	import charts from './charts.js';
	import meta from './meta.json';
	import FibreConstructionTotals from './charts/fibre-construction-totals.svelte';
	import FibreConstructionOverlap from './charts/fibre-construction-overlap.svelte';
	import Footnote from '$lib/footnotes/Footnote.svelte';
	import Footnotes from '$lib/footnotes/Footnotes.svelte';
	import { createFootnoteStore } from '$lib/footnotes/footnoteUtils.js';

	const paperDoc = meta.documents.find((d) => d.type === 'paper');
	const brimiDoc = meta.documents.find((d) => d.type === 'project-site');

	const footnoteStore = createFootnoteStore();

	const fPriceCaveat = footnoteStore.addFootnote(
		"These prices come from a small number of addresses compiled by Beanfield, a competitor of Bell, so they show listed prices at those buildings rather than a citywide price gap. Beanfield's 2024 presentation to the City of Toronto's Technology Services Division is reproduced in Table 6 of Mersereau (2026)."
	);
	const fOccupancyFees = footnoteStore.addFootnote(
		[
			"Canadian Radio-television and Telecommunications Commission. (2001). *Decision CRTC 2001-23* (Ledcor/Vancouver). [URL](https://crtc.gc.ca/eng/archive/2001/dt2001-23.htm).",
			"On Ontario law, Mersereau (2026) cites the fees and charges regulation under the Municipal Act, 2001 ([O. Reg. 584/06](https://www.ontario.ca/laws/regulation/060584)) and s. 267(2) of the [City of Toronto Act, 2006](https://www.ontario.ca/laws/statute/06c11)."
		].join("\n\n")
	);
	const fBlindness = footnoteStore.addFootnote(
		"Mersereau (2026), p. 19."
	);
</script>

<div class="text">

<p>
	Much of the fibre-optic cable that brings internet into Toronto homes and businesses runs under the City's public streets. Which companies build these networks, and where, matters both for competition between companies and for how that public land is used.
</p>

<p>
	The City records permits to dig up or build in the public right-of-way, its streets and sidewalks, including who did the work, where, and when. Michel Mersereau, a researcher at the University of Toronto's Faculty of Information, obtained these records for 2012 to 2022 through a freedom of information request. The records list the streets where each company built. Mersereau's <a href={brimiDoc.link} target="_blank" rel="noopener noreferrer">Broadband Infrastructure Market Insights</a> project geocoded them onto Toronto's streets.
</p>

</div>

<ChartFrame meta={charts['fibre-construction-totals']} authors={meta.authors} license={meta.license} chartKey="fibre-construction-totals">
	<FibreConstructionTotals />
</ChartFrame>

<div class="text">

<p>
	Most of this construction happened in a short period. Bell Canada's construction peaked in 2017, with 3,192 projects that year alone.
</p>

<p>
	Matching the records of Bell and Rogers Communications by street and cross streets, Mersereau found only about 12.5% of street segments had construction by both.
	Mersereau reads this pattern as Bell and Rogers, the two largest providers in Toronto, avoiding head-to-head competition. Bell expanded across many local streets, while Rogers and Beanfield, a smaller Toronto company, focused more on specific parts of the market, such as neighbourhoods with higher-density apartment and condominium buildings.
</p>


</div>

<ChartFrame meta={charts['fibre-construction-overlap']} authors={meta.authors} license={meta.license} chartKey="fibre-construction-overlap">
	<FibreConstructionOverlap />
</ChartFrame>

<div class="text">

<p>
	Mersereau's research also points to what competition, or lack thereof, can mean for prices. In a 2024 presentation to the City, Beanfield showed Bell's two gigabit fibre plans listed at up to $140 per month at Toronto addresses without Beanfield service, and at $60 per month at nearby buildings where Beanfield also offers service.<Footnote id={fPriceCaveat} />
</p>

<p>
	All of this construction occupies public land. Since a 2001 decision by the federal telecom regulator, the Canadian Radio-television and Telecommunications Commission (CRTC), and later changes to Ontario law, Ontario municipalities can recover the direct costs of telecom construction in their streets but cannot charge an occupancy fee for the space the infrastructure takes up.<Footnote id={fOccupancyFees} /> Mersereau argues this amounts to a public subsidy. Based on fees proposed or contracted in Canadian cities Mersereau estimates fees of about $75.8 million for the infrastructure built in Toronto from 2012 to 2022.
</p>

<p>
	Together, the City's records show that from 2012 to 2022, most new fibre construction was done by one company (Bell), with little overlap between companies, under streets where no occupancy fee is charged. The City already collects these records as part of coordinating construction in its streets. The same freedom of information request to the CRTC found no data. Mersereau recommends that the CRTC collect this data from municipalities on a regular basis, both to track competition and to inform how the use of public space is valued. Without such data the regulator is "operating in a state of partial blindness."<Footnote id={fBlindness} />
</p>

<Footnotes footnotes={footnoteStore.footnotes} />

</div>
