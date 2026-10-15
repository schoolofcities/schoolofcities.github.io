<script>
	import { scaleLinear, median, extent } from 'd3';
	import turnout from '../data/turnout-by-municipality.csv';
	import internet from '../data/internet-voting.csv';

	const startedColor = 'var(--brandMedBlue)';
	const stoppedColor = 'var(--brandRed)';
	const medianColor = 'var(--brandGray75)';

	const offered = Object.fromEntries(internet.map((d) => [d.municipality, d]));

	// The CSV holds turnout to one decimal; rounding the difference keeps it from
	// picking up floating-point noise (e.g. 4.4999999).
	const round1 = (v) => Math.round(v * 10) / 10;
	// A median of an even count can land on a half step (-8.05); this rounds it
	// away from zero, to -8.1.
	const roundHalfOut = (v) => (Math.sign(v) * Math.round(Math.abs(v) * 10 + 1e-6)) / 10;
	const signed = (v) => (v > 0 ? `+${v.toFixed(1)}` : v.toFixed(1).replace('-', '−'));
	const tickLabel = (v) => (v > 0 ? `+${v}` : `${v}`.replace('-', '−'));

	// One group per election. Each municipality that started or stopped offering
	// internet voting gets a row, largest rise first; one last row summarizes the
	// municipalities whose use of it did not change by their median change.
	// The more recent election first: it is the one the title is about.
	const groups = [
		[2018, 2022],
		[2014, 2018]
	].map(([from, to]) => {
		const all = turnout.map((d) => {
			const before = offered[d.municipality][`internet_${from}`] === 'yes';
			const after = offered[d.municipality][`internet_${to}`] === 'yes';
			return {
				name: d.municipality,
				before: +d[`turnout_${from}`],
				after: +d[`turnout_${to}`],
				change: round1(d[`turnout_${to}`] - d[`turnout_${from}`]),
				status: before === after ? 'same' : after ? 'started' : 'stopped'
			};
		});
		const same = all.filter((r) => r.status === 'same');
		const [min, max] = extent(same, (r) => r.change);
		const byChange = (a, b) => b.change - a.change;
		return {
			from,
			to,
			rows: [
				...all.filter((r) => r.status === 'started').sort(byChange),
				...all.filter((r) => r.status === 'stopped').sort(byChange),
				{
					name: `Median of the other ${same.length}`,
					change: roundHalfOut(median(same, (r) => r.change)),
					status: 'summary',
					count: same.length,
					min,
					max
				}
			]
		};
	});

	const colors = { started: startedColor, stopped: stoppedColor, summary: medianColor };

	// Each category's rows sit in a faint box, labelled on the chart in place of a
	// legend: in a column to the right at 720px, as a line at the top of the box at
	// 360px. The median row names itself, so at 360px its box has no label.
	const categories = [
		{ status: 'started', side: ['Introduced', 'internet voting'], top: 'Introduced internet voting' },
		{ status: 'stopped', side: ['Stopped offering', 'internet voting'], top: 'Stopped offering internet voting' },
		{ status: 'summary', side: ['Did not', 'change'], top: null }
	];

	// Each row is an arrow from zero to its change. The head is drawn as its own
	// triangle so the shaft can stop at its base; on a change too small to fit a
	// head and a shaft, the head starts at zero.
	function arrow(x, r, cy, headL, headW) {
		const x0 = x(0);
		const tip = x(r.change);
		const dir = r.change >= 0 ? 1 : -1;
		const base = Math.abs(tip - x0) > headL ? tip - dir * headL : x0;
		return {
			shaft: { x1: x0, x2: base },
			head: `${tip},${cy} ${base},${cy - headW} ${base},${cy + headW}`,
			tip,
			dir
		};
	}

	const xDomain = [-12, 6];
	const xTicks = [-10, -5, 0, 5];

	// One geometry per snapped width (see meta.widths in charts.js), drawn 1:1 so
	// font sizes are true pixels. Names sit in a column on the left, inset into
	// their box. Each election has a heading, then one box per category.
	function buildLayout({ W, labelW, plotRight, sideLabels, directions, top, headerH, catH, rowH, pad, boxGap, groupGap, bottom, fontSize, headL, headW }) {
		const x = scaleLinear().domain(xDomain).range([labelW, plotRight]);
		let y = top;
		const placed = groups.map((g, gi) => {
			if (gi > 0) y += groupGap;
			const headerY = y + fontSize + 1;
			y += headerH;
			const boxes = categories
				.map((c) => ({ ...c, color: colors[c.status], rows: g.rows.filter((r) => r.status === c.status) }))
				.filter((c) => c.rows.length > 0)
				.map((c, ci) => {
					if (ci > 0) y += boxGap;
					const boxTop = y;
					y += pad;
					const topLabelY = !sideLabels && c.top ? y + fontSize - 2 : null;
					if (topLabelY) y += catH;
					const rows = c.rows.map((r) => {
						const cy = y + rowH / 2;
						y += rowH;
						return { ...r, cy, color: c.color, arrow: arrow(x, r, cy, headL, headW) };
					});
					y += pad;
					const mid = (boxTop + y) / 2;
					return { ...c, rows, boxTop, boxBottom: y, topLabelY, sideY: mid - (c.side.length - 1) * (fontSize + 2) / 2 + 4 };
				});
			return { ...g, headerY, boxes };
		});
		return { W, H: y + bottom, x, groups: placed, top, plotBottom: y, fontSize, sideLabels, sideX: plotRight + 26, directions };
	}

	const wide = buildLayout({ W: 678, labelW: 170, plotRight: 520, sideLabels: true, directions: ['Turnout decreased', 'Turnout increased'], top: 54, headerH: 26, catH: 0, rowH: 26, pad: 5, boxGap: 6, groupGap: 22, bottom: 8, fontSize: 13, headL: 9, headW: 5.5 });
	const narrow = buildLayout({ W: 318, labelW: 132, plotRight: 284, sideLabels: false, directions: ['Decreased', 'Increased'], top: 50, headerH: 24, catH: 16, rowH: 24, pad: 5, boxGap: 6, groupGap: 18, bottom: 8, fontSize: 11, headL: 8, headW: 5 });
</script>

<div class="legend-title">Change in voter turnout from the previous municipal election</div>
<div class="legend-subtitle">For example, turnout decreasing from 35% to 30% is shown as −5</div>


{#snippet arrows(L)}
	{@const x = L.x}
	<svg viewBox="0 0 {L.W} {L.H}" width={L.W} height={L.H} style="--label-size: {L.fontSize}px;">
		<!-- Boxes first, so the gridlines and the zero line run over them. -->
		{#each L.groups as g}
			{#each g.boxes as b}
				<rect x="0" y={b.boxTop} width={L.W} height={b.boxBottom - b.boxTop} rx="4" fill={b.color} class="box" />
			{/each}
		{/each}

		{#each xTicks as tick}
			<line x1={x(tick)} x2={x(tick)} y1={L.top} y2={L.plotBottom} class={tick === 0 ? 'zero-line' : 'gridline'} />
			<text x={x(tick)} y={L.top - 10} text-anchor="middle" class="axis-label">{tickLabel(tick)}</text>
		{/each}
		<!-- Which way is which, on either side of zero, above the tick values. -->
		<text x={x(0) - 6} y={L.top - 10 - L.fontSize - 8} text-anchor="end" class="axis-title">← {L.directions[0]}</text>
		<text x={x(0) + 6} y={L.top - 10 - L.fontSize - 8} text-anchor="start" class="axis-title">{L.directions[1]} →</text>

		{#each L.groups as g}
			<text x="0" y={g.headerY} class="group-title">{g.from} to {g.to}</text>

			{#each g.boxes as b}
				{#if L.sideLabels}
					<text x={L.sideX} y={b.sideY} fill={b.color} class="category-label">
						{#each b.side as part, i}
							<tspan x={L.sideX} dy={i ? L.fontSize + 2 : 0}>{part}</tspan>
						{/each}
					</text>
				{:else if b.topLabelY}
					<text x="8" y={b.topLabelY} fill={b.color} class="category-label">{b.top}</text>
				{/if}
			{/each}

			{#each g.boxes.flatMap((b) => b.rows) as r}
				<g class="row">
					<text x="8" y={r.cy + 4} class="row-label" fill={r.color}>{r.name}</text>
					{#if r.arrow.shaft.x1 !== r.arrow.shaft.x2}
						<line x1={r.arrow.shaft.x1} x2={r.arrow.shaft.x2} y1={r.cy} y2={r.cy} stroke={r.color} class="stem" />
					{/if}
					<polygon points={r.arrow.head} fill={r.color} />
					<text
						x={r.arrow.tip + r.arrow.dir * 5}
						y={r.cy + 4}
						text-anchor={r.arrow.dir > 0 ? 'start' : 'end'}
						fill={r.color}
						class="value-label">{signed(r.change)}</text
					>
					<!-- The whole row is the hover target, so a short arrow is as easy to hit as a long one. -->
					<rect x="0" y={r.cy - 10} width={L.W} height="20" fill="transparent" class="hover-target">
						<title
							>{r.status === 'summary'
								? `Median change of the ${r.count} municipalities whose use of internet voting did not change, ${g.from} to ${g.to}: ${signed(r.change)} points (ranging from ${signed(r.min)} to ${signed(r.max)})`
								: `${r.name}: ${r.before.toFixed(1)}% in ${g.from}, ${r.after.toFixed(1)}% in ${g.to} (${signed(r.change)} points); ${r.status === 'started' ? 'introduced' : 'stopped offering'} internet voting`}</title
						>
					</rect>
				</g>
			{/each}
		{/each}
	</svg>
{/snippet}

<div class="arrows arrows-wide">
	{@render arrows(wide)}
</div>

<div class="arrows arrows-narrow">
	{@render arrows(narrow)}
</div>

<style>
	.arrows svg {
		display: block;
		overflow: visible;
	}

	/* ChartFrame draws the graphic at exactly 678px or 318px (720 and 360 less the
	   frame's inset); this shows whichever SVG was built for that width. */
	.arrows-narrow {
		display: none;
	}

	@container (max-width: 400px) {
		.arrows-wide {
			display: none;
		}

		.arrows-narrow {
			display: block;
		}
	}

	.gridline {
		stroke: var(--brandGray10);
		stroke-width: 1;
	}

	.zero-line {
		stroke: var(--brandGray70);
		stroke-width: 1;
	}

	.axis-label {
		font-family: OpenSans;
		font-size: var(--label-size);
		fill: var(--brandGray60);
	}

	.axis-title {
		font-family: OpenSansItalic;
		font-size: var(--label-size);
		fill: var(--brandGray60);
	}

	.group-title {
		font-family: OpenSansBold;
		font-size: calc(var(--label-size) + 1px);
		fill: var(--brandBlack);
	}

	.row-label {
		font-family: OpenSans;
		font-size: var(--label-size);
	}

	/* Each box is a faint tint of its category's colour. */
	.box {
		fill-opacity: 0.08;
	}

	.category-label {
		font-family: OpenSansBoldItalic;
		font-size: var(--label-size);
	}

	.stem {
		stroke-width: 3;
	}

	.value-label {
		font-family: OpenSansBold;
		font-size: var(--label-size);
	}

	.hover-target {
		cursor: pointer;
	}

	.legend-title {
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: 14px;
		color: var(--brandGray90);
		padding-top: 15px;
	}

	.legend-subtitle {
		font-family: OpenSans;
		font-size: 13px;
		color: var(--brandGray60);
		padding-top: 4px;
		padding-bottom: 14px;
	}
</style>
