<script>
	import { scaleLinear, group, sum } from 'd3';
	import data from '../data/conversions-share-by-year.csv';
	import ChartGraphic from '$lib/ChartGraphic.svelte';

	// Scale 0% to 25%: the highest point is Toronto in 2022 (20.8%). Recheck if the data is updated.
	const shown = 8;
	const maxPct = 25;

	const W = 156;
	const left = 6;
	const right = W - 6;
	const headroom = 20;
	const plotH = 76;
	const base = headroom + plotH;
	const H = base + 20;
	const y = scaleLinear().domain([0, maxPct]).range([base, headroom]);
	const x = scaleLinear().domain([0, 7]).range([left, right]);

	const byCma = group(data, (d) => d.cma);
	const linePoints = (rows) => rows.map((d, i) => `${x(i)},${y(+d.percent_from_conversions)}`).join(' ');
	const canadaLine = linePoints(byCma.get('All Canada'));
	const canadaArea = `${left},${base} ${canadaLine} ${right},${base}`;

	const panels = Array.from(byCma, ([cma, rows]) => {
		const points = rows.map((d, i) => ({
			x: x(i),
			y: y(+d.percent_from_conversions),
			pct: +d.percent_from_conversions
		}));
		return {
			name: cma.split(',')[0],
			size: sum(rows, (d) => +d.conversions + +d.new_construction),
			first: points[0],
			last: points[points.length - 1],
			points,
			line: points.map((p) => `${p.x},${p.y}`).join(' '),
			area: `${left},${base} ${points.map((p) => `${p.x},${p.y}`).join(' ')} ${right},${base}`
		};
	})
		.filter((p) => p.name !== 'All Canada')
		.sort((a, b) => b.size - a.size)
		.slice(0, shown)
		.sort((a, b) => b.last.pct - a.last.pct);

	const round = (p) => `${Math.round(p)}%`;
</script>

<ChartGraphic>
	<div class="chart">
		<div class="legend">
			<span class="legend-item">
				<svg width="26" height="12" aria-hidden="true">
					<polygon points="0,12 0,4 26,2 26,12" class="area" />
					<polyline points="0,4 26,2" class="line" />
				</svg>
				Region
			</span>
			<span class="legend-item">
				<svg width="26" height="12" aria-hidden="true">
					<polygon points="0,12 0,6 26,4 26,12" class="canada-area" />
					<polyline points="0,6 26,4" class="canada" />
				</svg>
				Canada
			</span>
		</div>

		<div class="grid">
			{#each panels as p}
				<div class="panel">
					<div class="name">{p.name}</div>
					<svg width={W} height={H} viewBox="0 0 {W} {H}" aria-hidden="true">
						<line x1="0" x2={W} y1={base + 0.5} y2={base + 0.5} class="axis" />

						<polygon points={canadaArea} class="canada-area" />
						<polygon points={p.area} class="area" />
						<polyline points={p.line} class="line" />
						<polyline points={canadaLine} class="canada" />
						<circle cx={p.first.x} cy={p.first.y} r="3.5" class="dot" />
						<circle cx={p.last.x} cy={p.last.y} r="3.5" class="dot" />
						<text x="0" y={p.first.y - 8} text-anchor="start" class="share">{round(p.first.pct)}</text>
						<text x={W} y={p.last.y - 8} text-anchor="end" class="share">{round(p.last.pct)}</text>

						<text x="0" y={base + 16} text-anchor="start" class="year">2018</text>
						<text x={W} y={base + 16} text-anchor="end" class="year">2025</text>
					</svg>
				</div>
			{/each}
		</div>
	</div>
</ChartGraphic>

<style>
	.chart {
		padding: 14px 0 8px;
		font-family: OpenSans;
	}

	.legend {
		display: flex;
		gap: 4px 20px;
		margin-bottom: 18px;
		font-size: 14px;
		line-height: 18px;
		color: var(--brandBlack);
	}

	.legend-item {
		display: inline-flex;
		align-items: center;
		gap: 7px;
	}

	.legend svg {
		display: block;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, 156px);
		justify-content: space-between;
		gap: 18px 0;
	}

	.name {
		font-family: OpenSansBold;
		font-size: 14px;
		line-height: 18px;
		color: var(--brandBlack);
	}

	svg {
		display: block;
		overflow: visible;
	}

	.axis {
		stroke: var(--brandGray60);
		stroke-width: 1;
	}

	.area {
		fill: var(--brandPink);
		fill-opacity: 0.2;
	}

	.canada-area {
		fill: var(--brandLightBlue);
		fill-opacity: 0.1;
	}

	.line {
		fill: none;
		stroke: var(--brandPink);
		stroke-width: 2.5;
		stroke-linejoin: round;
	}

	.canada {
		fill: none;
		stroke: var(--brandLightBlue);
		stroke-width: 2;
		stroke-dasharray: 5 3;
		stroke-linejoin: round;
	}

	.dot {
		fill: var(--brandPink);
	}

	.share {
		font-family: OpenSansBold;
		font-size: 13px;
		fill: var(--brandPink);
		stroke: var(--brandWhite);
		stroke-width: 3px;
		stroke-linejoin: round;
		paint-order: stroke;
	}

	.year {
		font-family: OpenSans;
		font-size: 12px;
		fill: var(--brandGray70);
	}
</style>
