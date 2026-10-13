<script>
	import { scaleLinear, median } from 'd3';
	import data from '../data/turnout-by-municipality.csv';
	import provincial from '../data/provincial-turnout.csv';

	// The municipality highlighted in pink, chosen in the search box under the
	// chart's title. Empty by default, so exports and the no-JS page show the
	// chart without a highlight.
	let selected = $state('');

	// Search box: typing filters the list of municipalities, and picking one (by
	// click, or arrow keys and Enter) highlights it. The list shows about ten
	// names at a time and scrolls for the rest.
	let query = $state('');
	let open = $state(false);
	let active = $state(0);
	let listEl = $state();

	// Showing the chosen name in the box shouldn't filter the list down to it, so
	// the full list comes back when the box is reopened.
	const matches = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q || query === selected) return municipalities;
		return municipalities.filter((name) => name.toLowerCase().includes(q));
	});

	function choose(name) {
		selected = name;
		query = name;
		open = false;
	}

	function clearSearch() {
		selected = '';
		query = '';
		open = false;
	}

	function onInput() {
		open = true;
		active = 0;
		if (!query.trim()) selected = '';
	}

	function onKeydown(event) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			if (!open) {
				open = true;
				return;
			}
			const step = event.key === 'ArrowDown' ? 1 : -1;
			active = Math.min(Math.max(active + step, 0), matches.length - 1);
			listEl?.children[active]?.scrollIntoView({ block: 'nearest' });
		} else if (event.key === 'Enter' && open && matches.length) {
			event.preventDefault();
			choose(matches[active]);
		} else if (event.key === 'Escape') {
			open = false;
		}
	}

	const years = [2014, 2018, 2022];
	const municipalities = data.map((d) => d.municipality).sort((a, b) => a.localeCompare(b));

	// Every municipality is a plain grey line; only the median, the provincial line
	// and a selected municipality are coloured and labelled.
	const lineStyle = { color: 'var(--brandGray30)', width: 1, dotR: 0 };
	const selectedStyle = { color: 'var(--brandPink)', width: 3, dotR: 5 };
	const fmt = (v) => `${v.toFixed(1)}%`;
	// The CSV holds turnout to one decimal, so a median of two values lands on a
	// half step (28.15) that floating point then rounds down. The nudge makes it
	// round up, which also matches the median of the unrounded figures (28.17).
	const round1 = (v) => Math.round(v * 10 + 1e-6) / 10;

	// Every line is a list of { year, value } points, since the provincial line
	// has a point (2025) that the municipal lines don't.
	const cities = data.map((d) => ({
		name: d.municipality,
		group: 'other',
		...lineStyle,
		points: years.map((year) => ({ year, value: +d[`turnout_${year}`] }))
	}));

	const medianLine = {
		name: 'Median of 34 municipalities',
		// Too long for the label column on one line.
		nameLines: ['Median of 34', 'municipalities'],
		group: 'median',
		color: 'var(--brandDarkGreen)',
		width: 3,
		dotR: 5,
		points: years.map((year, i) => ({
			year,
			value: round1(median(cities, (c) => c.points[i].value))
		}))
	};

	// Province-wide turnout in Ontario's general elections, dashed to set it apart
	// from the municipal lines. Plotted by year: the 2014, 2018 and 2022 elections
	// were in June, months before that year's municipal vote.
	const provincialLine = {
		name: 'Provincial elections',
		nameLines: ['Provincial', 'elections'],
		group: 'provincial',
		color: 'var(--brandMedBlue)',
		width: 2,
		dotR: 4,
		dashed: true,
		// Its 2025 value is centred: pushed left, it runs into the 2022 value at 360px.
		valueCentred: true,
		points: provincial.map((d) => ({ year: +d.year, value: +d.turnout }))
	};

	// Grey lines first, so the median and the provincial line are drawn over them,
	// and the selected municipality, if any, over everything.
	const lines = $derived.by(() => {
		const chosen = cities.find((c) => c.name === selected);
		const others = cities.filter((c) => c !== chosen);
		return [
			...others,
			medianLine,
			provincialLine,
			...(chosen ? [{ ...chosen, ...selectedStyle, group: 'selected' }] : [])
		];
	});
	const labelled = $derived(lines.filter((l) => l.group !== 'other'));

	// A column for each election year on the chart: the municipal years plus 2025,
	// which only the provincial line uses.
	const columns = [
		...new Set([...years, ...provincialLine.points.map((p) => p.year)])
	].sort();

	// The full 0-100% range, not one fitted to the data: an axis that stopped at
	// 60% would make every turnout look like a larger share of electors than it is.
	const yMax = 100;
	const yTicks = [0, 20, 40, 60, 80, 100];

	// Labels sit at the y of their line's end, so neighbours can collide. Pushes
	// them apart to at least `gap`, top to bottom, then back up if that ran past
	// the bottom of the plot.
	function dodge(items, gap, bottom) {
		const sorted = [...items].sort((a, b) => a.y - b.y);
		for (let i = 1; i < sorted.length; i++) {
			sorted[i].y = Math.max(sorted[i].y, sorted[i - 1].y + gap * sorted[i - 1].rows);
		}
		const last = sorted[sorted.length - 1];
		if (last.y > bottom) {
			last.y = bottom;
			for (let i = sorted.length - 2; i >= 0; i--) {
				sorted[i].y = Math.min(sorted[i].y, sorted[i + 1].y - gap * sorted[i].rows);
			}
		}
		return sorted;
	}

	// One geometry per snapped width (see meta.widths in charts.js): drawn 1:1, so
	// the font sizes below are true pixels. The container query in the styles
	// shows one of the two. The x-axis is in years, so the gap from 2022 to 2025
	// is drawn to scale.
	function buildLayout({ W, H, left, right, top, bottom, fontSize, gap }, labelled) {
		const x = scaleLinear()
			.domain([columns[0], columns[columns.length - 1]])
			.range([left, W - right]);
		const y = scaleLinear().domain([0, yMax]).range([H - bottom, top]);
		const path = (line) => line.points.map((p) => `${x(p.year)},${y(p.value)}`).join(' ');

		// Each name sits just right of its own line's last point: the municipal
		// lines end at 2022, the provincial line at 2025. All are dodged together,
		// since at 360px the two groups of names overlap horizontally.
		const finishLabels = dodge(
			// `rows` is how many text lines the label takes, so the next one clears it.
			labelled.map((line) => {
				const end = line.points[line.points.length - 1];
				return { line, x: x(end.year) + 10, y: y(end.value), rows: line.nameLines?.length ?? 1 };
			}),
			gap,
			H - bottom
		);

		// The value of each labelled line at each election. A value sits above its
		// dot unless that would run into the one above it, in which case it drops below.
		// A line with `labelBelow` always has its values below. Values at a line's
		// first point sit to the right, at its last point to the left, except for a
		// line with `valueCentred`, whose last value is centred over its dot.
		const valueLabels = columns.flatMap((year) => {
			let previous = -Infinity;
			return labelled
				.filter((line) => line.points.some((p) => p.year === year))
				.map((line) => ({ line, i: line.points.findIndex((p) => p.year === year) }))
				.sort((a, b) => b.line.points[b.i].value - a.line.points[a.i].value)
				.map(({ line, i }) => {
					const point = line.points[i];
					const dotY = y(point.value);
					const labelY =
						line.labelBelow || dotY - 11 - previous < fontSize + 2 ? dotY + fontSize + 8 : dotY - 11;
					previous = labelY;
					const first = i === 0;
					const last = i === line.points.length - 1 && !line.valueCentred;
					return {
						line,
						text: fmt(point.value),
						x: x(year) + (first ? 8 : last ? -8 : 0),
						y: labelY,
						anchor: first ? 'start' : last ? 'end' : 'middle'
					};
				});
		});
		return {
			W,
			H,
			fontSize,
			x,
			y,
			path,
			plotLeft: left,
			plotRight: W - right,
			plotBottom: H - bottom,
			gap,
			finishLabels,
			valueLabels
		};
	}

	const wide = $derived(
		buildLayout({ W: 678, H: 560, left: 44, right: 118, top: 34, bottom: 16, fontSize: 13, gap: 16 }, labelled)
	);
	const narrow = $derived(
		buildLayout({ W: 318, H: 520, left: 36, right: 82, top: 34, bottom: 16, fontSize: 11, gap: 14 }, labelled)
	);
</script>

<div class="legend-title">Voter turnout in municipal elections</div>

<div class="legend">
	<div class="legend-item">
		<svg class="legend-swatch" viewBox="0 0 24 10" width="24" height="10" aria-hidden="true">
			<line x1="0" x2="24" y1="5" y2="5" stroke="var(--brandPink)" stroke-width="3" />
			<circle cx="12" cy="5" r="4" fill="var(--brandPink)" />
		</svg>
		<label for="turnout-municipality">Highlight a municipality</label>
		<div class="search">
			<input
				id="turnout-municipality"
				type="text"
				placeholder="Search"
				autocomplete="off"
				role="combobox"
				aria-autocomplete="list"
				aria-expanded={open}
				aria-controls="turnout-municipality-list"
				aria-activedescendant={open && matches.length ? `turnout-municipality-${active}` : undefined}
				bind:value={query}
				oninput={onInput}
				onkeydown={onKeydown}
				onfocus={() => (open = true)}
				onblur={() => (open = false)}
			/>
			{#if query}
				<button type="button" class="clear" aria-label="Clear" onclick={clearSearch}>×</button>
			{/if}
			{#if open}
				<ul id="turnout-municipality-list" role="listbox" bind:this={listEl}>
					{#each matches as name, i}
						<!-- mousedown, not click, so the choice lands before the input's blur
						     closes the list. -->
						<li
							id="turnout-municipality-{i}"
							role="option"
							aria-selected={i === active}
							class:active={i === active}
							onmousedown={(event) => {
								event.preventDefault();
								choose(name);
							}}
							onmouseenter={() => (active = i)}
						>
							{name}
						</li>
					{:else}
						<li class="empty">No match</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</div>

{#snippet slope(layout)}
	<svg viewBox="0 0 {layout.W} {layout.H}" width={layout.W} height={layout.H} style="--label-size: {layout.fontSize}px;">
		{#each yTicks as tick}
			<text x={layout.plotLeft - 8} y={layout.y(tick) + 4} class="axis-label" text-anchor="end"
				>{tick}%</text
			>
		{/each}

		{#each columns as year}
			<line x1={layout.x(year)} x2={layout.x(year)} y1={layout.y(yMax)} y2={layout.plotBottom} class="year-line" />
			<text x={layout.x(year)} y={layout.y(yMax) - 14} class="year-label" text-anchor="middle">{year}</text>
		{/each}

		{#each lines as line}
			<!-- Only the grey municipal lines respond to the mouse: hovering darkens and
			     widens one, and clicking it highlights it, as choosing it in the search
			     box would. The median, provincial and highlighted lines are already
			     labelled, so they don't respond. -->
			<g class="line-group" class:no-hover={line.group !== 'other'}>
				<polyline
					points={layout.path(line)}
					fill="none"
					stroke={line.color}
					stroke-dasharray={line.dashed ? '6 4' : undefined}
					class="slope-line"
					style="--w: {line.width}px;"
				/>
				<!-- Wider invisible copy of the line, so thin grey lines are easy to hover
				     and click. Mouse-only by design: the search box above is the keyboard
				     route to the same choice. -->
				{#if line.group === 'other'}
					<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
					<polyline
						points={layout.path(line)}
						fill="none"
						stroke="transparent"
						stroke-width="10"
						class="hit-line"
						onclick={() => choose(line.name)}
					>
						<title>{line.name}: {line.points.map((p) => `${fmt(p.value)} in ${p.year}`).join(', ')}</title>
					</polyline>
				{/if}
				{#if line.dotR}
					{#each line.points as p}
						<circle cx={layout.x(p.year)} cy={layout.y(p.value)} r={line.dotR} fill={line.color} />
					{/each}
				{/if}
			</g>
		{/each}

		{#each layout.finishLabels as l}
			<text x={l.x} y={l.y + 4} text-anchor="start" fill={l.line.color} class="end-label">
				{#each l.line.nameLines ?? [l.line.name] as part, i}
					<tspan x={l.x} dy={i ? layout.gap : 0}>{part}</tspan>
				{/each}
			</text>
		{/each}

		<!-- After every line, so a value is never drawn under one. -->
		{#each layout.valueLabels as l}
			<text x={l.x} y={l.y} text-anchor={l.anchor} fill={l.line.color} class="value-label">{l.text}</text>
		{/each}
	</svg>
{/snippet}

<div class="slope slope-wide">
	{@render slope(wide)}
</div>

<div class="slope slope-narrow">
	{@render slope(narrow)}
</div>

<style>
	.slope svg {
		display: block;
		overflow: visible;
	}

	/* ChartFrame draws the graphic at exactly 678px or 318px (720 and 360 less the
	   frame's inset); this shows whichever SVG was built for that width. */
	.slope-narrow {
		display: none;
	}

	@container (max-width: 400px) {
		.slope-wide {
			display: none;
		}

		.slope-narrow {
			display: block;
		}
	}

	.year-line {
		stroke: var(--brandGray05);
		stroke-width: 1;
	}

	.axis-label,
	.year-label {
		font-family: OpenSans;
		font-size: var(--label-size);
		fill: var(--brandGray60);
	}

	/* Width comes in as --w so hover can double it, whatever the line's own width. */
	.slope-line {
		stroke-width: var(--w);
		stroke-linejoin: round;
		stroke-linecap: round;
	}

	.hit-line {
		cursor: pointer;
	}

	.line-group:not(.no-hover):hover .slope-line {
		stroke: var(--brandBlack);
		stroke-width: calc(var(--w) * 2);
	}

	.end-label,
	.value-label {
		font-family: OpenSansBold;
		font-size: var(--label-size);
	}

	/* White halo, so a value or name sitting among the lines stays legible. The
	   municipal names sit under the provincial line's 2022-2025 stretch. */
	.end-label,
	.value-label {
		paint-order: stroke;
		stroke: var(--brandWhite);
		stroke-width: 3px;
		stroke-linejoin: round;
	}

	.legend-title {
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: 14px;
		color: var(--brandGray90);
		padding-top: 15px;
	}

	.legend {
		padding-top: 6px;
		padding-bottom: 10px;
		margin-bottom: 14px;
	}

	.legend-item {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px 8px;
		font-family: OpenSans;
		font-size: 13px;
		color: var(--brandGray90);
	}

	.legend-swatch {
		flex-shrink: 0;
	}

	.search {
		position: relative;
	}

	.search input {
		box-sizing: border-box;
		width: 200px;
		font-family: OpenSans;
		font-size: 13px;
		color: var(--brandGray90);
		padding: 4px 26px 4px 8px;
		border: solid 1px var(--brandGray30);
		border-radius: 4px;
		background: var(--brandWhite);
	}

	.search input::placeholder {
		color: var(--brandGray55);
	}

	.clear {
		position: absolute;
		right: 4px;
		top: 50%;
		transform: translateY(-50%);
		border: none;
		background: none;
		padding: 0 4px;
		font-size: 16px;
		line-height: 1;
		color: var(--brandGray60);
		cursor: pointer;
	}

	/* About ten names tall (each row is 13px text plus 10px padding), scrolling
	   for the rest. Drawn over the chart, below the box. */
	.search ul {
		position: absolute;
		z-index: 2;
		top: calc(100% + 2px);
		left: 0;
		width: 200px;
		max-height: 260px;
		overflow-y: auto;
		margin: 0;
		padding: 2px 0;
		list-style: none;
		background: var(--brandWhite);
		border: solid 1px var(--brandGray30);
		border-radius: 4px;
		box-shadow: 0 2px 6px rgb(0 0 0 / 0.12);
	}

	.search li {
		font-family: OpenSans;
		font-size: 13px;
		line-height: 16px;
		color: var(--brandGray90);
		padding: 5px 8px;
		cursor: pointer;
	}

	.search li.active {
		background: var(--brandGray05);
	}

	.search li.empty {
		color: var(--brandGray60);
		cursor: default;
	}

</style>
