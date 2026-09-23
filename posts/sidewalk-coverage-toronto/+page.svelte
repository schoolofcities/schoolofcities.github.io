<script>
	import ChartFrame from '$lib/ChartFrame.svelte';
	import charts from './charts.js';
	import meta from './meta.json';
	import SidewalkCoverageMap from './charts/sidewalk-coverage-map.svelte';
</script>

<div class="text">

<p>
	Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
</p>
<p>
	Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
</p>

</div>

<ChartFrame meta={charts['sidewalk-coverage-map']} authors={meta.authors} license={meta.license} chartKey="sidewalk-coverage-map">
	<SidewalkCoverageMap />
</ChartFrame>

<div class="text">

<p>
	Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
</p>
<p>
	Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.
</p>

</div>

<div class = "text">

	<div class="details-block data-methods">

		<h2>Data sources and processing</h2>

		<p>
			This data draws two sources from the City of Toronto: a 2019 baseline of where sidewalks were missing, and two overlapping records of what's been built or planned as of 2026. Each data source is described below, along with how we combined them.
		</p>

		<p>
			Overall, the map on this page is meant to show citywide patterns, not to confirm the status of a specific address or segment. If you want to know whether a sidewalk is planned, underway, or completed on your own street, the city's <a href="https://www.toronto.ca/services-payments/streets-parking-transportation/sidewalk-tours-wayfinding/sidewalks-in-toronto/sidewalk-programs-policies-and-bylaws/" target="_blank" rel="noopener noreferrer">Sidewalk Programs, Policies and By-laws</a> page is where to find further information.
		</p>

		<p>
			The <a href="https://open.toronto.ca/dataset/pedestrian-network/" target="_blank" rel="noopener noreferrer">Pedestrian Network </a> layer comes from the City of Toronto's Open Data portal, first published in August 2019 by the City. At the time of writing, the portal lists the data as "last refreshed" in February 2026, but that date reflects when the files were last re-exported, not necessarily when the underlying sidewalk geometry was last checked. The dataset's own documentation dates to January 2020, and there's no changelog indicating what, if anything, has been updated since. We thus treat it here as a snapshot of sidewalk coverage circa 2019–2020 rather than a more up-to-date inventory. It's the baseline for the map on this page: each road segment is coded by whether a sidewalk exists on both sides, one side, neither side, or not at all.
		</p>

		<p>
			The <a href="https://open.toronto.ca/dataset/sidewalk-construction-program/" target="_blank" rel="noopener noreferrer">Sidewalk Construction Program</a> dataset, on the Open Data portal, lists locations currently in the city's active pipeline for new sidewalk installation. 96 locations at the time of writing, with planned start years from 2023 to 2027. Every record in it is marked with an "Active" status, but there is no "completed" status and no changelog, so as of this dataset's last refresh (February 2026) it tells us only what was planned or underway at that time. Some of it may since have been completed.
		</p>

		<p>
			As well, each year since 2020, Transportation Services has reported new missing-sidewalk installations to the Infrastructure and Environment Committee. All seven reports are linked from the city's <a href="https://www.toronto.ca/services-payments/streets-parking-transportation/sidewalk-tours-wayfinding/sidewalks-in-toronto/sidewalk-programs-policies-and-bylaws/" target="_blank" rel="noopener noreferrer">Sidewalk Programs, Policies and By-laws</a> page.
		</p>

		<p>
			We then matched the council-report locations against the Sidewalk Construction Program records by street name. 62 matched, and where they did, the "from/to" descriptions lined up almost exactly, confirming the Construction Program dataset is fed by these same annual reports rather than being an independent source. For the remaining 75 locations, which don't (yet, or ever) appear in the Construction Program list, we located them on the ground by matching their street names relative to the City's <a href="https://open.toronto.ca/dataset/toronto-centreline-tcl/" target="_blank" rel="noopener noreferrer">Centreline (TCL)</a> dataset, then used that location to pull the corresponding geometry. Eleven street names existed in more than one part of the city (e.g. two separate Hillside Drives), so we used each report's stated ward, matched against the City's <a href="https://open.toronto.ca/dataset/city-wards/" target="_blank" rel="noopener noreferrer">ward boundaries</a>, to keep only the correct one. This resolved almost all of the locations to the right street and general location.
		</p>

		

	</div>

</div>