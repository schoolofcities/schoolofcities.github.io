<script>
    /**
     * Small two-button toggle: white buttons with a thin grey border, the chosen one bold and dark, the other faded.
     * Same look as the toggle on the Place & Politics maps. Each label reserves its bold width, so the buttons
     * don't change size when chosen.
     */
    let {
        options = [],            // [{ label, value }]
        value = $bindable(),     // currently chosen value
        onSelect = () => {},
        label = 'Choose a view', // accessible name for the group
    } = $props();
</script>

<div class="toggle" role="group" aria-label={label}>
    {#each options as o (o.value)}
        <button type="button" aria-pressed={value === o.value} onclick={() => { value = o.value; onSelect(o.value); }}>
            <span class="lbl" data-text={o.label}>{o.label}</span>
        </button>
    {/each}
</div>

<style>
    .toggle {
        display: inline-flex;
        gap: 10px;
    }
    .toggle button {
        font-family: OpenSans, sans-serif;
        font-size: 13px;
        color: var(--brandGray90);
        background: white;
        border: 1px solid #c8c8c8;
        border-radius: 0;
        margin: 0;
        padding: 5px 10px;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
    }
    .toggle button:hover {
        border-color: #9ba1a8;
        position: relative;
    }
    .toggle button[aria-pressed='false'] { opacity: 0.75; }
    .toggle button[aria-pressed='false']:hover { opacity: 0.99; }
    .toggle button[aria-pressed='true'] {
        font-family: OpenSansBold, sans-serif;
        color: var(--brandBlack);
        position: relative;
    }
    .toggle button:focus-visible {
        outline: 2px solid var(--brandLightBlue);
        outline-offset: 1px;
        position: relative;
    }
    .lbl {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
    }
    .lbl::after {
        content: attr(data-text);
        height: 0;
        overflow: hidden;
        visibility: hidden;
        font-family: OpenSansBold, sans-serif;
    }
</style>
