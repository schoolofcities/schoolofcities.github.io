<script>
	import mapImage from '../images/toronto-libraries-access-1080.png';

	// Sampled from the pre-rendered PNG's own fill colors, so the legend bar matches what's drawn.
	const bandColors = ['#4d6185', '#42a7c4', '#93d9f5'];

	// Two maps stacked in one image (walk on top, transit below). Each legend's
	// `bottom` is measured against its own map's bottom edge within the combined
	// PNG (the top map's content ends at 48.5% of the image height), not the image's —
	// plus a 112px lift so it sits near the map's colored area rather than down in
	// the empty margin below the coastline.
	const legends = [
		{ modeText: 'walking', bottom: 'calc(51.5% + 112px)' },
		{ modeText: 'public transit', bottom: '112px' }
	];
</script>

<div class="map">
	<img src={mapImage} width="1080" height="1200" alt="" />

	{#each legends as legend}
		<div class="legend" style="bottom: {legend.bottom};">
			<div class="legend-title">
				Travel time by <span class="mode-underline">{legend.modeText}</span> to the nearest library (minutes)
			</div>
			<div class="legend-row">
				<div class="legend-bar">
					<span class="legend-dot" title="Library"></span>
					{#each bandColors as color}
						<div class="legend-segment" style="background: {color};"></div>
					{/each}
					<span class="legend-tick" style="left: 33.333%;">15</span>
					<span class="legend-tick" style="left: 66.667%;">30</span>
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
	.map {
		position: relative;
	}

	img {
		display: block;
		width: 100%;
		height: auto;
	}

	.legend {
		position: absolute;
		right: 12px;
		width: 220px;
		box-sizing: border-box;
		padding: 10px 12px 18px;
		background: rgba(255, 255, 255, 0.9);
		border: solid 1px var(--brandGray20);
	}

	.legend-title {
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: 12px;
		line-height: 15px;
		color: var(--brandGray90);
		margin-bottom: 8px;
	}

	.mode-underline {
		text-decoration: underline;
	}

	.legend-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.legend-dot {
		position: absolute;
		left: 0;
		top: 50%;
		transform: translate(-50%, -50%);
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: #ffdc14;
		box-shadow: 0 0 0 1px var(--brandWhite);
	}

	.legend-bar {
		position: relative;
		display: flex;
		flex: 1;
		gap: 1px;
		height: 9px;
		background: var(--brandWhite);
	}

	.legend-segment {
		flex: 1;
	}

	.legend-tick {
		position: absolute;
		top: 100%;
		transform: translateX(-50%);
		margin-top: 3px;
		font-family: OpenSans;
		font-size: 11px;
		color: var(--brandGray90);
	}
</style>
