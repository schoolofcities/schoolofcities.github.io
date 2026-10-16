<script>
	import data from '../data/bell-price-with-competitor.csv';

	// Bell's colour from the other charts in this post; Beanfield's green marks
	// the condition, so it links back to Beanfield elsewhere on the page.
	const bell = 'var(--brandMedBlue)';
	const beanfield = 'var(--brandDarkGreen)';

	// Each $10 a month is drawn as a banknote, stacked into a pile per price.
	// Where Beanfield is present, the notes Bell doesn't charge for are drawn as
	// dashed outlines, so the gap reads as money missing from the pile.
	const unitDollars = 10;
	const noteW = 64;
	const noteH = 11;
	const noteStep = 15;

	const width = 678;
	const stackGap = 40;
	const top = 30;

	const plans = [...new Set(data.map((d) => d.plan))];
	const maxNotes = Math.max(...data.map((d) => +d.monthly_price_cad / unitDollars));
	const baseY = top + maxNotes * noteStep;
	const height = baseY + 50;

	const groupW = 2 * noteW + stackGap;
	const groupGap = (width - plans.length * groupW) / plans.length;

	const groups = plans.map((plan, p) => {
		const rows = data.filter((d) => d.plan === plan);
		const without = +rows.find((d) => d.beanfield_present === 'no').monthly_price_cad;
		const withB = +rows.find((d) => d.beanfield_present === 'yes').monthly_price_cad;
		const x0 = groupGap / 2 + p * (groupW + groupGap);
		return {
			plan,
			speed: rows[0].max_download,
			x0,
			diff: without - withB,
			pct: Math.round((1 - withB / without) * 100),
			stacks: [
				{ label: 'Without Beanfield', price: without, notes: without / unitDollars, ghosts: 0, x: x0 },
				{
					label: 'With Beanfield',
					price: withB,
					notes: withB / unitDollars,
					ghosts: (without - withB) / unitDollars,
					x: x0 + noteW + stackGap,
					withBeanfield: true
				}
			]
		};
	});

	const noteY = (k) => baseY - (k + 1) * noteStep;
</script>

<svg viewBox="0 0 {width} {height}">
	{#each groups as g}
		<text x={g.x0 + groupW / 2} y="14" text-anchor="middle" class="plan"
			>{g.plan} <tspan class="speed">(up to {g.speed})</tspan></text
		>

		{#each g.stacks as s}
			{#each Array(s.notes) as _, k}
				<g transform="translate({s.x}, {noteY(k)})">
					<rect width={noteW} height={noteH} rx="1.5" fill={bell} />
					<rect x="3" y="2.5" width={noteW - 6} height={noteH - 5} rx="1" class="note-border" />
					<circle cx={noteW / 2} cy={noteH / 2} r="2.6" class="note-seal" />
				</g>
			{/each}
			{#each Array(s.ghosts) as _, k}
				<rect
					x={s.x + 0.75}
					y={noteY(s.notes + k) + 0.75}
					width={noteW - 1.5}
					height={noteH - 1.5}
					rx="1.5"
					class="ghost"
				/>
			{/each}

			<!-- Price sits under the pile, not on top, where the Beanfield pile's
			     dashed notes would crowd it. -->
			<text x={s.x + noteW / 2} y={baseY + 22} text-anchor="middle" class="price"
				>${s.price}<tspan class="per">/mo</tspan></text
			>
			<text x={s.x + noteW / 2} y={baseY + 40} text-anchor="middle" class="stack-label"
				fill={s.withBeanfield ? beanfield : 'var(--brandGray90)'}>{s.label}</text
			>
		{/each}

		<!-- The saving, labelled beside the dashed notes it refers to. -->
		{@const s = g.stacks[1]}
		{@const midY = (noteY(s.notes) + noteY(s.notes + s.ghosts - 1) + noteH) / 2}
		<text x={s.x + noteW + 8} y={midY - 7} dominant-baseline="central" class="diff"
			>${g.diff} less</text
		>
		<text x={s.x + noteW + 8} y={midY + 8} dominant-baseline="central" class="diff">({g.pct}%)</text>
	{/each}

	<line x1="0" x2={width} y1={baseY + 2} y2={baseY + 2} class="ground" />
</svg>

<div class="key">
	<span class="key-item"><span class="swatch filled"></span>$10 a month</span>
	<span class="key-item"><span class="swatch outline"></span>Difference from the price without Beanfield</span>
</div>

<style>
	svg {
		display: block;
		width: 100%;
		height: auto;
		padding: 14px 0 6px;
	}

	.plan {
		font-family: OpenSansBold;
		font-size: 14px;
		fill: var(--brandGray90);
	}

	.speed {
		font-family: OpenSans;
		fill: var(--brandGray70);
	}

	.note-border {
		fill: none;
		stroke: rgba(255, 255, 255, 0.45);
		stroke-width: 1;
	}

	.note-seal {
		fill: none;
		stroke: rgba(255, 255, 255, 0.6);
		stroke-width: 1;
	}

	.ghost {
		fill: none;
		stroke: var(--brandMedBlue);
		stroke-width: 1.5;
		stroke-dasharray: 3 2;
	}

	.price {
		font-family: OpenSansBold;
		font-size: 16px;
		fill: var(--brandGray90);
	}

	.per {
		font-family: OpenSans;
		font-size: 12px;
		fill: var(--brandGray70);
	}

	.stack-label {
		font-family: OpenSansBold;
		font-size: 12px;
	}

	.diff {
		font-family: OpenSans;
		font-size: 12px;
		fill: var(--brandGray70);
	}

	.ground {
		stroke: var(--brandGray70);
		stroke-width: 1;
	}

	.key {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 20px;
		padding-bottom: 12px;
		font-family: OpenSans;
		font-size: 12px;
		color: var(--brandGray70);
	}

	.key-item {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.swatch {
		width: 22px;
		height: 8px;
		box-sizing: border-box;
		border-radius: 1px;
	}

	.swatch.filled {
		background: var(--brandMedBlue);
	}

	.swatch.outline {
		border: 1.5px dashed var(--brandMedBlue);
	}
</style>
