<script>
	import { scaleLinear } from 'd3';
	import data from '../data/homeownership-by-citizenship.csv';

	const cmaOrder = ['Vancouver CMA', 'Toronto CMA', 'Montreal CMA', 'Edmonton CMA'];
	const fbtInfo = {
		'Vancouver CMA': 'FBT introduced 2016',
		'Toronto CMA': 'FBT introduced 2017',
		'Montreal CMA': 'No FBT',
		'Edmonton CMA': 'No FBT'
	};
	const years = [2006, 2011, 2016, 2021];

	const seriesStyle = {
		'Canadian-born': {
			color: 'var(--brandLightGreen)',
			width: 2,
			dotR: 3,
			label: false,
			dotStroke: 'var(--brandDarkGreen)'
		},
		'Naturalized Citizens and Permanent Residents': {
			color: 'var(--brandMedBlue)',
			width: 2,
			dotR: 3,
			label: false,
			dotStroke: 'var(--brandDarkBlue)'
		},
		'Non-permanent Residents': {
			color: 'var(--brandPurple)',
			width: 4,
			dotR: 5,
			label: true
		}
	};
	const seriesOrder = Object.keys(seriesStyle);
	const fmt = (v) => v.toFixed(1);

	const panelWidth = 243;
	const panelHeight = 283;
	const marginLeft = 32;
	const marginRight = 6;
	const marginTop = 44;
	const marginBottom = 24;
	const plotLeft = marginLeft;
	const plotRight = panelWidth - marginRight;
	const plotTop = marginTop;
	const plotBottom = panelHeight - marginBottom;

	const y = scaleLinear().domain([0, 80]).range([plotBottom, plotTop]);
	const yTicks = [0, 20, 40, 60, 80];
	const x = scaleLinear().domain([2004, 2023]).range([plotLeft, plotRight]);

	const panels = cmaOrder.map((cma) => {
		const series = seriesOrder.map((name) => {
			const points = years.map((year, i) => {
				const row = data.find((d) => d.cma === cma && d.series === name && +d.year === year);
				const value = +row.value;
				return { i, year, value, x: x(year), y: y(value) };
			});
			return { name, ...seriesStyle[name], points };
		});
		return { cma, series };
	});
</script>

<div class="legend-title">
	Share of population in an owner-occupied home, by citizenship status (%)
</div>

<div class="legend">
	{#each seriesOrder as name}
		{@const s = seriesStyle[name]}
		<div class="legend-item">
			<svg class="legend-swatch" viewBox="0 0 24 10" width="24" height="10">
				<line x1="0" x2="24" y1="5" y2="5" stroke={s.color} stroke-width={s.width} />
				<circle
					cx="12"
					cy="5"
					r={s.dotR}
					fill={s.color}
					stroke={s.dotStroke ?? 'none'}
					stroke-width={s.dotStroke ? 1 : 0}
				/>
			</svg>
			{name}
		</div>
	{/each}
</div>

<div class="panel-grid">
	{#each panels as panel}
		<div class="panel" style="width: {panelWidth}px;">
			<svg viewBox="0 0 {panelWidth} {panelHeight}">
				<text x={plotLeft} y={13} text-anchor="start" class="panel-title">{panel.cma}</text>
				<text x={plotLeft} y={30} text-anchor="start" class="panel-subtitle"
					>{fbtInfo[panel.cma]}</text
				>

				{#each yTicks as tick}
					<line x1={plotLeft} x2={plotRight} y1={y(tick)} y2={y(tick)} class="gridline" />
					<text x={plotLeft - 4} y={y(tick) + 3} class="axis-label" text-anchor="end"
						>{tick}%</text
					>
				{/each}

				{#each years as year, i}
					<text x={x(year)} y={plotBottom + 16} class="axis-label" text-anchor="middle"
						>{year}</text
					>
				{/each}

				{#each panel.series as s}
					<polyline
						points={s.points.map((p) => `${p.x},${p.y}`).join(' ')}
						fill="none"
						stroke={s.color}
						stroke-width={s.width}
					/>

					{#each s.points as p}
						<g class="dot-group">
							<circle
								cx={p.x}
								cy={p.y}
								fill={s.color}
								stroke={s.dotStroke ?? 'none'}
								stroke-width={s.dotStroke ? 1 : 0}
								class="dot"
								style="--r: {s.dotR}px;"
							/>
							<circle cx={p.x} cy={p.y} r="10" fill="transparent" class="hover-target">
								<title>{s.name}, {p.year}: {fmt(p.value)}%</title>
							</circle>
						</g>

						{#if s.label}
							{@const isBelow =
								(panel.cma === 'Vancouver CMA' || panel.cma === 'Toronto CMA') &&
								p.i === years.length - 1}
							<text
								x={p.x}
								y={isBelow ? p.y + 16 : p.y - 10}
								text-anchor="middle"
								fill={s.color}
								class="point-label"
							>
								{fmt(p.value)}%
							</text>
						{/if}
					{/each}
				{/each}
			</svg>
		</div>
	{/each}
</div>

<style>
	.panel-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px;
		padding-top: 25px;
		padding-bottom: 30px;
	}

	.panel-title {
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: 13px;
		fill: var(--brandBlack);
	}

	.panel-subtitle {
		font-family: OpenSans;
		font-size: 13px;
		fill: var(--brandGray90);
	}

	.panel svg {
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
		fill: var(--brandGray60);
	}

	.point-label {
		font-family: OpenSans;
		font-weight: normal;
		font-size: 12px;
	}

	.dot {
		r: var(--r);
		transition: r 0.1s ease;
	}

	.hover-target {
		cursor: pointer;
	}

	.dot-group:hover .dot {
		r: calc(var(--r) * 2);
	}

	.legend-title {
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: 14px;
		color: var(--brandGray90);
		padding-top: 15px;
	}

	.legend {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding-top: 6px;
		padding-bottom: 10px;
		margin-bottom: 14px;
	}

	@media (min-width: 1080px) {
		.legend {
			flex-direction: row;
			flex-wrap: wrap;
			gap: 20px;
			justify-content: flex-start;
		}
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
		font-family: OpenSans;
		font-size: 13px;
		color: var(--brandGray90);
	}

	.legend-swatch {
		flex-shrink: 0;
	}
</style>
