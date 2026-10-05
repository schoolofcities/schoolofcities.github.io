<script>
	import { format } from 'd3';
	import data from '../data/fibre-construction-by-year.csv';

	// Same company colours on every chart and the map in this post.
	const colors = {
		Bell: 'var(--brandMedBlue)',
		Rogers: 'var(--brandRed)',
		Beanfield: 'var(--brandDarkGreen)'
	};
	const companies = ['Bell', 'Rogers', 'Beanfield'];
	const years = [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022];

	// One mark per 25 km, on one shared scale across all three panels so their
	// heights compare directly. A year's last mark is drawn at partial height
	// rather than rounded, so small years (most of Beanfield's) still show.
	const unitKm = 25;
	const unitH = 10;
	const unitGap = 2;
	const maxUnits = 50; // 1,250 km, just above Bell's 2017 peak

	const width = 678;
	const axisW = 44;
	const panelGap = 30;
	const rightPad = 14; // room for the last year label
	const panelW = (width - axisW - rightPad - panelGap * (companies.length - 1)) / companies.length;
	const colW = panelW / years.length;
	const barW = colW - 6;

	const titleY = 16;
	const plotTop = 54;
	const plotBottom = plotTop + maxUnits * unitH;
	const height = plotBottom + 26;
	const yTicks = [0, 250, 500, 750, 1000, 1250];
	const fmt = format(',.0f');
	const yOf = (km) => plotBottom - (km / unitKm) * unitH;

	const panels = companies.map((company, p) => {
		const rows = data.filter((d) => d.company === company);
		const x0 = axisW + p * (panelW + panelGap);
		const cols = years.map((year, i) => {
			const km = +rows.find((d) => +d.year === year).km;
			const full = Math.floor(km / unitKm);
			const part = km / unitKm - full;
			const marks = [];
			for (let k = 0; k < full; k++) marks.push({ y: plotBottom - (k + 1) * unitH, h: unitH - unitGap });
			if (part > 0) {
				const h = Math.max(part * unitH - unitGap, 1);
				marks.push({ y: plotBottom - full * unitH - h, h });
			}
			return { year, km, x: x0 + i * colW + (colW - barW) / 2, marks };
		});
		const total = cols.reduce((a, c) => a + c.km, 0);
		const peak = cols.reduce((a, c) => (c.km > a.km ? c : a));
		return { company, x0, cols, total, peak };
	});
</script>

<svg viewBox="0 0 {width} {height}">
	{#each yTicks as t}
		<line x1={axisW} x2={width} y1={yOf(t)} y2={yOf(t)} class={t === 0 ? 'zero' : 'grid'} />
		<text x={axisW - 6} y={yOf(t)} dominant-baseline="central" text-anchor="end" class="tick"
			>{fmt(t)}</text
		>
	{/each}
	<text x="0" y={plotTop - 14} class="tick">km</text>

	{#each panels as panel}
		<text x={panel.x0} y={titleY} class="panel-title" fill={colors[panel.company]}
			>{panel.company}</text
		>
		<text x={panel.x0} y={titleY + 18} class="panel-sub">{fmt(panel.total)} km in total</text>

		{#each panel.cols as col}
			{#each col.marks as m}
				<rect x={col.x} y={m.y} width={barW} height={m.h} rx="0.8" fill={colors[panel.company]} />
			{/each}
			<rect x={col.x} y={yOf(col.km) - 2} width={barW} height={plotBottom - yOf(col.km) + 2} fill="transparent">
				<title>{panel.company}, {col.year}: {fmt(col.km)} km</title>
			</rect>
			<!-- Every other year: nine labels per panel don't fit at 12px. -->
			{#if col.year % 2 === 0}
				<text x={col.x + barW / 2} y={plotBottom + 16} text-anchor="middle" class="year"
					>{col.year}</text
				>
			{/if}
		{/each}

		<text
			x={panel.peak.x + barW / 2}
			y={yOf(panel.peak.km) - 7}
			text-anchor={panel.company === 'Beanfield' ? 'end' : 'middle'}
			class="annotation">{fmt(panel.peak.km)} km in {panel.peak.year}</text
		>
	{/each}
</svg>

<div class="key">Each mark is 25 km of construction started that year</div>

<style>
	svg {
		display: block;
		width: 100%;
		height: auto;
		padding: 14px 0 4px;
	}

	.grid {
		stroke: var(--brandGray10);
		stroke-width: 1;
	}

	.zero {
		stroke: var(--brandGray70);
		stroke-width: 1;
	}

	.tick,
	.year {
		font-family: OpenSans;
		font-size: 12px;
		fill: var(--brandGray70);
	}

	.panel-title {
		font-family: OpenSansBold;
		font-size: 15px;
	}

	.panel-sub {
		font-family: OpenSans;
		font-size: 12px;
		fill: var(--brandGray70);
	}

	.annotation {
		font-family: OpenSans;
		font-size: 12px;
		fill: var(--brandGray90);
	}

	.key {
		font-family: OpenSansItalic;
		font-size: 12px;
		color: var(--brandGray70);
		padding-bottom: 10px;
	}
</style>
