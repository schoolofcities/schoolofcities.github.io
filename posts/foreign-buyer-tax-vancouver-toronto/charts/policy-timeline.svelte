<script>
	import { scaleTime } from 'd3';
	import data from '../data/policy-timeline.csv';

	const width = 1080;
	const height = 480;
	const marginLeft = 130;
	const marginRight = 20;
	const plotLeft = marginLeft;
	const plotRight = width - marginRight;
	const axisY = 440;

	const rowOrder = ['Ontario', 'British Columbia', 'Federal'];
	const rowY = { Ontario: 100, 'British Columbia': 225, Federal: 350 };

	const domainStart = new Date('2015-01-01');
	const domainEnd = new Date('2024-01-01');
	const x = scaleTime().domain([domainStart, domainEnd]).range([plotLeft, plotRight]);

	const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

	const yearLabels = years.slice(0, -1).map((year) => ({
		year,
		x: (x(new Date(`${year}-01-01`)) + x(new Date(`${year + 1}-01-01`))) / 2
	}));

	const minGap = 150;
	const dateOffset = 14;
	const lineGap = 15;
	const edgeGap = 190;

	function wrapLabel(text, maxChars = 28) {
		if (text.length <= maxChars) return [text];
		const words = text.split(' ');
		let line1 = '';
		let line2 = '';
		for (const word of words) {
			if (!line2 && (line1 ? `${line1} ${word}` : word).length <= maxChars) {
				line1 = line1 ? `${line1} ${word}` : word;
			} else {
				line2 = line2 ? `${line2} ${word}` : word;
			}
		}
		return line2 ? [line1, line2] : [line1];
	}

	const rowLineStart = {};

	const events = rowOrder.flatMap((row) => {
		const rowEvents = data
			.filter((d) => d.row === row)
			.map((d) => ({ ...d, x: x(new Date(d.date)) }))
			.sort((a, b) => a.x - b.x);

		rowLineStart[row] = rowEvents[0]?.x ?? plotLeft;

		const lastXPerTier = [-Infinity, -Infinity];

		return rowEvents.map((d) => {
			const tier = d.x - lastXPerTier[0] < minGap ? 1 : 0;
			lastXPerTier[tier] = d.x;

			const baseY = rowY[row];
			const lines = wrapLabel(d.label);
			const below = tier === 1;

			let dateY, line1Y, line2Y, leaderTopY, leaderBottomY;

			if (!below) {
				dateY = baseY - dateOffset;
				line2Y = dateY - lineGap;
				line1Y = lines.length === 2 ? line2Y - lineGap : dateY - lineGap;
				leaderTopY = dateY + 4;
				leaderBottomY = baseY - 6;
			} else {
				dateY = baseY + dateOffset + 8;
				line1Y = dateY + lineGap;
				line2Y = line1Y + lineGap;
				leaderTopY = baseY + 6;
				leaderBottomY = dateY - 10;
			}

			const anchor = plotRight - d.x < edgeGap ? 'end' : 'start';

			return {
				...d,
				row,
				baseY,
				lines,
				below,
				anchor,
				dateY,
				line1Y,
				line2Y,
				leaderTopY,
				leaderBottomY
			};
		});
	});
</script>

<svg viewBox="0 0 {width} {height}">
	{#each years as year}
		<line
			x1={x(new Date(`${year}-01-01`))}
			x2={x(new Date(`${year}-01-01`))}
			y1={20}
			y2={axisY}
			class="gridline"
		/>
	{/each}

	{#each yearLabels as yl}
		<text x={yl.x} y={axisY + 20} class="year-label">{yl.year}</text>
	{/each}

	{#each rowOrder as row}
		<line x1={plotLeft} x2={plotRight} y1={rowY[row]} y2={rowY[row]} class="gridline" />
	{/each}

	{#each rowOrder as row}
		<line x1={rowLineStart[row]} x2={plotRight} y1={rowY[row]} y2={rowY[row]} class="row-line" />
		<text x={4} y={rowY[row] + 4} class="row-label">{row}</text>
	{/each}

	{#each events as d}
		<line x1={d.x} x2={d.x} y1={d.leaderTopY} y2={d.leaderBottomY} class="leader-line" />
		<circle cx={d.x} cy={d.baseY} r="5" class="event-dot" />

		{#if d.lines.length === 2}
			<text x={d.x} y={d.line1Y} text-anchor={d.anchor} class="event-label">{d.lines[0]}</text>
			<text x={d.x} y={d.line2Y} text-anchor={d.anchor} class="event-label">{d.lines[1]}</text>
		{:else}
			<text x={d.x} y={d.line1Y} text-anchor={d.anchor} class="event-label">{d.lines[0]}</text>
		{/if}

		<text x={d.x} y={d.dateY} text-anchor={d.anchor} class="event-date">{d.date}</text>
	{/each}
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: auto;
	}

	.gridline {
		stroke: var(--brandGray05);
		stroke-width: 1;
	}

	.row-line {
		stroke: var(--brandLightBlue);
		stroke-width: 2;
	}

	.year-label {
		font-family: OpenSans;
		font-size: 13px;
		fill: var(--brandGray90);
		text-anchor: middle;
	}

	.row-label {
		font-family: OpenSansBold;
		font-size: 14px;
		fill: var(--brandMedBlue);
	}

	.leader-line {
		stroke: var(--brandGray30);
		stroke-width: 1;
	}

	.event-dot {
		fill: var(--brandDarkBlue);
	}

	.event-label {
		font-family: OpenSans;
		font-size: 14px;
		fill: var(--brandGray90);
	}

	.event-date {
		font-family: OpenSansBold;
		font-size: 11px;
		fill: var(--brandPurple);
	}
</style>
