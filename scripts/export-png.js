// Exports print-resolution PNGs for one post, one chart, or the whole site,
// screenshotting the (not-yet-built) bare figure route at each of a chart's
// declared widths, at 2x device scale for retina.
//
// Usage:
//   npm run export-pngs -- --post <slug> [--chart <id>] [--overwrite]
//   npm run export-pngs -- --all [--overwrite]
//
// Writes into posts/{slug}/published/{lastUpdated ?? published}/{chart}-{width}.png
// and never overwrites an existing file unless --overwrite is passed.
//
// Each screenshot is quantised to a palette on the way out (see lib/png.js),
// which takes roughly 44% off a typical chart export here. There is no flag to
// skip it: these files are reproducible — delete one and re-run — so there is
// nothing to lose, and lib/png.js rejects its own work and leaves the original
// alone whenever quantising would shift a colour that matters.

import { chromium } from 'playwright';
import { createServer, build, preview } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectEngine, formatBytes, quantizePng } from './lib/png.js';
import { lastUpdated } from '../src/lib/meta.js';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const SCALE = 2;

function parseArgs(argv) {
	const args = { post: null, chart: null, all: false, overwrite: false };
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === '--post') args.post = argv[++i];
		else if (arg === '--chart') args.chart = argv[++i];
		else if (arg === '--all') args.all = true;
		else if (arg === '--overwrite') args.overwrite = true;
	}
	return args;
}

function usageError(message) {
	console.error(`Error: ${message}\n`);
	console.error('Usage:');
	console.error('  npm run export-pngs -- --post <slug> [--chart <id>] [--overwrite]');
	console.error('  npm run export-pngs -- --all [--overwrite]');
	process.exit(1);
}

/**
 * Version folders a post is allowed to have: the date it was published, plus
 * one for every changelog entry. Anything else is left over from a date that
 * was edited before the post went live, and is removed by pruneVersions below.
 */
function validVersions(meta) {
	return new Set([meta.published, ...(meta.changelog ?? []).map((c) => c.date)].filter(Boolean));
}

/**
 * Removes version folders that no longer correspond to anything in meta.json.
 *
 * Editing `published` means the post was never live under the old date, so its
 * exports were a draft and are deleted. Adding a changelog entry does the
 * opposite: the older folder stays, because it records what the post looked
 * like when it was published under that date.
 */
function pruneVersions(slug, meta) {
	const dir = path.join(rootDir, 'posts', slug, 'published');
	if (!fs.existsSync(dir)) return;

	const valid = validVersions(meta);
	for (const name of fs.readdirSync(dir)) {
		if (valid.has(name)) continue;
		fs.rmSync(path.join(dir, name), { recursive: true, force: true });
		console.log(`removed stale version: posts/${slug}/published/${name}/ (not in meta.json)`);
	}
}

async function main() {
	const args = parseArgs(process.argv.slice(2));

	if (!args.all && !args.post) {
		usageError('specify --post <slug> or --all');
	}
	if (args.chart && !args.post) {
		usageError('--chart requires --post');
	}

	// Load post/chart metadata via Vite's SSR module graph (not a plain
	// `import`, since posts.js uses import.meta.glob, a Vite-only feature).
	// Cheap, so do it before the expensive build step to fail fast on typos.
	const devServer = await createServer({
		server: { middlewareMode: true },
		optimizeDeps: { noDiscovery: true }
	});
	const { posts, chartEntries } = await devServer.ssrLoadModule('/src/lib/posts.js');
	await devServer.close();

	let targets = chartEntries;
	if (args.post) targets = targets.filter((e) => e.slug === args.post);
	if (args.chart) targets = targets.filter((e) => e.chart === args.chart);

	if (targets.length === 0) {
		usageError(
			`no matching charts found for --post ${args.post ?? '(any)'} --chart ${args.chart ?? '(any)'}`
		);
	}

	console.log(`Building the site (needed so the figure routes reflect current source)...`);
	await build({ logLevel: 'warn' });

	// Say which quantiser is in play rather than letting the output silently
	// differ between machines depending on what happens to be installed.
	const engine = await detectEngine();
	if (engine) {
		console.log(`Quantising with ${engine}.`);
	} else {
		console.warn(
			'No quantiser found — exports will be written unoptimised.\n' +
				'  Install one with:  sudo apt install pngquant   (or: brew install pngquant)'
		);
	}

	console.log(`Exporting ${targets.length} chart(s)...`);

	const previewServer = await preview({ preview: { port: 4173 } });
	const baseUrl = previewServer.resolvedUrls.local[0];
	const browser = await chromium.launch();

	// chart id -> rendered height at its embed width, collected as we go and
	// written to embed.json per version folder. ChartFrame needs this to build an
	// iframe snippet without measuring in the browser, which is what let the
	// Share dialog stop depending on JavaScript. A layout engine is the only
	// thing that can answer it — some charts wrap to a new row rather than
	// scaling as a fixed ratio — and this script already has one running.
	// Keyed by output folder, since one run can span several posts and versions.
	const embedHeights = new Map();

	// Once per post, before writing anything into it.
	for (const slug of new Set(targets.map((t) => t.slug))) {
		pruneVersions(slug, posts[slug].meta);
	}

	for (const { slug, chart } of targets) {
		const { meta, charts } = posts[slug];
		const chartMeta = charts[chart];
		const widths = chartMeta.widths ?? [];
		const date = lastUpdated(meta.changelog) ?? meta.published;
		const outDir = path.join(rootDir, 'posts', slug, 'published', date);
		fs.mkdirSync(outDir, { recursive: true });

		// The embed uses the largest declared width, matching ChartFrame.
		const embedWidth = Math.max(...widths);

		for (const width of widths) {
			// Named by the file's real pixel width, not the design width it was laid
			// out at — `widths: [1080]` rendered at SCALE=2 is a 2160px file, and
			// that is the number the download label and filename both report.
			const outPath = path.join(outDir, `${chart}-${width * SCALE}.png`);
			const relPath = path.relative(rootDir, outPath);

			if (fs.existsSync(outPath) && !args.overwrite) {
				console.log(`skip (exists): ${relPath}`);
				continue;
			}

			const context = await browser.newContext({
				viewport: { width, height: 800 },
				deviceScaleFactor: SCALE
			});
			const page = await context.newPage();

			const url = `${baseUrl}posts/${slug}/figures/${chart}/`;
			await page.goto(url, { waitUntil: 'networkidle' });

			// Measure before hiding the buttons: an embedded copy shows them, so a
			// height taken with them hidden would leave the iframe short.
			if (width === embedWidth) {
				const box = await page.locator('.chart-frame').boundingBox();
				if (!embedHeights.has(outDir)) embedHeights.set(outDir, {});
				embedHeights.get(outDir)[chart] = { width: embedWidth, height: Math.ceil(box.height) };
			}

			// The figure route renders Read more/Download/Share buttons for the
			// live embed page, but a flat PNG export has nothing for them to do.
			await page.addStyleTag({ content: '.chart-buttons { display: none !important; }' });
			await page.locator('.chart-frame').screenshot({ path: outPath });
			await context.close();

			const result = await quantizePng(outPath);
			const note = result.applied
				? `${formatBytes(result.before)} -> ${formatBytes(result.after)}, palette`
				: `${formatBytes(result.before)}, kept as-is: ${result.reason}`;

			console.log(`${args.overwrite ? 'overwrote' : 'wrote'}: ${relPath}  (${note})`);
		}
	}

	await browser.close();
	await previewServer.close();

	// Merged rather than replaced, so exporting a single chart doesn't drop the
	// heights recorded for its siblings in the same version.
	for (const [dir, heights] of embedHeights) {
		const file = path.join(dir, 'embed.json');
		const existing = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
		const merged = Object.fromEntries(Object.entries({ ...existing, ...heights }).sort());
		fs.writeFileSync(file, `${JSON.stringify(merged, null, '\t')}\n`);
		console.log(`wrote: ${path.relative(rootDir, file)}`);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
