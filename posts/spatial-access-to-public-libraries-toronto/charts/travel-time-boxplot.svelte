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
	// line up with the Share button below).
	const MODES = [
		{
			mode: 'Walk',
			modeText: 'walking',
			gridlines: [0, 5, 10, 15, 20, 25, 30, 35, 40],
			ticks: [0, 5, 10, 15, 20, 25, 30, 35, 40],
			rightPad: 3,
			marginRight: 20
		},
		{
			mode: 'Transit',
			modeText: 'public transit',
			gridlines: [0, 5, 10, 15, 20, 25, 30],
			ticks: [0, 5, 10, 15, 20, 25],
			rightPad: 0,
			marginRight: 0
		}
	];

	const marginLeft = 157;
	const marginTop = 10;
	const marginBottom = 30;
	const rowHeight = 42;
	const boxHalfHeight = 8;
	const PX_PER_MIN = 10; // nominal viewBox units — only the ratio between panels matters

	const H = marginTop + ROW_ORDER.length * rowHeight + marginBottom;

	const rowY = (i) => marginTop + i * rowHeight + rowHeight / 2;

	const panels = MODES.map(({ mode, modeText, gridlines, ticks, rightPad, marginRight }) => {
		const xMin = 0;
		const xMax = gridlines[gridlines.length - 1] + rightPad;
		const plotWidth = (xMax - xMin) * PX_PER_MIN;
		const W = marginLeft + plotWidth + marginRight;
		const plotLeft = marginLeft;
		const plotRight = W - marginRight;
		const x = scaleLinear().domain([xMin, xMax]).range([plotLeft, plotRight]);
		const clip = (v) => Math.max(xMin, Math.min(xMax, v));

		const byGroup = Object.fromEntries(
			percentiles.filter((d) => d.mode === mode).map((d) => [d.group, d])
		);
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

		return { mode, modeText, gridlines, ticks, xMin, xMax, W, plotLeft, plotRight, x, clip, rows };
	});

	const anyOverflow = panels.some((p) => p.rows.some((r) => r.p10Over || r.p90Over));
</script>

<div class="chart-wrap">
	<div class="panels">
		{#each panels as panel}
			<div class="panel" style="flex-grow: {panel.W};">
				<div class="panel-title">
					Median travel time by <span class="mode-underline">{panel.modeText}</span> to the nearest library
					(minutes)
				</div>
				<svg viewBox="0 0 {panel.W} {H}" class="boxplot">
					{#each panel.gridlines as g}
						<line
							x1={panel.x(g)}
							x2={panel.x(g)}
							y1={marginTop}
							y2={marginTop + panel.rows.length * rowHeight}
							class="gridline"
						/>
					{/each}
					{#each panel.ticks as tick}
						<text
							x={panel.x(tick)}
							y={marginTop + panel.rows.length * rowHeight + 16}
							class="axis-label"
							text-anchor="middle"
							>{tick}{tick === panel.ticks[panel.ticks.length - 1] ? ' min' : ''}</text
						>
					{/each}

					{#each panel.rows as row, i}
						{@const cy = rowY(i)}
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
		{/each}
	</div>

	<div class="legend">
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
		{#if anyOverflow}
			<span class="legend-item">
				<svg class="legend-swatch" viewBox="0 0 16 12" width="16" height="12">
					<path d="M 6 2 L 12 6 L 6 10" fill="none" stroke="var(--brandGray55)" stroke-width="1.5" />
				</svg>
				extends past the chart's edge
			</span>
		{/if}
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

	.panel {
		/* flex-grow is set inline per panel, proportional to its own nominal
		   viewBox width — that's what keeps the two panels' minutes-per-pixel
		   scale identical despite covering different-sized minute ranges. */
		flex-shrink: 1;
		flex-basis: 0;
		min-width: 280px;
	}

	.panel-title {
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: 13px;
		color: var(--brandGray90);
		margin-bottom: 6px;
		text-align: center;
	}

	.mode-underline {
		text-decoration: underline;
	}

	.boxplot {
		display: block;
		width: 100%;
		height: auto;
	}

	.gridline {
		stroke: var(--brandGray10);
		stroke-width: 1;
	}

	.axis-label {
		font-family: OpenSans;
		font-size: 13px;
		fill: var(--brandGray55);
	}

	.row-label {
		font-family: OpenSans;
		font-size: 14px;
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
		font-size: 13px;
		fill: var(--brandGray90);
	}

	.legend {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		gap: 24px;
		margin-top: 12px;
	}

	.legend-diagram {
		display: block;
		width: 220px;
		height: auto;
	}

	.diagram-label {
		font-family: OpenSans;
		font-size: 10px;
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
