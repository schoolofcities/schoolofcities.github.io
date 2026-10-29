<script>
	import ChartFrame from '$lib/ChartFrame.svelte';
	import charts from './charts.js';
	import meta from './meta.json';
	import TurnoutByElection from './charts/turnout-by-election.svelte';
	import TurnoutByMayoralVote from './charts/turnout-by-mayoral-vote.svelte';
	import TurnoutByInternetVoting from './charts/turnout-by-internet-voting.svelte';
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
	const fInternet = footnoteStore.addFootnote(
		"Goodman, N., & Stokes, L. C. (2020). Reducing the cost of voting: An evaluation of internet voting's effect on turnout. *British Journal of Political Science*, 50(3), 1155–1167. [DOI](https://doi.org/10.1017/S0007123417000849)."
	);
</script>

<div class="text">

<p>
	Every four years, on the fourth Monday in October, Ontarians go to the polls to elect their mayors, councillors, and school board trustees. The percentage of the electorate who actually vote – voter turnout – is a common measure of civic engagement in local democracy.
</p>

<p>
	We compared voter turnout data across the four most recent municipal election waves in Ontario for every city and town with more than 75,000 residents.<Footnote id={fPopulation} /> 
</p>

</div>

<ChartFrame meta={charts['turnout-by-election']} authors={meta.authors} license={meta.license} chartKey="turnout-by-election">
	<TurnoutByElection />
</ChartFrame>

<div class="text">

<p>
	In 2014, only 3 of the 34 municipalities had turnout below 30%. In 2022, this number rose to 21. Commentators and news articles pointed to the COVID-19 pandemic and to election fatigue as potential reasons (the October 2022 municipal elections came less than five months after the June 2022 provincial election and 13 months after the September 2021 federal election, though the 2014 and 2018 municipal elections also followed June provincial elections).<Footnote id={fCommentary} /> Research from Europe has found that more frequent elections tend to lower turnout.<Footnote id={fFrequency} />
</p>

<p>
	Earlier research does suggest some reasons why turnout differs between municipalities. A study including <a href="https://www.cmb-bmc.ca/" target="_blank" rel="noopener noreferrer">Canadian Municipal Barometer</a> data on 233 municipalities in Ontario, Quebec, British Columbia, and Alberta, in their 2017 and 2018 elections, found that turnout was higher where there were more local newspapers per resident and they published more often, where councils had more seats relative to population, and where there was a lower share of residents aged 18 to 34.<Footnote id={fBarometer} />
</p>

<p>
	When we look at Ontario's largest municipalities from 2014 to 2022, we find that, in all three elections, single-tier cities – which are not part of a regional government – had higher median turnout than lower-tier municipalities within regions such as Peel and York. We also find that turnout tends to be lower where the winning mayoral candidate took a larger share of the vote.
</p>

</div>

<ChartFrame meta={charts['turnout-by-mayoral-vote']} authors={meta.authors} license={meta.license} chartKey="turnout-by-mayoral-vote">
	<TurnoutByMayoralVote />
</ChartFrame>

<div class="text">

<p>
	Another factor is voting method. Half of the 34 municipalities offered internet voting in 2022, up from 10 in 2014. A study of Ontario municipal elections from 2000 to 2014 found that offering internet voting raised turnout by about 3.5 points.<Footnote id={fInternet} /> In our more recent data, the four municipalities that introduced internet voting in 2022 saw turnout rise or change by less than a point, while it fell in every other municipality except Ottawa. The four that introduced it in 2018 had mixed results: turnout rose 4.9 points in Thunder Bay but fell in Newmarket, Kawartha Lakes, and Pickering.
</p>

</div>

<ChartFrame meta={charts['turnout-by-internet-voting']} authors={meta.authors} license={meta.license} chartKey="turnout-by-internet-voting">
	<TurnoutByInternetVoting />
</ChartFrame>

<div class="text">



<div class="details-block data-methods" style="margin-top: 60px; margin-bottom: 60px;">
	<h2>Methods and data</h2>

	<p>
		Turnout data are from the <a href={dataUrl} target="_blank" rel="noopener noreferrer">Municipal election results</a> dataset published by the Government of Ontario. We included every single-tier and lower-tier municipality with a population above 75,000 (based on the 2021 Census of Population). By-elections, such as Toronto's 2023 and Mississauga's 2024 mayoral by-elections, are not included.
	</p>

	<p>
		Turnout is the number of electors who voted divided by the number of electors on the voters' list. Voters' lists are not always up to date, since they can include people who have moved away or died and miss people who have recently moved in or become eligible. The accuracy of this can vary between places and between elections, so small differences in turnout should be read with caution.
	</p>

	<p>
		The provincial dataset does not yet include the 2026 elections. The 2026 turnout in the first chart is preliminary and unofficial, as of October 29, 2026. For most municipalities it is from the <a href="https://elections2026.amo.on.ca/web/en/home" target="_blank" rel="noopener noreferrer">2026 election results</a> of the Association of Municipalities of Ontario (AMO), to which municipal clerks submit their results. We checked each AMO figure against the municipality's own published results. For Greater Sudbury, Guelph, Hamilton, Milton, Mississauga, Newmarket, Oakville, St. Catharines, Thunder Bay, and Waterloo, AMO's figure was missing, incomplete, or differed from the municipality's own, so we used the turnout each municipality published. For Caledon, Markham, Toronto, and Vaughan, we could not find a turnout figure published by the municipality to confirm AMO's, so those are from AMO alone. For Windsor, AMO's count of voters is lower than the total votes for mayor in the City's certified results, so its 2026 turnout may be slightly understated.
	</p>

	<p>
		We replaced three values with data published by the cities themselves. The provincial dataset had no data for Toronto in 2014, so we used the City of Toronto's <a href="https://www.toronto.ca/wp-content/uploads/2017/07/96b9-2014-election-report.pdf" target="_blank" rel="noopener noreferrer">2014 election report</a>. For Toronto in 2018, the provincial dataset lists far fewer electors than the City's final count, so we used the City's <a href="https://www.toronto.ca/wp-content/uploads/2019/07/9662-2018-Election-Report.docx" target="_blank" rel="noopener noreferrer">2018 election report</a>. For Barrie in 2018, the provincial dataset's turnout is much higher than the City of Barrie <a href="https://www.barrie.ca/node/661" target="_blank" rel="noopener noreferrer">reported</a>, so we used the City's data. 
	</p>

	<p>
		The mayoral results are from the same dataset's files of successful candidates, which give the votes cast for the winning candidate and the total votes cast for the office. We divided the first by the second. The dataset does not list losing candidates, so we could not calculate the margin of victory with this data. Three of the 102 contests are left out of the second chart. Newmarket's mayor was acclaimed in 2022, and the data has no total for Milton in 2022. For St. Catharines in 2014, the data lists more votes for mayor than electors who voted. For Peterborough in 2018, the data's total votes for mayor does not match the sum of the two candidates' votes, so we used the sum.
	</p>

	<p>
		Whether each municipality offered internet voting is also from the provincial dataset, which records the voting methods each municipality used, including internet voting only during advance voting. 
		We noticed a couple of discrepancies in the source data, which we fixed before creating the chart. A) The provincial dataset lists internet voting in Oakville in 2018, but AMO's list of voting methods and the Town's <a href="https://www.oakville.ca/town-hall/elections/past-elections/2018-municipal-election/2018-municipal-election-ballots-cast-per-location/" target="_blank" rel="noopener noreferrer">count of ballots by polling location</a> show that every ballot was cast in person. B) The provincial dataset was blank for Toronto in 2014, but the City's <a href="https://www.toronto.ca/wp-content/uploads/2017/07/96b9-2014-election-report.pdf" target="_blank" rel="noopener noreferrer">2014 election report</a> does not indicate that the City offered internet voting.
	</p>

	<p>
		Provincial turnout in the first chart is from Elections Ontario's <a href="https://results.elections.on.ca/api/report-groups/48/report-outputs/1088/pdf/en" target="_blank" rel="noopener noreferrer">statistical summary of previous general elections</a>, and is all ballots cast as a share of electors on the voters' list. Federal turnout is from Elections Canada's <a href="https://www.elections.ca/res/rep/off/ovrGE45/62/table4E.html" target="_blank" rel="noopener noreferrer">official voting results</a>. We include voter turnout in Ontario only.
	</p>

	

</div>

<Footnotes footnotes={footnoteStore.footnotes} />

</div>
