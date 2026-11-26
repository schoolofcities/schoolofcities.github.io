<script>
    /**
     * The top of a graphic, in a fixed order so every graphic on the page opens the same way:
     *   a thin rule · the title · a one-line hint about interacting · a row with the controls on the left (e.g. a toggle)
     *   and a legend on the right.
     * `controls` and `legend` are snippets passed by the graphic.
     */
    let {
        title = '',
        titleLongest = '',       // the longest title this graphic can show: its height is reserved, so switching titles never moves what's below
        hint = '',
        controls = null,
        legend = null,
    } = $props();
</script>

<header class="chart-header">
    {#if title}
        <div class="title-wrap">
            <p class="chart-legend-title title">{title}</p>
            {#if titleLongest}<p class="chart-legend-title title sizer" aria-hidden="true">{titleLongest}</p>{/if}
        </div>
    {/if}
    {#if hint}<p class="hint">{hint}</p>{/if}
    {#if controls || legend}
        <div class="row">
            {#if controls}<div class="controls">{@render controls()}</div>{/if}
            {#if legend}<div class="legend">{@render legend()}</div>{/if}
        </div>
    {/if}
</header>

<style>
    .chart-header {
        border-top: solid 1px var(--brandGray, #d0d1c9);
        padding-top: 10px;
        margin-bottom: 14px;
    }
    .title-wrap { display: grid; }
    /* Both paragraphs are set here rather than relying on the page's global p rules (serif body text with padding). */
    p.title {
        grid-area: 1 / 1;
        margin: 0;
        padding: 0;
        font-family: OpenSans, sans-serif;
        font-size: 14px;
        line-height: 22px;
        color: var(--brandGray90);
    }
    p.title.sizer { visibility: hidden; pointer-events: none; }
    p.hint {
        margin: 1px 0 0;
        padding: 0;
        font-family: OpenSansItalic, sans-serif;
        font-size: 13px;
        line-height: 20px;
        color: var(--brandGray60);
    }
    .row {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 8px 16px;
        margin-top: 12px;
    }
    .legend { margin-left: auto; }
</style>
