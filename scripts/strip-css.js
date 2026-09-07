// Removes <link rel="stylesheet"> tags a prerendered page doesn't actually need.
//
// Usage:
//   node scripts/strip-css.js [--dry-run]
//
// Why they're there in the first place: one route (posts/[slug]/figures/[chart])
// serves every chart on the site, so SvelteKit lists every chart's stylesheet as
// a possible dependency of that route. It has to — at build time it can't know
// which chart a given URL renders, and a missing stylesheet would mean a flash of
// unstyled content. The cost is that every page links every chart's CSS: fine at
// six charts, ~300 render-blocking requests at a hundred posts.
//
// Once the page is prerendered, though, we know exactly what it rendered. Svelte
// stamps each scoped rule with a hash (`.gridline.svelte-1jht5xl`) and puts that
// same class on the elements it styles, so a stylesheet whose hashes appear
// nowhere in the page's HTML cannot be affecting it, and its link can go.
//
// Client-side navigation is unaffected: the route's JS chunk carries its CSS
// dependencies and Vite's preload helper injects the stylesheet at runtime. With
// scripting off there is no client navigation, and every page is a fresh load
// carrying its own correct links.
//
// The safety rule is that anything unclassifiable is kept. A stylesheet with any
// unscoped selector may contain :global() rules, whose effects leave no hash in
// the markup — ChartFrame's shared dialog styles are exactly this — so those are
// never stripped.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const buildDir = path.join(rootDir, 'build');

const LINK = /<link[^>]+rel="stylesheet"[^>]*>/g;
const HREF = /href="([^"]+)"/;

/** Every .html file under `dir`. */
function pages(dir) {
	return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const full = path.join(dir, entry.name);
		if (entry.isDirectory()) return pages(full);
		return entry.name.endsWith('.html') ? [full] : [];
	});
}

const analysed = new Map();

/**
 * A stylesheet's scope hashes, and whether it's safe to strip at all.
 *
 * `strippable` is false when any selector carries no scope hash, since such a
 * rule can match elements that show no trace of the stylesheet in the markup.
 */
function analyse(file) {
	if (analysed.has(file)) return analysed.get(file);

	const body = fs.readFileSync(file, 'utf8');
	const hashes = [...new Set(body.match(/svelte-[a-z0-9]+/g) ?? [])];
	const selectors = [...body.matchAll(/([^{}]+)\{/g)].map((m) => m[1].trim());
	const unscoped = selectors.filter((s) => !s.includes('svelte-') && !s.startsWith('@'));

	const result = { hashes, strippable: hashes.length > 0 && unscoped.length === 0 };
	analysed.set(file, result);
	return result;
}

function main() {
	const dryRun = process.argv.includes('--dry-run');

	if (!fs.existsSync(buildDir)) {
		console.error(`Error: no build directory at ${path.relative(rootDir, buildDir)} — run the build first.`);
		process.exit(1);
	}

	let pagesChanged = 0;
	let linksRemoved = 0;
	let bytesBefore = 0;
	let bytesAfter = 0;

	for (const page of pages(buildDir).sort()) {
		const html = fs.readFileSync(page, 'utf8');
		const dropped = [];

		const updated = html.replace(LINK, (tag) => {
			const href = tag.match(HREF)?.[1];
			if (!href) return tag;

			const file = path.resolve(path.dirname(page), href);
			if (!fs.existsSync(file)) return tag; // not ours to reason about

			const { hashes, strippable } = analyse(file);
			const size = fs.statSync(file).size;
			bytesBefore += size;

			// Keep anything unclassifiable, and anything the page actually uses.
			if (!strippable || hashes.some((h) => html.includes(h))) {
				bytesAfter += size;
				return tag;
			}

			dropped.push(path.basename(file).split('.')[0]);
			return '';
		});

		if (dropped.length === 0) continue;

		pagesChanged++;
		linksRemoved += dropped.length;
		if (!dryRun) fs.writeFileSync(page, updated);

		console.log(`  ${path.relative(buildDir, page)}`);
		console.log(`      removed ${dropped.length}: ${dropped.join(', ')}`);
	}

	const saved = bytesBefore - bytesAfter;
	console.log(
		`\n${dryRun ? '[dry run] would remove' : 'removed'} ${linksRemoved} stylesheet link(s) ` +
			`across ${pagesChanged} page(s) — ${Math.round(saved / 1024)} KB of CSS no longer requested.`
	);
}

main();
