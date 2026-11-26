<script>
    import SegmentedToggle from '../components/SegmentedToggle.svelte';
    import ChartHeader from '../components/ChartHeader.svelte';
    import CanadaGlyphMap from '../components/CanadaGlyphMap.svelte';
    import data from '../data/net-change-map.json';

    // net-change-map.json: { meta, cities, frames }, built by the plotting-data notebook in the analysis repo
    const { meta, cities, frames } = data;

    // After inflation (starting rents restated in latest-CPI dollars) is the default view; before inflation = rents as advertised
    const MEASURES = [
        { label: 'After inflation', value: 'real' },
        { label: 'Before inflation', value: 'nominal' },
    ];
    let measure = $state('real');

    let real = $derived(measure === 'real');

    // Dollar scale shared by every pop-up bar: how much an increase / a decrease needs to fill its side of the line (rounded up to $50), so bar lengths compare across cities
    let deltas    = $derived(cities.flatMap(r => [r.latest_rent - r.base_rent, r.latest_rent - r.real_base_rent]));
    let scaleUp   = $derived(Math.ceil(Math.max(...deltas, 0) / 50) * 50);
    let scaleDown = $derived(Math.ceil(Math.max(...deltas.map(d => -d), 0) / 50) * 50);
    let legendBase  = $derived(`Net change in ${meta.bedroom} asking rent, ${meta.baseline_quarter} to ${meta.latest_quarter}`);
    let legendTitle = $derived(`${legendBase}${real ? ', after inflation' : ', before inflation'}`);
    // legend caption: two lines in both views, so the legend never changes shape
    let keyTitle = $derived(['Net change in asking rent,', real ? 'after inflation, %' : 'before inflation, %']);
</script>

<div class="net-change-map">
    <ChartHeader title={legendTitle} titleLongest="{legendBase}, after inflation" hint="Hover or tap an arrow for details.">
        {#snippet controls()}
            <SegmentedToggle options={MEASURES} bind:value={measure} label="Show net change as" />
        {/snippet}
    </ChartHeader>

    <CanadaGlyphMap
        {frames}
        {cities}
        {measure}
        tiltDeg={meta.arrow_tilt_deg}
        classBreaksNominal={meta.class_breaks}
        classBreaksReal={meta.class_breaks_real}
        {keyTitle}
        baseQuarter={meta.baseline_quarter}
        latestQuarter={meta.latest_quarter}
        realYear={meta.real_dollar_year}
        {scaleUp}
        {scaleDown}
    />
</div>

<style>
    .net-change-map {
        width: 100%;
    }
</style>
