<script>
	// The home banner's dot chart: every piece in the catalogue is one dot, in the
	// colour of its type, and the dots glide between four arrangements: stacked by
	// the quarter they were published, spread out to fill the outline of the city of
	// Toronto, in a cluster for each theme (a piece's first tag), and in a scatter
	// plot. There are no controls and nothing to point at: it plays on its own (or sits still,
	// for a reader who prefers less motion).
	//
	// The arrangements are worked out once, up front (d3-force settles each into a
	// beeswarm), so the prerendered page already shows the first and the browser
	// only has to move the dots. The picture repeats what the columns below list,
	// so it is hidden from assistive tech.
	import { onMount } from 'svelte';
	import { forceSimulation, forceX, forceY, forceCollide, pack, hierarchy, easeCubicInOut, timer } from 'd3';
	import { catalogue, TYPES } from './catalogue.js';
	import outline from './toronto-outline.json';

	const W = 640;
	const H = 440;
	const R = 12; // dot radius

	// Light enough for the navy banner it sits on.
	const COLOUR = { post: '#6FC7EA', feature: '#C58BD0', explorer: '#8DBF2E', project: '#F1C500' };
	const ORDER = TYPES.map(([type]) => type);

	const items = catalogue;

	const HOLD = 2000; // ms each arrangement sits still before the next move
	const DURATION = 800; // ms for each dot's own glide
	const STAGGER = 2.5; // ms of delay per dot, so they set off in a ripple
	const MORPH = DURATION + STAGGER * items.length; // ms from the first dot setting off to the last arriving
	// The order they play in: time, the city, the themes, a scatter, and round again.
	const NEXT = { year: 'toronto', toronto: 'theme', theme: 'scatter', scatter: 'year' };


	// Lets d3-force relax a set of targets into a packed swarm; returns each dot's
	// settled position, in the same order. Deterministic, so the server and the
	// browser agree.
	function swarm(targets, { strengthX, strengthY }) {
		const nodes = targets.map((t, i) => ({ x: t.x + i * 0.001, y: t.y - i * 0.001, tx: t.x, ty: t.y }));
		const simulation = forceSimulation(nodes)
			.force('x', forceX((d) => d.tx).strength(strengthX))
			.force('y', forceY((d) => d.ty).strength(strengthY))
			.force('collide', forceCollide(R + 1.2).iterations(4))
			.alphaDecay(0.01) // settles slowly enough for the dots to finish moving apart
			.stop();
		for (let i = 0; i < 240; i++) simulation.tick();
		return nodes.map((n) => ({ x: n.x, y: n.y }));
	}

	// ---- 1. By year: columns of dots, a column for each quarter.
	const quarterOf = (iso) => Number(iso.slice(0, 4)) * 4 + Math.floor((Number(iso.slice(5, 7)) - 1) / 3);
	const firstQuarter = Math.min(...items.map((item) => quarterOf(item.published)));
	const quarterCount = Math.max(...items.map((item) => quarterOf(item.published))) - firstQuarter + 1;
	// Close together, and the whole chart centred, like the other views.
	const stepX = 2 * R + 4;
	const yearLeft = (W - quarterCount * stepX) / 2;

	const stacks = Array.from({ length: quarterCount }, () => []);
	for (const item of items) stacks[quarterOf(item.published) - firstQuarter].push(item);
	const tallest = Math.max(...stacks.map((stack) => stack.length));
	const stepY = Math.min(2 * R + 3, (H - 16) / tallest);
	const yearBottom = (H + tallest * stepY) / 2 - stepY / 2;

	const yearSlot = new Map();
	stacks.forEach((stack, col) => {
		stack
			.toSorted((a, b) => ORDER.indexOf(a.type) - ORDER.indexOf(b.type) || a.title.localeCompare(b.title))
			.forEach((item, row) => yearSlot.set(item.id, { x: yearLeft + col * stepX + stepX / 2, y: yearBottom - row * stepY }));
	});
	const year = items.map((item) => yearSlot.get(item.id));

	// ---- 2. A scatter: each dot at a made-up (x, y), with a fairly loose positive
	// correlation. The positions only make the picture and mean nothing. A fresh set
	// is drawn each time the scatter comes round (see go), so it is never quite the
	// same twice; a little relaxing keeps the dots from overlapping.
	function seeded(seed) {
		return () => {
			seed = (seed + 0x6d2b79f5) | 0;
			let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}
	const EDGE = R + 26;
	function makeScatter(seed) {
		const random = seeded(seed);
		const bell = () => (random() + random() + random() + random() - 2) / 0.58; // roughly normal, spread 1
		const targets = items.map(() => {
			const u = random();
			const v = Math.min(1, Math.max(0, 0.5 * u + 0.5 * (0.5 + 0.26 * bell())));
			return { x: EDGE + u * (W - 2 * EDGE), y: H - EDGE - v * (H - 2 * EDGE) };
		});
		return swarm(targets, { strengthX: 0.1, strengthY: 0.1 });
	}
	// Seeded for the first, so the server and the browser agree before it is drawn anew.
	const scatter = makeScatter(11);

	// ---- 3. By theme: a cluster for each theme, the clusters packed to fit the space.
	const themeOf = (item) => item.tags[0] ?? 'other';
	const themeGroups = Object.entries(Object.groupBy(items, themeOf)).toSorted((a, b) => b[1].length - a[1].length);
	const packed = pack().size([W - 2 * R - 12, H - 2 * R - 12]).padding(26)(
		hierarchy({ children: themeGroups.map(([name, members]) => ({ name, value: members.length })) }).sum((d) => d.value ?? 0)
	);
	const centres = new Map(packed.leaves().map((leaf) => [leaf.data.name, { x: leaf.x + R + 6, y: leaf.y + R + 6 }]));
	const themeSettled = swarm(
		items.map((item) => centres.get(themeOf(item))),
		{ strengthX: 0.3, strengthY: 0.3 }
	);
	const theme = themeSettled;
	// ---- 4. Toronto: the dots spread out to fill the city's outline (which is not drawn). The outline is
	// the city boundary from the historical aerial imagery project, simplified to
	// about a hundred points (toronto-outline.json, 2 kB), and drawn to fit the
	// space. Points of an even hexagonal lattice inside it are the dots' places.
	const kx = Math.cos((43.7 * Math.PI) / 180); // shrinks longitude to match latitude
	// Turned 17 degrees clockwise, which brings the lakeshore level.
	const TILT = (17 * Math.PI) / 180;
	const flat = outline.map(([lon, lat]) => {
		const px = lon * kx;
		const py = -lat;
		return [px * Math.cos(TILT) - py * Math.sin(TILT), px * Math.sin(TILT) + py * Math.cos(TILT)];
	});
	const minX = Math.min(...flat.map((p) => p[0]));
	const maxX = Math.max(...flat.map((p) => p[0]));
	const minY = Math.min(...flat.map((p) => p[1]));
	const maxY = Math.max(...flat.map((p) => p[1]));
	// Drawn a little under the full space, so the same dots sit closer together.
	const fit = 0.8 * Math.min((W - 2 * R - 12) / (maxX - minX), (H - 2 * R - 12) / (maxY - minY));
	const shore = flat.map(([px, py]) => [
		(px - minX) * fit + (W - (maxX - minX) * fit) / 2,
		(py - minY) * fit + (H - (maxY - minY) * fit) / 2
	]);

	function inside([px, py]) {
		let yes = false;
		for (let i = 0, j = shore.length - 1; i < shore.length; j = i++) {
			const [xi, yi] = shore[i];
			const [xj, yj] = shore[j];
			if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) yes = !yes;
		}
		return yes;
	}

	function lattice(gap) {
		const points = [];
		for (let row = 0; ; row++) {
			const py = R + 6 + row * gap * 0.866;
			if (py > H - R - 6) break;
			for (let col = 0; ; col++) {
				const px = R + 6 + (col + (row % 2) / 2) * gap;
				if (px > W - R - 6) break;
				if (inside([px, py])) points.push([px, py]);
			}
		}
		return points;
	}

	// The widest spacing that still gives a place for every dot, then thinned evenly
	// to exactly as many places as there are dots.
	let gap = 90;
	let places = lattice(gap);
	while (places.length < items.length && gap > 2 * R + 2) places = lattice((gap -= 0.5));
	places = Array.from({ length: items.length }, (_, k) => places[Math.floor((k * places.length) / items.length)]);

	// Each dot takes the nearest free place to where it sits in the year view, which
	// comes just before this one, so the dots slide a short way rather than crossing
	// the whole chart.
	const taken = new Set();
	const toronto = new Array(items.length);
	items
		.map((_, i) => i)
		.toSorted((a, b) => year[a].x - year[b].x)
		.forEach((i) => {
			let best = -1;
			let bestDistance = Infinity;
			places.forEach(([px, py], k) => {
				const distance = (px - year[i].x) ** 2 + (py - year[i].y) ** 2;
				if (!taken.has(k) && distance < bestDistance) [best, bestDistance] = [k, distance];
			});
			taken.add(best);
			toronto[i] = { x: places[best][0], y: places[best][1] };
		});

	const LAYOUTS = { year, scatter, theme, toronto }; // scatter is replaced each time it is shown

	// ---- Moving between them.
	let view = $state('year');
	let x = $state(year.map((p) => p.x));
	let y = $state(year.map((p) => p.y));
	let motion; // the running d3 timer
	let moved = false; // whether a move has happened yet (the first view has none to wait out)
	let reduced = false;

	function go(next) {
		if (next === view) return;
		view = next;
		moved = true;
		if (next === 'scatter') LAYOUTS.scatter = makeScatter(Math.floor(Math.random() * 2 ** 32));
		const to = LAYOUTS[next];
		motion?.stop();

		if (reduced) {
			x = to.map((p) => p.x);
			y = to.map((p) => p.y);
			return;
		}

		const fromX = [...x];
		const fromY = [...y];
		motion = timer((elapsed) => {
			for (let i = 0; i < to.length; i++) {
				const t = Math.min(1, Math.max(0, (elapsed - i * STAGGER) / DURATION));
				const e = easeCubicInOut(t);
				x[i] = fromX[i] + (to[i].x - fromX[i]) * e;
				y[i] = fromY[i] + (to[i].y - fromY[i]) * e;
			}
			if (elapsed > MORPH) motion.stop();
		});
	}

	// ---- Playing through them. Always, unless the reader prefers less motion.
	let playing = $state(false);

	onMount(() => {
		reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
		playing = !reduced;
		return () => motion?.stop();
	});

	$effect(() => {
		if (!playing) return;
		// Read here, not inside the timeout, so each change of view restarts the wait.
		const next = NEXT[view];
		// The wait is counted from when the last move ends, so each view sits still for
		// the same time.
		const id = setTimeout(() => go(next), HOLD + (moved ? MORPH : 0));
		return () => clearTimeout(id);
	});
</script>

<div class="atlas-wrap">
	<svg class="atlas" viewBox="0 0 {W} {H}" preserveAspectRatio="xMaxYMax meet" aria-hidden="true">
		{#each items as item, i (item.id)}
			<circle cx={x[i]} cy={y[i]} r={R} fill={COLOUR[item.type]} />
		{/each}
	</svg>
</div>

<style>
	.atlas-wrap {
		position: relative;
	}

	.atlas {
		display: block;
		width: 100%;
		height: auto;
		max-height: 400px;
	}
</style>
