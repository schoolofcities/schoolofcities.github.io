<script>
	import mapImage from '../images/toronto-sidewalks-qgis-for-web-labels.png';

	// Sampled from the rendered PNG's own line colors, so the legend matches what's drawn.
	// Grouped by source: the first three come from the 2019 PedNet baseline, the last
	// from combining the Sidewalk Construction Program with the annual council reports.
	const legendGroups = [
		{
			title: '2019 baseline',
			items: [
				{ color: '#44bde9', label: 'Sidewalk on both sides' },
				{ color: '#f2c400', label: 'Sidewalk on one side only' },
				{ color: '#dc230d', label: 'No sidewalk' }
			]
		},
		{
			title: 'Since 2020',
			items: [{ color: '#090909', label: 'New or planned sidewalk' }]
		}
	];
</script>

<div class="map">
	<img src={mapImage} width="2040" height="1084" alt="" />

	<!-- ward/area svg labels to come, positioned in this same 2040x1084 space -->

	<div class="legend">
		<div class="legend-title">Toronto streets</div>
		{#each legendGroups as group, i}
			<div class="legend-group" class:first={i === 0}>
				<div class="legend-group-title">{group.title}</div>
				{#each group.items as item}
					<div class="legend-row">
						<span class="swatch" style="background: {item.color};"></span>
						<span class="legend-label">{item.label}</span>
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.map {
		position: relative;
	}

	img {
		display: block;
		width: 100%;
		height: auto;
	}

	.legend {
		position: absolute;
		right: 12px;
		bottom: 12px;
		width: 220px;
		box-sizing: border-box;
		padding: 10px 12px 12px;
		background: rgba(255, 255, 255, 0.9);
		border: solid 1px var(--brandGray20);
	}

	@media (min-width: 1440px) {
		.legend {
			right: 22px;
			bottom: 22px;
		}
	}

	.legend-title {
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: 11px;
		line-height: 14px;
		color: var(--brandGray90);
		margin-bottom: 8px;
	}

	@media (min-width: 1440px) {
		.legend-title {
			font-size: 13px;
			line-height: 16px;
		}
	}

	.legend-group {
		margin-top: 12px;
	}

	.legend-group.first {
		margin-top: 0;
	}

	.legend-group-title {
		font-family: OpenSans;
		font-style: italic;
		font-size: 10px;
		color: var(--brandGray60);
		margin-bottom: 4px;
	}

	@media (min-width: 1440px) {
		.legend-group-title {
			font-size: 12px;
		}
	}

	.legend-row {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 6px;
	}

	.legend-row:first-of-type {
		margin-top: 0;
	}

	.swatch {
		width: 16px;
		height: 3px;
		flex-shrink: 0;
	}

	.legend-label {
		font-family: OpenSans;
		font-size: 11px;
		color: var(--brandGray90);
	}

	@media (min-width: 1440px) {
		.legend-label {
			font-size: 13px;
		}
	}
</style>
