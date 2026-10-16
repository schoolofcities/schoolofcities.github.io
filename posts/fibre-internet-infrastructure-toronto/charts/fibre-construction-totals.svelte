<script>
	import { format } from 'd3';
	import data from '../data/fibre-construction-totals.csv';

	// Same company colours on every chart and the maps in this post.
	const colors = {
		Bell: 'var(--brandMedBlue)',
		Rogers: 'var(--brandRed)',
		Beanfield: 'var(--brandDarkGreen)'
	};

	const width = 678;
	const units = 100; // one mark per 1% of the total
	const unitW = width / units;
	const gap = 1.5;
	const barH = 55;
	const fmt = format(',');

	// Largest-remainder rounding, so each row is exactly 100 marks and every
	// company's count is its share rounded as fairly as possible.
	function toUnits(values) {
		const total = values.reduce((a, b) => a + b, 0);
		const raw = values.map((v) => (v / total) * units);
		const counts = raw.map(Math.floor);
		const order = raw.map((r, i) => [r - Math.floor(r), i]).sort((a, b) => b[0] - a[0]);
		const missing = units - counts.reduce((a, b) => a + b, 0);
		for (let k = 0; k < missing; k++) counts[order[k][1]]++;
		return counts;
	}

	function buildRow(field, label, valueText) {
		const counts = toUnits(data.map((d) => +d[field]));
		let start = 0;
		const segments = data.map((d, i) => {
			const seg = {
				company: d.company,
				start,
				count: counts[i],
				text: valueText(d, counts[i])
			};
			start += counts[i];
			return seg;
		});
		return { label, segments };
	}

	const rows = [
		buildRow('km', 'Length of fibre construction', (d, n) => `${fmt(Math.round(+d.km))} km (${n}%)`),
		buildRow('projects', 'Number of construction projects', (d, n) => `${fmt(+d.projects)} projects (${n}%)`)
	];

	// Vertical layout of one row block. Bell's label sits left-aligned over the
	// start of its run; Rogers' and Beanfield's are right-aligned to the end of
	// theirs, with Beanfield's raised a line and given a leader, since its run is
	// too short to sit under its own label.
	const rowH = 143;
	const titleY = 14;
	const upperY = 40;
	const lowerY = 60;
	const barY = 70;

	function labelFor(seg, i) {
		const end = (seg.start + seg.count) * unitW;
		if (i === 0) return { x: seg.start * unitW, y: lowerY, anchor: 'start' };
		if (i === 1) return { x: end - gap, y: lowerY, anchor: 'end' };
		return { x: end - gap, y: upperY, anchor: 'end', leaderX: (seg.start + seg.count / 2) * unitW };
	}

	const height = rows.length * rowH + 16;
</script>

<svg viewBox="0 0 {width} {height}">
	{#each rows as row, r}
		<g transform="translate(0, {r * rowH})">
			<text x="0" y={titleY} class="row-title">{row.label}</text>
			{#each row.segments as seg, i}
				{@const l = labelFor(seg, i)}
				<text x={l.x} y={l.y} text-anchor={l.anchor} class="value">
					<tspan class="company" fill={colors[seg.company]}>{seg.company}</tspan>{' '}{seg.text}
				</text>
				{#if l.leaderX !== undefined}
					<line x1={l.leaderX} x2={l.leaderX} y1={upperY + 5} y2={barY - 3} class="leader" />
				{/if}
				{#each Array(seg.count) as _, k}
					<rect
						x={(seg.start + k) * unitW}
						y={barY}
						width={unitW - gap}
						height={barH}
						rx="1"
						fill={colors[seg.company]}
					/>
				{/each}
			{/each}
		</g>
	{/each}
	<text x="0" y={height - 2} class="key">Each mark is 1% of the total</text>
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: auto;
		padding: 14px 0 8px;
	}

	.row-title {
		font-family: OpenSansBold;
		font-size: 13px;
		fill: var(--brandGray70);
	}

	.value {
		font-family: OpenSans;
		font-size: 14px;
		fill: var(--brandGray90);
	}

	.company {
		font-family: OpenSansBold;
	}

	.leader {
		stroke: var(--brandGray60);
		stroke-width: 1;
	}

	.key {
		font-family: OpenSansItalic;
		font-size: 12px;
		fill: var(--brandGray70);
	}
</style>
