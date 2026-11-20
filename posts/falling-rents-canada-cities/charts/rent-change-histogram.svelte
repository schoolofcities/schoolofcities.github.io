<script>
    import { scaleLinear } from 'd3';
    import SegmentedToggle from '../components/SegmentedToggle.svelte';
    import ChartHeader from '../components/ChartHeader.svelte';
    import MapTooltip from '../components/MapTooltip.svelte';
    import data from '../data/rent-change-histogram.json';

    /**
     * Stacked histogram: one bar per 1-point band of yearly change in the average rent paid, one colour per year (2019 light → 2025 dark),
     * the height being the number of cities. All binning is done in the notebook; this only draws.
     *
     * Data is rent-change-histogram.json: { meta, bins }.
     */
    const { meta, bins } = data;

    // ─── nominal / after inflation ─────────────────────────────────────────────
    const MEASURES = [
        { label: 'After inflation', value: 'real' },
        { label: 'Nominal', value: 'nominal' },
    ];
    let measure = $state('real');
    let real = $derived(measure === 'real');

    // One colour per year, a warm-to-cool spectrum from amber (2019) through orange, red and pink to purple (2025), all from the site's own palette. Each step is
    // darker than the last, so the order reads even without hue, and the lightest still clears 2:1 against white.
    const YEAR_COLORS = ['#e8a63d', '#f37800', '#e94f0f', '#ce3344', '#ad1f5b', '#861b65', '#5f1764'];
    const DIM = 0.28;

    // ─── layout ────────────────────────────────────────────────────────────────
    let width = $state(0);
    let compact = $derived(width < 520);
    const margin = $derived({ top: 20, right: 4, bottom: 44, left: 26 });
    let innerW = $derived(Math.max(0, width - margin.left - margin.right));
    let innerH = $derived(compact ? Math.round(width * 0.7) : Math.max(250, Math.round(width * 0.42)));
    let height = $derived(innerH + margin.top + margin.bottom);

    let [xLo, xHi] = $derived(meta.x_domain);
    let nBins = $derived(bins.length);
    let xScale = $derived(scaleLinear().domain([xLo, xHi]).range([0, innerW]));
    let yScale = $derived(scaleLinear().domain([0, meta.y_max]).range([innerH, 0]));
    let barGap = $derived(compact ? 1 : 2);
    const segGap = 1.5;      // surface-coloured gap between stacked segments

    // every segment: { bin, yi, x, y, w, h, n }
    let segments = $derived.by(() => {
        const out = [];
        bins.forEach((b, bi) => {
            let run = 0;
            b[measure].forEach((cities, yi) => {
                if (!cities.length) return;
                const y0 = yScale(run), y1 = yScale(run + cities.length);
                run += cities.length;
                const x0 = xScale(b.lo) + barGap / 2;
                out.push({ bi, yi, x: x0, w: Math.max(1, xScale(b.hi) - xScale(b.lo) - barGap), y: y1 + segGap / 2, h: Math.max(1, y0 - y1 - segGap), n: cities.length });
            });
        });
        return out;
    });

    const signed = (v, digits = 0) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(digits);
    const range = (b) => `${signed(b.lo, 1)}% to ${signed(b.hi - 0.1, 1)}%`;
    const fmtTick = (t) => (t === 0 ? '0%' : `${signed(t)}%`);

    // ─── hover / tap ───────────────────────────────────────────────────────────
    let hoverYear = $state(null);        // year index highlighted while the pointer is over a segment or a legend swatch
    let pinYear   = $state(null);        // year index kept highlighted by tapping / clicking its swatch (the only way on a touch screen)
    let activeYear = $derived(hoverYear ?? pinYear);
    let tooltip   = $state(null);        // { x, y, bi, yi }

    function show(seg, x, y) { hoverYear = seg.yi; tooltip = { x, y, bi: seg.bi, yi: seg.yi }; }
    function hide() { hoverYear = null; tooltip = null; }
    function clearAll() { hide(); pinYear = null; }               // a tap on empty space clears everything
    function togglePin(i, e) { e.stopPropagation(); tooltip = null; hoverYear = null; pinYear = pinYear === i ? null : i; }
    function onEnter(seg, e) { if (e.pointerType === 'mouse') show(seg, e.clientX, e.clientY); }
    function onMove(seg, e) { if (e.pointerType === 'mouse' && tooltip) tooltip = { ...tooltip, x: e.clientX, y: e.clientY }; }
    function onLeave(e) { if (e.pointerType === 'mouse') hide(); }
    function onTap(seg, e) { e.stopPropagation(); show(seg, e.clientX, e.clientY); }

    const MAX_LISTED = 8;
    let tipRows = $derived(tooltip ? bins[tooltip.bi][measure][tooltip.yi] : []);

    // Counts under the chart for people who can't use the graphic (visually hidden)
    let tableRows = $derived(bins.map((b) => ({ range: range(b), counts: b[measure].map((c) => c.length) })).filter((r) => r.counts.some((n) => n > 0)));
</script>

<div class="histogram">
    <ChartHeader
        title="Yearly change in average rent paid{real ? ', after inflation' : ', nominal'}"
        titleLongest="Yearly change in average rent paid, after inflation"
        hint="Hover or tap a bar for the cities."
    >
        {#snippet controls()}
            <SegmentedToggle options={MEASURES} bind:value={measure} label="Show change as" />
        {/snippet}
        {#snippet legend()}
            <div class="key" role="group" aria-label="Year colours">
                {#each meta.years as y, i (y)}
                    <button
                        type="button"
                        class="key-item"
                        class:dim={activeYear !== null && activeYear !== i}
                        aria-pressed={pinYear === i}
                        aria-label="Highlight {y}"
                        onpointerenter={(e) => { if (e.pointerType === 'mouse') hoverYear = i; }}
                        onpointerleave={(e) => { if (e.pointerType === 'mouse') hoverYear = null; }}
                        onclick={(e) => togglePin(i, e)}
                    >
                        <span class="chip" style="background: {YEAR_COLORS[i]}"></span>
                        <span class="yr">{y}</span>
                    </button>
                {/each}
            </div>
        {/snippet}
    </ChartHeader>

    <div class="plot" bind:clientWidth={width} onclick={clearAll} role="presentation">
        {#if width > 0}
            <svg {width} {height} role="img"
                 aria-label="Stacked histogram of {meta.n_city_years} city-years: yearly change in average rent, {real ? 'after inflation' : 'nominal'}, one colour per year. Median {signed(meta.medians[measure], 1)}%; rent fell in {meta.declines[measure]} of them.">
                <g transform="translate({margin.left},{margin.top})">
                    <!-- the "rent falls" side, softly shaded -->
                    <rect x={xScale(xLo)} y="0" width={Math.max(0, xScale(0) - xScale(xLo))} height={innerH} class="falls-bg" />
                    <text x={xScale(xLo) + 4} y="11" class="side-note">Rent falls</text>

                    {#each meta.y_ticks as t}
                        <line x1="0" x2={innerW} y1={yScale(t)} y2={yScale(t)} class="grid-line" />
                        <text x="-6" y={yScale(t)} class="chart-axis-label tick" text-anchor="end" dominant-baseline="middle">{t}</text>
                    {/each}
                    <text x={-margin.left + 2} y="-8" class="axis-title">Number of cities</text>

                    {#each segments as s (`${s.bi}-${s.yi}`)}
                        <rect
                            x={s.x} y={s.y} width={s.w} height={s.h}
                            fill={YEAR_COLORS[s.yi]}
                            opacity={activeYear === null || activeYear === s.yi ? 1 : DIM}
                            onpointerenter={(e) => onEnter(s, e)}
                            onpointermove={(e) => onMove(s, e)}
                            onpointerleave={onLeave}
                            onclick={(e) => onTap(s, e)}
                            role="presentation"
                        />
                    {/each}

                    <!-- baseline and the zero line (no change) -->
                    <line x1="0" x2={innerW} y1={innerH} y2={innerH} class="base-line" />
                    <line x1={xScale(0)} x2={xScale(0)} y1="0" y2={innerH + 4} class="zero-line" />

                    {#each meta.x_ticks as t}
                        <text x={xScale(t)} y={innerH + 17} class="chart-axis-label tick" text-anchor="middle">{fmtTick(t)}</text>
                    {/each}
                    <text x={innerW / 2} y={innerH + 37} class="axis-title" text-anchor="middle">Change in average rent since the previous October</text>
                </g>
            </svg>
        {/if}
    </div>

    {#if tooltip}
        {@const b = bins[tooltip.bi]}
        <MapTooltip x={tooltip.x} y={tooltip.y} title={range(b)} width={228} ondismiss={hide}>
            <span class="tip-sub">
                <span class="chip" style="background: {YEAR_COLORS[tooltip.yi]}"></span>
                {meta.years[tooltip.yi]} · {tipRows.length} {tipRows.length === 1 ? 'city' : 'cities'}
            </span>
            {#each tipRows.slice(0, MAX_LISTED) as [city, v]}
                <span class="tip-row"><span>{city}</span><span class="tip-val">{signed(v, 1)}%</span></span>
            {/each}
            {#if tipRows.length > MAX_LISTED}
                <span class="tip-more">and {tipRows.length - MAX_LISTED} more</span>
            {/if}
        </MapTooltip>
    {/if}

    <div class="sr-only">
            <table>
            <caption>Number of cities by yearly change in average rent, {real ? 'after inflation' : 'nominal'}, by year</caption>
            <thead><tr><th>Change</th>{#each meta.years as y}<th>{y}</th>{/each}</tr></thead>
            <tbody>
                {#each tableRows as r}
                    <tr><th>{r.range}</th>{#each r.counts as n}<td>{n}</td>{/each}</tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    /* Axis, tick and key labels. The original page defined this as a global class; here it is local to the component. Kept first so the rules below win, as the global one did. */
    .chart-axis-label { font-family: OpenSans, sans-serif; font-size: 12px; fill: var(--brandGray70); }
    @media (max-width: 600px) { .chart-axis-label { font-size: 11px; } }

    .histogram {
        width: 100%;
    }

    .plot { width: 100%; }
    svg { display: block; overflow: visible; }

    .falls-bg { fill: #f3f3f1; }
    .side-note {
        font-family: OpenSansItalic, sans-serif;
        font-size: 11.5px;
        fill: var(--brandGray60);
    }
    .grid-line { stroke: var(--brandGray); stroke-width: 0.5; }
    .base-line { stroke: var(--brandGray50); stroke-width: 0.75; }
    .zero-line { stroke: var(--brandGray80); stroke-width: 1; }
    .tick { font-size: 11px; fill: var(--brandGray60); }
    .axis-title {
        font-family: OpenSans, sans-serif;
        font-size: 12px;
        fill: var(--brandGray70);
    }

    /* year key: seven chips in a row, each with its year */
    .key { display: inline-flex; gap: 2px; }
    .key-item {
        display: inline-flex;
        flex-direction: column;
        align-items: stretch;
        gap: 2px;
        margin: 0;
        padding: 4px 0 2px;            /* a taller touch target than the swatch alone */
        border: 0;
        background: none;
        font: inherit;
        cursor: pointer;
        touch-action: manipulation;
        transition: opacity 0.12s;
    }
    .key-item:focus-visible { outline: 2px solid var(--brandGray80); outline-offset: 1px; }
    .key-item.dim { opacity: 0.35; }
    .key .chip { width: 100%; min-width: 30px; height: 10px; }
    .yr { font-size: 11px; line-height: 14px; color: var(--brandGray70); text-align: center; }

    .chip { display: inline-block; width: 9px; height: 9px; flex: none; }

    /* pop-up body */
    .tip-sub {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--brandGray70);
        margin: 1px 0 4px;
    }
    .tip-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 12px;
        line-height: 1.45;
    }
    .tip-val { font-variant-numeric: tabular-nums; color: var(--brandGray70); }
    .tip-more { display: block; font-size: 11px; color: var(--brandGray60); margin-top: 2px; }

    .sr-only {
        position: absolute;
        width: 1px; height: 1px;
        margin: -1px; padding: 0;
        overflow: hidden;
        clip: rect(0 0 0 0);
        white-space: nowrap;
        border: 0;
    }
</style>
