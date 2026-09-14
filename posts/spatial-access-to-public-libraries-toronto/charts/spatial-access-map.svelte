<script>
	import mapImageWalk from '../images/toronto-libraries-access-walk-1080.png';
	import mapImageTransit from '../images/toronto-libraries-access-transit-1080.png';

	// Sampled from the pre-rendered PNGs' own fill colors, so the legend bar matches what's drawn.
	const bandColors = ['#4d6185', '#42a7c4', '#93d9f5'];

	// Ward number label positions, in each panel's own source PNG native pixel
	// space (2160x1200). The lon/lat-to-pixel fit (from the ward boundary line
	// color) has a few degrees of unmodeled skew, so points from it alone can
	// land close to a real boundary line for some wards — every position here
	// was checked against (and a few corrected against) the actual boundary-line
	// pixels in the rendered PNG, not just the fitted polygon, so labels stay off
	// ward lines and out of blank/water areas (e.g. 3, 10) that the ward polygon
	// technically covers but the map doesn't render. Not hand-placed — re-derive
	// and re-verify against the real pixels if the base maps are ever re-rendered.
	// Both panels share the same extent/scale, so one set of positions covers both.
	const wards = [
		{ code: 1, x: 259.0, y: 380.0 },
		{ code: 2, x: 344.0, y: 670.0 },
		{ code: 3, x: 320.0, y: 890.0 },
		{ code: 4, x: 600.0, y: 850.0 },
		{ code: 5, x: 550, y: 550 },
		{ code: 6, x: 751.0, y: 250 },
		{ code: 7, x: 520, y: 280 },
		{ code: 8, x: 850, y: 570 },
		{ code: 9, x: 700, y: 740 },
		{ code: 10, x: 890, y: 952 },
		{ code: 11, x: 870.0, y: 790.0 },
		{ code: 12, x: 870, y: 670 },
		{ code: 13, x: 955, y: 905 },
		{ code: 14, x: 1110, y: 790 },
		{ code: 15, x: 1050, y: 500 },
		{ code: 16, x: 1210.0, y: 500.0 },
		{ code: 17, x: 1200.0, y: 250.0 },
		{ code: 18, x: 950, y: 220 },
		{ code: 19, x: 1230, y: 770.0 },
		{ code: 20, x: 1480, y: 720.0 },
		{ code: 21, x: 1458.7, y: 497.3 },
		{ code: 22, x: 1398.3, y: 278.7 },
		{ code: 23, x: 1600, y: 291.4 },
		{ code: 24, x: 1690.0, y: 490.0 },
		{ code: 25, x: 1880.0, y: 357.0 }
	];

	// Former-municipality / area labels, same 2160x1200 panel space as the ward
	// numbers above. Positions were checked against the rendered PNGs so each sits
	// inside its own area, clear of the ward numbers, the library dots and the
	// transit lines. Re-verify if the base maps are re-rendered.
	const places = [
		{ name: 'Etobicoke', x: 320, y: 611 },
		{ name: 'North York', x: 950, y: 375 },
		{ name: 'Scarborough', x: 1600, y: 395 },
		{ name: 'East York', x: 1189, y: 728 },
		{ name: 'Downtown', x: 925, y: 997 }
	];

	// Each panel is its own image now (previously one combined PNG with walk on
	// top, transit below). legendBottom is measured against its own panel's
	// bottom edge — the walking map's content (Lake Ontario's shoreline) ends
	// slightly above its panel's bottom edge, hence the extra 3% lift, which the
	// transit map's content doesn't need.
	const panels = [
		{ image: mapImageWalk, modeText: 'walking', legendBottom: 'calc(3% + 22px)' },
		{ image: mapImageTransit, modeText: 'public transit', legendBottom: '22px' }
	];
</script>

<div class="maps">
	{#each panels as panel}
		<div class="map">
			<img src={panel.image} width="1080" height="600" alt="" />

			<svg class="ward-labels" viewBox="0 0 2160 1200" preserveAspectRatio="none">
				{#each wards as ward}
					<text x={ward.x} y={ward.y}>{ward.code.toString().padStart(2, '0')}</text>
				{/each}
				{#each places as place}
					<text class="place" x={place.x} y={place.y}>{place.name}</text>
				{/each}
			</svg>

			<div class="panel-title">
				Travel time by <span class="mode-underline">{panel.modeText}</span> to<br />the nearest
				public library
			</div>

			<div class="legend" style="bottom: {panel.legendBottom};">
				<div class="legend-row extra-legend-row first-legend-row">
					<span class="library-swatch"></span>
					<span class="extra-legend-label">Public library</span>
				</div>
				<div class="legend-title">Travel time (minutes)</div>
				<div class="legend-row">
					<div class="legend-bar">
						{#each bandColors as color}
							<div class="legend-segment" style="background: {color};"></div>
						{/each}
						<span class="legend-tick" style="left: 33.333%;">15</span>
						<span class="legend-tick" style="left: 66.667%;">30</span>
					</div>
				</div>
				<div class="legend-row extra-legend-row after-bar-row">
					<svg class="ward-swatch" viewBox="0 0 16 16">
						<polygon
							points="3,2 10,1 15,5 13,11 14,15 7,14 1,10 2,5"
							fill="none"
							stroke="#000826"
							stroke-width="1.4"
							stroke-linejoin="round"
						/>
					</svg>
					<span class="extra-legend-label">Municipal ward boundaries</span>
				</div>
				<div class="legend-row extra-legend-row">
					<span class="transit-line-swatch"></span>
					<span class="extra-legend-label">Major transit line</span>
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
	.maps {
		display: flex;
		flex-direction: column;
	}

	.map {
		position: relative;
	}

	img {
		display: block;
		width: 100%;
		height: auto;
	}

	.ward-labels {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	/* Matches .panel-title in travel-time-boxplot.svelte — same wording pattern,
	   size, weight and underlined mode word, so the two charts read as a set.
	   Left edge lines up with the westernmost point of the mapped area (106px in
	   the PNG's own 2160-wide space, so 53px at the 1080px render width). */
	.panel-title {
		position: absolute;
		top: 16px;
		left: 53px;
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: 13px;
		color: var(--brandGray90);
		text-align: left;
	}

	.ward-labels .place {
		font-size: 28px;
		letter-spacing: 1px;
		fill: var(--brandDarkBlue);
		stroke-width: 7px;
	}

	.ward-labels text {
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: 24px;
		text-anchor: middle;
		dominant-baseline: central;
		fill: var(--brandGray90);
		paint-order: stroke fill;
		stroke: rgba(255, 255, 255, 0.85);
		stroke-width: 5px;
		stroke-linejoin: round;
	}

	.legend {
		position: absolute;
		right: 32px;
		width: 220px;
		box-sizing: border-box;
		padding: 10px 12px 18px;
		background: rgba(255, 255, 255, 0.9);
		border: solid 1px var(--brandGray20);
	}

	.legend-title {
		font-family: OpenSans;
		font-weight: normal;
		font-size: 12px;
		line-height: 15px;
		color: var(--brandGray90);
		margin-bottom: 4px;
	}

	.mode-underline {
		text-decoration: underline;
	}

	.legend-row {
		display: flex;
		align-items: center;
		gap: 6px;
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
		margin-top: 2px;
		font-family: OpenSans;
		font-size: 12px;
		color: var(--brandGray90);
	}

	.extra-legend-row {
		margin-top: 12px;
	}

	.first-legend-row {
		margin-top: 0;
		margin-bottom: 10px;
	}

	.after-bar-row {
		margin-top: 20px;
	}

	.library-swatch {
		width: 9px;
		height: 9px;
		box-sizing: border-box;
		border-radius: 50%;
		background: #ffdc14;
		box-shadow: 0 0 0 1px var(--brandWhite);
		flex-shrink: 0;
	}

	.transit-line-swatch {
		width: 14px;
		height: 2px;
		background: #9a241b;
		flex-shrink: 0;
	}

	.ward-swatch {
		width: 14px;
		height: 14px;
		flex-shrink: 0;
	}

	.extra-legend-label {
		font-family: OpenSans;
		font-size: 12px;
		color: var(--brandGray90);
	}
</style>
