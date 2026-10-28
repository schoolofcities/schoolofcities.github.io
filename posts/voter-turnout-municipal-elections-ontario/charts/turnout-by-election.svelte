<script>
	import { scaleLinear, median } from 'd3';
	import data from '../data/turnout-by-municipality.csv';
	import provincial from '../data/provincial-turnout.csv';
	import federal from '../data/federal-turnout.csv';

	// The municipality highlighted in purple, chosen in the search box under the
	// chart's title. Empty by default, so exports and the no-JS page show the
	// chart without a highlight.
	let selected = $state('');

	// The provincial and federal reference lines, each switched on and off by its
	// own button in the legend. Federal starts on and provincial off, and exports
	// and the no-JS page show that default. Hiding one leaves the year columns as
	// they are, so the other lines don't shift sideways.
	let showProvincial = $state(false);
	let showFederal = $state(true);
	const compareButtons = $derived([
		{ label: 'Provincial', color: 'var(--brandMedBlue)', dash: '6 4', on: showProvincial, toggle: () => (showProvincial = !showProvincial) },
		{ label: 'Federal', color: 'var(--brandDarkBlue)', dash: '2 4', on: showFederal, toggle: () => (showFederal = !showFederal) }
	]);

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

	const years = [2014, 2018, 2022, 2026];
	const municipalities = data.map((d) => d.municipality).sort((a, b) => a.localeCompare(b));

	// Every municipality is a faint line in the median's pink, so the median reads
	// as their summary; only the median, the provincial and federal lines and a
	// selected municipality are labelled.
	const lineStyle = { color: 'var(--brandPink)', opacity: 0.36, width: 1, dotR: 0 };
	const selectedStyle = { color: 'var(--brandPurple)', opacity: 1, width: 3, dotR: 5 };
	const fmt = (v) => `${v.toFixed(1)}%`;
	// '2014-06-12' -> '6/2014': the month and year shown with each provincial and
	// federal value, since those elections fall in other months than October.
	const monthYear = (date) => `${+date.slice(5, 7)}/${date.slice(0, 4)}`;

	// The x-axis is time, by month: each election sits at the middle of its month,
	// as a fraction of a year (October 2014 is 2014.79). Every municipal election
	// was in October.
	const monthT = (year, month) => year + (month - 0.5) / 12;
	const dateT = (date) => monthT(+date.slice(0, 4), +date.slice(5, 7));
	const municipalT = (year) => monthT(year, 10);
	// The CSV holds turnout to one decimal, so a median of two values lands on a
	// half step (28.15) that floating point then rounds down. The nudge makes it
	// round up, which also matches the median of the unrounded figures (28.17).
	const round1 = (v) => Math.round(v * 10 + 1e-6) / 10;

	// Every line is a list of { year, t, value } points: `t` places it on the time
	// axis, `year` groups it with the municipal election of the same year. A year
	// with no figure yet (three municipalities in 2026) is left out, so that line
	// stops at its last election rather than dropping to 0%.
	const cities = data.map((d) => ({
		name: d.municipality,
		group: 'other',
		...lineStyle,
		points: years
			.filter((year) => d[`turnout_${year}`] !== '')
			.map((year) => ({ year, t: municipalT(year), value: +d[`turnout_${year}`] }))
	}));

	const medianLine = {
		name: 'Median of 34 municipalities',
		// Too long for the label column on one line.
		nameLines: ['Median of 34', 'municipalities'],
		group: 'median',
		color: 'var(--brandPink)',
		width: 3,
		dotR: 5,
		// Of the municipalities with a figure that year: 31 in 2026.
		points: years.map((year) => ({
			year,
			t: municipalT(year),
			value: round1(median(cities, (c) => c.points.find((p) => p.year === year)?.value))
		}))
	};

	// Province-wide turnout in Ontario's general elections, dashed to set it apart
	// from the municipal lines. Plotted at their own months: the 2014, 2018 and 2022
	// elections were in June, four months before that year's municipal vote.
	const provincialLine = {
		name: 'Provincial elections',
		nameLines: ['Provincial', 'elections'],
		// Its last point (2/2025) sits just left of the 2026 municipal column, so a
		// name beside it would land among the 2026 values. Centred above that point
		// instead, over its date and value, and kept out of the dodging.
		nameOffset: { dx: 0, dy: -60, anchor: 'middle' },
		group: 'provincial',
		color: 'var(--brandMedBlue)',
		width: 1.25,
		dotR: 4,
		dashed: true,
		points: provincial.map((d) => ({
			year: +d.year,
			t: dateT(d.election_date),
			value: +d.turnout,
			when: monthYear(d.election_date)
		}))
	};

	// Turnout in Ontario in federal general elections, dotted to tell it apart from
	// the provincial line. Its elections fall between the municipal columns, so each
	// of its values sits above its dot.
	const federalLine = {
		name: 'Federal elections',
		nameLines: ['Federal elections', '(Ontario turnout)'],
		// The label column is too narrow at 360px for those two lines.
		nameLinesNarrow: ['Federal', 'elections', '(Ontario', 'turnout)'],
		group: 'federal',
		color: 'var(--brandDarkBlue)',
		width: 1.25,
		dotR: 4,
		dash: '2 4',
		points: federal.map((d) => ({
			year: +d.year,
			t: dateT(d.election_date),
			value: +d.turnout,
			when: monthYear(d.election_date)
		}))
	};

	// Grey lines first, so the median and the provincial line are drawn over them,
	// and the selected municipality, if any, over everything.
	const lines = $derived.by(() => {
		const chosen = cities.find((c) => c.name === selected);
		const others = cities.filter((c) => c !== chosen);
		return [
			...others,
			medianLine,
			...(showProvincial ? [provincialLine] : []),
			...(showFederal ? [federalLine] : []),
			...(chosen ? [{ ...chosen, ...selectedStyle, group: 'selected' }] : [])
		];
	});
	const labelled = $derived(lines.filter((l) => l.group !== 'other'));

	// A column, headed by its month and year, for each municipal election. The
	// provincial and federal elections fall in other months, so their values carry
	// their own month and year instead. The time axis runs from the earliest
	// election to the latest whether or not those lines are shown, so toggling them
	// never moves the rest of the chart.
	const columns = years;
	const allT = [...years.map(municipalT), ...[...provincialLine.points, ...federalLine.points].map((p) => p.t)];
	const firstT = Math.min(...allT);
	const lastT = Math.max(...allT);

	// From 0%, and well above the data, not fitted to it: an axis that stopped at
	// 60% would make every turnout look like a larger share of electors than it is.
	// 88% leaves room above the highest point (federal 69.1%) for its two-line
	// label, with no unlabelled gridline at the top.
	const yMax = 88;
	const yTicks = [0, 20, 40, 60, 80];

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
	// shows one of the two. The x-axis is time, so every gap between elections is
	// drawn to scale. `inset` is the space between the % labels and the earliest election.
	function buildLayout({ W, H, left, inset, right, top, bottom, fontSize, gap, narrow = false }, labelled) {
		const nameLines = (line) => (narrow && line.nameLinesNarrow) || line.nameLines || [line.name];
		const x = scaleLinear().domain([firstT, lastT]).range([left + inset, W - right]);
		const y = scaleLinear().domain([0, yMax]).range([H - bottom, top]);
		const path = (line) => line.points.map((p) => `${x(p.t)},${y(p.value)}`).join(' ');

		// Each name sits just right of its own line's last point: the municipal
		// lines end in 2026, the provincial and federal lines in 2025. All are dodged together,
		// since at 360px the two groups of names overlap horizontally.
		const finishLabel = (line) => {
			const end = line.points[line.points.length - 1];
			const lines = nameLines(line);
			const { dx = 10, dy = 0, anchor = 'start' } = line.nameOffset ?? {};
			// A selected municipality's last value goes on a row under its name (see
			// below), so its label takes one more row when dodging.
			const rows = lines.length + (line.group === 'selected' ? 1 : 0);
			return { line, lines, x: x(end.t) + dx, y: y(end.value) + dy, rows, anchor };
		};
		const finishLabels = [
			...dodge(
				// `rows` is how many text lines the label takes, so the next one clears it.
				labelled.filter((line) => !line.nameOffset).map(finishLabel),
				gap,
				H - bottom
			),
			...labelled.filter((line) => line.nameOffset).map(finishLabel)
		];

		// A provincial or federal value has its month and year on a second, smaller line, on
		// the side away from the dot: above the value when the label sits above the
		// dot, below it when the label sits below.
		const isReference = (line) => line.group === 'provincial' || line.group === 'federal';
		const yearLine = fontSize + 1;
		const withYear = (label, point) => ({
			...label,
			year: isReference(label.line) ? point.when : null,
			yearY: label.below ? label.y + yearLine : label.y - yearLine
		});

		// The value of each labelled line at each municipal election, together with a
		// provincial value from the same year, since the two sit close. A value sits
		// above its dot unless that would run into the one above it, in which case it
		// drops below. A line with `labelBelow` always has its values below. Values at
		// a line's first point sit to the right, at its last point to the left.
		const columnLabels = columns.flatMap((year) => {
			let previous = -Infinity;
			return labelled
				.filter((line) => line.group !== 'federal' && line.points.some((p) => p.year === year))
				.map((line) => ({ line, i: line.points.findIndex((p) => p.year === year) }))
				.filter(({ line, i }) => !(line.group === 'selected' && i === line.points.length - 1))
				.sort((a, b) => b.line.points[b.i].value - a.line.points[a.i].value)
				.map(({ line, i }) => {
					const point = line.points[i];
					const dotY = y(point.value);
					const extra = isReference(line) ? yearLine : 0;
					const below = line.labelBelow || dotY - 11 - extra - previous < fontSize + 2;
					const labelY = below ? dotY + fontSize + 8 : dotY - 11;
					previous = below ? labelY + extra : labelY;
					const first = i === 0;
					const last = i === line.points.length - 1;
					return withYear(
						{
							line,
							text: fmt(point.value),
							x: x(point.t) + (first ? 8 : last ? -8 : 0),
							y: labelY,
							below,
							anchor: first ? 'start' : last ? 'end' : 'middle'
						},
						point
					);
				});
		});
		// Points in years with no municipal election: every federal one, and the
		// provincial 2025. Nothing else is near them, so each value goes above its dot.
		const offColumnLabels = labelled.filter(isReference).flatMap((line) =>
			line.points
				.filter((p) => line.group === 'federal' || !columns.includes(p.year))
				.map((p) =>
					withYear({ line, text: fmt(p.value), x: x(p.t), y: y(p.value) - 11, below: false, anchor: 'middle' }, p)
				)
		);
		// A selected municipality's last value sits under its name rather than beside
		// its dot, where it would crowd the provincial 2025 value and the 2026 column.
		const selectedEndLabels = finishLabels
			.filter((l) => l.line.group === 'selected')
			.map((l) => ({
				line: l.line,
				text: fmt(l.line.points[l.line.points.length - 1].value),
				x: l.x,
				y: l.y + 4 + gap * l.lines.length,
				anchor: 'start',
				year: null
			}));
		const valueLabels = [...columnLabels, ...offColumnLabels, ...selectedEndLabels];

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
		buildLayout({ W: 678, H: 560, left: 44, inset: 20, right: 130, top: 34, bottom: 16, fontSize: 13, gap: 16 }, labelled)
	);
	const narrow = $derived(
		buildLayout({ W: 318, H: 520, left: 36, inset: 12, right: 82, top: 34, bottom: 16, fontSize: 11, gap: 14, narrow: true }, labelled)
	);
</script>

<div class="legend-title">Voter turnout in municipal elections</div>

<div class="legend">
	<div class="legend-item">
		<svg class="legend-swatch" viewBox="0 0 24 10" width="24" height="10" aria-hidden="true">
			<line x1="0" x2="24" y1="5" y2="5" stroke="var(--brandPink)" stroke-opacity="0.36" stroke-width="1" />
		</svg>
		<span>Each thin line is one municipality's turnout</span>
	</div>
	<div class="legend-item">
		<svg class="legend-swatch" viewBox="0 0 24 10" width="24" height="10" aria-hidden="true">
			<line x1="0" x2="24" y1="5" y2="5" stroke="var(--brandPurple)" stroke-width="3" />
			<circle cx="12" cy="5" r="4" fill="var(--brandPurple)" />
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
	<!-- A button for each reference line, pressed while that line shows. -->
	<div class="legend-item compare">
		<span id="turnout-compare-label">Compare with other elections:</span>
		<div class="compare-buttons" role="group" aria-labelledby="turnout-compare-label">
			{#each compareButtons as b}
				<button type="button" aria-pressed={b.on} onclick={b.toggle}>
					<svg class="legend-swatch" viewBox="0 0 20 10" width="20" height="10" aria-hidden="true">
						<line x1="0" x2="20" y1="5" y2="5" stroke={b.color} stroke-width="1.5" stroke-dasharray={b.dash} />
					</svg>
					{b.label}
				</button>
			{/each}
		</div>
	</div>
</div>

{#snippet slope(layout)}
	<svg viewBox="0 0 {layout.W} {layout.H}" width={layout.W} height={layout.H} style="--label-size: {layout.fontSize}px;">
		{#each yTicks as tick}
			<!-- A gridline from just after the label to the end of the plot, in the
			     vertical grid's colour. -->
			<line x1={layout.plotLeft - 4} x2={layout.plotRight} y1={layout.y(tick)} y2={layout.y(tick)} class="year-line" />
			<text x={layout.plotLeft - 8} y={layout.y(tick) + 4} class="axis-label" text-anchor="end"
				>{tick}%</text
			>
		{/each}

		{#each columns as year}
			<line x1={layout.x(municipalT(year))} x2={layout.x(municipalT(year))} y1={layout.y(yMax)} y2={layout.plotBottom} class="year-line" />
			<text x={layout.x(municipalT(year))} y={layout.y(yMax) - 14} class="year-label" text-anchor="middle">10/{year}</text>
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
					stroke-dasharray={line.dash ?? (line.dashed ? '6 4' : undefined)}
					stroke-opacity={line.opacity ?? 1}
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
						<circle cx={layout.x(p.t)} cy={layout.y(p.value)} r={line.dotR} fill={line.color} />
					{/each}
				{/if}
			</g>
		{/each}

		{#each layout.finishLabels as l}
			<text x={l.x} y={l.y + 4} text-anchor={l.anchor} fill={l.line.color} class="end-label" class:reference={l.line.group !== 'selected'}>
				{#each l.lines as part, i}
					<tspan x={l.x} dy={i ? layout.gap : 0}>{part}</tspan>
				{/each}
			</text>
		{/each}

		<!-- After every line, so a value is never drawn under one. -->
		{#each layout.valueLabels as l}
			{#if l.year}
				<text x={l.x} y={l.yearY} text-anchor={l.anchor} class="year-tag">{l.year}</text>
			{/if}
			<text x={l.x} y={l.y} text-anchor={l.anchor} fill={l.line.color} class="value-label" class:reference={l.line.group === 'provincial' || l.line.group === 'federal'}
				>{l.text}</text
			>
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
		stroke-opacity: 1;
		stroke-width: calc(var(--w) * 2);
	}

	.end-label,
	.value-label {
		font-family: OpenSansBold;
		font-size: var(--label-size);
	}

	/* Regular weight for the provincial and federal lines' text, which are
	   background references, and for the median's name; only a selected
	   municipality's name is bold. */
	.end-label.reference,
	.value-label.reference {
		font-family: OpenSans;
	}

	/* A selected municipality's name. */
	.end-label:not(.reference) {
		font-family: OpenSansBoldItalic;
	}

	/* White halo, so a value or name sitting among the lines stays legible. The
	   municipal names sit under the provincial line's 2022-2025 stretch. */
	/* 12px at 720px and 10px at 360px, the minimums for chart text. */
	.year-tag {
		font-family: OpenSans;
		font-size: calc(var(--label-size) - 1px);
		fill: var(--brandGray60);
		paint-order: stroke;
		stroke: var(--brandWhite);
		stroke-width: 3px;
		stroke-linejoin: round;
	}

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
		line-height: 28px;
		padding-top: 10px;
	}

	/* The title and each legend row are 28px tall, the height of the search box,
	   so the three lines sit at an even spacing. */
	.legend {
		display: flex;
		flex-direction: column;
		padding-bottom: 10px;
		margin-bottom: 14px;
	}

	/* At 360px, a gap between the search box and the line below it. */
	@container (max-width: 400px) {
		.legend-item.compare {
			margin-top: 10px;
		}
	}

	/* At 720px, "Compare with" and its buttons sit to the right of the two
	   municipality items, spanning both rows; at 360px everything stacks. */
	@container (min-width: 401px) {
		.legend {
			display: grid;
			grid-template-columns: auto auto;
			justify-content: start;
			column-gap: 82px;
		}

		/* Two classes, to win over .legend-item's row layout below. */
		.legend-item.compare {
			grid-column: 2;
			grid-row: 1 / span 2;
			flex-direction: column;
			align-items: flex-start;
			justify-content: center;
		}
	}

	.legend-item {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px 8px;
		min-height: 28px;
		font-family: OpenSans;
		font-size: 13px;
		color: var(--brandGray90);
	}

	/* Two separate buttons; a pressed one is shaded. */
	.compare-buttons {
		display: flex;
		gap: 6px;
	}

	/* The same look on or off; an unpressed button is faded. */
	.compare-buttons button {
		display: flex;
		align-items: center;
		gap: 5px;
		font-family: OpenSans;
		font-size: 13px;
		color: var(--brandGray90);
		background: var(--brandWhite);
		border: solid 1px var(--brandGray45);
		border-radius: 4px;
		padding: 3px 10px;
		cursor: pointer;
	}

	.compare-buttons button[aria-pressed='false'] {
		opacity: 0.5;
	}

	.compare-buttons button:hover {
		border-color: var(--brandGray70);
	}

	.legend-swatch {
		flex-shrink: 0;
	}

	.search {
		position: relative;
	}

	.search input {
		box-sizing: border-box;
		width: 150px;
		height: 28px;
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
		width: 150px;
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
