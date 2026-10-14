<script>
	import { scaleLinear } from 'd3';
	import percentiles from '../data/travel_time_percentiles.csv';

	// Each group's darkest choropleth-ramp color from demographics-grid.svelte, so a
	// group is the same color in every chart on this page.
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

	// Walking takes much longer than transit, so each mode gets its own axis range,
	// but both share one minutes-per-pixel scale so their gridlines line up when
	// stacked. Walking's rightPad leaves room for its "min" label; transit ends
	// flush with its last gridline.
	const MODES = [
		{ mode: 'Walk', modeText: 'walking', max: 40, rightPad: 3 },
		{ mode: 'Transit', modeText: 'public transit', max: 30, rightPad: 0 }
	];

	const rowsFor = (mode) =>
		ROW_ORDER.map((group) => {
			const d = percentiles.find((r) => r.mode === mode && r.group === group);
			return {
				group,
				color: GROUP_COLORS[group] ?? 'var(--brandGray55)',
				p10: +d.p10,
				p25: +d.p25,
				p50: +d.p50,
				p75: +d.p75,
				p90: +d.p90
			};
		});

	// One geometry per snapped width (see meta.widths in charts.js), drawn 1:1 so
	// every size below is in true pixels. The walking panel fills the width; the
	// transit panel is narrower at the same scale.
	function buildLayout({ W, left, right, top, bottom, rowHeight, boxHalf, capHalf, labelGap, medianGap, tickGap, tickStep, fontSize }) {
		const widest = MODES[0].max + MODES[0].rightPad;
		const pxPerMin = (W - left - right) / widest;
		const plotBottom = top + ROW_ORDER.length * rowHeight;

		const panels = MODES.map(({ mode, modeText, max, rightPad }) => {
			const plotRight = left + (max + rightPad) * pxPerMin;
			return {
				modeText,
				W: plotRight + (rightPad ? right : 0),
				x: scaleLinear().domain([0, max + rightPad]).range([left, plotRight]),
				gridlines: Array.from({ length: max / 5 + 1 }, (_, i) => i * 5),
				ticks: Array.from({ length: max / tickStep + 1 }, (_, i) => i * tickStep),
				rows: rowsFor(mode)
			};
		});

		return {
			panels,
			H: plotBottom + bottom,
			left,
			top,
			plotBottom,
			rowY: (i) => top + i * rowHeight + rowHeight / 2,
			boxHalf,
			capHalf,
			labelGap,
			medianGap,
			tickGap,
			fontSize
		};
	}

	const wide = buildLayout({
		W: 678,
		left: 175,
		right: 22,
		top: 11,
		bottom: 34,
		rowHeight: 47,
		boxHalf: 9,
		capHalf: 5.5,
		labelGap: 11,
		medianGap: 8,
		tickGap: 18,
		tickStep: 5,
		fontSize: 13
	});

	// Wider label gutter than the wide layout, since "First-gen. immigrants" still
	// needs ~111px at 11px. Ticks every 10 minutes so adjacent numbers don't touch.
	const narrow = buildLayout({
		W: 318,
		left: 122,
		right: 9,
		top: 4,
		bottom: 13,
		rowHeight: 23,
		boxHalf: 3.5,
		capHalf: 2.2,
		labelGap: 4,
		medianGap: 3,
		tickGap: 7,
		tickStep: 10,
		fontSize: 11
	});
</script>

{#snippet boxplots(layout)}
	{#each layout.panels as panel}
		<div class="panel">
			<div class="panel-title">
				Median travel time by <span class="mode-underline">{panel.modeText}</span> to the nearest library (minutes)
			</div>
			<!-- overflow: visible so transit's last gridline and "min" label, which sit
			     right at the SVG's edge, aren't clipped. -->
			<svg
				viewBox="0 0 {panel.W} {layout.H}"
				width={panel.W}
				height={layout.H}
				class="boxplot"
				style="--label-size: {layout.fontSize}px;"
			>
				{#each panel.gridlines as g}
					<line x1={panel.x(g)} x2={panel.x(g)} y1={layout.top} y2={layout.plotBottom} class="gridline" />
				{/each}
				{#each panel.ticks as tick, i}
					{@const y = layout.plotBottom + layout.tickGap}
					<text x={panel.x(tick)} {y} class="axis-label" text-anchor="middle">{tick}</text>
					{#if i === panel.ticks.length - 1}
						<text x={panel.x(tick)} dx="0.83em" {y} class="axis-label" text-anchor="start">min</text>
					{/if}
				{/each}

				{#each panel.rows as row, i}
					{@const cy = layout.rowY(i)}
					<text x={layout.left - layout.labelGap} y={cy + 4} class="row-label" text-anchor="end">{row.group}</text>

					<line x1={panel.x(row.p10)} x2={panel.x(row.p90)} y1={cy} y2={cy} class="whisker" stroke={row.color} />
					{#each [row.p10, row.p90] as v}
						<line
							x1={panel.x(v)}
							x2={panel.x(v)}
							y1={cy - layout.capHalf}
							y2={cy + layout.capHalf}
							class="whisker"
							stroke={row.color}
						/>
					{/each}

					<rect
						x={panel.x(row.p25)}
						y={cy - layout.boxHalf}
						width={panel.x(row.p75) - panel.x(row.p25)}
						height={layout.boxHalf * 2}
						fill={row.color}
						class="box"
					/>
					<line
						x1={panel.x(row.p50)}
						x2={panel.x(row.p50)}
						y1={cy - layout.boxHalf}
						y2={cy + layout.boxHalf}
						class="median-line"
					/>
					<text
						x={panel.x(row.p50)}
						y={cy - layout.boxHalf - layout.medianGap}
						class="median-label"
						text-anchor="middle">{row.p50.toFixed(1)}</text
					>
				{/each}
			</svg>
		</div>
	{/each}
{/snippet}

<div class="legend">
	<div class="diagram-title">Percentile of travel time</div>
	<svg viewBox="0 0 280 46" class="legend-diagram">
		<text x="10" y="10" class="diagram-label" text-anchor="start">10th</text>
		<text x="90" y="10" class="diagram-label" text-anchor="middle">25th</text>
		<text x="140" y="10" class="diagram-label" text-anchor="middle">Median</text>
		<text x="190" y="10" class="diagram-label" text-anchor="middle">75th</text>
		<text x="270" y="10" class="diagram-label" text-anchor="end">90th</text>

		<line x1="10" x2="270" y1="28" y2="28" class="whisker" stroke="var(--brandGray55)" />
		<line x1="10" x2="10" y1="23" y2="33" class="whisker" stroke="var(--brandGray55)" />
		<line x1="270" x2="270" y1="23" y2="33" class="whisker" stroke="var(--brandGray55)" />

		<rect x="90" y="20" width="100" height="16" fill="var(--brandGray55)" class="box" />
		<line x1="140" x2="140" y1="20" y2="36" class="median-line" />
	</svg>
</div>

<div class="panels panels-wide">
	{@render boxplots(wide)}
</div>

<div class="panels panels-narrow">
	{@render boxplots(narrow)}
</div>

<style>
	.panels {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	/* ChartFrame draws the graphic at exactly 678px or 318px (720 and 360 less the
	   frame's inset); this shows whichever set was built for that width. */
	.panels-narrow {
		display: none;
	}

	@container (max-width: 400px) {
		.panels-wide {
			display: none;
		}

		.panels-narrow {
			display: flex;
		}
	}

	.panel-title {
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: 13px;
		color: var(--brandGray90);
		margin-bottom: 6px;
	}

	.panels-narrow .panel-title {
		font-size: 12px;
	}

	.mode-underline {
		text-decoration: underline;
	}

	.boxplot {
		display: block;
		overflow: visible;
	}

	.gridline {
		stroke: var(--brandGray10);
		stroke-width: 1;
	}

	.axis-label {
		font-family: OpenSans;
		font-size: var(--label-size);
		fill: var(--brandGray55);
	}

	.row-label {
		font-family: OpenSans;
		font-size: var(--label-size);
		fill: var(--brandGray90);
	}

	.whisker {
		stroke-width: 1.5;
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
	}

	.panels-narrow .whisker {
		stroke-width: 1;
	}

	.panels-narrow .median-line {
		stroke-width: 1.5;
	}

	.median-label {
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: var(--label-size);
		fill: var(--brandGray90);
	}

	.legend {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 30px 0;
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

	/* At 318px the title and diagram don't fit side by side on one line, so the
	   title wraps to two lines and the diagram keeps its full size. */
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
</style>
