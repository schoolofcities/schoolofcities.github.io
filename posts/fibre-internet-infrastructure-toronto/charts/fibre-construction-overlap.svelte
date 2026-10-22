<script>
	import overlapMap from '../images/fibre-overlap-qgis.png';

	// One 1080x580 map made in QGIS: streets where one company built in
	// brandYellow, where more than one built in brandPurple. The key matches
	// the first chart's map buttons: a bold label over a coloured underline.
	const keyItems = [
		{ colour: 'var(--brandYellow)', label: 'One company' },
		{ colour: 'var(--brandPurple)', label: 'More than one company' }
	];

	// Place-name positions, in percent of this image (its own frame, so they
	// differ from the first chart's). Projected from each place's coordinates
	// into the QGIS map (Web Mercator, rotated 17°) and fitted against the
	// permit lines here; re-derive if the map is re-exported with a different
	// extent.
	const places = [
		{ name: 'Etobicoke', x: 13.4, y: 54.2 },
		{ name: 'North York', x: 43.7, y: 22.4 },
		{ name: 'Scarborough', x: 72.2, y: 39.0 },
		{ name: 'East York', x: 52.5, y: 61.5 },
		{ name: 'York', x: 26.7, y: 49.5 },
		{ name: 'Downtown', x: 40.8, y: 84.2 },
		{ name: 'Midtown', x: 42.1, y: 50.3 },
		{ name: 'Rexdale', x: 12.4, y: 25.8 },
		{ name: 'Mimico', x: 18.1, y: 81.7 },
		{ name: 'Agincourt', x: 69.2, y: 25.0 },
		{ name: 'Guildwood', x: 81.5, y: 51.4 },
		{ name: 'Don Mills', x: 53.9, y: 41.8 },
		{ name: 'Lake Ontario', x: 74, y: 84, water: true }
	];
	let showPlaces = $state(false);
</script>

<div class="overlap">
	<div class="key">
		{#each keyItems as item}
			<div>
				<span class="key-label">{item.label}</span>
				<span class="key-underline" style="background: {item.colour};"></span>
			</div>
		{/each}
	</div>
	<div class="map">
		<img src={overlapMap} width="1080" height="580" alt="" />
		<div class="place-layer">
			<div class="places" class:hidden={!showPlaces} aria-hidden="true">
				{#each places as place}
					<span class="place" class:water={place.water} style="left: {place.x}%; top: {place.y}%;">
						{place.name}
					</span>
				{/each}
			</div>

			<div class="places-control">
				<span class="places-control-label" aria-hidden="true">Place names</span>
				<button
					type="button"
					role="switch"
					class="switch"
					class:on={showPlaces}
					aria-checked={showPlaces}
					aria-label="Place names"
					onclick={() => (showPlaces = !showPlaces)}
				>
					<span class="knob"></span>
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.overlap {
		padding: 15px 0 8px;
	}

	/* The negative margin pulls the key into the empty space at the top of the
	   PNG; z-index keeps the underlines above the image. */
	.key {
		position: relative;
		z-index: 1;
		display: flex;
		flex-wrap: wrap;
		gap: 8px 24px;
		margin-bottom: -6px;
	}

	.key-label {
		display: block;
		font-family: OpenSansBold;
		font-weight: normal;
		font-size: 14px;
		line-height: 18px;
		color: var(--brandBlack);
	}

	.key-underline {
		display: block;
		width: 100px;
		height: 2px;
		margin-top: 2px;
	}

	.map {
		position: relative;
	}

	img {
		display: block;
		width: 100%;
		height: auto;
	}

	/* Place names and their on/off switch (bottom-right, over the lake), off by
	   default. The layer fills the positioned map wrapper; places are placed in
	   percent of the image so they track it at any width. */
	.place-layer {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.places {
		transition: opacity 0.2s;
	}

	.places.hidden {
		opacity: 0;
	}

	/* Black with a white outline so the names read over the lines: eight 1px
	   offsets make a solid edge around each letter, and the 4px blur adds a soft
	   clearing beyond it. */
	.place {
		position: absolute;
		transform: translate(-50%, -50%);
		white-space: nowrap;
		font-family: OpenSans;
		font-size: 11px;
		letter-spacing: 0.5px;
		color: var(--brandBlack);
		text-shadow:
			1px 0 0 var(--brandWhite),
			-1px 0 0 var(--brandWhite),
			0 1px 0 var(--brandWhite),
			0 -1px 0 var(--brandWhite),
			1px 1px 0 var(--brandWhite),
			-1px -1px 0 var(--brandWhite),
			1px -1px 0 var(--brandWhite),
			-1px 1px 0 var(--brandWhite),
			0 0 4px var(--brandWhite);
	}

	.place.water {
		font-family: OpenSansItalic;
		letter-spacing: 0;
		color: var(--brandGray60);
		text-shadow: none;
	}

	.places-control {
		position: absolute;
		right: 6px;
		bottom: 6px;
		display: flex;
		align-items: center;
		gap: 6px;
		pointer-events: auto;
	}

	.places-control-label {
		font-family: OpenSans;
		font-size: 12px;
		color: var(--brandGray50);
	}

	/* Off: light grey track, knob left. On: darker track, knob right. */
	.switch {
		position: relative;
		flex: none;
		width: 28px;
		height: 16px;
		padding: 0;
		border: none;
		border-radius: 8px;
		background: var(--brandGray10);
		cursor: pointer;
		transition: background 0.2s;
	}

	.switch.on {
		background: var(--brandGray60);
	}

	.switch:focus-visible {
		outline: 2px solid var(--brandDarkBlue);
		outline-offset: 3px;
	}

	.switch .knob {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--brandWhite);
		transition: transform 0.2s;
	}

	.switch.on .knob {
		transform: translateX(12px);
	}

	@media (prefers-reduced-motion: reduce) {
		.places,
		.switch,
		.switch .knob {
			transition: none;
		}
	}
</style>
