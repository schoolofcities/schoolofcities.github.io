<script>
	import ChartFrame from '$lib/ChartFrame.svelte';
	import charts from './charts.js';
	import meta from './meta.json';
	import NetChangeMap from './charts/net-change-map.svelte';
	import CityRentTrajectories from './charts/city-rent-trajectories.svelte';
	import RentChangeHistogram from './charts/rent-change-histogram.svelte';
	import HeadlineContext from './charts/headline-context.svelte';
</script>

<div class="text">

<p>
	In some way or another, many of us have seen the headlines: rents are falling. In Toronto, asking rents are <a href="https://www.cbc.ca/news/canada/toronto/toronto-rents-fall-to-lowest-september-levels-9.7374528" target="_blank" rel="noopener noreferrer">at a five-year low</a>. Across British Columbia, <a href="https://www.cbc.ca/news/canada/british-columbia/canada-average-rents-fall-2-years-9.7373338" target="_blank" rel="noopener noreferrer">they’ve fallen by 7.3 per cent</a> over the past two years. And nationally, there have been <a href="https://globalnews.ca/news/12091033/rent-canada-falling-24-months/" target="_blank" rel="noopener noreferrer">24 months of continuous decline</a>.
</p>

<p>
	These headlines sit somewhat awkwardly alongside another widely reported fact. Between roughly one-third of Canadians <a href="https://globalnews.ca/news/12134303/food-insecurity-groceries-affordability/" target="_blank" rel="noopener noreferrer">skipping meals</a>, minimum wages <a href="https://www.cbc.ca/news/canada/living-wage-minimum-wage-canada-9.7416320" target="_blank" rel="noopener noreferrer">failing to keep pace with living costs</a>, and rent consuming a <a href="https://www.ipolitics.ca/2026/09/11/rents-are-falling-across-canadas-major-cities-but-its-not-necessarily-better-for-tenants/" target="_blank" rel="noopener noreferrer">substantial share of household income</a>, Canada remains in the midst of a broader <a href="https://www.cbc.ca/news/health/health-inflation-cpi-9.7320052" target="_blank" rel="noopener noreferrer">cost-of-living crisis</a>.
</p>

<p>
	We examined changes in asking rents using <a href="https://www150.statcan.gc.ca/n1/daily-quotidien/260609/dq260609c-eng.htm" target="_blank" rel="noopener noreferrer">Statistics Canada’s Quarterly Rent Statistics</a>, which track advertised rents from the first quarter of 2019 onward. Across 40 Canadian cities, the longer-term picture is striking: after accounting for inflation, 39 have still seen a net increase in two-bedroom asking rents between early 2019 and early 2026. Toronto is the lone exception, consistent with <a href="https://torontolife.com/city/access-to-affordable-housing-is-improving-but-most-locals-say-its-still-awful/" target="_blank" rel="noopener noreferrer">some local perceptions</a> that access has recently improved, even as housing there remains widely unaffordable.
</p>

</div>

<ChartFrame meta={charts['net-change-map']} authors={meta.authors} license={meta.license} chartKey="net-change-map">
	<NetChangeMap />
</ChartFrame>

<div class="text">

<p>
	Across much of the country, rents followed a similar trajectory: a sharp increase concentrated around 2022 to 2024, followed by a considerably more modest decline. While this pattern cannot be attributed to any single cause, it sits within longer-running pressures including <a href="https://reframehousing.org/the-financialization-of-housing" target="_blank" rel="noopener noreferrer">the financialization of rental housing</a>, persistent shortages of <a href="https://schoolofcities.utoronto.ca/housing-supply-mix-strategy/" target="_blank" rel="noopener noreferrer">different forms of housing supply</a>, and <a href="https://reframehousing.org/merits-and-limits-of-rent-stabilization" target="_blank" rel="noopener noreferrer">incomplete rent regulation</a>, as highlighted by previous School of Cities research.
</p>

<p>
	Despite the nationwide pattern, several cities in Quebec and the Maritimes experienced substantially larger increases, often with much smaller declines afterward, if at all. Quebec’s historically lower rents have been accompanied by a steady <a href="https://www.ctvnews.ca/montreal/article/a-study-finds-quebec-is-losing-lower-cost-rentals-as-average-rent-climbs/" target="_blank" rel="noopener noreferrer">erosion of lower-cost rental stock</a>, while Nova Scotia has experienced <a href="https://www.cbc.ca/news/canada/nova-scotia/rent-increases-vs-historical-9.7332728" target="_blank" rel="noopener noreferrer">large increases when units turn over</a> even under rent caps. As School of Cities researcher Carolyn Whitzman <a href="https://www.cbc.ca/news/canada/nova-scotia/ns-affordable-rental-erosion-9.7186538" target="_blank" rel="noopener noreferrer">has noted</a>, adding housing does not necessarily produce affordable housing if new construction remains concentrated at the higher end of the market.
</p>

</div>

<ChartFrame meta={charts['city-rent-trajectories']} authors={meta.authors} license={meta.license} chartKey="city-rent-trajectories">
	<CityRentTrajectories />
</ChartFrame>

<div class="text">

<p>
	The data so far describe asking rents: the prices advertised to someone currently looking for an apartment. That is separate from the rent paid by people who are already housed. There is not yet a comparable long-run national quarterly series covering all existing tenants, but <a href="https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/market-reports/rental-market-reports-major-centres" target="_blank" rel="noopener noreferrer">CMHC’s Rental Market Survey</a> provides a longer annual record for purpose-built rental apartments. Across the cities and years we examined, nominal average rents almost never declined from one year to the next. Inflation-adjusted declines were more common, but still represented a minority of observations.
</p>

<p>
	That distinction helps explain how asking rents can fall without tenants seeing their own rent fall. CMHC’s latest data show that rents charged to new tenants have declined in several major markets, while average rents across all occupied units have continued to rise. Statistics Canada now makes the same conceptual distinction between <a href="https://www23.statcan.gc.ca/imdb/p2SV.pl?Function=getSurvey&amp;SDDS=5427&amp;wbdisable=true" target="_blank" rel="noopener noreferrer">asking rent and paid rent</a>. In practice, accessing a lower market rent may therefore require moving – potentially bringing moving costs, a change in location or housing quality, and, in some provinces, the loss of an existing rent-regulated tenancy.
</p>

</div>

<ChartFrame meta={charts['rent-change-histogram']} authors={meta.authors} license={meta.license} chartKey="rent-change-histogram">
	<RentChangeHistogram />
</ChartFrame>

<div class="text">

<p>
	Where, then, does the broader perception of falling rents come from? There is little doubt that asking rents have fallen in many cities. The issue is one of scale: those declines are generally modest relative to the preceding increase, and almost every city in our analysis remains more expensive than it was in 2019 after accounting for inflation.
</p>

<p>
	We examined Canadian media headlines from 2019 to 2026 that explicitly described rents as rising or falling. Among 149 headlines discussing falling rents, fewer than one in five provided broader context – for example, noting that the decline was small, that rents remained high or unaffordable, that they remained above an earlier benchmark, or that the fall was from a recent peak. The pattern persisted across different ways of accounting for duplicated stories and uneven coverage among outlets.
</p>

<p>
	This does not mean those headlines were inaccurate. In fact, when we matched headlines to the relevant Statistics Canada trend, roughly four-fifths pointed in the same direction as the data. Nor is it necessarily a newspaper’s responsibility to reproduce the full historical context in a headline. But in aggregate, and without implying intent, repeated emphasis on direction without scale can produce a different impression from the longer-run data.
</p>

</div>

<ChartFrame meta={charts['headline-context']} authors={meta.authors} license={meta.license} chartKey="headline-context">
	<HeadlineContext />
</ChartFrame>

<div class="text">

<p>
	The sum of the evidence is therefore more complicated than simply saying rents are falling. A more complete description is that asking rents have undergone a modest drop after a much larger spike. <a href="https://www.cmhc-schl.gc.ca/observer/2026/2026-mid-year-rental-market-update?ap=a1-p1" target="_blank" rel="noopener noreferrer">CMHC describes the current market</a> as more favourable to renters in several cities, with higher vacancies and greater mobility, but also finds that pressure remains particularly strong in lower-rent segments.
</p>

<p>
	Those are welcome signs for renters. They are also compatible with the broader evidence that affordability remains strained. In most of Canada, rents have a long way to fall before reversing the increases of the past several years.
</p>

</div>

<div class="details-block data-methods" style="margin-top: 60px; margin-bottom: 60px;">
	<h2>Methods and data</h2>

	<p>
		We use <a href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=4610009201" target="_blank" rel="noopener noreferrer">Statistics Canada Table 46-10-0092-01</a> for quarterly asking rents for two-bedroom apartments in census metropolitan areas. Asking rents describe newly advertised units, not what sitting tenants pay, so they move faster than the averages in the CMHC survey used below. Cities need a first-quarter 2019 value and at least eight quarters of data, which leaves out Saguenay and Trois-Rivières.
	</p>

	<p>
		The map and small multiples show the net change from the first quarter of 2019 to the latest quarter, not the fall from each city's peak, because the question is how much of the earlier increase remains. For the after-inflation view, we restate the 2019 rent in 2025 dollars using the <a href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1810000501" target="_blank" rel="noopener noreferrer">consumer price index</a> for each city's province. The index is not yet published beyond 2025, so the latest rent is left as is, which slightly understates recent inflation.
	</p>

	<p>
		Arrows on the map fall into four size classes, and each small-multiple line takes the colour of its city's arrow; blue marks a decline. Insets enlarge crowded areas, and labels go to the largest cities and a few notable cases.
	</p>

	<p>
		The histogram uses the <a href="https://www.cmhc-schl.gc.ca/professionals/housing-markets-data-and-research/housing-data/data-tables/rental-market" target="_blank" rel="noopener noreferrer">CMHC Rental Market Survey</a>, which each October records the average rent in occupied purpose-built apartments. For 40 cities and each year from 2019 to 2025, we take the percentage change in that average since the previous October and count the 280 city-years in one-point bands. Windsor and St. Catharines–Niagara are left out because their data cannot be used. A change in the average can also reflect new buildings entering the survey.
	</p>

	<p>
		The headlines are those containing the word "rent" from Canadian news outlets between January 2019 and March 2026, collected through Media Cloud. A language model classified whether each reports a change in residential market rents and whether rents are rising or falling; the 149 falling headlines were re-read in a second, blind pass. A headline gives some context if it says the change is small or slowing, compares it with an earlier year or a peak, or says rents are still high or unaffordable. Only the headline is read, so an article may say more. The rising bar is a random sample of 143 of the 401 rising headlines, and its labels were not re-checked.
	</p>

	<p>
		You can find all the data, code, and the full list of classified headlines for this article on our <a href="https://github.com/schoolofcities/renters" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
	</p>
</div>
