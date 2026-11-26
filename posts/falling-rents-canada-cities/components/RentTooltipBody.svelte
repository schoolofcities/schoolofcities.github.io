<script>
    /**
     * Body of the asking-rent pop-up shared by the map and the trajectory chart (the title is the card's own bold heading).
     * A small two-row table — after inflation, then before inflation — with the net change and the monthly asking rent, start → latest.
     * Under each row a thin bar shows the change in dollars: a line marks the starting rent, and the shading runs to the right of it
     * for an increase or to the left for a decrease. Almost every change is an increase, so the line sits near the left and most of the
     * bar is room for increases. Both rows (and every pop-up on the page) share one dollar scale.
     * The row for the view the reader has chosen is bold. The chart adds a one-line peak.
     */
    let {
        nominalPct,
        realPct,
        baseRent,
        latestRent,
        realBaseRent,
        realYear,
        baseQuarter,
        latestQuarter,
        measure = 'real',        // 'nominal' | 'real': which row to emphasise
        peak = null,             // { pct, quarter } — optional
        scaleUp = null,          // $ an increase needs to fill the bar to the right of the line — shared by all pop-ups so lengths compare across cities
        scaleDown = null,        // $ a decrease needs to fill the bar to the left of it (default: this city's own)
    } = $props();

    const pct = (v) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(1) + '%';
    const usd = (v) => '$' + Math.round(v).toLocaleString('en-CA');

    let deltaNominal = $derived(latestRent - baseRent);
    let deltaReal    = $derived(latestRent - realBaseRent);
    let up   = $derived(scaleUp   ?? Math.max(deltaNominal, deltaReal, 1));
    let down = $derived(scaleDown ?? Math.max(-deltaNominal, -deltaReal, 0));
    let zero = $derived((down / (down + up)) * 100);        // where the line sits: % from the left

    // shading from the line: to the right for an increase, to the left for a decrease
    function shade(delta) {
        const w = (Math.min(Math.abs(delta), delta >= 0 ? up : down) / (down + up)) * 100;
        return delta >= 0 ? { left: zero, width: w, down: false } : { left: zero - w, width: w, down: true };
    }
    let nominalShade = $derived(shade(deltaNominal));
    let realShade    = $derived(shade(deltaReal));
</script>

<span class="when">{baseQuarter} → {latestQuarter}</span>

<div class="rows">
    <span class="lbl" class:on={measure === 'real'}>After inflation</span>
    <span class="chg" class:on={measure === 'real'}>{pct(realPct)}</span>
    <span class="usd" class:on={measure === 'real'}>{usd(realBaseRent)} → {usd(latestRent)}</span>
    <span class="bar" aria-hidden="true">
        <i class="fill" class:down={realShade.down} style="left: {realShade.left}%; width: {realShade.width}%"></i><i class="mid" style="left: {zero}%"></i>
    </span>

    <span class="lbl" class:on={measure === 'nominal'}>Before inflation</span>
    <span class="chg" class:on={measure === 'nominal'}>{pct(nominalPct)}</span>
    <span class="usd" class:on={measure === 'nominal'}>{usd(baseRent)} → {usd(latestRent)}</span>
    <span class="bar" aria-hidden="true">
        <i class="fill" class:down={nominalShade.down} style="left: {nominalShade.left}%; width: {nominalShade.width}%"></i><i class="mid" style="left: {zero}%"></i>
    </span>
</div>

{#if peak}
    <!-- a city that never rose above its starting level has no meaningful peak -->
    <div class="peak">{peak.pct > 0 ? `Peak ${pct(peak.pct)} in ${peak.quarter}` : `Never above its ${baseQuarter} level`}</div>
{/if}

<span class="note">Change in monthly asking rent; after inflation in {realYear} dollars.</span>

<style>
    .when { display: block; font-size: 11px; color: var(--brandGray60); }

    .rows {
        display: grid;
        grid-template-columns: max-content max-content max-content;
        column-gap: 10px;
        row-gap: 2px;
        margin-top: 5px;
        font-size: 12px;
        color: var(--brandGray70);
    }
    .chg, .usd { text-align: right; white-space: nowrap; }
    .lbl.on, .chg.on {
        font-family: OpenSansBold, sans-serif;
        color: var(--brandGray90);
    }
    .usd.on { color: var(--brandGray90); }   /* dollars stay regular weight; the change is what's bold */

    /* the dollar bar: a line for the starting rent, shading to its right (up) or left (down) */
    .bar {
        grid-column: 1 / -1;
        position: relative;
        height: 6px;
        margin: 1px 0 5px;
        background: #efefec;
    }
    .bar .fill { position: absolute; top: 0; bottom: 0; background: #bf2150; }
    .bar .fill.down { background: #3a7bab; }
    .bar .mid {
        position: absolute;
        top: -2px;
        bottom: -2px;
        width: 1px;
        background: var(--brandGray90);
    }

    .peak {
        margin-top: 6px;
        padding-top: 5px;
        border-top: solid 1px var(--brandGray, #d0d1c9);
        font-size: 12px;
        color: var(--brandGray90);
    }
    .note { display: block; margin-top: 5px; font-size: 10.5px; line-height: 1.4; color: var(--brandGray60); }
</style>
