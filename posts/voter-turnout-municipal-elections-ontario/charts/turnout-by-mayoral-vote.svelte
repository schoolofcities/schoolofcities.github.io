<script>
	import { scaleLinear, mean } from 'd3';
	import data from '../data/turnout-and-mayoral-vote.csv';

	const years = [2014, 2018, 2022];

	// Toronto and Ottawa keep the colours they have in the slope chart: pink for
	// the largest decline, blue for the one that rose.
	const highlights = {
		Toronto: 'var(--brandPink)',
		Ottawa: 'var(--brandMedBlue)'
	};
	const otherColor = 'var(--brandGray45)';

	// Where each highlighted label sits relative to its point, per year:
	// [dx, dy, text-anchor].
	const labelAt = {
		Toronto: { 2014: [0, -11, 'middle'], 2018: [-4, 20, 'middle'], 2022: [0, 19, 'middle'] },
		Ottawa: { 2014: [0, -11, 'middle'], 2018: [0, -11, 'middle'], 2022: [0, -11, 'middle'] }
	};

	// Rows with no vote share are left out: an acclaimed mayor has no contest to
	// measure, and one row has no total for the office in the provincial file.
	const rows = data
		.filter((d) => d.mayor_vote_share !== '')
		.map((d) => ({
			name: d.municipality,
			year: +d.year,
			turnout: +d.turnout,
			share: +d.mayor_vote_share,
			mayor: d.mayor_elected,
			color: highlights[d.municipality] ?? otherColor,
			highlighted: d.municipality in highlights
		}));

	// Two-sided p-value for a correlation r across n points: the chance of an r
	// at least this far from zero if there were no relationship. From the t
	// distribution with n - 2 degrees of freedom, whose tail is a regularized
	// incomplete beta function, evaluated here by its continued fraction.
	function logGamma(z) {
		const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.001208650973866179, -0.000005395239384953];
		let sum = 1.000000000190015;
		c.forEach((v, j) => (sum += v / (z + j + 1)));
		const t = z + 5.5;
		return (z + 0.5) * Math.log(t) - t + Math.log((2.5066282746310005 * sum) / z);
	}

	function incompleteBeta(x, a, b) {
		if (x <= 0) return 0;
		if (x >= 1) return 1;
		const front = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
		// The fraction converges quickly only on one side of the mean; use symmetry on the other.
		if (x > (a + 1) / (a + b + 2)) return 1 - incompleteBeta(1 - x, b, a);
		const tiny = 1e-30;
		let c = 1;
		let d = 1 / Math.max(1 - ((a + b) * x) / (a + 1), tiny);
		let h = d;
		for (let m = 1; m <= 200; m++) {
			const even = (m * (b - m) * x) / ((a + 2 * m - 1) * (a + 2 * m));
			d = 1 / (Math.abs(1 + even * d) < tiny ? tiny : 1 + even * d);
			c = Math.abs(1 + even / c) < tiny ? tiny : 1 + even / c;
			h *= d * c;
			const odd = (-(a + m) * (a + b + m) * x) / ((a + 2 * m) * (a + 2 * m + 1));
			d = 1 / (Math.abs(1 + odd * d) < tiny ? tiny : 1 + odd * d);
			c = Math.abs(1 + odd / c) < tiny ? tiny : 1 + odd / c;
			const step = d * c;
			h *= step;
			if (Math.abs(step - 1) < 1e-10) break;
		}
		return (front * h) / a;
	}

	function pValue(r, n) {
		const df = n - 2;
		const t2 = (r * r * df) / (1 - r * r);
		return incompleteBeta(df / (df + t2), df / 2, 0.5);
	}

	// Least-squares line through one election's points, drawn only across the
	// range of vote shares that election actually has, with the correlation (r)
	// and p-value that each panel is labelled with.
	function trend(points) {
		const mx = mean(points, (p) => p.share);
		const my = mean(points, (p) => p.turnout);
		const sxy = points.reduce((s, p) => s + (p.share - mx) * (p.turnout - my), 0);
		const sxx = points.reduce((s, p) => s + (p.share - mx) ** 2, 0);
		const syy = points.reduce((s, p) => s + (p.turnout - my) ** 2, 0);
		const slope = sxy / sxx;
		const at = (v) => my + slope * (v - mx);
		const lo = Math.min(...points.map((p) => p.share));
		const hi = Math.max(...points.map((p) => p.share));
		const r = sxy / Math.sqrt(sxx * syy);
		return { x1: lo, y1: at(lo), x2: hi, y2: at(hi), r, p: pValue(r, points.length) };
	}

	const panels = years.map((year) => {
		const points = rows.filter((r) => r.year === year);
		// Highlighted points last, so they are drawn over their neighbours.
		points.sort((a, b) => a.highlighted - b.highlighted);
		return { year, points, trend: trend(points) };
	});

	const xDomain = [20, 100];
	const xTicks = [25, 50, 75, 100];
	// Stops at 80% rather than the slope chart's 100%: the panels are small, and
	// the extra fifth of the axis left the points too squeezed to read the trend.
	const yDomain = [0, 80];
	const yTicks = [0, 20, 40, 60, 80];

	// One geometry per snapped width (see meta.widths in charts.js), drawn 1:1 so
	// font sizes are true pixels. Each panel is a frame inside a single SVG: three
	// across at 720px, stacked at 360px.
	function buildLayout({ W, left, right, top, plotH, gapX, gapY, bottom, columns, fontSize, dotR }) {
		const rowsCount = Math.ceil(panels.length / columns);
		const plotW = (W - left - right - gapX * (columns - 1)) / columns;
		const H = top + rowsCount * plotH + (rowsCount - 1) * gapY + bottom;
		const frames = panels.map((panel, i) => {
			const col = i % columns;
			const row = Math.floor(i / columns);
			const x0 = left + col * (plotW + gapX);
			const y0 = top + row * (plotH + gapY);
			const x = scaleLinear().domain(xDomain).range([x0, x0 + plotW]);
			const y = scaleLinear().domain(yDomain).range([y0 + plotH, y0]);
			return {
				...panel,
				x,
				y,
				x0,
				x1: x0 + plotW,
				y0,
				y1: y0 + plotH,
				showYLabels: col === 0,
				// One axis title for the whole graphic, under the first panel of the last row.
				showXTitle: col === 0 && row === rowsCount - 1
			};
		});
		return { W, H, frames, fontSize, dotR, left };
	}

	const wide = buildLayout({ W: 678, left: 40, right: 8, top: 30, plotH: 300, gapX: 18, gapY: 0, bottom: 58, columns: 3, fontSize: 13, dotR: 4.5 });
	const narrow = buildLayout({ W: 318, left: 36, right: 10, top: 28, plotH: 190, gapX: 0, gapY: 62, bottom: 52, columns: 1, fontSize: 11, dotR: 4 });
</script>

<div class="legend-title">
	Voter turnout relative to the winning mayoral candidate's share of the vote
</div>

<div class="legend">
	{#each Object.entries(highlights) as [name, color]}
		<div class="legend-item">
			<svg class="legend-swatch" viewBox="0 0 14 14" width="14" height="14">
				<circle cx="7" cy="7" r="5.5" fill={color} />
			</svg>
			{name}
		</div>
	{/each}
	<div class="legend-item">
		<svg class="legend-swatch" viewBox="0 0 14 14" width="14" height="14">
			<circle cx="7" cy="7" r="4.5" fill={otherColor} />
		</svg>
		Other municipalities
	</div>
	<div class="legend-item">
		<svg class="legend-swatch" viewBox="0 0 24 10" width="24" height="10">
			<line x1="0" x2="24" y1="5" y2="5" class="trend-line" />
		</svg>
		Trend
	</div>
</div>

{#snippet scatter(layout)}
	<svg viewBox="0 0 {layout.W} {layout.H}" width={layout.W} height={layout.H} style="--label-size: {layout.fontSize}px;">
		{#each layout.frames as f}
			<text x={f.x0} y={f.y0 - 12} class="panel-title" text-anchor="start">{f.year}</text>
			<!-- Just under the top gridline, where the plot is empty: no turnout is
			     above 60%. A typographic minus, not a hyphen, to match the post's text. -->
			<text x={f.x0} y={f.y0 + layout.fontSize + 6} class="panel-stat" text-anchor="start"
				>Correlation: {f.trend.r.toFixed(2).replace('-', '−')} (p {f.trend.p < 0.001
					? '< 0.001'
					: `= ${f.trend.p.toFixed(3)}`})</text
			>

			{#each yTicks as tick}
				<line x1={f.x0} x2={f.x1} y1={f.y(tick)} y2={f.y(tick)} class="gridline" />
				<!-- The top gridline is unlabelled: it only closes off the band that
				     holds the correlation text. -->
				{#if f.showYLabels && tick !== yDomain[1]}
					<text x={f.x0 - 8} y={f.y(tick) + 4} class="axis-label" text-anchor="end">{tick}%</text>
				{/if}
			{/each}
			<line x1={f.x0} x2={f.x1} y1={f.y1} y2={f.y1} class="zero-line" />

			{#each xTicks as tick}
				<line x1={f.x(tick)} x2={f.x(tick)} y1={f.y1} y2={f.y1 + 5} class="zero-line" />
				<text x={f.x(tick)} y={f.y1 + 20} class="axis-label" text-anchor={tick === 100 ? 'end' : 'middle'}
					>{tick}%</text
				>
			{/each}
			{#if f.showXTitle}
				<text x={f.x0} y={f.y1 + 42} class="axis-title" text-anchor="start">Winner's share of mayoral vote →</text>
			{/if}

			<line
				x1={f.x(f.trend.x1)}
				x2={f.x(f.trend.x2)}
				y1={f.y(f.trend.y1)}
				y2={f.y(f.trend.y2)}
				class="trend-line"
			/>

			{#each f.points as p}
				<g class="dot-group">
					<circle
						cx={f.x(p.share)}
						cy={f.y(p.turnout)}
						fill={p.color}
						class="dot"
						class:highlighted={p.highlighted}
						style="--r: {p.highlighted ? layout.dotR + 1.5 : layout.dotR}px;"
					/>
					<circle cx={f.x(p.share)} cy={f.y(p.turnout)} r="9" fill="transparent" class="hover-target">
						<title
							>{p.name}, {p.year}: {p.turnout.toFixed(1)}% turnout; {p.mayor} elected mayor with {p.share.toFixed(
								1
							)}% of the vote</title
						>
					</circle>
				</g>
			{/each}

			<!-- After every dot, so a label is never covered by a neighbouring point. -->
			{#each f.points.filter((p) => p.highlighted) as p}
				{@const at = labelAt[p.name][p.year]}
				<text x={f.x(p.share) + at[0]} y={f.y(p.turnout) + at[1]} text-anchor={at[2]} fill={p.color} class="point-label"
					>{p.name}</text
				>
			{/each}
		{/each}
	</svg>
{/snippet}

<div class="scatter scatter-wide">
	{@render scatter(wide)}
</div>

<div class="scatter scatter-narrow">
	{@render scatter(narrow)}
</div>

<style>
	.scatter svg {
		display: block;
		overflow: visible;
	}

	/* ChartFrame draws the graphic at exactly 678px or 318px (720 and 360 less the
	   frame's inset); this shows whichever SVG was built for that width. */
	.scatter-narrow {
		display: none;
	}

	@container (max-width: 400px) {
		.scatter-wide {
			display: none;
		}

		.scatter-narrow {
			display: block;
		}
	}

	.panel-title {
		font-family: OpenSansBold;
		font-size: calc(var(--label-size) + 1px);
		fill: var(--brandBlack);
	}

	.panel-stat {
		font-family: OpenSans;
		font-size: var(--label-size);
		fill: var(--brandGray60);
	}

	.gridline {
		stroke: var(--brandGray10);
		stroke-width: 1;
	}

	.zero-line {
		stroke: var(--brandGray70);
		stroke-width: 1;
	}

	.trend-line {
		stroke: var(--brandDarkBlue);
		stroke-width: 1.5;
		stroke-dasharray: 5 3;
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

	.point-label {
		font-family: OpenSansBold;
		font-size: var(--label-size);
		/* White halo, so a label crossing a gridline or the trend stays legible. */
		paint-order: stroke;
		stroke: var(--brandWhite);
		stroke-width: 3px;
		stroke-linejoin: round;
	}

	.dot {
		r: var(--r);
		opacity: 0.75;
		transition: r 0.1s ease;
	}

	.dot.highlighted {
		opacity: 1;
		stroke: var(--brandWhite);
		stroke-width: 1.5;
	}

	.hover-target {
		cursor: pointer;
	}

	.dot-group:hover .dot {
		r: calc(var(--r) * 1.6);
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
		flex-direction: row;
		flex-wrap: wrap;
		gap: 8px 20px;
		padding-top: 6px;
		padding-bottom: 10px;
		margin-bottom: 14px;
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
