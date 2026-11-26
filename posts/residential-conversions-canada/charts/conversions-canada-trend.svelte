<script>
	import { scaleLinear, format } from 'd3';
	import data from '../data/canada-annual.csv';
	import ChartGraphic from '$lib/ChartGraphic.svelte';

	const fmt = format(',');

	const years = data.map((d) => ({
		year: +d.year,
		conv: +d.conversions,
		pct: +d.percent_from_conversions
	}));

	// The axis maxima fit the current data: the largest count is 32,705 (2025) and
	// the largest percent is 10.77% (2024). Recheck both if the data is updated.
	const maxCount = 35000;
	const countTicks = [10000, 20000, 30000];
	const maxPct = 12;
	const pctTicks = [5, 10];
	const unit = 100;

	function layout({ width, left, plotH1, plotH2, cols, pitch, barWidth, narrow }) {
		const units = !narrow;
		const barW = units ? cols * pitch - 1 : barWidth;
		const sq = pitch - 1;
		const slot = (width - left) / years.length;
		const title1 = 12;
		const base1 = title1 + 28 + plotH1;
		const title2 = base1 + 56;
		const base2 = title2 + 30 + plotH2;
		const y1 = units
			? (count) => (count / unit / cols) * pitch
			: scaleLinear().domain([0, maxCount]).range([0, plotH1]);
		const y2 = scaleLinear().domain([0, maxPct]).range([0, plotH2]);
		const cx = (i) => left + i * slot + slot / 2;
		const points = years.map((d, i) => ({ x: cx(i), y: base2 - y2(d.pct) }));
		return {
			width,
			left,
			title1,
			title2,
			base1,
			base2,
			height: base2 + 26,
			countTicks: countTicks.map((t) => ({ y: base1 - y1(t), label: `${t / 1000}k` })),
			pctTicks: pctTicks.map((t) => ({ y: base2 - y2(t), label: `${t}%` })),
			bars: years.map((d, i) => {
				const n = Math.round(d.conv / unit);
				const x0 = cx(i) - barW / 2;
				let squares = '';
				for (let k = 0; k < n; k++) {
					const sx = x0 + (k % cols) * pitch;
					const sy = base1 - (Math.floor(k / cols) + 1) * pitch + (pitch - sq);
					squares += `M${sx} ${sy}h${sq}v${sq}h${-sq}z`;
				}
				return {
					squares: units ? squares : null,
					x: x0,
					w: barW,
					h: y1(d.conv),
					y: units ? base1 - Math.ceil(n / cols) * pitch + (pitch - sq) : base1 - y1(d.conv),
					cx: cx(i),
					label: narrow ? `${Math.round(d.conv / unit) / 10}k` : fmt(Math.round(d.conv / unit) * unit),
					year: narrow ? `’${String(d.year).slice(2)}` : String(d.year),
					pct: `${Math.round(d.pct)}%`,
					pointY: points[i].y
				};
			}),
			line: points.map((p) => `${p.x},${p.y}`).join(' ')
		};
	}

	const wide = layout({ width: 678, left: 34, plotH1: 160, plotH2: 80, cols: 11, pitch: 5, narrow: false });
	const narrow = layout({ width: 318, left: 30, plotH1: 100, plotH2: 70, barWidth: 24, narrow: true });
</script>

<ChartGraphic>
	<div class="chart">
		{#each [[wide, 'wide'], [narrow, 'narrow']] as [g, cls]}
			<svg class={cls} viewBox="0 0 {g.width} {g.height}" aria-hidden="true">
				<text x="0" y={g.title1} class="panel-title">New permitted dwellings from conversions</text>
				{#each g.countTicks as t}
					<line x1={g.left} x2={g.width} y1={t.y} y2={t.y} class="grid" />
					<text x={g.left - 5} y={t.y + 4} text-anchor="end" class="tick">{t.label}</text>
				{/each}
				{#each g.bars as b}
					<g class="year-bar">
						{#if b.squares}
							<path d={b.squares} class="bar" />
						{:else}
							<rect x={b.x} y={b.y} width={b.w} height={b.h} class="bar" />
						{/if}
						<text x={b.cx} y={b.y - 5} text-anchor="middle" class="count">{b.label}</text>
					</g>
					<text x={b.cx} y={g.base1 + 18} text-anchor="middle" class="year">{b.year}</text>
				{/each}
				<line x1={g.left} x2={g.width} y1={g.base1 + 0.5} y2={g.base1 + 0.5} class="axis" />

				<text x="0" y={g.title2} class="panel-title">Percent of all new permitted dwellings</text>
				{#each g.pctTicks as t}
					<line x1={g.left} x2={g.width} y1={t.y} y2={t.y} class="grid" />
					<text x={g.left - 5} y={t.y + 4} text-anchor="end" class="tick">{t.label}</text>
				{/each}
				<polyline points={g.line} class="line" />
				{#each g.bars as b}
					<g class="year-bar">
						<circle cx={b.cx} cy={b.pointY} r="4.5" class="dot" />
						<text x={b.cx} y={b.pointY - 11} text-anchor="middle" class="share">{b.pct}</text>
					</g>
					<text x={b.cx} y={g.base2 + 18} text-anchor="middle" class="year">{b.year}</text>
				{/each}
				<line x1={g.left} x2={g.width} y1={g.base2 + 0.5} y2={g.base2 + 0.5} class="axis" />
			</svg>
		{/each}
	</div>
</ChartGraphic>

<style>
	.chart {
		container-type: inline-size;
		padding: 14px 0 8px;
		font-family: OpenSans;
	}

	svg {
		display: block;
		width: 100%;
		height: auto;
	}

	svg.narrow {
		display: none;
	}

	.panel-title {
		font-family: OpenSans;
		font-size: 14px;
		font-style: italic;
		fill: var(--brandGray70);
	}

	.bar {
		fill: var(--brandPink);
	}

	.line {
		fill: none;
		stroke: var(--brandPink);
		stroke-width: 2.5;
		stroke-linejoin: round;
	}

	.dot {
		fill: var(--brandPink);
		stroke: var(--brandWhite);
		stroke-width: 2;
	}

	.grid {
		stroke: var(--brandGray15);
		stroke-width: 1;
	}

	.axis {
		stroke: var(--brandGray60);
		stroke-width: 1;
	}

	.tick,
	.year {
		font-family: OpenSans;
		font-size: 12px;
		fill: var(--brandGray70);
	}

	.count {
		font-family: OpenSansBold;
		font-size: 12px;
		fill: var(--brandPink);
	}

	.share {
		font-family: OpenSansBold;
		font-size: 13.8px;
		fill: var(--brandPink);
	}

	@container (max-width: 500px) {
		svg.wide {
			display: none;
		}

		svg.narrow {
			display: block;
		}
	}
</style>
