<script>
	import ChartFrame from '$lib/ChartFrame.svelte';
	import charts from './charts.js';
	import meta from './meta.json';
	import ConversionsCanadaTrend from './charts/conversions-canada-trend.svelte';
	import ConversionsByCma from './charts/conversions-by-cma.svelte';
	import ConversionsShareByYear from './charts/conversions-share-by-year.svelte';
	import ConversionsByTypeBars from './charts/conversions-by-type-bars.svelte';
	import singleToMultiple from './images/conversion-single-to-multiple.svg';
	import multipleToMultiple from './images/conversion-multiple-to-multiple.svg';
	import nonResToRes from './images/conversion-non-residential-to-residential.svg';
	import Footnote from '$lib/footnotes/Footnote.svelte';
	import Footnotes from '$lib/footnotes/Footnotes.svelte';
	import { createFootnoteStore } from '$lib/footnotes/footnoteUtils.js';

	const surveyUrl = 'https://www23.statcan.gc.ca/imdb/p2SV.pl?Function=getSurvey&SDDS=2802';

	const footnoteStore = createFootnoteStore();

	// Added in the order they appear in the text.
	const fSprawl = footnoteStore.addFootnote(
		"Turner, C., Allen, J., Chapple, K., & Smith, S. A. (2024). *Land use planning to mitigate climate change in the Greater Golden Horseshoe* (IMFG Paper). Institute on Municipal Finance and Governance, University of Toronto. [URL](https://imfg.org/research/doc/?doc_id=637)."
	);
	const fReuse = footnoteStore.addFootnote(
		"Rankin, K. H., & Saxe, S. (2023, November). *A future infrastructure growth model for building more housing with less embodied greenhouse gas* (pre-print). Centre for the Sustainable Built Environment, University of Toronto. [URL](https://csbe.civmin.utoronto.ca/wp-content/uploads/2023/11/khr_Saxe_FIG2023.pdf)."
	);
	const fRules = footnoteStore.addFootnote(
		[
			"Ontario and British Columbia have recently changed their rules to allow more dwelling units on lots with a single house. Ontario's 2022 act requires zoning to permit up to three dwelling units per lot in serviced areas, and B.C. required many municipalities to allow three to four by June 30, 2024, with extensions for some. Alberta moved the other way: Calgary repealed its blanket rezoning in 2026, and in October 2026 the province directed Edmonton to revert to its pre-2024 infill rules. These data end in 2025, so they cannot show whether any of these changes affected conversions. Toronto's percent was already above 15% in 2021, and only the last 18 months of data follow B.C.'s deadline.",
			"Government of Ontario. *More Homes Built Faster*. [URL](https://www.ontario.ca/page/more-homes-built-faster).",
			"Borden Ladner Gervais. (2022, December 1). Bill 23 in Ontario: the More Homes Built Faster Act, 2022 receives Royal Assent. [URL](https://www.blg.com/en/insights/2022/12/bill-23-in-ontario-the-more-homes-built-faster-act-2022-receives-royal-assent).",
			"Province of British Columbia. *Small-scale, multi-unit housing*. [URL](https://www2.gov.bc.ca/gov/content/housing-tenancy/local-governments-and-housing/housing-initiatives/smale-scale-multi-unit-housing).",
			"Government of Alberta. (2026, October 8). *Growing neighbourhoods responsibly*. [URL](https://www.alberta.ca/announcements.cfm?xID=979211D15AF83-E5BB-BA65-5EB5240712E3934C)."
		].join("\n\n")
	);
</script>

<div class="text">

<p>
	Many Canadian cities need more housing, both now and in the near future. While urban sprawl consumes green spaces and strains resources, the conversion and expansion of existing buildings offer a more sustainable path forward. Research in Canada has shown that urban sprawl has far worse impacts on climate change than infill development,<Footnote id={fSprawl} /> and maintaining existing building stock to help construct new dwelling units can reduce emissions related to procuring and transporting new building material.<Footnote id={fReuse} />
</p>

<div class="conversion-types">
	<p class="types-title">Examples of converting or updating existing buildings to create new residential dwelling units:</p>
	<figure class="type">
		<figcaption>Single dwelling to multiple dwellings</figcaption>
		<img
			src={singleToMultiple}
			alt="Before and after drawings of a house. Before, a single house. After, the same house with its basement level tinted pink as a separate dwelling with its own side door."
		/>
	</figure>
	<figure class="type">
		<figcaption>Multiple dwellings to multiple dwellings</figcaption>
		<img
			src={multipleToMultiple}
			alt="Before and after drawings of a three-storey building with a ground-floor dwelling and dwellings above. After, the same building with a two-storey extension out the back, tinted pink, that adds a dwelling on each level."
		/>
	</figure>
	<figure class="type">
		<figcaption>Non-residential to residential</figcaption>
		<img
			src={nonResToRes}
			alt="Before and after drawings of a four-storey building. Before, a shopfront on the ground floor and long office windows above. After, the same building tinted pink, with rows of apartment windows and a residential entrance."
		/>
	</figure>
</div>

<p>
	On this page, we chart how different Canadian urban regions are doing in terms of creating new residential dwelling units from building conversions (2018 to 2025). Several recent rule changes are allowing more of them,<Footnote id={fRules} /> so continued tracking of this data could show how conversions change as those rules take effect.
</p>

</div>

<ChartFrame meta={charts['conversions-canada-trend']} authors={meta.authors} license={meta.license} chartKey="conversions-canada-trend">
	<ConversionsCanadaTrend />
</ChartFrame>

<div class="text">

<p>
	We used data from Statistics Canada's <a href={surveyUrl} target="_blank" rel="noopener noreferrer">Building Permits Survey</a>. This survey tracks attributes of building permits issued in census metropolitan areas (CMA) on a monthly basis. The survey includes the number of new dwelling units to be created from building conversions, based on building permits issued in each month. Using this data, we can rank and compare the number and percent of new dwelling units from building conversions by metro area.
</p>

</div>

<ChartFrame meta={charts['conversions-by-cma']} authors={meta.authors} license={meta.license} chartKey="conversions-by-cma">
	<ConversionsByCma />
</ChartFrame>

<div class="text">

<p>
	Counts and percents answer different questions. A count mostly reflects the size of a region. A percent shows how much a region relies on conversions compared with other ways of adding homes, and it can rise when new construction slows, not only when conversions grow. That happened across Canada from 2021 to 2023, when conversions were flat while new construction fell by about 40,000 dwellings. Their percent still rose, from 8% to 9%.
</p>

<p>
	The next chart follows the percent over time in the eight regions with the most new dwellings, with Canada's percent for reference.
</p>

</div>

<ChartFrame meta={charts['conversions-share-by-year']} authors={meta.authors} license={meta.license} chartKey="conversions-share-by-year">
	<ConversionsShareByYear />
</ChartFrame>

<div class="text">

<p>
	Conversions also differ in what is being converted. Splitting a single dwelling into two or more dwellings depends on zoning rules and individual property owners' preferences and budget. Turning an office or shop into housing depends on stock of commercial buildings that no longer have demand for their original use, whether their design allows for relatively easy transition to residential, as well as local zoning policy. A region's total can hide these differences, so the next chart splits conversions by type for Canada and for the eight largest regions.
</p>

</div>

<ChartFrame meta={charts['conversions-by-type-bars']} authors={meta.authors} license={meta.license} chartKey="conversions-by-type-bars">
	<ConversionsByTypeBars />
</ChartFrame>

<div class="text">

<p>
	Conversions are still a minority of new housing, about one in ten new dwelling units in permits in 2025, but a growing one. Most come from splitting single dwellings into several, though the mix varies by region, from Toronto, where nine in ten are of that type, to Winnipeg, where most come from non-residential buildings.
</p>

<Footnotes footnotes={footnoteStore.footnotes} />

</div>

<style>
	.conversion-types {
		max-width: 360px;
		margin: 28px auto 24px;
	}

	.types-title {
		margin: 0 0 8px;
		font-family: OpenSansBold;
		font-size: 15px;
		line-height: 20px;
		color: var(--brandBlack);
	}

	.type {
		margin: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 2px;
		padding: 10px 0 4px;
		border-top: 1px solid var(--brandGray10);
	}

	.type:last-child {
		border-bottom: 1px solid var(--brandGray10);
	}

	.type figcaption {
		font-family: OpenSansItalic;
		font-size: 14px;
		line-height: 18px;
		color: var(--brandBlack);
	}

	.type img {
		display: block;
		width: 100%;
		max-width: 360px;
		height: auto;
	}
</style>
