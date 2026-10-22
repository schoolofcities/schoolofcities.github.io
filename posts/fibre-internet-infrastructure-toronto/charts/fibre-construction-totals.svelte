<script>
	import { format } from 'd3';
	import data from '../data/fibre-construction-totals.csv';
	import bellMap from '../images/fibre-bell-qgis.png';
	import rogersMap from '../images/fibre-rogers-qgis.png';
	import beanfieldMap from '../images/fibre-bean-qgis.png';
	import allMap from '../images/fibre-all-qgis.png';

	// Same company colours on the bars and the maps.
	const colors = {
		Bell: 'var(--brandMedBlue)',
		Rogers: 'var(--brandRed)',
		Beanfield: 'var(--brandLightGreen)'
	};

	// ---- Bars -------------------------------------------------------------

	const units = 100; // one mark per 1% of the total
	const fmt = format(',');

	// Largest-remainder rounding, so each row is exactly 100 marks and every
	// company's count is its share rounded as fairly as possible.
	function toUnits(values) {
		const total = values.reduce((a, b) => a + b, 0);
		const raw = values.map((v) => (v / total) * units);
		const counts = raw.map(Math.floor);
		const order = raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]);
		const missing = units - counts.reduce((a, b) => a + b, 0);
		for (let k = 0; k < missing; k++) counts[order[k][1]]++;
		return counts;
	}

	// One row per measure. Each segment is a company's run of marks; `count`
	// is both its number of marks and its rounded percentage.
	function buildRow(field, label, valueText) {
		const counts = toUnits(data.map((d) => +d[field]));
		let start = 0;
		const segments = data.map((d, i) => {
			const seg = { company: d.company, start, count: counts[i], value: valueText(d) };
			start += counts[i];
			return seg;
		});
		return { label, segments };
	}

	const rows = [
		buildRow('km', 'Length of fibre construction', (d) => `${fmt(Math.round(+d.km))} km`),
		buildRow('projects', 'Number of construction projects', (d) => `${fmt(+d.projects)} projects`)
	];

	const titleY = 14;

	// Wide layout, at 720 (a 678px graphic: 720 less ChartFrame's 42px inset).
	// Per row: company names above the bar, then below it the percentage and
	// the count. Bell's and Rogers' labels sit left-aligned at the start of
	// their runs; Beanfield's run is too short, so its labels are right-aligned
	// to the end of the bar. The tightest pair ("2,048 projects" and
	// "460 projects") has 21px between them; recheck if labels get longer.
	const wide = (() => {
		const width = 678;
		const barY = 55;
		const barH = 35;
		const lineH = 18;
		const rowH = 159;
		return {
			width,
			height: rows.length * rowH,
			rowH,
			unitW: width / units,
			gap: 1.5,
			nameY: 45,
			barY,
			barH,
			pctY: barY + barH + lineH,
			countY: barY + barH + lineH * 2
		};
	})();

	function labelFor(seg, i) {
		if (i < 2) return { x: seg.start * wide.unitW, anchor: 'start' };
		return { x: (seg.start + seg.count) * wide.unitW - wide.gap, anchor: 'end' };
	}

	// Each company name is underlined in its bar colour. SVG text can't take a
	// coloured underline reliably, so it's a rect, as wide as the longest name,
	// "Beanfield" (66.4px in OpenSans Bold at 14px); the shorter names'
	// underlines extend past the word. Re-measure if the names or font change.
	const underline = { width: 66.4, gap: 4, height: 2 };

	// Narrow layout, at 360 (a 318px graphic). Names won't fit above the bar
	// (Rogers' and Beanfield's would overlap), so each row lists its companies
	// under the bar, one per line: swatch, name, percentage, count.
	const narrow = (() => {
		const width = 318;
		const barY = 26;
		const barH = 30;
		const listY = barY + barH + 22;
		const lineH = 20;
		const rowH = listY + lineH * 2 + 30;
		return {
			width,
			height: rows.length * rowH,
			rowH,
			unitW: width / units,
			gap: 0.8,
			barY,
			barH,
			listY,
			lineH,
			cols: { swatch: 0, name: 16, pct: 100, count: 140 }
		};
	})();

	// ---- Maps -------------------------------------------------------------

	// Four 720x420 maps made in QGIS on the same frame: one per company, and all
	// three together. One shows at a time, chosen with the buttons above it.
	// Bell shows by default, including without JavaScript and in the exported
	// PNG. Each button's underline is the company colour; "All companies"
	// splits it into thirds.
	const maps = [
		{ label: 'Bell', image: bellMap, underline: colors.Bell },
		{ label: 'Rogers', image: rogersMap, underline: colors.Rogers },
		{ label: 'Beanfield', image: beanfieldMap, underline: colors.Beanfield },
		{
			label: 'All companies',
			image: allMap,
			underline: `linear-gradient(to right, ${colors.Bell} 0 33.3%, ${colors.Rogers} 33.3% 66.6%, ${colors.Beanfield} 66.6% 100%)`
		}
	];
	let activeMap = $state('Bell');

	// Place-name positions, in percent of the map images (all four share one
	// frame). Projected from each place's coordinates into the QGIS layout (Web
	// Mercator, rotated 17°) and fitted against the permit lines in the PNGs;
	// re-derive if the maps are re-exported with a different extent.
	const places = [
		{ name: 'Etobicoke', x: 14.2, y: 53.5 },
		{ name: 'North York', x: 44.0, y: 24.4 },
		{ name: 'Scarborough', x: 72.1, y: 40.0 },
		{ name: 'East York', x: 52.7, y: 60.2 },
		{ name: 'York', x: 27.3, y: 49.2 },
		{ name: 'Downtown', x: 41.2, y: 81.8 },
		{ name: 'Midtown', x: 42.5, y: 50.0 },
		{ name: 'Rexdale', x: 13.2, y: 27.6 },
		{ name: 'Mimico', x: 18.8, y: 78.6 },
		{ name: 'Agincourt', x: 69.1, y: 26.8 },
		{ name: 'Guildwood', x: 81.3, y: 51.0 },
		{ name: 'Don Mills', x: 54.1, y: 42.2 },
		{ name: 'Lake Ontario', x: 74, y: 84, water: true }
	];
	let showPlaces = $state(false);
</script>

<div class="chart">
	<svg class="bars wide" viewBox="0 0 {wide.width} {wide.height}">
		{#each rows as row, r}
			<g transform="translate(0, {r * wide.rowH})">
				<text x="0" y={titleY} class="row-title">{row.label}</text>
				{#each row.segments as seg, i}
					{@const l = labelFor(seg, i)}
					<text x={l.x} y={wide.nameY} text-anchor={l.anchor} class="value company">{seg.company}</text>
					<rect
						x={l.anchor === 'end' ? l.x - underline.width : l.x}
						y={wide.nameY + underline.gap}
						width={underline.width}
						height={underline.height}
						fill={colors[seg.company]}
					/>
					<text x={l.x} y={wide.pctY} text-anchor={l.anchor} class="value pct">{seg.count}%</text>
					<text x={l.x} y={wide.countY} text-anchor={l.anchor} class="value count">{seg.value}</text>
					{#each Array(seg.count) as _, k}
						<rect
							x={(seg.start + k) * wide.unitW}
							y={wide.barY}
							width={wide.unitW - wide.gap}
							height={wide.barH}
							rx="1"
							fill={colors[seg.company]}
						/>
					{/each}
				{/each}
			</g>
		{/each}
	</svg>

	<svg class="bars narrow" viewBox="0 0 {narrow.width} {narrow.height}">
		{#each rows as row, r}
			<g transform="translate(0, {r * narrow.rowH})">
				<text x="0" y={titleY} class="row-title">{row.label}</text>
				{#each row.segments as seg, i}
					{@const y = narrow.listY + i * narrow.lineH}
					{#each Array(seg.count) as _, k}
						<rect
							x={(seg.start + k) * narrow.unitW}
							y={narrow.barY}
							width={narrow.unitW - narrow.gap}
							height={narrow.barH}
							fill={colors[seg.company]}
						/>
					{/each}
					<rect x={narrow.cols.swatch} y={y - 10} width="10" height="10" fill={colors[seg.company]} />
					<text x={narrow.cols.name} {y} class="value company">{seg.company}</text>
					<text x={narrow.cols.pct} {y} class="value pct">{seg.count}%</text>
					<text x={narrow.cols.count} {y} class="value count">{seg.value}</text>
				{/each}
			</g>
		{/each}
	</svg>

	<div class="maps">
		<div class="maps-title">Streets with fibre construction permits</div>
		<div class="map-toggle" role="group" aria-label="Choose which company's map to show">
			{#each maps as map}
				<button
					type="button"
					class:active={activeMap === map.label}
					aria-pressed={activeMap === map.label}
					onclick={() => (activeMap = map.label)}
				>
					<span class="map-label">{map.label}</span>
					<span class="map-underline" style="background: {map.underline};"></span>
				</button>
			{/each}
		</div>
		<div class="map-stack">
			{#each maps as map}
				<img
					src={map.image}
					width="720"
					height="420"
					alt=""
					class:visible={activeMap === map.label}
				/>
			{/each}
			<div class="place-layer">
				<div class="places" class:hidden={!showPlaces} aria-hidden="true">
					{#each places as place}
						<span class="place" class:water={place.water} style="left: {place.x}%; top: {place.y}%;">
							{place.name}
						</span>
					{/each}
				</div>

				<div class="places-control">
					<span class="places-control-label" aria-hidden="true">Place names</span>
					<button
						type="button"
						role="switch"
						class="switch"
						class:on={showPlaces}
						aria-checked={showPlaces}
						aria-label="Place names"
						onclick={() => (showPlaces = !showPlaces)}
					>
						<span class="knob"></span>
					</button>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	/* Both bar layouts are in the page; the container query below shows the one
	   that fits the width ChartFrame draws the graphic at, so it works without
	   JavaScript too. */
	.chart {
		container-type: inline-size;
	}

	.bars.narrow {
		display: none;
	}

	svg {
		display: block;
		width: 100%;
		height: auto;
		padding: 14px 0 8px;
	}

	.row-title {
		font-family: OpenSans;
		font-size: 15px;
		fill: var(--brandBlack);
	}

	/* Labels are black rather than in company colours: the light green and red
	   fall below 4.5:1 contrast as text, and the bar colours already show which
	   company is which. */
	.value {
		font-family: OpenSans;
		font-size: 14px;
		fill: var(--brandBlack);
	}

	.company,
	.pct {
		font-family: OpenSansBold;
	}

	.count {
		font-size: 12px;
	}

	.maps {
		padding: 20px 0 8px;
	}

	.maps-title {
		margin-bottom: 12px;
		font-family: OpenSans;
		font-size: 15px;
		line-height: 18px;
		color: var(--brandBlack);
	}

	/* Map buttons: name over a coloured underline, in a grey box. The selected
	   one is full strength, the others faded until hovered (only the contents
	   fade, so every outline stays). The negative margin pulls them into the
	   empty space at the top of the PNGs; z-index keeps the underlines above
	   the images. */
	.map-toggle {
		position: relative;
		z-index: 1;
		display: flex;
		gap: 8px;
		margin-bottom: -6px;
	}

	.map-toggle button {
		padding: 6px 10px 8px;
		border: 1px solid var(--brandGray10);
		background: var(--brandWhite);
		cursor: pointer;
		text-align: left;
	}

	.map-toggle button span {
		opacity: 0.3;
		transition: opacity 0.2s;
	}

	.map-toggle button:hover span,
	.map-toggle button.active span {
		opacity: 1;
	}

	.map-toggle button:focus-visible {
		outline: 2px solid var(--brandDarkBlue);
		outline-offset: 3px;
	}

	.map-label {
		display: block;
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: 14px;
		line-height: 18px;
		color: var(--brandBlack);
	}

	.map-underline {
		display: block;
		width: 100px;
		height: 2px;
		margin-top: 2px;
	}

	/* The maps share one grid cell, so they stack exactly and the selected one
	   crossfades in. minmax(0, 1fr) lets the column shrink below the images'
	   720px, which would otherwise make ChartFrame scroll at 360. */
	.map-stack {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	.map-stack img {
		grid-area: 1 / 1;
		display: block;
		width: 100%;
		height: auto;
		opacity: 0;
		transition: opacity 0.4s ease;
	}

	.map-stack img.visible {
		opacity: 1;
	}

	/* At 360: the narrow bars, and the four map buttons in a 2x2 grid, each
	   underline spanning its button rather than a fixed 100px. */
	@container (max-width: 500px) {
		.bars.wide {
			display: none;
		}

		.bars.narrow {
			display: block;
		}

		.map-toggle {
			flex-wrap: wrap;
		}

		.map-toggle button {
			flex: 1 1 calc(50% - 4px);
			padding: 6px 8px 8px;
		}

		.map-underline {
			width: 100%;
		}
	}

	/* Place names and their on/off switch (bottom-right, over the lake), off by
	   default. The layer fills the positioned map wrapper; places are placed in
	   percent of the image so they track it at any width. */
	.place-layer {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.places {
		transition: opacity 0.2s;
	}

	.places.hidden {
		opacity: 0;
	}

	/* Black with a white outline so the names read over the lines: eight 1px
	   offsets make a solid edge around each letter, and the 4px blur adds a soft
	   clearing beyond it. */
	.place {
		position: absolute;
		transform: translate(-50%, -50%);
		white-space: nowrap;
		font-family: OpenSans;
		font-size: 11px;
		letter-spacing: 0.5px;
		color: var(--brandBlack);
		text-shadow:
			1px 0 0 var(--brandWhite),
			-1px 0 0 var(--brandWhite),
			0 1px 0 var(--brandWhite),
			0 -1px 0 var(--brandWhite),
			1px 1px 0 var(--brandWhite),
			-1px -1px 0 var(--brandWhite),
			1px -1px 0 var(--brandWhite),
			-1px 1px 0 var(--brandWhite),
			0 0 4px var(--brandWhite);
	}

	.place.water {
		font-family: OpenSansItalic;
		letter-spacing: 0;
		color: var(--brandGray60);
		text-shadow: none;
	}

	.places-control {
		position: absolute;
		right: 6px;
		bottom: 6px;
		display: flex;
		align-items: center;
		gap: 6px;
		pointer-events: auto;
	}

	.places-control-label {
		font-family: OpenSans;
		font-size: 12px;
		color: var(--brandGray50);
	}

	/* Off: light grey track, knob left. On: darker track, knob right. */
	.switch {
		position: relative;
		flex: none;
		width: 28px;
		height: 16px;
		padding: 0;
		border: none;
		border-radius: 8px;
		background: var(--brandGray10);
		cursor: pointer;
		transition: background 0.2s;
	}

	.switch.on {
		background: var(--brandGray60);
	}

	.switch:focus-visible {
		outline: 2px solid var(--brandDarkBlue);
		outline-offset: 3px;
	}

	.switch .knob {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--brandWhite);
		transition: transform 0.2s;
	}

	.switch.on .knob {
		transform: translateX(12px);
	}

	@media (prefers-reduced-motion: reduce) {
		.map-toggle button span,
		.map-stack img,
		.places,
		.switch,
		.switch .knob {
			transition: none;
		}
	}
</style>
