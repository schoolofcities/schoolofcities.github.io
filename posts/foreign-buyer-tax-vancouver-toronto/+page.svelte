<script>
	import ChartFrame from '$lib/ChartFrame.svelte';
	import charts from './charts.js';
	import meta from './meta.json';
	import PolicyTimeline from './charts/policy-timeline.svelte';
	import HomeownershipByCitizenship from './charts/homeownership-by-citizenship.svelte';
	import RentGap from './charts/rent-gap.svelte';

	const paperDoc = meta.documents.find((d) => d.type === 'paper');
	const briefDoc = meta.documents.find((d) => d.type === 'brief');
</script>

<div class="text">

<p>
	Foreign buyer taxes (FBTs) are additional property-transfer taxes charged only to buyers who are not Canadian citizens or permanent residents. The British Columbia provincial government introduced the first FBT in Canada in August 2016, a 15% surcharge on residential purchases in Metro Vancouver. Ontario followed in April 2017 with a 15% tax across the Greater Golden Horseshoe. Both provinces later raised their rates and expanded the areas covered, and the Federal government added a temporary ban on foreign purchases in 2023.
</p>

<p>
	A stated goal of FBTs was to improve housing affordability for local residents by discouraging foreign speculative buying. 
</p>

<p>
	The charts on this page are adapted from <a href={paperDoc.link} target="_blank" rel="noopener noreferrer">research by Taesoo Song (2025), published in the Journal of Urban Affairs</a>, part of which examines what these taxes actually achieved in terms of housing market outcomes: 1) whether the taxes changed who owns homes in the cities they targeted, and 2) whether they made renting more affordable in those same areas. 
</p>

</div>



<ChartFrame meta={charts['policy-timeline']} authors={meta.authors} license={meta.license} chartKey="policy-timeline">
	<PolicyTimeline />
</ChartFrame>

<div class="text">


<p>
	Because FBTs apply specifically to non-permanent residents, immigrants who have not yet obtained citizenship or permanent residency, one direct analysis is whether home ownership fell for that group after the taxes took effect. It did. In both Vancouver and Toronto, based on Statistics Canada data, the share of non-permanent residents living in an owner-occupied home dropped sharply between 2016 and 2021, a pattern not seen among Canadian-born or permanent-resident households, or in cities without a tax.
</p>

</div>

<ChartFrame meta={charts['homeownership-by-citizenship']} authors={meta.authors} license={meta.license} chartKey="homeownership-by-citizenship">
	<HomeownershipByCitizenship />
</ChartFrame>

<div class="text">

<p>
	To look at impacts on rents, Song (2025) estimated the effect of foreign buyer taxes using dynamic difference-in-differences models. This compares median rent in areas subject to a foreign buyer tax against similar areas that weren't, from 2010 to 2021, controlling for each area's employment, recent immigration, and new housing supply. For each year, it reports how far median rents in taxed areas diverged from untaxed areas, relative to a baseline set just before that region's tax took effect.
</p>

<p>
	The chart below presents the model results as each year's percentage gap in rent growth between taxed and untaxed areas, relative to a baseline year. The baseline is the year before the region's FBT started. Dots are colored by whether that year falls before or after the region's tax was introduced.
</p>

</div>

<ChartFrame meta={charts['rent-gap']} authors={meta.authors} license={meta.license} chartKey="rent-gap">
	<RentGap />
</ChartFrame>



<div class="text">

<details class="details-block" style="margin-bottom: 60px;">
	<summary>About the dynamic difference-in-differences models</summary>
	<p>
		A standard difference-in-differences model compares one group's change over time to another group's change, before and after a policy, and treats the gap between them as the estimated effect. A dynamic version, also called an event study, estimates that gap separately for each year rather than assuming one constant effect for the whole post-policy period. That makes it possible to see how the effect builds or fades over time, and to check that taxed and untaxed areas were not already trending apart before the tax existed. 
	</p>
	<p>
		For each census subdivision (i.e. municipality) and year, Song's (2025) model can be described roughly as: median rent (logged) equals a baseline, plus a separate effect for each year the area was taxed, plus fixed effects for area and year, plus controls for local employment, recent immigration, and new housing supply. The area and year fixed effects account for anything constant about a specific place, or common to a specific year, that isn't the tax itself, so the remaining year-by-year effects reflect the tax's association with rents specifically.
	</p>
	<p>
		Because rent enters the model in log form, each year's estimated effect (reported in the paper's Table A1) is a log-point difference rather than a percentage. The chart on this page converts those coefficients into percentages using (e^coefficient − 1) × 100, the standard back-transformation for a log-linear model. 
	</p>
	<p>
		A few caveats from the paper are worth noting. The approach assumes taxed and untaxed areas would have followed similar rent trends without the tax. Pre-tax years show no significant gap, which supports that assumption but doesn't fully confirm it. Effects for 2020 and 2021 may also partly reflect pandemic-era disruption to rental markets, which isn't separately accounted for. And the underlying CMHC rental data excludes secondary rentals such as condos and houses rented out by their owners, so any demand that shifted specifically into that segment wouldn't be captured by this data. For British Columbia, the untaxed comparison group is limited to regions never subject to an FBT, which excludes regions where the tax was extended starting in 2018.
	</p>
	<p>
		For the full model specification and complete results, including standard errors and significance levels for every year, see Table A1 in <a href={paperDoc.link} target="_blank" rel="noopener noreferrer">Song (2025)</a>.
	</p>
</details>

<p>
	Taken together, these results suggest the taxes fell short of their affordability goal. Rents in taxed areas of British Columbia actually rose faster than in untaxed areas after 2016, reaching an estimated 12.7% higher by 2019. Ontario's effect was smaller and mostly not statistically significant. Meanwhile, non-permanent residents, the group the tax directly targets, saw home ownership decline in exactly the cities where the tax applied, with no equivalent shift elsewhere. One likely explanation, according to Song (2025), is that the tax did not reduce housing demand so much as redirect it. By making ownership harder for non-permanent residents, it appears to have pushed some of that group into the rental market instead, adding pressure to rents in the very areas the tax was meant to help.
</p>

<p>
	Read the <a href={briefDoc.link ?? '#'} target="_blank" rel="noopener noreferrer">School of Cities Policy Brief</a>, which describes what these findings mean for policymakers weighing similar measures.
</p>

</div>
