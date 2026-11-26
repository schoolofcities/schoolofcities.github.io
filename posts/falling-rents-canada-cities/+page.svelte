<script>
	import ChartFrame from '$lib/ChartFrame.svelte';
	import charts from './charts.js';
	import meta from './meta.json';
	import NetChangeMap from './charts/net-change-map.svelte';
	import CityRentTrajectories from './charts/city-rent-trajectories.svelte';
	import AskingVsPaid from './charts/asking-vs-paid.svelte';
	import HeadlineContext from './charts/headline-context.svelte';
	import Footnote from '$lib/footnotes/Footnote.svelte';
	import Footnotes from '$lib/footnotes/Footnotes.svelte';
	import { createFootnoteStore } from '$lib/footnotes/footnoteUtils.js';

	const footnoteStore = createFootnoteStore();
	const fnBedrooms = footnoteStore.addFootnote(
		'We also examined one-bedroom and three-plus-bedroom homes in the data, which saw essentially the same trend. We feature two-bedrooms in this article as it is commonplace for discussions about housing.'
	);
</script>

<div class="text">

<p>
	Asking rents in Canada are lower than they were two years ago – about 4% nationally, and down in 23 of 40 cities across the country since then. The headlines have followed: In Toronto, asking rents are <a href="https://www.cbc.ca/news/canada/toronto/toronto-rents-fall-to-lowest-september-levels-9.7374528" target="_blank" rel="noopener noreferrer">at a five-year low</a>. Across British Columbia, <a href="https://www.cbc.ca/news/canada/british-columbia/canada-average-rents-fall-2-years-9.7373338" target="_blank" rel="noopener noreferrer">they’ve fallen by 7.3%</a> over the past two years. And nationally, there has been <a href="https://globalnews.ca/news/12091033/rent-canada-falling-24-months/" target="_blank" rel="noopener noreferrer">24 months of continuous decline</a>.
</p>

<p>
	But these headlines sit alongside another widely reported fact: Canada remains in the midst of a broader <a href="https://www.cbc.ca/news/health/health-inflation-cpi-9.7320052" target="_blank" rel="noopener noreferrer">cost-of-living crisis</a>. Roughly one-third of Canadians are <a href="https://globalnews.ca/news/12134303/food-insecurity-groceries-affordability/" target="_blank" rel="noopener noreferrer">skipping meals</a>, minimum wages <a href="https://www.cbc.ca/news/canada/living-wage-minimum-wage-canada-9.7416320" target="_blank" rel="noopener noreferrer">fail to keep pace with living costs</a>, and rent consumes a <a href="https://www.ipolitics.ca/2026/09/11/rents-are-falling-across-canadas-major-cities-but-its-not-necessarily-better-for-tenants/" target="_blank" rel="noopener noreferrer">substantial share of household income</a>.
</p>

<p>
	We examined changes in asking rents using <a href="https://www150.statcan.gc.ca/n1/daily-quotidien/260609/dq260609c-eng.htm" target="_blank" rel="noopener noreferrer">Statistics Canada’s Quarterly Rent Statistics</a>, which track advertised rents from the first quarter of 2019 onward. Across 40 Canadian cities, the longer-term picture is striking: after accounting for inflation, 39 have seen a net increase in two-bedroom asking rents between early 2019 and early 2026.<Footnote id={fnBedrooms} />
</p>

<p>
	Toronto is the lone exception. It’s a probable combination of timing and market conditions: Toronto’s rents were <a href="https://www.cmhc-schl.gc.ca/-/media/sites/cmhc/data-research/publications-reports/rental-market-reports/2020/rental-market-report-69720-2020-en.ashx#page=95" target="_blank" rel="noopener noreferrer">already rising sharply</a> by the late 2010s, while a <a href="https://toronto.citynews.ca/2026/06/09/rents-fall-as-new-completions-surge-and-demand-slows-but-rebound-expected-cmhc/" target="_blank" rel="noopener noreferrer">surge in completed condos and purpose-built rentals</a> has accompanied slower demand after the pandemic from tenants. That is consistent with <a href="https://torontolife.com/city/access-to-affordable-housing-is-improving-but-most-locals-say-its-still-awful/" target="_blank" rel="noopener noreferrer">some local perceptions</a> that access to affordable housing has improved, even though housing remains widely unaffordable. Indeed, Toronto’s decline appears only after adjusting for inflation.
</p>

</div>

<ChartFrame meta={charts['net-change-map']} authors={meta.authors} license={meta.license} chartKey="net-change-map">
	<NetChangeMap />
</ChartFrame>

<div class="text">

<p>
	Across much of the country, rents followed a similar trajectory: a sharp increase concentrated around 2021 to 2023, followed by a considerably more modest decline. While this pattern cannot be attributed to any single cause, it sits within longer-running pressures including <a href="https://reframehousing.org/the-financialization-of-housing" target="_blank" rel="noopener noreferrer">the financialization of rental housing</a>, persistent shortages of <a href="https://schoolofcities.utoronto.ca/housing-supply-mix-strategy/" target="_blank" rel="noopener noreferrer">different forms of housing supply</a>, such as non-market and rental housing, and <a href="https://reframehousing.org/merits-and-limits-of-rent-stabilization" target="_blank" rel="noopener noreferrer">incomplete rent regulation</a>, as highlighted by previous School of Cities research.
</p>

<p>
	Despite the nationwide pattern, several cities in Quebec and the Maritimes experienced substantially larger increases, often with much smaller declines afterward, if at all. Quebec’s historically lower rents have been accompanied by a steady <a href="https://www.ctvnews.ca/montreal/article/a-study-finds-quebec-is-losing-lower-cost-rentals-as-average-rent-climbs/" target="_blank" rel="noopener noreferrer">erosion of lower-cost rental stock</a>, while Nova Scotia has experienced <a href="https://www.cbc.ca/news/canada/nova-scotia/rent-increases-vs-historical-9.7332728" target="_blank" rel="noopener noreferrer">large increases when units turn over</a>, even under rent caps. As School of Cities researcher Carolyn Whitzman <a href="https://www.cbc.ca/news/canada/nova-scotia/ns-affordable-rental-erosion-9.7186538" target="_blank" rel="noopener noreferrer">has noted</a>, adding housing does not necessarily produce affordable housing if new construction remains concentrated at the higher end of the market.
</p>

</div>

<ChartFrame meta={charts['city-rent-trajectories']} authors={meta.authors} license={meta.license} chartKey="city-rent-trajectories">
	<CityRentTrajectories />
</ChartFrame>

<div class="text">

<p>
	The data so far describe asking rents – the prices advertised to someone currently looking for an apartment. That is separate from the rent paid by people who are already housed. There is not yet a comparable national quarterly series covering all existing tenants, but <a href="https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/market-reports/rental-market-reports-major-centres" target="_blank" rel="noopener noreferrer">CMHC’s Rental Market Survey</a> provides an annual record for purpose-built rental apartments. Asking rents peaked nationally in late 2023: since then, they have fallen about 9% after inflation. Over the same stretch, the average rent people pay has gone the other way, rising about 8%.
</p>

<p>
	That distinction helps explain how asking rents can fall without tenants seeing their own rent fall. CMHC's latest data show that rents charged to new tenants have declined in several major markets, including Toronto, Vancouver and Calgary, while average rents across all occupied units have continued to rise. The pattern holds almost everywhere we looked: in all 12 cities, rents paid have risen more than asking rents since late 2023. In Vancouver, for example, asking rents are down 16% after inflation while rents paid are up 3%. Statistics Canada now makes the same conceptual distinction between <a href="https://www23.statcan.gc.ca/imdb/p2SV.pl?Function=getSurvey&amp;SDDS=5427&amp;wbdisable=true" target="_blank" rel="noopener noreferrer">asking rent and paid rent</a>. In practice, accessing a lower market rent may therefore require moving – potentially bringing moving costs, a change in location or housing quality, and, in some provinces, the loss of an existing rent-regulated tenancy.
</p>

</div>

<ChartFrame meta={charts['asking-vs-paid']} authors={meta.authors} license={meta.license} chartKey="asking-vs-paid">
	<AskingVsPaid />
</ChartFrame>

<div class="text">

<p>
	Asking rents have fallen from their peaks in 39 of the 40 cities after inflation. But most of those declines are small next to the increase that came before them: the typical city's asking rent is only about 7% below its peak, which claws back roughly 30 cents of every dollar of the increase since 2019. Only six cities, led by Vancouver and Edmonton, have won back more than half of it. And all but one are still more expensive in 2026 than in 2019 after accounting for inflation.
</p>

<p>
	But how were these trends reported in the media? We examined Canadian headlines from 2019 to 2026 that explicitly described rents as rising or falling: 505 in all, from 41 outlets, mostly large ones such as CTV News, the Toronto Star and Global News, so not all Canadian media. Of the 145 about falling rents, 22 (15%) gave broader context – for example, noting that the decline was small or slowing, that rents remained high or above an earlier level, or that the fall was from a recent peak. The share stayed below one in four after merging near-duplicate stories or weighting every outlet equally, and headlines about rising rents were no more likely to give context (11% of 360).
</p>

<p>
	This does not mean those headlines were inaccurate. When we matched them to Statistics Canada's asking rents for the city and period each described, 78% of the 551 we could match pointed the same way as the data. The rest are not necessarily wrong, since headlines may describe periods, places or sources our quarterly data cannot match exactly. Nor is it a newspaper's job to give the full history in a headline. But in aggregate, and without implying intent, repeated emphasis on direction without scale can leave a different impression from the longer-run data.
</p>

</div>

<ChartFrame meta={charts['headline-context']} authors={meta.authors} license={meta.license} chartKey="headline-context">
	<HeadlineContext />
</ChartFrame>

<div class="text">

<p>
	The sum of the evidence is therefore more complicated than simply saying rents are falling. A more complete description is that Canada-wide asking rents have undergone a modest drop, after a much larger spike – about 4% from their late-2023 peak, and they remain up 41% from 2019, or about 15% after inflation. In most of Canada, rents have a long way to fall before reversing the increases of the past several years.
</p>

<Footnotes footnotes={footnoteStore.footnotes} footnoteListTitle="Notes" />

</div>

<div class="details-block data-methods" style="margin-top: 60px; margin-bottom: 60px;">
	<h2>Methods and data</h2>

	<p>
		Asking rents come from <a href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=4610009201" target="_blank" rel="noopener noreferrer">Statistics Canada Table 46-10-0092-01</a>: quarterly rents for two-bedroom apartments in census metropolitan areas. They describe newly advertised units, not what sitting tenants pay. Cities need a first-quarter 2019 value and at least eight quarters of data, which leaves out Saguenay and Trois-Rivières.
	</p>

	<p>
		The map and small multiples show the net change since the first quarter of 2019, not the fall from each city's peak, because the question is how much of the earlier increase remains. After inflation, we restate the 2019 rent in first-quarter 2026 dollars using each province's <a href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810000401" target="_blank" rel="noopener noreferrer">monthly consumer price index</a>.
	</p>

	<p>
		In the text, the two-year change compares the first quarter of 2026 with the first quarter of 2024, before inflation. A city's peak is its highest quarter after inflation, and the share clawed back is its fall from that peak divided by its rise from 2019 to the peak.
	</p>

	<p>
		For rents actually paid, we use the <a href="https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market" target="_blank" rel="noopener noreferrer">CMHC Rental Market Survey</a>, which each October records the average rent in occupied purpose-built rental apartments. The dumbbell chart runs from the asking-rent peak in the fourth quarter of 2023 (October 2023 for rents paid) to the latest data. The Canada figure averages the 40 metros with complete records, weighted by their rental units.
	</p>

	<p>
		The two sources cover different units, so we compare only changes, never dollar levels. A change in the CMHC average can also reflect new buildings entering the survey.
	</p>

	<p>
		The headlines are those containing the word "rent" or "rents" from Canadian news outlets between January 2019 and March 2026, collected through Media Cloud. A language model sorted them by whether they report rising or falling market rents; we dropped stories about other countries and items not about rent trends (48 headlines). Every remaining headline was then coded for context twice, independently, settling disagreements in favour of finding context.
	</p>

	<p>
		A headline gives some context if it says the change is small or slowing, that rents are still high or above an earlier level (or falling from a peak), that the trend differs elsewhere, or that it may not last. Records, streaks and bare figures do not count. Only headlines are read, so an article may say more. To check direction, we compared each headline with Statistics Canada's asking rents for the city and period it described.
	</p>

	<p>
		You can find all the data, code, and the full list of classified headlines on our <a href="https://github.com/schoolofcities/renters" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
	</p>
</div>
