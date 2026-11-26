<script>
    // Generic fixed-position tooltip for maps and charts.
    // Use with {#if} in the parent — mounts when shown, unmounts when hidden.
    // Automatically calls ondismiss on scroll so the parent can clear its state.
    //
    // Plain by design: a white card with a thin dark outline, a bold title, then either the simple
    // value / descriptor lines or a snippet of the parent's own content (e.g. a tiny bar graphic).
    // `yBelow` (optional): where the tooltip hangs from if it has to open BELOW the anchor — for an anchor that is a whole panel (y = its top edge, yBelow = its bottom edge),
    // so the tooltip never sits on top of the thing it describes.
    let { x, y, yBelow = null, title, value = '', descriptor = '', width = null, children = null, ondismiss = null } = $props();

    // ChartFrame puts the graphic inside a scroll container and a container-query boundary. Either one would
    // clip a position: fixed tooltip, or anchor it to the chart instead of the window, so the tooltip moves
    // itself to <body> while it is open.
    function portal(node) {
        document.body.appendChild(node);
        return { destroy: () => node.remove() };
    }

    let el = $state(null);
    let visible = $state(false);
    // svelte-ignore state_referenced_locally -- starts at the anchor, then the effect below clamps it into the window
    let finalX = $state(x);
    let flipBelow = $state(false);

    // After mount, measure the tooltip and clamp to viewport edges.
    // Start invisible to avoid a flash at the unclamped position.
    $effect(() => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vw = window.innerWidth;
        const pad = 8;

        let ax = x;
        if (ax - rect.width / 2 < pad) ax = rect.width / 2 + pad;
        if (ax + rect.width / 2 > vw - pad) ax = vw - rect.width / 2 - pad;

        finalX = ax;
        // above the anchor unless it doesn't fit there and there is more room below
        const roomAbove = y - 10 - pad;
        const roomBelow = window.innerHeight - (yBelow ?? y) - 10 - pad;
        flipBelow = rect.height > roomAbove && roomBelow > roomAbove;
        visible = true;
    });

    $effect(() => {
        if (!ondismiss) return;
        window.addEventListener('scroll', ondismiss, { passive: true });
        return () => window.removeEventListener('scroll', ondismiss);
    });
</script>

<div
    class="map-tooltip"
    class:flip-below={flipBelow}
    class:fixed-width={width !== null}
    style="left: {finalX}px; top: {flipBelow && yBelow !== null ? yBelow : y}px; opacity: {visible ? 1 : 0};{width !== null ? ` width: ${width}px;` : ''}"
    bind:this={el}
    use:portal
>
    <span class="title">{title}</span>
    {#if children}
        {@render children()}
    {:else}
        {#if value}<span class="value">{value}</span>{/if}
        {#if descriptor}<span class="desc">{descriptor}</span>{/if}
    {/if}
</div>

<style>
    .map-tooltip {
        position: fixed;
        transform: translate(-50%, calc(-100% - 10px));
        background: #fff;
        color: var(--brandGray90);
        border: 1px solid var(--brandGray80);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        padding: 8px 10px;
        pointer-events: none;
        white-space: nowrap;
        font-family: OpenSans, sans-serif;
        font-size: 12px;
        line-height: 1.5;
        z-index: 10;
    }
    .map-tooltip.fixed-width { white-space: normal; box-sizing: border-box; }
    .map-tooltip.flip-below {
        transform: translate(-50%, 10px); /* show below cursor when near the top of screen */
    }
    /* the installed bold face, not a browser-synthesized weight */
    .title { display: block; font-family: OpenSansBold, sans-serif; font-weight: normal; font-size: 13px; }
    .value { display: block; font-size: 12px; }
    .desc  { display: block; font-size: 11px; color: var(--brandGray60); margin-top: 1px; }
</style>
