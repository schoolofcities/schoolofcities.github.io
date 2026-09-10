<script>
	import ChartFrame from '$lib/ChartFrame.svelte';
	import charts from './charts.js';
	import meta from './meta.json';
	import SpatialAccessMap from './charts/spatial-access-map.svelte';
	import DemographicsGrid from './charts/demographics-grid.svelte';
	import TravelTimeBoxplot from './charts/travel-time-boxplot.svelte';
</script>

<div class="text">

<p>
	
</p>

</div>

<ChartFrame meta={charts['spatial-access-map']} authors={meta.authors} license={meta.license} chartKey="spatial-access-map">
	<SpatialAccessMap />
</ChartFrame>

<ChartFrame meta={charts['demographics-grid']} authors={meta.authors} license={meta.license} chartKey="demographics-grid">
	<DemographicsGrid />
</ChartFrame>

<ChartFrame meta={charts['travel-time-boxplot']} authors={meta.authors} license={meta.license} chartKey="travel-time-boxplot">
	<TravelTimeBoxplot />
</ChartFrame>
