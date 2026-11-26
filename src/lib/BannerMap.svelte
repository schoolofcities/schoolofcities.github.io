<script>
	// A faint map of Toronto behind the home banner: OpenStreetMap's Shortbread vector
	// tiles, drawn as water, roads, and rail only, in a few shades of the banner's own
	// navy, with no labels. It can be dragged a little. It is loaded in the browser only,
	// after the page, so until then (and offline) the banner is just navy.
	import { onMount } from 'svelte';
	import 'maplibre-gl/dist/maplibre-gl.css';

	// The banner's navy, and shades of it: water a little darker, streets a little lighter
	// (but only just).
	const NAVY = '#1E3765';
	const WATER = '#1a3059';
	const MINOR = '#223c68';
	const MAJOR = '#27437a';
	const RAIL = '#2f4d82';

	// The three University of Toronto campuses, each a faint dot with rings spreading out
	// from it like sound, the way the Toronto sound map draws its points.
	const CAMPUSES = [
		{ name: 'St. George', lngLat: [-79.3957, 43.6629] },
		{ name: 'Mississauga', lngLat: [-79.6639, 43.549] },
		{ name: 'Scarborough', lngLat: [-79.1866, 43.7845] }
	];
	const WAVE = '#6FC7EA'; // the light blue of the dot chart
	const PERIOD = 6000; // ms for a ring to spread out and fade
	const RINGS = 3;
	const REACH = 120; // px a ring spreads to

	const widthByZoom = (small, big) => ['interpolate', ['linear'], ['zoom'], 9, small, 13, big];

	const style = {
		version: 8,
		sources: {
			osm: {
				type: 'vector',
				tiles: ['https://vector.openstreetmap.org/shortbread_v1/{z}/{x}/{y}.mvt'],
				maxzoom: 14
			}
		},
		layers: [
			{ id: 'background', type: 'background', paint: { 'background-color': NAVY } },
			{ id: 'ocean', type: 'fill', source: 'osm', 'source-layer': 'ocean', paint: { 'fill-color': WATER } },
			{ id: 'water', type: 'fill', source: 'osm', 'source-layer': 'water_polygons', paint: { 'fill-color': WATER } },
			{
				id: 'rivers',
				type: 'line',
				source: 'osm',
				'source-layer': 'water_lines',
				paint: { 'line-color': WATER, 'line-width': widthByZoom(0.8, 3) }
			},
			{
				id: 'minor-streets',
				type: 'line',
				source: 'osm',
				'source-layer': 'streets',
				minzoom: 9.5,
				filter: ['in', ['get', 'kind'], ['literal', ['tertiary', 'unclassified', 'residential', 'living_street']]],
				layout: { 'line-cap': 'round', 'line-join': 'round' },
				paint: { 'line-color': MINOR, 'line-width': widthByZoom(0.4, 1.4) }
			},
			{
				id: 'major-streets',
				type: 'line',
				source: 'osm',
				'source-layer': 'streets',
				filter: ['in', ['get', 'kind'], ['literal', ['motorway', 'trunk', 'primary', 'secondary']]],
				layout: { 'line-cap': 'round', 'line-join': 'round' },
				paint: { 'line-color': MAJOR, 'line-width': widthByZoom(0.7, 2.6) }
			},
			{
				id: 'rail',
				type: 'line',
				source: 'osm',
				'source-layer': 'streets',
				// Main lines, subway, and light rail. In these tiles a yard, siding, spur, or
				// crossover is the track with a `service` tag, and a running line has none.
				filter: [
					'all',
					['in', ['get', 'kind'], ['literal', ['rail', 'light_rail', 'subway']]],
					['!', ['has', 'service']]
				],
				paint: { 'line-color': RAIL, 'line-width': widthByZoom(0.7, 1.6) }
			}
		]
	};

	let container = $state();
	let ready = $state(false);

	onMount(() => {
		let map;
		let gone = false;

		(async () => {
			const { default: maplibregl } = await import('maplibre-gl');
			if (gone) return;

			// A finger is for scrolling the page, so touch screens get no dragging.
			const canDrag = matchMedia('(hover: hover) and (pointer: fine)').matches;

			map = new maplibregl.Map({
				container,
				style,
				center: [-79.43, 43.7],
				zoom: 10, // only until the campuses are fitted, just below
				minZoom: 6,
				maxZoom: 12,
				// Turned 17 degrees clockwise, which brings the lakeshore level (as in the dot
				// chart's Toronto view); fitCampuses keeps it.
				bearing: -17,
				attributionControl: false,
				interactive: canDrag,
				// Panning only: no zooming, turning, or tilting, and the wheel is left to the page.
				scrollZoom: false,
				boxZoom: false,
				doubleClickZoom: false,
				touchZoomRotate: false,
				touchPitch: false,
				dragRotate: false,
				keyboard: false,
				fadeDuration: 0
			});
			// The zoom follows the width: the map is fitted so the three campuses are always
			// in view, with room around them (and clear of the right-hand fade). It is fitted
			// again whenever the banner changes size.
			const bounds = new maplibregl.LngLatBounds();
			for (const campus of CAMPUSES) bounds.extend(campus.lngLat);
			function fitCampuses() {
				const { clientWidth: w, clientHeight: h } = map.getContainer();
				const fades = w > 0 && getComputedStyle(map.getContainer()).maskImage !== 'none';
				map.fitBounds(bounds, {
					padding: {
						top: Math.max(40, h * 0.14),
						bottom: Math.max(40, h * 0.14),
						left: Math.max(40, w * 0.07),
						right: Math.max(40, w * (fades ? 0.22 : 0.07))
					},
					bearing: -17,
					maxZoom: 11.5,
					duration: 0
				});
			}
			fitCampuses();
			map.on('resize', fitCampuses);
			map.on('load', () => (ready = true));

			// ---- The campuses: one canvas over the map, redrawn each frame so it follows
			// the map when it is dragged. With reduced motion, a still picture: the dots and
			// one ring each.
			const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
			const canvas = document.createElement('canvas');
			canvas.setAttribute('aria-hidden', 'true');
			canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none';
			map.getContainer().appendChild(canvas);
			const ctx = canvas.getContext('2d');

			function fit() {
				const dpr = window.devicePixelRatio || 1;
				const { clientWidth: w, clientHeight: h } = map.getContainer();
				canvas.width = w * dpr;
				canvas.height = h * dpr;
				ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			}
			fit();
			map.on('resize', () => {
				fit();
				if (reduced) draw(0);
			});

			function draw(now) {
				const { clientWidth: w, clientHeight: h } = map.getContainer();
				ctx.clearRect(0, 0, w, h);
				ctx.strokeStyle = WAVE;
				ctx.fillStyle = WAVE;
				for (const campus of CAMPUSES) {
					const { x, y } = map.project(campus.lngLat);
					for (let i = 0; i < (reduced ? 1 : RINGS); i++) {
						const t = reduced ? 0.45 : (now / PERIOD + i / RINGS) % 1;
						const fade = Math.pow(1 - t, 1.5);
						const r = 6 + REACH * t;
						ctx.globalAlpha = fade * 0.07; // a soft wide line under a thin one
						ctx.lineWidth = 7;
						ctx.beginPath();
						ctx.arc(x, y, r, 0, 6.2832);
						ctx.stroke();
						ctx.globalAlpha = fade * 0.3;
						ctx.lineWidth = 1.5;
						ctx.beginPath();
						ctx.arc(x, y, r, 0, 6.2832);
						ctx.stroke();
					}
					ctx.globalAlpha = 0.14; // the dot, with a halo
					ctx.beginPath();
					ctx.arc(x, y, 11, 0, 6.2832);
					ctx.fill();
					ctx.globalAlpha = 0.45;
					ctx.beginPath();
					ctx.arc(x, y, 4.5, 0, 6.2832);
					ctx.fill();
				}
			}

			if (reduced) {
				map.on('render', () => draw(0));
			} else {
				const loop = (now) => {
					if (gone) return;
					draw(now);
					requestAnimationFrame(loop);
				};
				requestAnimationFrame(loop);
			}
			map.on('error', () => {}); // offline, or a tile failed: the navy stays
		})();

		return () => {
			gone = true;
			map?.remove();
		};
	});
</script>

<div class="map" class:ready bind:this={container} aria-hidden="true"></div>

<style>
	/* The left two thirds of the banner, behind the title text, easing out at its right
	   edge into the plain navy the chart sits on. Below 1100px the banner stacks, and
	   the map spans it. */
	.map {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		width: 66.667%;
		mask-image: linear-gradient(to right, #000 82%, transparent 100%);
		opacity: 0;
		transition: opacity 0.8s;
		cursor: grab;
	}

	.map.ready {
		opacity: 1;
	}

	@media screen and (max-width: 1100px) {
		.map {
			width: 100%;
			mask-image: none;
		}
	}

	.map:active {
		cursor: grabbing;
	}

	/* The library's own canvas and container are styled by its stylesheet; this only
	   keeps its stray focus ring off. */
	.map :global(canvas) {
		outline: none;
	}
</style>
