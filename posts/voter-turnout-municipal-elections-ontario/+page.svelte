<script>
	import ChartFrame from '$lib/ChartFrame.svelte';
	import charts from './charts.js';
	import meta from './meta.json';
	import TurnoutByElection from './charts/turnout-by-election.svelte';
	import TurnoutByMayoralVote from './charts/turnout-by-mayoral-vote.svelte';
	import Footnote from '$lib/footnotes/Footnote.svelte';
	import Footnotes from '$lib/footnotes/Footnotes.svelte';
	import { createFootnoteStore } from '$lib/footnotes/footnoteUtils.js';

	const dataUrl = 'https://open.canada.ca/data/en/dataset/a5871234-ed52-4c79-af33-b205aee59fd3';

	const footnoteStore = createFootnoteStore();


	const fPopulation = footnoteStore.addFootnote(
		"Population is from the 2021 Census of Population, Statistics Canada."
	);
	const fCommentary = footnoteStore.addFootnote(
		[
			"Marshall, S. (2023, March 7). Election: Voter turnout in 2022. *Spacing Toronto*. [URL](https://spacing.ca/toronto/2023/03/07/election-voter-turnout-in-2022/).",
			"The Canadian Press. (2022, October 25). Where were the voters? Low Ontario turnout caused by fatigue and non-competitive race: experts. *CBC News*. [URL](https://www.cbc.ca/news/canada/toronto/ontario-election-low-voter-turnout-1.6629007)."
		].join("\n\n")
	);
	const fFrequency = footnoteStore.addFootnote(
		"Kostelka, F., Krejcova, E., Sauger, N., & Wuttke, A. (2023). Election frequency and voter turnout. *Comparative Political Studies*, 56(14), 2231–2268. [DOI](https://doi.org/10.1177/00104140231169020)."
	);
	// Both sources back the same sentence, so they share one footnote; a blank
	// line between references stacks them in the tooltip and the reference list.
	const fBarometer = footnoteStore.addFootnote(
		[
			"Eidelman, G., Merrill, R., McMahon, N., Vanhooren, S., McCoy, K., Sachdeva, R., Galati, K., Exon Smith, K., Breux, S., & Lucas, J. (2026). *The State of Local Democracy in Canada: Insights from the Canadian Municipal Barometer, 2020–25*. School of Cities. [URL](https://utoronto.scholaris.ca/items/ee90a010-6b1e-4439-9020-6e8b8f3ea887).",
			"Andrews, B., & Pruysers, S. (2022). Does democracy die in darkness? An examination of the relationship between local newspaper health and turnout in municipal politics. *Canadian Journal of Political Science*, 55(4), 958–971. [DOI](https://doi.org/10.1017/S0008423922000737)."
		].join("\n\n")
	);
</script>

<div class="text">

<p>
	Ontario holds municipal elections every four years, on the fourth Monday in October. Voters elect a mayor and council, as well as school board trustees, and in municipalities that sit within a region, members of regional council. We compared voter turnout data across the three most recent municipal elections in Ontario for every city and town with more than 75,000 residents.<Footnote id={fPopulation} /> Together these 34 municipalities had 7.1 million eligible electors in 2022.
</p>

</div>

<ChartFrame meta={charts['turnout-by-election']} authors={meta.authors} license={meta.license} chartKey="turnout-by-election">
	<TurnoutByElection />
</ChartFrame>

<div class="text">

<!-- <p>
	Toronto is the largest outlier. Its 2014 turnout of 54.7% was the highest of any municipality in any of the three elections; by 2022 it was 29.7%, a drop of 25 percentage points. London (down 17.7 points) and Guelph (down 17.2) had the next largest declines. The typical decline was about 7 points.
</p>

<p>
	Ottawa moved in the opposite direction. It is the only municipality where turnout rose in both 2018 and 2022, from 39.9% to 43.8%, which was the highest of the 34 in 2022. Hamilton is the only other municipality that finished higher than it started, at 35.4% compared with 34.0%. Barrie, Richmond Hill, and Cambridge were close to flat, each within one point of their 2014 turnout.
</p> -->

<p>
	In 2014, only 3 of the 34 municipalities had turnout below 30%. In 2022, 21 did. We found no research that directly explains the 2022 drop. Commentators pointed to the COVID-19 pandemic and to election fatigue (the October 2022 municipal elections came four months after the June 2022 provincial election and 13 months after the September 2021 federal election).<Footnote id={fCommentary} /> Research from Europe found that more frequent elections tend to lower turnout.<Footnote id={fFrequency} />
</p>

<p>
	Earlier research does point to some of the reasons turnout differs between municipalities. A study using <a href="https://www.cmb-bmc.ca/" target="_blank" rel="noopener noreferrer">Canadian Municipal Barometer</a> data on 233 municipalities in Ontario, Quebec, British Columbia, and Alberta, in their 2017 and 2018 elections, found that turnout was higher where there were more local newspapers that published more often, where councils had more seats relative to population, and where mayoral races were closer. Turnout also tends to be lower where a larger share of residents were aged 18 to 34.<Footnote id={fBarometer} />
</p>

<p>
	In our look at Ontario's largest municipalities, a city's size says little about its turnout: population and turnout are essentially uncorrelated in each of the three elections. How a municipality is governed makes a small difference. Single-tier cities, which are not part of a regional government, had a higher median turnout in all three elections than lower-tier municipalities, which sit within a region (e.g. Peel, York, etc.).
</p>

<p>
	The closeness of the mayoral race accounts for more of the difference, in line with the earlier research. In each of the three elections, turnout tended to be lower where the winning mayoral candidate took a larger share of the vote.
</p>

</div>

<ChartFrame meta={charts['turnout-by-mayoral-vote']} authors={meta.authors} license={meta.license} chartKey="turnout-by-mayoral-vote">
	<TurnoutByMayoralVote />
</ChartFrame>

<div class="text">

<p>
	We will likely update these charts after 2026 elections when the data are available.
</p>

<div class="details-block data-methods" style="margin-top: 60px; margin-bottom: 60px;">
	<h2>Methods and data</h2>

	<p>
		Turnout data are from the <a href={dataUrl} target="_blank" rel="noopener noreferrer">Municipal election results</a> dataset published by the Government of Ontario, which has one file of municipal data for each of the 2014, 2018, and 2022 elections. Turnout is the number of electors who voted divided by the total number of eligible electors.
	</p>

	<p>
		We included every single-tier and lower-tier municipality with a population above 75,000 in the 2021 Census of Population. That is 34 municipalities: 26 cities, six towns (Oakville, Whitby, Milton, Ajax, Newmarket, and Caledon), and two with the status of municipality (Chatham-Kent and Clarington). Upper-tier regions and counties are not included.
	</p>

	<p>
		We replaced three values with figures published by the cities themselves. The provincial file has no figures for Toronto in 2014, so we used the City of Toronto's count (991,754 voters of 1,813,915 eligible electors). For Toronto in 2018, the provincial file lists about 204,000 fewer electors than the City's final count, which gives a turnout of 45.1% instead of the City's 40.9%; we used the City's figures (769,044 of 1,880,371). For Barrie in 2018, the provincial file gives a turnout of 47.4%, while the City of Barrie reported 29.65%; we used the City's figure. The downloadable data marks these three values.
	</p>

	<p>
		The mayoral results are from the same dataset's files of successful candidates, which give the votes cast for the winning candidate and the total votes cast for the office. We divided the first by the second. The files do not list losing candidates, so we could not calculate the margin of victory. Two of the 102 contests are left out of the third chart: Newmarket in 2022, where the mayor was acclaimed, and Milton in 2022, where the file has no total for the office.
	</p>

	<h3>Limitations</h3>

	<p>
		Municipalities report these figures to the Province voluntarily, and we did not compare every value with each municipality's own published results. The three substitutions above are the ones we found; there may be others.
	</p>

	<p>
		Turnout depends on the voters' list as well as on the number of people who vote. A list that includes people who have moved or died lowers measured turnout, and a list that misses eligible residents raises it. The quality of the list can differ between municipalities and between elections, so small differences in turnout should be read with caution.
	</p>

	<p>
		Three elections are a short series, and the analysis is descriptive. It does not test why turnout changed or why it differs between municipalities.
	</p>
</div>

<Footnotes footnotes={footnoteStore.footnotes} />

</div>
