<script>
	import { scaleLinear, scaleLog, format } from 'd3';
	import { flip } from 'svelte/animate';
	import { cubicInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import data from '../data/conversions-by-cma.csv';

	const fmt = format(',');

	const reduceMotion =
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const moveMs = reduceMotion ? 0 : 650;
	const fadeMs = reduceMotion ? 0 : 300;

	const lo = 0;
	const hi = 25;
	const ramp = ['#F1C500', '#CE6C34', '#AB1368', '#6D247A'];
	const colorFor = scaleLinear()
		.domain(ramp.map((_, i) => lo + ((hi - lo) * i) / (ramp.length - 1)))
		.range(ramp)
		.clamp(true);
	const legendTicks = [0, 5, 10, 15, 20, 25];

	const rows = data
		.filter((d) => d.cma !== 'All Canada')
		.map((d) => ({
			name: d.cma.split(',')[0],
			conv: +d.conversions,
			pct: +d.percent_from_conversions
		}));

	const scales = [
		{ key: 'linear', label: 'Linear scale' },
		{ key: 'log', label: 'Log scale' }
	];
	const sorts = [
		{ key: 'count', label: 'Sort by #' },
		{ key: 'pct', label: 'Sort by %' }
	];
	let scaleType = $state('log');
	let sortBy = $state('count');

	const sorted = $derived(
		[...rows].sort((a, b) =>
			sortBy === 'count' ? b.conv - a.conv || b.pct - a.pct : b.pct - a.pct || b.conv - a.conv
		)
	);

	// Fixed domains, so gridlines land on round numbers. Toronto (52,114) is the
	// largest and Lethbridge (248) the smallest; recheck if the data is updated.
	const axes = {
		linear: { x: scaleLinear().domain([0, 55000]).range([0, 100]), ticks: [10000, 20000, 30000, 40000, 50000] },
		log: { x: scaleLog().domain([100, 60000]).range([0, 100]), ticks: [500, 1000, 5000, 10000, 50000], minor: [500, 5000] }
	};
	const axis = $derived(axes[scaleType]);

	const labelFor = (row) =>
		sortBy === 'count' ? fmt(Math.round(row.conv / 100) * 100) : `${row.pct.toFixed(1)}%`;

	const kFormat = (n) => (n >= 1000 ? `${n / 1000}k` : `${n}`);
</script>

<div class="chart">
	<div class="top">
		<div class="toggle" role="group" aria-label="Sort order">
			{#each sorts as s}
				<button type="button" class:active={sortBy === s.key} aria-pressed={sortBy === s.key} onclick={() => (sortBy = s.key)}>
					{s.label}
				</button>
			{/each}
		</div>

		<div class="legend">
			<div class="legend-title">% of all new dwelling units from conversions</div>
			<div class="legend-bins" style="background: linear-gradient(to right, {ramp.join(', ')});"></div>
			<div class="legend-ticks">
				{#each legendTicks as t, i}
					{@const end = i === 0 || i === legendTicks.length - 1}
					<span class="legend-tick" class:last={i === legendTicks.length - 1} style="left: {((t - lo) / (hi - lo)) * 100}%;">
						{#if end}<span class="legend-label">{t}%</span>{/if}
					</span>
				{/each}
			</div>
		</div>

		<div class="toggle" role="group" aria-label="Scale">
			{#each scales as s}
				<button type="button" class:active={scaleType === s.key} aria-pressed={scaleType === s.key} onclick={() => (scaleType = s.key)}>
					{s.label}
				</button>
			{/each}
		</div>
	</div>

	<div class="plot">
		<div class="axis-row">
			<div class="axis-title"># of new dwelling units from conversions</div>
			<div class="ticks" aria-hidden="true">
				{#each axis.ticks as t}
					<span class="tick" class:minor={axis.minor?.includes(t)} style="left: {axis.x(t)}%;">{kFormat(t)}</span>
				{/each}
			</div>
		</div>

		<div class="body">
			<div class="grid" aria-hidden="true">
				{#each axis.ticks as t}
					<span class="gridline" style="left: {axis.x(t)}%;"></span>
				{/each}
			</div>

			{#each sorted as row (row.name)}
				{@const w = axis.x(row.conv)}
				<div class="row" animate:flip={{ duration: moveMs, easing: cubicInOut }}>
					<div class="name">{row.name}</div>
					<div class="track">
						<div class="bar" class:stem={scaleType === 'log'} style="width: {w}%; --c: {colorFor(row.pct)};"></div>
						{#key sortBy}
							<span class="value" style="left: {w}%;" in:fade={{ duration: fadeMs, delay: moveMs / 2 }}>{labelFor(row)}</span>
						{/key}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.chart {
		--name-w: 196px;
		--gap: 10px;
		--label-w: 54px;
		padding: 14px 0 8px;
		font-family: OpenSans;
		color: var(--brandBlack);
	}

	.legend {
		flex: none;
		width: 240px;
	}

	.legend-title,
	.axis-title {
		font-size: 14px;
		line-height: 18px;
		font-style: italic;
		color: var(--brandGray70);
	}

	.legend-bins {
		height: 8px;
		margin-top: 6px;
	}

	.legend-ticks {
		position: relative;
		height: 24px;
		font-size: 13px;
	}

	.legend-tick {
		position: absolute;
		top: 0;
		width: 1px;
		height: 5px;
		background: var(--brandGray60);
	}

	.legend-tick.last {
		margin-left: -1px;
	}

	.legend-label {
		position: absolute;
		top: 7px;
		left: 50%;
		transform: translateX(-50%);
		white-space: nowrap;
		font-size: 13px;
		line-height: 16px;
	}

	.top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 14px 16px;
		margin-bottom: 18px;
	}

	.toggle {
		display: flex;
		gap: 6px;
	}

	.toggle button {
		padding: 4px 10px;
		border: 1px solid var(--brandGray20);
		background: var(--brandWhite);
		font-family: OpenSans;
		font-size: 13px;
		color: var(--brandGray60);
		cursor: pointer;
	}

	.toggle button:hover {
		border-color: var(--brandGray50);
		color: var(--brandBlack);
	}

	.toggle button.active {
		border-color: var(--brandDarkBlue);
		color: var(--brandBlack);
		font-family: OpenSansBold;
	}

	.toggle button:focus-visible {
		outline: 2px solid var(--brandDarkBlue);
		outline-offset: 2px;
	}

	.axis-row,
	.row {
		display: grid;
		grid-template-columns: var(--name-w) 1fr;
		column-gap: var(--gap);
		align-items: center;
	}

	.axis-row {
		align-items: end;
		margin-bottom: 4px;
	}

	.axis-title {
		font-size: 13px;
		text-align: right;
	}

	.ticks {
		position: relative;
		height: 18px;
		margin-right: var(--label-w);
	}

	.tick {
		position: absolute;
		bottom: 0;
		transform: translateX(-50%);
		font-size: 13px;
		color: var(--brandGray70);
	}

	.body {
		position: relative;
	}

	.grid {
		position: absolute;
		top: 0;
		bottom: 0;
		left: calc(var(--name-w) + var(--gap));
		right: var(--label-w);
		pointer-events: none;
	}

	.gridline {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 1px;
		background: var(--brandGray15);
	}

	.row {
		min-height: 20px;
	}

	.name {
		font-size: 13px;
		line-height: 16px;
		text-align: right;
	}

	.track {
		position: relative;
		height: 20px;
		margin-right: var(--label-w);
		display: flex;
		align-items: center;
	}

	.bar {
		position: relative;
		height: 12px;
		background: var(--c);
		transition: width 0.4s ease, height 0.3s ease;
	}

	.bar::after {
		content: '';
		position: absolute;
		right: 0;
		top: 50%;
		width: 5px;
		height: 12px;
		transform: translateY(-50%);
		background: var(--c);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.bar.stem {
		height: 6px;
	}

	.bar.stem::after {
		opacity: 1;
	}

	.value {
		position: absolute;
		top: 50%;
		padding-left: 6px;
		transform: translateY(-50%);
		font-family: OpenSans;
		font-size: 12px;
		line-height: 16px;
		white-space: nowrap;
		color: var(--brandBlack);
		transition: left 0.4s ease;
	}

	@container (max-width: 500px) {
		.chart {
			--name-w: 112px;
			--gap: 8px;
		}

		.name {
			font-size: 12px;
			line-height: 14px;
		}

		.axis-title {
			font-size: 12px;
		}

		.tick {
			font-size: 12px;
		}

		.tick.minor {
			display: none;
		}

		.legend {
			order: -1;
			flex-basis: 100%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.bar,
		.bar::after,
		.value {
			transition: none;
		}
	}
</style>
