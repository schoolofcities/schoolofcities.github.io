<script>
	import ChartFrame from '$lib/ChartFrame.svelte';
	import charts from './charts.js';
	import meta from './meta.json';
	import SpatialAccessMap from './charts/spatial-access-map.svelte';
	import DemographicsGrid from './charts/demographics-grid.svelte';
	import TravelTimeBoxplot from './charts/travel-time-boxplot.svelte';
	import Footnote from '$lib/footnotes/Footnote.svelte';
	import Footnotes from '$lib/footnotes/Footnotes.svelte';
	import { createFootnoteStore } from '$lib/footnotes/footnoteUtils.js';

	const footnoteStore = createFootnoteStore();

	const fBhatt = footnoteStore.addFootnote(
		"Bhatt, R. (2010). The impact of public library use on reading, television, and academic outcomes. *Journal of Urban Economics*, 68(2), 148–166. [DOI](https://doi.org/10.1016/j.jue.2010.03.008)."
	);
	const fPark = footnoteStore.addFootnote(
		"Park, S. J. (2012). Measuring public library accessibility: A case study using GIS. *Library & Information Science Research*, 34(1), 13–21. [DOI](https://doi.org/10.1016/j.lisr.2011.07.007)."
	);
	const fAllen = footnoteStore.addFootnote(
		"Allen, J. (2019). Mapping differences in access to public libraries by travel mode and time of day. *Library & Information Science Research*, 41(1), 11–18. [DOI](https://doi.org/10.1016/j.lisr.2019.02.001)."
	);
	const fCheng = footnoteStore.addFootnote(
		"Cheng, W., Wu, J., & Hong, L. (2021). Assessing the spatial accessibility and spatial equity of public libraries' physical locations. *Library & Information Science Research*, 43(2), 101097. [DOI](https://doi.org/10.1016/j.lisr.2021.101097)."
	);
	const fDonnelly = footnoteStore.addFootnote(
		"Donnelly, F. P. (2014). The geographic distribution of United States public libraries: An analysis of locations and service areas. *Journal of Librarianship and Information Science*, 46(2), 110–129. [DOI](https://doi.org/10.1177/0961000612473099)."
	);

</script>

<div class="text">

<p>
	Toronto has 101 public library branches. People who live closer to one visit more often and
	borrow more.<Footnote id={fBhatt} /><Footnote id={fPark} /> We mapped how long it takes to reach
	the nearest library from across the city, on foot and by public transit. 
</p>
<p>
	On foot, 35% of residents can reach the nearest library within 15 minutes. The areas least connected to libraries are in more inner-suburban neighbourhoods, areas with fewer libraries and lower population density. When looking at access via public transit, the share of residents unable to access a library within 30 minutes drops to 5%.
</p>

</div>

<ChartFrame meta={charts['spatial-access-map']} authors={meta.authors} license={meta.license} chartKey="spatial-access-map">
	<SpatialAccessMap />
</ChartFrame>

<div class="text">
	<p>
		Public libraries offer important programming to serve different population groups, including recent immigrants, youth, and seniors. Research in other contexts has shown that accessibility to libraries varies across travel modes and population groups.<Footnote id={fAllen} /><Footnote id={fCheng} /><Footnote id={fDonnelly} /> Using census data in Toronto, we mapped the geography of a few population groups that often have specific needs for library services and programs, relative to library branch locations.
	</p>
	<p>
		You can view and compare both these sets of maps, including at a more zoomed-in neighbourhood level, on our interactive tool.
	</p>
	
</div>

<ChartFrame meta={charts['demographics-grid']} authors={meta.authors} license={meta.license} chartKey="demographics-grid">
	<DemographicsGrid />
</ChartFrame>

<div class="text">
	
	<p>
		Across every group we examined, travel time to the nearest library is close to the citywide figure. Immigrants, low-income households, children, seniors, and visible minority residents all face slightly longer trips on average, but the gaps are small, about 70 seconds at most. In the areas with the longest travel times, some groups are marginally better off than the city as a whole. On this measure, branch locations serve Toronto's population evenly.
	</p>
	
</div>

<ChartFrame meta={charts['travel-time-boxplot']} authors={meta.authors} license={meta.license} chartKey="travel-time-boxplot">
	<TravelTimeBoxplot />
</ChartFrame>

<div class="text">
	
	<div class="details-block data-methods">

	<h2>Methods and data</h2>

	<p>
		We covered the city with a 200 metre hexagon grid and measured outward from each cell.
		Travel times were computed in Python using r5py using a pedestrian network from OpenStreetMap and TTC transit schedules, so they follow the routes a person could actually take rather than straight-line distance. Travel times were computed in Python with the r5py package from the centroid of each cell in the 200 metre hexagon grid covering the City of Toronto boundary, for two mode scenarios: walking and public transit. For each mode and hexagon, we estimated the minimum travel time to a branch. Public transit travel times were computed during a late morning window Tuesday (representing a typical weekday) as well as on a Saturday. Weekday and Saturday results were very similar, so we combined them into a single transit metric for the maps on this page.
	</p>

	<p>
		Demographic counts from each Dissemination Area (DA) are distributed onto the hexagon grid by area-weighted overlay (most DAs are larger than hexagons, so each DA's population is allocated to the hexagons it covers in proportion to overlap area). For each demographic group, we computed population-weighted means, medians, and percentiles of travel times. For the maps shown above, we used larger census tracts to help visualize neighbourhood differences (some DAs are quite small and would be illegible on maps of this scale, but DAs were more accurate for linking to the hexagon grid).
	</p>

	<p>
		Data and code are in our <a href="https://github.com/schoolofcities/public-libraries" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
	</p>

	<h3>
		Limitations
	</h3>

	<p>	
		Travel times are computed from hexagon centroids, so results may be sensitive to the choice of grid size and placement. We also only measured travel time to Toronto Public Library branches, so residents near the city boundary may have a closer branch in a neighbouring municipality that offers them at least some services.
	</p>

	<p>	
		In terms of the demographic data, the 2021 Census data was the most recent available at the time of writing, though population composition in some areas may have shifted since. 
	</p>

	<p>
		The maps and analysis measures geographic accessibility based on transportation network datasets, not service access. The departure windows were chosen to fall within typical TPL operating hours on both a weekday and a Saturday, but individual branch hours vary and aren't accounted for. We also did not account for the types of services or collection each branch provides, and therefore the population groups it may attract. Filtering through libraries with programming catered to a specific group's needs and interests could give a more nuanced picture of access to library services.
	</p>

	</div>

	<Footnotes footnotes={footnoteStore.footnotes} />
	
</div>


