<script>
	import { scaleLinear } from 'd3';
	import data from '../data/rent-gap.csv';

	const regionOrder = ['B.C.', 'Ontario'];
	const regionLabels = { 'B.C.': 'British Columbia', Ontario: 'Ontario' };
	const firstTreatedYear = { 'B.C.': 2016, Ontario: 2017 };
	const fbtInfo = { 'B.C.': 'FBT introduced 2016', Ontario: 'FBT introduced 2017' };
	const years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021];

	const periodStyle = {
		pre: { color: 'var(--brandMedBlue)', dotR: 6 },
		post: { color: 'var(--brandPink)', dotR: 6 }
	};
	const periodLabels = { pre: 'Pre-FBT', post: 'Post-FBT' };
	const periodOrder = Object.keys(periodStyle);

	const panelWidth = 500;
	const panelHeight = 280;
	const marginLeft = 34;
	const marginRight = 10;
	const marginTop = 38;
	const marginBottom = 24;
	const plotLeft = marginLeft;
	const plotRight = panelWidth - marginRight;
	const plotTop = marginTop;
	const plotBottom = panelHeight - marginBottom;

	// Shared scale across both panels, not auto-fit per panel, so the size of
	// B.C.'s effect relative to Ontario's near-zero one stays honest.
	// Domain widened to fit the 95% CI whiskers (B.C. 2019's upper bound is the tallest).
	const y = scaleLinear().domain([-6, 21]).range([plotBottom, plotTop]);
	const yTicks = [ -5, 0, 5, 10, 15, 20];
	const x = scaleLinear().domain([2009.5, 2021.5]).range([plotLeft, plotRight]);
	const fmt = (v) => v.toFixed(1);

	// Pinned into the top margin (not near a gridline) since the CI whiskers
	// now reach close to the top of the plot area.
	const titleY = 16;
	const subtitleY = 33;

	const panels = regionOrder.map((region) => {
		const baselineYear = firstTreatedYear[region] - 1;
		const points = years.map((year) => {
			const row = data.find((d) => d.region === region && +d.year === year);
			const value = +row.pctGap;
			const pctLow = +row.pctLow;
			const pctHigh = +row.pctHigh;
			const period = year >= firstTreatedYear[region] ? 'post' : 'pre';
			const isBaseline = year === baselineYear;
			const color = isBaseline ? 'var(--brandGray90)' : periodStyle[period].color;
			return {
				year,
				value,
				pctLow,
				pctHigh,
				period,
				isBaseline,
				color,
				x: x(year),
				y: y(value),
				yLow: y(pctLow),
				yHigh: y(pctHigh),
				sig: row.significance
			};
		});
		const baselinePoint = points.find((p) => p.isBaseline);
		return { region, points, baselinePoint };
	});
</script>

<div class="legend-title">
	Estimated extra median rent growth in taxed areas compared to untaxed areas, relative to the year before the tax (%)
</div>

<div class="legend">
	{#each periodOrder as period}
		{@const s = periodStyle[period]}
		<div class="legend-item">
			<svg class="legend-swatch" viewBox="0 0 14 14" width="14" height="14">
				<circle cx="7" cy="7" r={s.dotR} fill={s.color} />
			</svg>
			{periodLabels[period]}
		</div>
	{/each}
</div>

<div class="panel-grid">
	{#each panels as panel}
		<div class="panel" style="width: {panelWidth}px;">
			<svg viewBox="0 0 {panelWidth} {panelHeight}">
				<text x={plotLeft} y={titleY} text-anchor="start" class="panel-title"
					>{regionLabels[panel.region]}</text
				>
				<text x={plotLeft} y={subtitleY} text-anchor="start" class="panel-subtitle"
					>{fbtInfo[panel.region]}</text
				>

				{#each yTicks as tick}
					<line x1={plotLeft} x2={plotRight} y1={y(tick)} y2={y(tick)} class="gridline" />
					<text x={plotLeft - 6} y={y(tick) + 3} class="axis-label" text-anchor="end"
						>{tick}%</text
					>
				{/each}

				<line x1={plotLeft} x2={plotRight} y1={y(0)} y2={y(0)} class="zero-line" />

				{#each years as year}
					<text x={x(year)} y={plotBottom + 16} class="axis-label" text-anchor="middle"
						>{year}</text
					>
				{/each}

				{#each panel.points as p}
					{#if !p.isBaseline}
						<line x1={p.x} x2={p.x} y1={p.yLow} y2={p.yHigh} stroke={p.color} class="error-bar" />
					{/if}
					<g class="dot-group">
						<circle
							cx={p.x}
							cy={p.y}
							fill={p.color}
							class="dot"
							style="--r: {periodStyle[p.period].dotR}px;"
						/>
						<circle cx={p.x} cy={p.y} r="9" fill="transparent" class="hover-target">
							<title>{fmt(p.value)}%</title>
						</circle>
					</g>
				{/each}

				<text
					x={panel.baselinePoint.x}
					y={panel.baselinePoint.y + 22}
					text-anchor="middle"
					class="baseline-label">Baseline</text
				>
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
		padding-bottom: 15px;
	}

	.panel-title {
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: 15px;
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
		opacity: 0.5;
	}

	.zero-line {
		stroke: var(--brandGray70);
		stroke-width: 1;
	}

	.error-bar {
		stroke-width: 1;
	}

	.axis-label {
		font-family: OpenSans;
		font-size: 13px;
		fill: var(--brandGray60);
	}

	.baseline-label {
		font-family: OpenSans;
		font-size: 12px;
		fill: var(--brandGray70);
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

	.dot {
		r: var(--r);
		transition: r 0.1s ease;
	}

	.hover-target {
		cursor: pointer;
	}

	.dot-group:hover .dot {
		r: calc(var(--r) * 1.6);
	}

</style>
