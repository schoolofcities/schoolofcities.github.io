<script>
    import { scaleLinear, line as d3line } from 'd3';

    /**
     * One small-multiple panel: a city's net % change in asking rent since the baseline quarter,
     * optionally over a faint grey reference line (Canada).
     *
     * variant 'featured' — bigger; always shows its title, a zero line + faint gridlines and the latest value
     * variant 'tiny'     — just the line (the caller prints the city's name above it); y-axis numbers appear only while the panel is `active`
     */
    let {
        width,
        height,
        values,                 // net % change per quarter, null where a quarter is missing
        reference = null,       // same shape; drawn behind in faint grey
        yDomain = [-20, 110],
        yTicks = [0, 50, 100],
        variant = 'featured',
        title = '',             // accessible name
        label = '',             // tiny: the city's name, printed small at the top-left, just above the graph
        labelSize = 10.5,       // tiny: font size of that name (px) — smaller when the panels are narrow
        large = false,          // featured: the big panel (Canada) — slightly larger title, line and end label
        compact = false,        // featured, phone: a small panel — smaller title and end label, tighter margins, no year labels
        yLabels = false,        // featured: print tick numbers inside the plot, top-left (the page does this for the first panel in each row only)
        active = false,         // tiny: reveal the y-axis numbers
        xTicks = [],            // featured: [{ label, i }] printed under the panel
        color = '#bf2150',      // the city's line, coloured like its arrow on the map
    } = $props();

    // The line takes its colour from the caller (the size class of the city's net change); the Canada reference line is a neutral grey
    let C_LINE = $derived(color);
    const C_REF  = '#c3c3c3';

    let featured = $derived(variant === 'featured');
    // tiny panels reserve a strip above the graph for the city's name, sized to the name's font
    let margin   = $derived(featured
        ? (compact ? { top: 14, right: 29, bottom: 4, left: 3 } : { top: 16, right: 38, bottom: 20, left: 4 })
        : { top: Math.round(labelSize * 1.3), right: 3, bottom: 3, left: 3 });
    let innerW = $derived(Math.max(0, width - margin.left - margin.right));
    let innerH = $derived(Math.max(0, height - margin.top - margin.bottom));

    let n      = $derived(values.length);
    let xScale = $derived(scaleLinear().domain([0, n - 1]).range([0, innerW]));
    let yScale = $derived(scaleLinear().domain(yDomain).range([innerH, 0]));

    // Missing quarters are skipped, so the line runs straight across the gap instead of breaking
    function pathFor(vals) {
        const pts = vals.map((v, i) => [i, v]).filter(([, v]) => v !== null && v !== undefined);
        return d3line().x(d => xScale(d[0])).y(d => yScale(d[1]))(pts);
    }

    let linePath = $derived(pathFor(values));
    let refPath  = $derived(reference ? pathFor(reference) : null);

    // last defined point → end dot and label
    let last = $derived.by(() => {
        for (let i = n - 1; i >= 0; i--) if (values[i] !== null && values[i] !== undefined) return { i, v: values[i] };
        return null;
    });

    // A tiny panel's name is squeezed (a little, never below 78%) to fit its panel when it would otherwise run into the next one.
    let labelEl = $state(null);
    $effect(() => {
        label; labelSize; width; active;                      // re-fit when any of these change
        const el = labelEl;
        if (!el) return;
        let cancelled = false;
        const fit = () => {
            if (cancelled) return;
            el.removeAttribute('textLength');
            el.removeAttribute('lengthAdjust');
            const w = el.getComputedTextLength();
            const avail = width - 1;
            if (w > avail && w > 0) {
                el.setAttribute('textLength', String(Math.max(avail, w * 0.78)));
                el.setAttribute('lengthAdjust', 'spacingAndGlyphs');
            }
        };
        (document.fonts?.ready ?? Promise.resolve()).then(fit);
        return () => { cancelled = true; };
    });

    const fmtPct = (v) => (v >= 0 ? '+' : '−') + Math.abs(Math.round(v)) + '%';
    const fmtTick = (v) => `${v}%`;
</script>

<svg {width} {height} role="img" aria-label="{title}: net change in asking rent since the baseline quarter, {last ? fmtPct(last.v) : 'no data'} now">
    {#if !featured && active}
        <rect x="0" y="0" {width} {height} class="active-bg" rx="2" />
    {/if}

    <g transform="translate({margin.left},{margin.top})">
        {#if featured}
            <!-- faint gridlines; the zero line (the 2019 level) is the one that matters -->
            {#each yTicks as t}
                <line x1="0" x2={innerW} y1={yScale(t)} y2={yScale(t)} class={t === 0 ? 'zero-line' : 'grid-line'} />
                {#if yLabels}
                    <!-- sits just under its line, at the left where the series are still low, clear of the title above -->
                    <text x="2" y={yScale(t) + 11} class="chart-axis-label tick inside">{fmtTick(t)}</text>
                {/if}
            {/each}
            {#each xTicks as t, k}
                <text x={xScale(t.i)} y={innerH + 11.5} class="chart-axis-label tick" text-anchor={k === 0 ? 'start' : k === xTicks.length - 1 ? 'end' : 'middle'}>{t.label}</text>
            {/each}
            <text x="0" y="-4" class="panel-title" class:large class:compact>{title}</text>
        {:else}
            <text x="0" y="-3" class="tiny-label" class:on={active} style="font-size: {labelSize}px" bind:this={labelEl}>{label}</text>
            <line x1="0" x2={innerW} y1={yScale(0)} y2={yScale(0)} class="zero-line tiny-zero" class:on={active} />
            {#if active}
                {#each yTicks.filter(t => t !== 0) as t}
                    <line x1="0" x2={innerW} y1={yScale(t)} y2={yScale(t)} class="grid-line" />
                {/each}
            {/if}
        {/if}

        {#if refPath}
            <path d={refPath} fill="none" stroke={C_REF} stroke-width={featured ? 1.9 : 1.3} stroke-linecap="round" stroke-linejoin="round" />
        {/if}
        <path d={linePath} fill="none" stroke={C_LINE} stroke-width={featured ? (large ? 2.8 : compact ? 1.9 : 2.2) : active ? 1.8 : 1.4} stroke-linecap="round" stroke-linejoin="round" />

        {#if last && (featured || active)}
            <circle cx={xScale(last.i)} cy={yScale(last.v)} r={featured ? (large ? 3.6 : compact ? 2.4 : 3) : 2.2} fill={C_LINE} />
        {/if}
        {#if featured && last}
            <text x={xScale(last.i) + (compact ? 5 : 7)} y={yScale(last.v)} class="end-label" class:large class:compact fill={C_LINE} dominant-baseline="middle">{fmtPct(last.v)}</text>
        {/if}

        <!-- tiny: numbers appear only on hover / tap, tucked inside the panel just under each gridline (as on the featured panels) -->
        {#if !featured && active}
            {#each yTicks as t}
                <text x="2" y={yScale(t) + 8.5} class="chart-axis-label tiny-tick">{fmtTick(t)}</text>
            {/each}
        {/if}
    </g>
</svg>

<style>
    /* Axis, tick and key labels. The original page defined this as a global class; here it is local to the component. Kept first so the rules below win, as the global one did. */
    .chart-axis-label { font-family: OpenSans, sans-serif; font-size: 12px; fill: var(--brandGray70); }
    @media (max-width: 600px) { .chart-axis-label { font-size: 11px; } }

    svg { display: block; overflow: visible; }

    .grid-line { stroke: var(--brandGray); stroke-width: 0.5; }
    .zero-line { stroke: var(--brandGray50); stroke-width: 0.75; }
    .tiny-zero { stroke: var(--brandGray); stroke-width: 0.6; }
    .tiny-zero.on { stroke: var(--brandGray50); }

    .active-bg { fill: #f3f3f1; }

    .tick { font-size: 11px; fill: var(--brandGray60); }
    .tick.inside {
        paint-order: stroke;
        stroke: white;
        stroke-width: 3px;
        stroke-linejoin: round;
    }
    .tiny-tick {
        font-size: 8.5px;
        fill: var(--brandGray70);
        paint-order: stroke;
        stroke: #f3f3f1;                 /* matches the active panel's background, so the numbers stay readable over the lines */
        stroke-width: 2.5px;
        stroke-linejoin: round;
    }

    /* city names in the same face as the candidate names over the Place & Politics small multiples: OpenSans Italic */
    .panel-title {
        font-family: OpenSansItalic, sans-serif;
        font-size: 13px;
        fill: var(--brandGray90);
    }
    .tiny-label {
        font-family: OpenSansItalic, sans-serif;
        fill: var(--brandGray90);
    }
    .tiny-label.on { font-family: OpenSansBoldItalic, sans-serif; }

    .panel-title.large { font-size: 15px; }
    .panel-title.compact { font-size: 11px; }
    .end-label {
        font-family: OpenSansBold;
        font-size: 12px;
    }
    .end-label.large { font-size: 14px; }
    .end-label.compact { font-size: 10px; }

    @media (max-width: 600px) {
        .panel-title { font-size: 12.5px; }
        .end-label { font-size: 11px; }
    }
</style>
