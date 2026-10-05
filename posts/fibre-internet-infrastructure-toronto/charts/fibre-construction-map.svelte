<script>
	import mapImage from '../images/toronto-fibre-construction-map.png';

	// Same colours the base PNG's lines were rendered with, and the same company
	// colours as the other charts in this post. `share` is each category's
	// share of the 1,010 km of mapped Bell and Rogers street length, measured
	// from the same layers the PNG was drawn from. Overlap is a darkened
	// brandPurple (blue + red reads as both); plain brandPurple was too close to
	// Bell's blue under deuteranopia simulation for thin lines.
	const legendItems = [
		{ color: '#007FA3', width: 3, label: 'Bell only', share: 59 },
		{ color: '#DC4633', width: 3, label: 'Rogers only', share: 29 },
		{ color: '#4A1554', width: 4, label: 'Both Bell and Rogers', share: 12 }
	];

	// Area labels in a 2160x1122 coordinate space (the map is rotated 17° so
	// the street grid runs square to the frame). The PNG itself is rendered at
	// 2880x1496, the same aspect ratio, so the labels scale onto it unchanged.
	// Re-check against the image if the base map is ever re-rendered.
	const places = [
		{ name: 'Etobicoke', x: 250, y: 700 },
		{ name: 'North York', x: 930, y: 150 },
		{ name: 'Scarborough', x: 1700, y: 540 },
		{ name: 'East York', x: 1180, y: 660 },
		{ name: 'Downtown', x: 860, y: 850 }
	];
</script>

<div class="map">
	<img src={mapImage} width="2880" height="1496" alt="" />

	<svg class="labels" viewBox="0 0 2160 1122" preserveAspectRatio="none" aria-hidden="true">
		{#each places as place}
			<text x={place.x} y={place.y}>{place.name}</text>
		{/each}
		<text class="water" x={1640} y={1040}>Lake Ontario</text>
	</svg>

	<div class="legend">
		<div class="legend-title">Fibre construction, 2012–2022</div>
		{#each legendItems as item}
			<div class="legend-row">
				<span class="swatch" style="background: {item.color}; height: {item.width}px;"></span>
				<span class="legend-label">{item.label}</span>
			</div>
		{/each}
		<!-- Parts-of-a-whole bar: each category's share of mapped street length. -->
		<div class="share-bar">
			{#each legendItems as item}
				<span class="share-seg" style="flex: {item.share}; background: {item.color};">{item.share}%</span>
			{/each}
		</div>
		<div class="legend-note">Share of mapped street length</div>
	</div>
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

	.labels {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.labels text {
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: 30px;
		letter-spacing: 1px;
		text-anchor: middle;
		dominant-baseline: central;
		fill: var(--brandDarkBlue);
		paint-order: stroke fill;
		stroke: rgba(255, 255, 255, 0.9);
		stroke-width: 8px;
		stroke-linejoin: round;
	}

	.labels text.water {
		font-family: OpenSansItalic;
		fill: var(--brandGray60);
		stroke: none;
	}

	.legend {
		position: absolute;
		right: 22px;
		bottom: 64px;
		width: 250px;
		box-sizing: border-box;
		padding: 10px 12px 12px;
		background: rgba(255, 255, 255, 0.9);
		border: solid 1px var(--brandGray20);
	}

	/* Larger legend in the 1440 layout, as on the sidewalk coverage map. */
	@media (min-width: 1440px) {
		.legend {
			width: 290px;
		}

		.legend-title,
		.legend-label,
		.share-seg,
		.legend-note {
			font-size: 14px;
		}

		.share-bar {
			height: 24px;
		}
	}

	.legend-title {
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: 12px;
		line-height: 15px;
		color: var(--brandGray90);
		margin-bottom: 8px;
	}

	.legend-row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 6px;
	}

	.swatch {
		width: 18px;
		flex-shrink: 0;
	}

	.legend-label {
		flex: 1;
		font-family: OpenSans;
		font-size: 12px;
		color: var(--brandGray90);
	}

	.share-bar {
		display: flex;
		gap: 1px;
		margin-top: 12px;
		height: 20px;
	}

	.share-seg {
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: OpenSansBold;
		font-size: 12px;
		color: var(--brandWhite);
		overflow: hidden;
	}

	.legend-note {
		margin-top: 4px;
		font-family: OpenSansItalic;
		font-size: 12px;
		color: var(--brandGray70);
	}
</style>
