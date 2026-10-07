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

	// Adjacent citations share one footnote; a blank line between references
	// stacks them in both the tooltip and the reference list.
	const fUsage = footnoteStore.addFootnote(
		[
			"Bhatt, R. (2010). The impact of public library use on reading, television, and academic outcomes. *Journal of Urban Economics*, 68(2), 148–166. [DOI](https://doi.org/10.1016/j.jue.2010.03.008).",
			"Park, S. J. (2012). Measuring public library accessibility: A case study using GIS. *Library & Information Science Research*, 34(1), 13–21. [DOI](https://doi.org/10.1016/j.lisr.2011.07.007)."
		].join("\n\n")
	);
	const fAccess = footnoteStore.addFootnote(
		[
			"Allen, J. (2019). Mapping differences in access to public libraries by travel mode and time of day. *Library & Information Science Research*, 41(1), 11–18. [DOI](https://doi.org/10.1016/j.lisr.2019.02.001).",
			"Cheng, W., Wu, J., Moen, W., & Hong, L. (2021). Assessing the spatial accessibility and spatial equity of public libraries' physical locations. *Library & Information Science Research*, 43(2), 101089. [DOI](https://doi.org/10.1016/j.lisr.2021.101089).",
			"Donnelly, F. P. (2014). The geographic distribution of United States public libraries: An analysis of locations and service areas. *Journal of Librarianship and Information Science*, 46(2), 110–129. [DOI](https://doi.org/10.1177/0961000612470276)."
		].join("\n\n")
	);

</script>

<div class="text">

<p>
	People who live closer to a library tend to visit it more often, borrow more resources, 
	and access its social services more easily.<Footnote id={fUsage} /> We mapped how long it takes to reach the nearest public library from any location in Toronto, on foot, and by public transit. 
</p>
<p>
	On foot, 35% of Torontonians can reach the nearest library within 15 minutes and 79% within 30 minutes; by transit, those shares rise to about 40% and 95%. The areas least connected to libraries are inner-suburban neighbourhoods, which have fewer libraries and lower population density.
</p>

</div>

<ChartFrame meta={charts['spatial-access-map']} authors={meta.authors} license={meta.license} chartKey="spatial-access-map">
	<SpatialAccessMap />
</ChartFrame>

<div class="text">
	<p>
		According to research conducted in other urban areas, accessibility to libraries varies across travel modes and population groups.<Footnote id={fAccess} /> With public libraries offering programming for such target populations as recent immigrants, youth, and seniors, it is crucial to account for differences in library access across demographic groups. Using census data, we mapped where these groups are concentrated across Toronto in relation to the locations of public libraries.
	</p>
	<p>
		If you want to explore demographic data against the transit travel data, including at a more zoomed-in neighbourhood level, you can refer to our <a href="https://schoolofcities.github.io/libraries-by-transit/toronto-proximity" target="_blank" rel="noopener noreferrer">interactive tool</a>.	
	</p>
	
</div>

<ChartFrame meta={charts['demographics-grid']} authors={meta.authors} license={meta.license} chartKey="demographics-grid">
	<DemographicsGrid />
</ChartFrame>

<div class="text">
	
	<p>
		Across every population group examined, travel time to the nearest library is close to the citywide median. Immigrants, low-income households, children, seniors, and visible minority residents all face slightly longer trips on average, but the gaps are small, 71 seconds at most. By transit, every group's median is within 45 seconds of the citywide median.
	</p>
	
</div>

<ChartFrame meta={charts['travel-time-boxplot']} authors={meta.authors} license={meta.license} chartKey="travel-time-boxplot">
	<TravelTimeBoxplot />
</ChartFrame>

<div class="text">
	
	<div class="details-block data-methods" style="margin-top: 100px;">

	<h2>Methods and data</h2>

	<p>
		We overlaid a grid of 200-metre hexagons on Toronto and calculated the travel time from each hexagon to the nearest public library. 
		Travel times were computed with the r5py Python library, using OpenStreetMap's pedestrian network and TTC transit schedules, so they follow realistic routes rather than straight-line distance. We modelled two scenarios: walking only, and walking plus public transit. For transit, we computed the minimum travel time for a late-morning departure window on a Tuesday (a typical weekday) and on a Saturday. Because the weekday and Saturday results were very similar, the maps on this page combine them into a single transit measure. The separate Tuesday and Saturday isochrones can be explored on the <a href="https://schoolofcities.github.io/libraries-by-transit/toronto-proximity" target="_blank" rel="noopener noreferrer">interactive web map</a>.
	</p>

	<p>
		Demographic counts from each Dissemination Area (DA) are distributed onto the hexagon grid by area-weighted overlay (most DAs are larger than hexagons, so each DA's population is allocated to the hexagons it covers in proportion to overlap area). For each demographic group, we computed population-weighted means, medians, and percentiles of travel times. For the maps shown above, we used larger census tracts to help visualize neighbourhood differences (some DAs are quite small and would be illegible on maps of this scale, but DAs were more accurate for linking to the hexagon grid).
	</p>

	<p>
		Data and code are in our <a href="https://github.com/schoolofcities/libraries-by-transit" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
	</p>

	<h3>
		Limitations
	</h3>

	<p>	
		Travel times are computed from hexagon centroids, so results may be sensitive to the choice of grid size and placement. Additionally, we only measured travel time to Toronto Public Library (TPL) locations. It is possible that Torontonians near the city boundary have close access to a library in a neighbouring municipality, which could decrease the differences in travel times established in this project.
	</p>

	<p>	
		In terms of the demographic data, the 2021 Census was the most recent available at the time of writing, though population composition in some areas may have shifted since. Applying our methodology to the 2026 Census data will provide more up-to-date findings on the topic. 
	</p>

	<p>
		The analysis measures geographic accessibility based on transportation network datasets, not library services availability. The departure windows were chosen to fall within typical TPL operating hours on both a weekday and a Saturday, but individual branch hours vary and aren't accounted for. We also did not account for the types of services each location provides, and therefore the population groups it may attract. Filtering through libraries with programming catered to a specific group's needs could give a more nuanced insight into library services access for the target demographic groups.
	</p>

	</div>

	<Footnotes footnotes={footnoteStore.footnotes} />
	
</div>


