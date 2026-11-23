<script>
	import { format } from 'd3';
	import data from '../data/conversions-by-cma.csv';
	import singleToMultiple from '../images/conversion-single-to-multiple-legend.svg';
	import multipleToMultiple from '../images/conversion-multiple-to-multiple-legend.svg';
	import nonResToRes from '../images/conversion-non-residential-to-residential-legend.svg';

	const fmt = format(',');

	const types = [
		{ field: 'single_to_multiple', label: 'Single dwelling to multiple dwellings', color: 'var(--brandMedGreen)', ink: 'var(--brandBlack)', image: singleToMultiple },
		{ field: 'multiple_to_multiple', label: 'Multiple dwellings to multiple dwellings', color: 'var(--brandDarkBlue)', ink: 'var(--brandWhite)', image: multipleToMultiple },
		{ field: 'non_residential_to_residential', label: 'Non-residential to residential', color: 'var(--brandLightGreen)', ink: 'var(--brandBlack)', image: nonResToRes }
	];

	const shown = 8;

	// Rows run west to east. A region missing from this list goes last.
	const longitude = {
		Vancouver: -123.12,
		Calgary: -114.07,
		Edmonton: -113.49,
		Winnipeg: -97.14,
		Toronto: -79.38,
		'Ottawa-Gatineau': -75.7,
		Montréal: -73.57,
		Québec: -71.21
	};
	const minLabel = 10;

	function toPercents(values) {
		const total = values.reduce((a, b) => a + b, 0);
		const raw = values.map((v) => (v / total) * 100);
		const counts = raw.map(Math.floor);
		const order = raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]);
		const missing = 100 - counts.reduce((a, b) => a + b, 0);
		for (let k = 0; k < missing; k++) counts[order[k][1]]++;
		return counts;
	}

	function build(d) {
		const percents = toPercents(types.map((t) => +d[t.field]));
		return {
			name: d.cma === 'All Canada' ? 'Canada' : d.cma.split(',')[0],
			percents,
			conv: +d.conversions,
			cells: percents.flatMap((n, i) => Array(n).fill(i)),
			marks: percents.map((n, i) => ({
				i,
				n,
				mid: percents.slice(0, i).reduce((a, b) => a + b, 0) + n / 2
			})),
			size: +d.new_construction + +d.conversions
		};
	}

	const canada = build(data.find((d) => d.cma === 'All Canada'));
	const rows = data
		.filter((d) => d.cma !== 'All Canada')
		.map(build)
		.sort((a, b) => b.size - a.size)
		.slice(0, shown)
		.sort((a, b) => (longitude[a.name] ?? Infinity) - (longitude[b.name] ?? Infinity));
</script>

{#snippet bar(p)}
	<div class="row">
		<div class="name">{p.name}</div>
		<div class="bar" aria-hidden="true">
			{#each types as t, i}
				<div class="seg" style="flex: {p.percents[i]} 0 0; background: {t.color}; color: {t.ink};">
					{#if p.percents[i] >= minLabel}{p.percents[i]}%{/if}
				</div>
			{/each}
		</div>
	</div>
{/snippet}

{#snippet column(p)}
	<div class="col">
		<div class="stack" aria-hidden="true">
			{#each p.cells as c}
				<span class="cell" style="background: {types[c].color};"></span>
			{/each}
			{#each p.marks as m}
				{#if m.n >= minLabel}
					<span class="vlabel" style="top: {m.mid}%; color: {types[m.i].ink}; background: {types[m.i].color};">{m.n}%</span>
				{/if}
			{/each}
		</div>
		<div class="cname">{p.name}</div>
		<div class="ctotal">{fmt(Math.round(p.conv / 100) * 100)}</div>
	</div>
{/snippet}

<div class="chart">
	<div class="vertical">
		<div class="vlegend">
			<div class="vitems">
				{#each types as t}
					<div class="vitem">
						<img src={t.image} alt="" />
						<span class="legend-label"><span class="swatch" style="background: {t.color};"></span>{t.label}</span>
					</div>
				{/each}
			</div>
		</div>
		<div class="cols">
			<div class="col-canada">
				{@render column(canada)}
				<span class="totals-label">Total permits issued for new dwellings from building conversions</span>
			</div>
			<div class="regions">
				{#each rows as p}
					{@render column(p)}
				{/each}
			</div>
		</div>
	</div>

	<div class="horizontal">
		<div class="legend">
			{#each types as t}
				<div class="legend-item">
					<img src={t.image} alt="" />
					<span class="legend-label"><span class="swatch" style="background: {t.color};"></span>{t.label}</span>
				</div>
			{/each}
		</div>

		<div class="canada">{@render bar(canada)}</div>
		{#each rows as p}
			{@render bar(p)}
		{/each}
	</div>
</div>

<style>
	.chart {
		--name-h: 30px;
		--name-gap: 6px;
		--total-gap: 5px;
		--total-h: 16px;
		--under-stack: calc(var(--name-gap) + var(--name-h) + var(--total-gap) + var(--total-h));
		--bar-gap: 9px;
		padding: 24px 0 18px;
		font-family: OpenSans;
		color: var(--brandBlack);
	}

	.legend {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 4px 16px;
		margin-bottom: 18px;
		font-size: 14px;
		line-height: 18px;
	}

	.legend-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.legend-item img {
		display: block;
		width: 100%;
		height: auto;
	}

	.legend-label {
		display: flex;
		align-items: flex-start;
		gap: 7px;
	}

	.swatch {
		flex: none;
		width: 12px;
		height: 12px;
		margin-top: 3px;
	}

	.horizontal {
		display: none;
	}

	.vertical {
		display: flex;
		gap: 44px;
		align-items: stretch;
	}

	.vlegend {
		display: flex;
		flex: none;
		flex-direction: column;
		align-self: stretch;
		padding-bottom: var(--under-stack);
		width: clamp(120px, 20%, 250px);
		font-size: 13px;
		line-height: 17px;
	}

	.vitems {
		display: flex;
		flex: 1;
		flex-direction: column;
		justify-content: space-between;
		gap: 10px;
	}

	.vitem {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.vitem img {
		display: block;
		width: 100%;
		max-width: 150px;
		height: auto;
	}

	.cols {
		--cg: 44px;
		--g: 0px;
		display: flex;
		flex: 1;
		align-items: flex-start;
		gap: var(--cg);
		min-width: 0;
	}

	.col-canada {
		position: relative;
		flex: none;
		width: calc((100% - var(--cg) - 7 * var(--g)) / 9);
	}

	.col-canada::after {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		right: calc(var(--cg) / -2);
		width: 1px;
		background: var(--brandGray10);
	}

	.regions {
		display: grid;
		flex: 1;
		grid-template-columns: repeat(8, minmax(0, 1fr));
		column-gap: var(--g);
		min-width: 0;
	}

	.col {
		min-width: 0;
	}

	.stack {
		position: relative;
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: 1px;
		width: calc(100% - var(--bar-gap));
		margin: 0 auto;
	}

	.cell {
		aspect-ratio: 1;
	}

	.vlabel {
		position: absolute;
		left: 50%;
		padding: 1px 4px;
		transform: translate(-50%, -50%);
		text-align: center;
		font-family: OpenSansBold;
		font-size: 12px;
		line-height: 16px;
	}

	.cname {
		min-height: var(--name-h);
		margin-top: var(--name-gap);
		font-size: 12px;
		line-height: 15px;
		text-align: center;
	}

	.totals-label {
		position: absolute;
		right: calc(100% + 8px);
		bottom: 0;
		width: 230px;
		height: var(--total-h);
		display: flex;
		align-items: center;
		justify-content: flex-end;
		font-size: 12px;
		line-height: 15px;
		font-style: italic;
		text-align: right;
		color: var(--brandGray70);
	}

	.ctotal {
		margin-top: var(--total-gap);
		font-size: 12px;
		line-height: var(--total-h);
		text-align: center;
		color: var(--brandGray70);
	}

	.col-canada :global(.cname) {
		font-family: OpenSansBold;
	}

	@container (max-width: 800px) {
		.vertical {
			gap: 24px;
		}

		.vlegend {
			width: 140px;
			font-size: 12px;
			line-height: 15px;
		}

		.vitems {
			gap: 4px;
		}

		.vitem img {
			max-width: 72px;
		}

		.totals-label {
			width: 184px;
			font-size: 12px;
			line-height: 15px;
		}

		.cols {
			--cg: 24px;
			--g: 0px;
		}

		.cname {
			font-size: 12px;
		}
	}

	@container (max-width: 520px) {
		.vertical {
			display: none;
		}

		.horizontal {
			display: block;
		}

		.legend {
			grid-template-columns: 1fr;
			gap: 6px;
			font-size: 13px;
			line-height: 17px;
		}

		.legend-item .legend-label {
			order: -1;
			flex: 1;
		}

		.legend-item {
			flex-direction: row;
			align-items: center;
			gap: 10px;
		}

		.legend-item img {
			flex: none;
			width: 55%;
		}
	}

	.canada {
		margin-bottom: 14px;
		padding-bottom: 14px;
		border-bottom: 1px solid var(--brandGray10);
	}

	.row {
		display: grid;
		grid-template-columns: 1fr;
		row-gap: 3px;
		margin-bottom: 12px;
	}

	.canada .row {
		margin-bottom: 0;
	}

	.name {
		font-size: 13px;
		line-height: 16px;
	}

	.canada .name {
		font-family: OpenSansBold;
		font-size: 14px;
	}

	.bar {
		display: flex;
		gap: 1px;
		height: 19.4px;
	}

	.seg {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
		font-family: OpenSansBold;
		font-size: 12px;
		line-height: 16px;
	}
</style>
