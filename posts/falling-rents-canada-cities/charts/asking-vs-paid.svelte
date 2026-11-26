<script>
    import SegmentedToggle from '../components/SegmentedToggle.svelte';
    import ChartHeader from '../components/ChartHeader.svelte';
    import MapTooltip from '../components/MapTooltip.svelte';
    import { scaleLinear } from 'd3';
    import { ASKING_RENT_COLOR, PAID_RENT_COLOR } from '../components/colors.js';
    import data from '../data/asking-vs-paid.json';

    /**
     * A dumbbell per place: one crimson dot for how much asking rents have changed, one plum dot for how much the rents people pay have changed, joined by a
     * thin line. Canada sits on top on a light grey band; twelve cities follow, sorted by how far rents paid are ahead of asking rents. A toggle picks after or
     * before inflation. The change is measured since late 2023, when asking rents peaked nationally. All the numbers are prepared in the notebook; this only draws.
     *
     * Data is asking-vs-paid.json: { meta, places }.
     */
    const { meta, places } = data;

    // ─── what to show ──────────────────────────────────────────────────────────
    const period = 'since2023';       // the notebook also prepares 'since2019', which this chart no longer offers
    let measure = $state('real');
    let real = $derived(measure === 'real');
    const MEASURES = [
        { label: 'After inflation', value: 'real' },
        { label: 'Before inflation', value: 'nom' },
    ];

    // Canada first, then the cities sorted by how far rents paid have moved ahead of asking rents
    let rows = $derived.by(() => {
        const all = places.map((p) => ({ name: p.name, prov: p.prov, ask: p.changes[period][measure].ask, paid: p.changes[period][measure].paid }));
        return [all[0], ...all.slice(1).sort((a, b) => b.paid - b.ask - (a.paid - a.ask))];
    });
    let cities = $derived(rows.slice(1));
    let canada = $derived(rows[0]);

    // ─── layout ────────────────────────────────────────────────────────────────
    let width = $state(0);
    let compact = $derived(width < 520);
    const LABEL_W = $derived(compact ? 86 : 116);
    let margin = $derived({ top: 8, right: 12, bottom: 30, left: LABEL_W });
    let innerW = $derived(Math.max(0, width - margin.left - margin.right));
    const ROW_H = $derived(compact ? 26 : 30);       // every row, Canada's included

    // The horizontal range fits the chosen period and view, in whole tens, and always includes zero.
    let xDomain = $derived.by(() => {
        const vals = rows.flatMap((r) => [r.ask, r.paid, 0]);
        return [Math.floor((Math.min(...vals) - 2) / 10) * 10, Math.ceil((Math.max(...vals) + 2) / 10) * 10];
    });
    let xScale = $derived(scaleLinear().domain(xDomain).range([0, innerW]));
    let xTicks = $derived.by(() => { const step = xDomain[1] - xDomain[0] > 60 ? 20 : 10, t = []; for (let v = Math.ceil(xDomain[0] / step) * step; v <= xDomain[1]; v += step) t.push(v); return t; });

    // each row's top and height
    let layout = $derived(rows.map((r, i) => ({ top: i * ROW_H, h: ROW_H, mid: i * ROW_H + ROW_H / 2 })));
    let innerH = $derived(rows.length * ROW_H);
    let height = $derived(innerH + margin.top + margin.bottom);

    const signed = (v) => { const r = Math.round(v); return (r > 0 ? '+' : r < 0 ? '−' : '') + Math.abs(r) + '%'; };

    // ─── the sentences under the chart ─────────────────────────────────────────
    let windowTitle = $derived(meta.windows[period].title);
    // counted on the rounded figures, so the numbers in the sentence match the ones printed beside the dots
    let fewer = $derived(cities.filter((c) => Math.round(c.ask) < 0).length);
    let paidUp = $derived(cities.filter((c) => Math.round(c.paid) > 0).length);
    let caption = $derived.by(() => {
        const view = real ? 'after' : 'before';
        const move = (v) => (Math.round(v) >= 0 ? `up ${Math.round(v)}%` : `down ${Math.abs(Math.round(v))}%`);
        const lead = `Across Canada, ${view} inflation, asking rents are ${move(canada.ask)} ${windowTitle} and rents paid are ${move(canada.paid)}.`;
        const n = cities.length;
        return `${lead} Of the ${n} cities, asking rents are down in ${fewer} and rents paid are up in ${paidUp}.`;
    });

    // ─── hover / tap ───────────────────────────────────────────────────────────
    let sel = $state(null);          // row index whose pop-up is open
    let anchor = $state(null);       // { x, y, yBelow } in client pixels
    let svgEl = $state(null);

    function open(i) {
        const r = svgEl.getBoundingClientRect(), row = layout[i], row_ = rows[i];
        sel = i;
        anchor = { x: r.left + margin.left + xScale((row_.ask + row_.paid) / 2), y: r.top + margin.top + row.top, yBelow: r.top + margin.top + row.top + row.h };
    }
    function close() { sel = null; anchor = null; }
    function onEnter(i, e) { if (e.pointerType === 'mouse') open(i); }
    function onLeave(e) { if (e.pointerType === 'mouse') close(); }
    function onTap(i, e) { e.stopPropagation(); sel === i ? close() : open(i); }
    $effect(() => { measure; close(); });
</script>

<div class="dumb" onclick={close} role="presentation">
    <ChartHeader
        title="Change in asking rents and rents paid, {windowTitle}{real ? ', after inflation' : ', before inflation'}"
        titleLongest="Change in asking rents and rents paid, since late 2023, after inflation"
        hint="Sorted by how far rents paid are ahead of asking rents. Hover or tap a row for the numbers."
    >
        {#snippet controls()}
            <div onclick={(e) => e.stopPropagation()} role="presentation"><SegmentedToggle options={MEASURES} bind:value={measure} label="Show rents as" /></div>
        {/snippet}
        {#snippet legend()}
            <div class="key" role="group" aria-label="Dots">
                <span class="key-item"><span class="chip" style="background: {ASKING_RENT_COLOR}"></span>Asking rents</span>
                <span class="key-item"><span class="chip" style="background: {PAID_RENT_COLOR}"></span>Rents paid</span>
            </div>
        {/snippet}
    </ChartHeader>

    <div class="plot" bind:clientWidth={width}>
        {#if width > 0}
            <svg bind:this={svgEl} {width} {height} role="img"
                 aria-label="Dumbbell chart: change in asking rents and in rents paid, {windowTitle}, {real ? 'after' : 'before'} inflation, for Canada and {cities.length} cities. {caption}">
                <g transform="translate({margin.left},{margin.top})">
                    <!-- Canada is the same size as every row; only a light band under it (running under its label too) sets it apart -->
                    <rect x={-LABEL_W + 2} y={layout[0].top} width={width - 4} height={layout[0].h} class="canada-band" />

                    {#each xTicks as t}
                        <line x1={xScale(t)} x2={xScale(t)} y1="0" y2={innerH + 4} class={t === 0 ? 'zero-line' : 'grid-line'} />
                        <text x={xScale(t)} y={innerH + 20} class="chart-axis-label tick" text-anchor="middle">{t > 0 ? '+' : t < 0 ? '−' : ''}{Math.abs(t)}%</text>
                    {/each}

                    {#each rows as r, i}
                        {@const L = layout[i]}
                        <g class="row">
                            {#if sel === i}<rect x={-LABEL_W + 2} y={L.top} width={width - 4} height={L.h} class="hl-band" />{/if}
                            <text x={-10} y={L.mid + 4} text-anchor="end" class="name">{r.name}</text>
                            <line x1={xScale(r.ask)} x2={xScale(r.paid)} y1={L.mid} y2={L.mid} class="link" />
                            <circle cx={xScale(r.ask)} cy={L.mid} r="5" fill={ASKING_RENT_COLOR} class="dot" />
                            <circle cx={xScale(r.paid)} cy={L.mid} r="5" fill={PAID_RENT_COLOR} class="dot" />
                            {#if i === 0}
                                <!-- the Canada row carries its two numbers, outside its dots, to give the scale; the others are in the pop-up -->
                                <text x={xScale(r.ask) + (r.ask < r.paid ? -10 : 10)} y={L.mid + 4} class="val" text-anchor={r.ask < r.paid ? 'end' : 'start'}>{signed(r.ask)}</text>
                                <text x={xScale(r.paid) + (r.ask < r.paid ? 10 : -10)} y={L.mid + 4} class="val" text-anchor={r.ask < r.paid ? 'start' : 'end'}>{signed(r.paid)}</text>
                            {/if}
                            <rect x={-LABEL_W + 2} y={L.top} width={width - 4} height={L.h} fill="transparent" role="presentation"
                                  onpointerenter={(e) => onEnter(i, e)} onpointerleave={onLeave} onclick={(e) => onTap(i, e)} />
                        </g>
                    {/each}
                </g>
            </svg>
        {/if}
    </div>

    {#if sel !== null && anchor}
        {@const r = rows[sel]}
        <MapTooltip x={anchor.x} y={anchor.y} yBelow={anchor.yBelow} title={r.prov ? `${r.name}, ${r.prov}` : r.name} width={248} ondismiss={close}>
            <span class="tip-row"><span><span class="chip" style="background: {ASKING_RENT_COLOR}"></span>Asking rents</span><span class="tip-val">{signed(r.ask)}</span></span>
            <span class="tip-row"><span><span class="chip" style="background: {PAID_RENT_COLOR}"></span>Rents paid</span><span class="tip-val">{signed(r.paid)}</span></span>
            <span class="tip-note">{real ? 'After' : 'Before'} inflation, {windowTitle}</span>
        </MapTooltip>
    {/if}

    <p class="caption">{caption}</p>

    <div class="sr-only">
        <table>
            <caption>Change in asking rents and rents paid, {windowTitle}, {real ? 'after' : 'before'} inflation</caption>
            <thead><tr><th>Place</th><th>Asking rents</th><th>Rents paid</th></tr></thead>
            <tbody>
                {#each rows as r}<tr><td>{r.name}</td><td>{signed(r.ask)}</td><td>{signed(r.paid)}</td></tr>{/each}
            </tbody>
        </table>
    </div>
</div>

<style>
    /* Axis, tick and key labels. The original page defined this as a global class; here it is local to the component. Kept first so the rules below win, as the global one did. */
    .chart-axis-label { font-family: OpenSans, sans-serif; font-size: 12px; fill: var(--brandGray70); }
    @media (max-width: 600px) { .chart-axis-label { font-size: 11px; } }

    .dumb { width: 100%; }
    .plot { width: 100%; }
    svg { display: block; overflow: visible; }


    .canada-band { fill: #f3f3f1; }
    .hl-band { fill: #ecece8; }
    .grid-line { stroke: var(--brandGray, #d0d1c9); stroke-width: 0.5; }
    .zero-line { stroke: var(--brandGray70); stroke-width: 1; }
    .tick { font-size: 11px; fill: var(--brandGray60); }
    .row { cursor: pointer; }
    .link { stroke: #a9a9a3; stroke-width: 2.25; }           /* a thin, solid line between the two dots */
    .dot { stroke: white; stroke-width: 1.2; stroke-opacity: 0.65; }   /* a very faint white edge, so a dot stays crisp where it crosses the line or the grey band */

    .name { font-family: OpenSansBold, sans-serif; font-size: 12.5px; fill: var(--brandGray80); }
    .val { font-family: OpenSansBold, sans-serif; font-size: 11px; fill: var(--brandGray70); }

    .key { display: flex; flex-wrap: wrap; gap: 4px 16px; justify-content: flex-end; }
    .key-item { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--brandGray70); }
    .chip { display: inline-block; width: 10px; height: 10px; flex: none; margin-right: 6px; border-radius: 50%; }
    .key-item .chip { margin-right: 0; }

    .tip-row { display: flex; justify-content: space-between; gap: 12px; font-size: 12px; line-height: 1.5; }
    .tip-val { font-family: OpenSansBold, sans-serif; font-variant-numeric: tabular-nums; }
    .tip-note { display: block; margin-top: 3px; font-size: 11px; color: var(--brandGray60); }

    p.caption {
        font-family: OpenSans, sans-serif;
        font-size: 13.5px;
        line-height: 1.5;
        color: var(--brandGray80);
        margin: 10px 0 0;
        padding: 0;
    }

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
