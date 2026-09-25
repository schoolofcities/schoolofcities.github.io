<script>
	import { scaleLinear } from 'd3';
	import percentiles from '../data/travel_time_percentiles.csv';

	// Reuses each group's own darkest choropleth-ramp color (demographics-grid.svelte)
	// so a group reads as "the same thing" across every chart on this page.
	const GROUP_COLORS = {
		'Visible minority': '#6D247A',
		'Low income': '#007FA3',
		'Recent immigrants': '#DC4633',
		'First-gen. immigrants': '#00A189',
		'Seniors (65+)': '#1E3765',
		'Children (0-14)': '#8DBF2E'
	};

	const ROW_ORDER = [
		'Total population',
		'Visible minority',
		'Low income',
		'Recent immigrants',
		'First-gen. immigrants',
		'Seniors (65+)',
		'Children (0-14)'
	];

	// Each mode gets its own gridline range — walking takes much longer than
	// transit, so a shared axis either crowds transit or wastes space on it.
	// The two panels still share one minutes-per-pixel scale (see panelW below),
	// so a 5-minute gap looks like the same width in both — only the axis's
	// total span differs, not what a minute "is worth" on screen.
	// `gridlines` draws the vertical lines; `ticks` (a subset) get a number
	// under them — transit's 30 is a gridline only, no label. rightPad is extra
	// minutes of blank space after the last gridline (walking needs room for its
	// "40 min" text to not clip at the edge; transit's last gridline is
	// unlabeled and is meant to sit exactly at the panel's own right edge, to
	// line up with the Share button below). ticksNarrow is a sparser version of
	// ticks used only at the 360px width — at that width's font size, labeling
	// every 5-minute gridline packs adjacent numbers ("35"/"40 min") into each
	// other; every 10 minutes leaves room. Transit's last tick sits exactly at
	// the panel's right edge (rightPad/marginRight are both 0, unlike walking) —
	// panelBlock right-anchors whichever label lands there instead of centering
	// it, so the text draws leftward into the panel rather than clipping past it.
	const MODES = [
		{
			mode: 'Walk',
			modeText: 'walking',
			gridlines: [0, 5, 10, 15, 20, 25, 30, 35, 40],
			ticks: [0, 5, 10, 15, 20, 25, 30, 35, 40],
			ticksNarrow: [0, 10, 20, 30, 40],
			rightPad: 3,
			marginRight: 20
		},
		{
			mode: 'Transit',
			modeText: 'public transit',
			gridlines: [0, 5, 10, 15, 20, 25, 30],
			ticks: [0, 5, 10, 15, 20, 25, 30],
			ticksNarrow: [0, 10, 20, 30],
			rightPad: 0,
			marginRight: 0
		}
	];

	const marginLeft = 157;
	// The 360px layout gets its own, wider row-label gutter (see narrowPanels
	// below) — at that width's font size (11px true), "First-gen. immigrants"
	// measures ~111 true px, well past what 157 viewBox units scales down to
	// (~82px). Unlike font-size, a gutter can't be decoupled from scale with a
	// CSS override — it's SVG geometry, not a text style — so it's built as a
	// second, wider geometry instead. 280 solves marginLeft_true ⋍ 122px at
	// NARROW_WIDTH, leaving ~6px clearance past the longest label.
	const NARROW_MARGIN_LEFT = 280;
	const marginTop = 10;
	const marginBottom = 30;
	const rowHeight = 42;
	const boxHalfHeight = 8;
	const PX_PER_MIN = 10; // nominal viewBox units — only the ratio between panels matters

	const H = marginTop + ROW_ORDER.length * rowHeight + marginBottom;

	const rowY = (i) => marginTop + i * rowHeight + rowHeight / 2;

	const rowLayout = { rowHeight, H, rowY };

	const byMode = (mode) =>
		Object.fromEntries(percentiles.filter((d) => d.mode === mode).map((d) => [d.group, d]));

	function buildPanel(
		{ mode, modeText, gridlines, ticks, ticksNarrow, rightPad, marginRight },
		gutter = marginLeft
	) {
		const xMin = 0;
		const xMax = gridlines[gridlines.length - 1] + rightPad;
		const plotWidth = (xMax - xMin) * PX_PER_MIN;
		const W = gutter + plotWidth + marginRight;
		const plotLeft = gutter;
		const plotRight = W - marginRight;
		const x = scaleLinear().domain([xMin, xMax]).range([plotLeft, plotRight]);
		const clip = (v) => Math.max(xMin, Math.min(xMax, v));

		const byGroup = byMode(mode);
		const rows = ROW_ORDER.map((group) => {
			const d = byGroup[group];
			return {
				group,
				color: GROUP_COLORS[group] ?? 'var(--brandGray55)',
				p10: +d.p10,
				p25: +d.p25,
				p50: +d.p50,
				p75: +d.p75,
				p90: +d.p90,
				p10Over: +d.p10 < xMin,
				p90Over: +d.p90 > xMax
			};
		});

		return {
			modeText,
			gridlines,
			ticks,
			ticksNarrow,
			xMin,
			xMax,
			W,
			plotLeft,
			x,
			clip,
			rows
		};
	}

	// Row and stacked share one geometry, reused at two different pixel scales
	// (below) — not a separate viewBox per layout. Walking and transit share
	// PX_PER_MIN here, so whatever uniform scale a layout applies, a given number
	// of minutes is the same number of pixels in both panels and their gridlines
	// land at the same x position when stacked — which a per-panel independent
	// width (this component's first attempt at the stacked layout) breaks, since
	// it gives each panel its own scale.
	const panels = MODES.map((m) => buildPanel(m));
	const anyOverflow = panels.some((p) => p.rows.some((r) => r.p10Over || r.p90Over));
	const maxW = Math.max(...panels.map((p) => p.W)); // walking; transit stays narrower at every scale

	// The narrow (360px) layout gets its own geometry off NARROW_MARGIN_LEFT (see
	// its comment above) rather than reusing panels/maxW — its gutter is wider in
	// viewBox units, so its own W and own scale differ from the row/stacked ones.
	const narrowPanels = MODES.map((m) => buildPanel(m, NARROW_MARGIN_LEFT));
	const narrowMaxW = Math.max(...narrowPanels.map((p) => p.W));

	// REFERENCE_ROW_WIDTH/STACKED_WIDTH/NARROW_WIDTH are ChartFrame's measured
	// content-box at each embed width (1080/720/360) minus this component's own 4px
	// inter-panel gap. Fixed constants, not computed from meta.widths, because this
	// component doesn't receive ChartFrame's width/padding — if ChartFrame's padding
	// changes, these (and the layouts they drive) would need updating to match.
	const REFERENCE_ROW_WIDTH = 1034;
	const STACKED_WIDTH = 678;
	const NARROW_WIDTH = 318;

	const totalW = panels.reduce((sum, p) => sum + p.W, 0);
	const ROW_SCALE = REFERENCE_ROW_WIDTH / totalW; // shared scale across both row-layout panels
	const STACKED_SCALE = STACKED_WIDTH / maxW; // walking fills exactly; transit stays proportionally narrower
	const NARROW_SCALE = NARROW_WIDTH / narrowMaxW;

	// H (viewBox height) is the same for every panel and every layout, and so is
	// whatever scale is active — so a layout's rendered height is just H times that
	// scale. Every width/height below is set explicitly rather than left as
	// width/height:auto: a replaced element's auto height inside a column-direction
	// flex container needs its final stretched width to compute an aspect-ratio
	// height, and that width isn't resolved yet when the browser calculates the flex
	// item's hypothetical main (height) size — auto falls back short of the real
	// content there, and the next panel overlaps it.
	const rowSvgStyle = () => `height: ${H * ROW_SCALE}px;`;

	// STACKED_SCALE (walking filling 678px) is bigger than ROW_SCALE (both panels
	// sharing 1034px) — that's the whole point, it's what closes up the whitespace —
	// but text size must not ride along with it: font-size is set in this SVG's own
	// viewBox units, so at a bigger scale, the same "13" units renders as visibly
	// bigger true pixels. STACKED_FONT_VIEWBOX is what "13" needs to be *in this
	// layout's own units* to still land on 13 true pixels once STACKED_SCALE is
	// applied — same fix as NARROW_FONT_VIEWBOX below, just holding size constant
	// instead of also shrinking it.
	const STACKED_FONT_PX = 13;
	const STACKED_FONT_VIEWBOX = STACKED_FONT_PX / STACKED_SCALE;
	const stackedSvgStyle = (panel) =>
		`width: ${panel.W * STACKED_SCALE}px; height: ${H * STACKED_SCALE}px; --chart-svg-font-size: ${STACKED_FONT_VIEWBOX}px;`;

	// The narrow (360px) layout additionally shrinks label text to make more room for
	// the plot itself. NARROW_FONT_VIEWBOX is the CSS font-size value (in this SVG's
	// own viewBox units) that renders at exactly NARROW_FONT_PX true pixels once
	// NARROW_SCALE is applied — i.e. NARROW_FONT_PX / NARROW_SCALE, so the "12px" the
	// text is styled with elsewhere isn't just riding along with NARROW_SCALE's own
	// shrink, it's a deliberate additional reduction on top of it. Passed down as a
	// CSS custom property (--chart-svg-font-size) that .row-label/.axis-label/
	// .median-label read with a 13px fallback, rather than a new class, so adding a
	// breakpoint doesn't mean adding a font-size rule per text class per breakpoint.
	const NARROW_FONT_PX = 11;
	const NARROW_FONT_VIEWBOX = NARROW_FONT_PX / NARROW_SCALE;

	// The narrow layout also gets 5 true px more row spacing than row/stacked —
	// row spacing is vertical (H, rowY), independent of the horizontal gutter
	// widening above, but the same problem: "5px" only means true px if it's
	// converted through NARROW_SCALE rather than added directly to rowHeight,
	// same as the font-size and gutter decoupling above.
	const NARROW_ROW_HEIGHT = rowHeight + 5 / NARROW_SCALE;
	const NARROW_H = marginTop + ROW_ORDER.length * NARROW_ROW_HEIGHT + marginBottom;
	const narrowRowY = (i) => marginTop + i * NARROW_ROW_HEIGHT + NARROW_ROW_HEIGHT / 2;
	const narrowLayout = { rowHeight: NARROW_ROW_HEIGHT, H: NARROW_H, rowY: narrowRowY };

	const narrowSvgStyle = (panel) =>
		`width: ${panel.W * NARROW_SCALE}px; height: ${NARROW_H * NARROW_SCALE}px; --chart-svg-font-size: ${NARROW_FONT_VIEWBOX}px;`;
</script>

<div class="chart-wrap">
	<div class="legend">
		<div class="legend-diagram-group">
			<div class="diagram-title">Percentile of travel time</div>
			<svg viewBox="0 0 280 46" class="legend-diagram">
				<text x="10" y="10" class="diagram-label" text-anchor="start">10th</text>
				<text x="90" y="10" class="diagram-label" text-anchor="middle">25th</text>
				<text x="140" y="10" class="diagram-label" text-anchor="middle">Median</text>
				<text x="190" y="10" class="diagram-label" text-anchor="middle">75th</text>
				<text x="270" y="10" class="diagram-label" text-anchor="end">90th</text>

				<line x1="10" x2="270" y1="28" y2="28" class="whisker" stroke="var(--brandGray55)" />
				<line x1="10" x2="10" y1="23" y2="33" class="whisker-cap" stroke="var(--brandGray55)" />
				<line x1="270" x2="270" y1="23" y2="33" class="whisker-cap" stroke="var(--brandGray55)" />

				<rect x="90" y="20" width="100" height="16" fill="var(--brandGray55)" class="box" />
				<line x1="140" x2="140" y1="20" y2="36" class="median-line" />
			</svg>
		</div>
		{#if anyOverflow}
			<span class="legend-item">
				<svg class="legend-swatch" viewBox="0 0 16 12" width="16" height="12">
					<path d="M 6 2 L 12 6 L 6 10" fill="none" stroke="var(--brandGray55)" stroke-width="1.5" />
				</svg>
				extends past the chart's edge
			</span>
		{/if}
	</div>

	{#snippet panelBlock(panel, panelStyle, svgStyle, ticksList, layout)}
		<div class="panel" style={panelStyle}>
			<div class="panel-title">
				Median travel time by <span class="mode-underline">{panel.modeText}</span> to the nearest library
				(minutes)
			</div>
			<!-- overflow: visible on .boxplot — transit's last gridline sits exactly at
			     plotRight, the SVG's own right edge, with nothing (no marginRight/rightPad)
			     reserved past it in the geometry (it's meant to line up with the Share
			     button below). A gridline stroke or a "min" suffix centered/placed there
			     would otherwise get clipped by the SVG's default overflow, even though the
			     page has visibly free space to its right (each panel is narrower than its
			     .panels-stacked/.panels-narrow container — see stackedSvgStyle's comment). -->
			<svg viewBox="0 0 {panel.W} {layout.H}" class="boxplot" style={svgStyle}>
				{#each panel.gridlines as g}
					<line
						x1={panel.x(g)}
						x2={panel.x(g)}
						y1={marginTop}
						y2={marginTop + panel.rows.length * layout.rowHeight}
						class="gridline"
					/>
				{/each}
				{#each ticksList as tick, ti}
					{@const isLast = ti === ticksList.length - 1}
					{@const tickY = marginTop + panel.rows.length * layout.rowHeight + 16}
					<text x={panel.x(tick)} y={tickY} class="axis-label" text-anchor="middle">{tick}</text>
					{#if isLast}
						<text x={panel.x(tick)} dx="0.83em" y={tickY} class="axis-label" text-anchor="start"
							>min</text
						>
					{/if}
				{/each}

				{#each panel.rows as row, i}
					{@const cy = layout.rowY(i)}
					<text x={panel.plotLeft - 10} y={cy + 4} class="row-label" text-anchor="end">{row.group}</text>

					<line
						x1={panel.x(panel.clip(row.p10))}
						x2={panel.x(panel.clip(row.p90))}
						y1={cy}
						y2={cy}
						class="whisker"
						stroke={row.color}
					/>

					{#if row.p10Over}
						<path
							d="M {panel.x(panel.xMin) + 6} {cy - 5} L {panel.x(panel.xMin)} {cy} L {panel.x(panel.xMin) + 6} {cy + 5}"
							class="overflow-arrow"
							stroke={row.color}
						/>
					{:else}
						<line
							x1={panel.x(row.p10)}
							x2={panel.x(row.p10)}
							y1={cy - 5}
							y2={cy + 5}
							class="whisker-cap"
							stroke={row.color}
						/>
					{/if}

					{#if row.p90Over}
						<path
							d="M {panel.x(panel.xMax) - 6} {cy - 5} L {panel.x(panel.xMax)} {cy} L {panel.x(panel.xMax) - 6} {cy + 5}"
							class="overflow-arrow"
							stroke={row.color}
						/>
					{:else}
						<line
							x1={panel.x(row.p90)}
							x2={panel.x(row.p90)}
							y1={cy - 5}
							y2={cy + 5}
							class="whisker-cap"
							stroke={row.color}
						/>
					{/if}

					<rect
						x={panel.x(panel.clip(row.p25))}
						y={cy - boxHalfHeight}
						width={panel.x(panel.clip(row.p75)) - panel.x(panel.clip(row.p25))}
						height={boxHalfHeight * 2}
						fill={row.color}
						class="box"
					/>
					<line
						x1={panel.x(panel.clip(row.p50))}
						x2={panel.x(panel.clip(row.p50))}
						y1={cy - boxHalfHeight}
						y2={cy + boxHalfHeight}
						class="median-line"
					/>
					<text
						x={panel.x(panel.clip(row.p50))}
						y={cy - boxHalfHeight - 7}
						class="median-label"
						text-anchor="middle">{row.p50.toFixed(1)}</text
					>
				{/each}
			</svg>
		</div>
	{/snippet}

	<!-- Same panels array, same geometry, rendered three times at three fixed pixel
	     scales — the container query below shows exactly one of these at a time. See
	     rowSvgStyle/stackedSvgStyle/narrowSvgStyle above for what changes between
	     them: row-layout panels use flex-grow for proportional width and share one
	     row; the other two give each panel an explicit width off the same shared
	     scale, so panels stay narrower than the widest one (rather than stretching to
	     fill, which would break their shared scale — see stackedSvgStyle's comment). -->
	<div class="panels panels-row">
		{#each panels as panel}
			{@render panelBlock(panel, `flex-grow: ${panel.W};`, rowSvgStyle(), panel.ticks, rowLayout)}
		{/each}
	</div>

	<div class="panels panels-stacked">
		{#each panels as panel}
			{@render panelBlock(panel, undefined, stackedSvgStyle(panel), panel.ticks, rowLayout)}
		{/each}
	</div>

	<div class="panels panels-narrow">
		{#each narrowPanels as panel}
			{@render panelBlock(panel, undefined, narrowSvgStyle(panel), panel.ticksNarrow, narrowLayout)}
		{/each}
	</div>
</div>

<style>
	.chart-wrap {
		margin: 0 auto;
	}

	.panels {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		justify-content: center;
	}

	/* Three panel sets — .panels-row (side by side, one shared x-axis scale),
	   .panels-stacked, and .panels-narrow — each the same panel data rendered at a
	   different fixed pixel scale (see rowSvgStyle/stackedSvgStyle/narrowSvgStyle),
	   swapped by which one this query shows. Not one panel set resized by CSS:
	   walking and transit share PX_PER_MIN, so a single shared scale per layout is
	   what keeps their gridlines aligned when stacked — each panel picking its own
	   independent scale (this component's first attempt at the stacked layout)
	   breaks that alignment. ChartFrame draws the graphic at an exact 360px, 720px,
	   or 1080px (less the frame's inset) via its own viewport media query (see
	   widthSnapCss in ChartFrame.svelte); this query then reads that width as this
	   element's container content-box (.chart-body sets container-type), which is
	   what actually distinguishes the three cases, not the browser viewport or the
	   frame's own width directly. */
	.panels-stacked,
	.panels-narrow {
		display: none;
	}

	@container (max-width: 800px) {
		.panels-row {
			display: none;
		}

		.panels-stacked {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
		}
	}

	/* Narrower than .panels-stacked's own 720px case (see NARROW_WIDTH), so this
	   comes after it in source order to win the cascade at equal specificity. */
	@container (max-width: 400px) {
		.panels-stacked {
			display: none;
		}

		.panels-narrow {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
		}
	}

	.panel {
		/* flex-grow is set inline per panel in .panels-row, proportional to its own
		   nominal viewBox width — that's what keeps the two side-by-side panels'
		   minutes-per-pixel scale identical despite covering different-sized minute
		   ranges. .panels-stacked/.panels-narrow panels have no flex-grow — each
		   gets an explicit width (see their svgStyle functions) instead, sized off
		   their own layout's shared scale, so the narrower panel (transit) stays
		   narrower rather than stretching to match. */
		flex-shrink: 1;
		flex-basis: 0;
		min-width: 280px;
	}

	.panels-stacked .panel,
	.panels-narrow .panel {
		/* flex-basis: 0 (inherited above, meant for the row layout's proportional
		   widths) breaks height in column direction: a flex item's hypothetical main
		   (height) size is calculated before its cross-axis (width) stretch is
		   resolved, and this component's SVGs need that final width to compute an
		   aspect-ratio height — auto falls back short of the real content there,
		   collapsing the panel and causing the next one to overlap it. Explicit
		   width/height (see svgStyle) avoids relying on that resolution at all, but
		   flex-basis: auto is kept as a second safeguard. */
		flex-basis: auto;
		min-width: 0;
	}

	.panel-title {
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: 13px;
		color: var(--brandGray90);
		margin-bottom: 6px;
		text-align: left;
	}

	.panels-narrow .panel-title {
		font-size: 12px;
	}

	.mode-underline {
		text-decoration: underline;
	}

	.boxplot {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}

	.gridline {
		stroke: var(--brandGray10);
		stroke-width: 1;
	}

	/* --chart-svg-font-size is set inline only on the narrow (360px) layout's SVGs
	   (see narrowSvgStyle) — row and stacked fall back to the 13px these were
	   always sized at. It's in this SVG's own viewBox units, not true CSS pixels
	   (see NARROW_FONT_VIEWBOX's comment), same as the plain 13px it replaces. */
	.axis-label {
		font-family: OpenSans;
		font-size: var(--chart-svg-font-size, 13px);
		fill: var(--brandGray55);
	}

	.row-label {
		font-family: OpenSans;
		font-size: var(--chart-svg-font-size, 13px);
		fill: var(--brandGray90);
	}

	.whisker {
		stroke-width: 1.5;
		opacity: 0.45;
	}

	.whisker-cap {
		stroke-width: 1.5;
		opacity: 0.45;
	}

	.overflow-arrow {
		fill: none;
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.45;
	}

	.box {
		stroke: var(--brandWhite);
		stroke-width: 1;
		fill-opacity: 0.35;
	}

	.median-line {
		stroke: var(--brandBlack);
		stroke-width: 3;
		opacity: 1;
	}

	.median-label {
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: var(--chart-svg-font-size, 13px);
		fill: var(--brandGray90);
	}

	.legend {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		flex-wrap: wrap;
		gap: 24px;
		margin-top: 30px;
		margin-bottom: 30px;
	}

	.legend-diagram-group {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 10px;
	}

	.diagram-title {
		font-family: OpenSans;
		font-size: 13px;
		color: var(--brandGray70);
		white-space: nowrap;
	}

	.legend-diagram {
		display: block;
		width: 220px;
		height: auto;
	}

	/* At 318px the diagram (220px) and title on one line ("Percentile of travel
	   time", ~141px) don't fit side by side. Wrapping the title onto two lines,
	   rather than moving the diagram below it, frees enough width for the
	   diagram to stay beside it at (near) full size — closer to how both looked
	   at every wider width than either shrinking the diagram or relocating it did. */
	@container (max-width: 400px) {
		.diagram-title {
			white-space: normal;
			width: 78px;
		}

		.legend-diagram {
			margin-top: 10px;
		}
	}

	.diagram-label {
		font-family: OpenSans;
		font-size: 13px;
		fill: var(--brandGray70);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
		font-family: OpenSans;
		font-size: 11px;
		color: var(--brandGray70);
	}

	.legend-swatch {
		flex-shrink: 0;
	}
</style>
