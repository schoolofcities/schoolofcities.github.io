// Checks every post before the site is built.
//
// Usage:
//   node scripts/validate.js [--strict]
//
// It runs first in the `build` script, and the shell's `&&` means Vite never
// runs if this exits non-zero. So an error here stops the build, and in an
// automated publishing step that means the previous site stays online rather
// than being replaced by a broken one.
//
// Two levels:
//
//   ERROR    the post is wrong — a missing data file, a chart with no
//            component, a date that isn't a date. Exits 1.
//   WARNING  the post is unfinished rather than wrong — a chart not yet
//            exported, an image not yet quantized. Prints and continues, so a
//            post can be built and previewed while it's still being written.
//
// --strict makes warnings exit 1 as well. Use it wherever the site is published
// from, so an unfinished post can be previewed locally but not published.
//
// Most of what's checked here fails silently at runtime by design: a data file
// that doesn't exist just drops a row from the Download menu, a `cardImage`
// naming nothing falls back to another chart. That is the right behaviour for a
// reader and the wrong behaviour for an author, which is why these checks exist.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { inspectPng } from './lib/png.js';
import { SITE_ORIGIN } from '../src/lib/site.js';
import { RELATIONS } from '../src/lib/meta.js';
import { GEOGRAPHY, TAGS } from '../src/lib/tags.js';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const postsDir = path.join(rootDir, 'posts');

const REQUIRED_META = ['title', 'type', 'summary', 'authors', 'published', 'license'];
const REQUIRED_CHART = ['title', 'source', 'alt'];
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Above this a single PNG is almost certainly a skipped optimisation step. The
// limit exists because git stores every revision of a binary file in full and
// forever, so an oversized image can't be taken back out later. For reference,
// the densest legitimate map here is 2.14 MB.
const MAX_PNG_BYTES = 5 * 1024 * 1024;

const problems = [];
const error = (post, message) => problems.push({ level: 'error', post, message });
const warn = (post, message) => problems.push({ level: 'warning', post, message });

/** A real calendar date, not just four digits and two dashes. */
function isValidDate(value) {
	if (typeof value !== 'string' || !ISO_DATE.test(value)) return false;
	const date = new Date(`${value}T00:00:00Z`);
	return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function listDir(dir) {
	return fs.existsSync(dir) ? fs.readdirSync(dir) : [];
}

function checkMeta(slug, meta) {
	for (const key of REQUIRED_META) {
		if (meta[key] === undefined || meta[key] === '' || (Array.isArray(meta[key]) && !meta[key].length)) {
			error(slug, `meta.json is missing required field "${key}"`);
		}
	}

	// Only posts live in this repo; explorers and data stories are built and
	// hosted separately, so any other value means this file came from elsewhere.
	if (meta.type !== undefined && meta.type !== 'post') {
		error(slug, `meta.json has type "${meta.type}" — this repo only holds "post"`);
	}

	if (meta.published !== undefined && !isValidDate(meta.published)) {
		error(slug, `meta.json published "${meta.published}" is not a valid ISO date (YYYY-MM-DD)`);
	}

	if (typeof meta.protected !== 'boolean') {
		error(slug, `meta.json "protected" must be true or false, got ${JSON.stringify(meta.protected)}`);
	}

	for (const entry of meta.changelog ?? []) {
		if (!isValidDate(entry.date)) {
			error(slug, `meta.json changelog date "${entry.date}" is not a valid ISO date (YYYY-MM-DD)`);
		}
	}

	for (const tag of meta.tags ?? []) {
		if (!TAGS.includes(tag)) {
			warn(slug, `tag "${tag}" is not in src/lib/tags.js — add it there, or use an existing term`);
		}
	}

	// A document with no recognised relation is dropped from the byline entirely,
	// so a typo here removes a citation with no other symptom.
	for (const doc of meta.documents ?? []) {
		const declared = [doc.relation ?? []].flat();
		if (declared.length === 0) {
			error(slug, `document "${doc.title ?? '(untitled)'}" has no relation — one of ${RELATIONS.join(', ')}`);
		}
		for (const relation of declared) {
			if (!RELATIONS.includes(relation)) {
				error(slug, `document "${doc.title ?? '(untitled)'}" has relation "${relation}" — must be one of ${RELATIONS.join(', ')}`);
			}
		}
	}

	for (const place of meta.geography ?? []) {
		if (!GEOGRAPHY.includes(place)) {
			warn(slug, `geography "${place}" is not in src/lib/tags.js — check the spelling used by other posts`);
		}
	}
}

function checkCharts(slug, charts) {
	const dir = path.join(postsDir, slug);
	const componentFiles = listDir(path.join(dir, 'charts')).filter((f) => f.endsWith('.svelte'));
	const componentKeys = componentFiles.map((f) => path.basename(f, '.svelte'));
	const dataFiles = listDir(path.join(dir, 'data'));
	const referencedData = new Set();

	for (const [key, chart] of Object.entries(charts)) {
		if (!KEBAB.test(key)) {
			error(slug, `chart id "${key}" must be kebab-case — it becomes a filename and a URL segment`);
		}

		if (!componentKeys.includes(key)) {
			error(slug, `charts.js has "${key}" but charts/${key}.svelte does not exist`);
		}

		for (const field of REQUIRED_CHART) {
			if (!chart[field]) error(slug, `chart "${key}" is missing "${field}"`);
		}

		for (const file of [chart.data ?? []].flat().filter(Boolean)) {
			referencedData.add(file);
			if (!dataFiles.includes(file)) {
				error(slug, `chart "${key}" lists data file "${file}", which is not in data/`);
			}
		}

		// Declaring widths is the statement that PNGs should exist; until
		// `npm run export-pngs` has run, the Download menu offers no image.
		if (chart.widths?.length && !chart.images?.length) {
			warn(slug, `chart "${key}" declares widths but has no exported PNG — run npm run export-pngs`);
		}
	}

	for (const key of componentKeys) {
		if (!(key in charts)) {
			error(slug, `charts/${key}.svelte has no entry in charts.js, so it is never rendered`);
		}
	}

	// A data file can be used two independent ways: listed in charts.js `data` to
	// be offered for download, or imported directly by a chart component to draw
	// with. Either counts as used — the map layers behind demographics-grid are
	// imported but deliberately not offered as a download.
	const importedData = new Set();
	for (const file of componentFiles) {
		const source = fs.readFileSync(path.join(dir, 'charts', file), 'utf8');
		for (const match of source.matchAll(/['"]\.\.\/data\/([^'"?]+)/g)) {
			importedData.add(match[1]);
		}
	}

	for (const file of dataFiles) {
		if (!referencedData.has(file) && !importedData.has(file)) {
			warn(slug, `data/${file} is neither imported by a chart nor offered for download, but is still copied into the build`);
		}
	}

}

/**
 * Every folder under published/ should correspond to a date in meta.json: the
 * publication date, or a changelog entry.
 *
 * A folder matching neither is left over from a date that was edited after
 * exporting. Downloads still resolve correctly — the newest date wins — but the
 * orphaned files are copied into the build and served, unreachable. Nothing
 * else surfaces this, since the files themselves are perfectly valid.
 *
 * `npm run export-pngs` removes these itself; this catches the case where
 * meta.json changed and the export hasn't been re-run yet.
 */
function checkVersions(slug, meta) {
	const valid = new Set([meta.published, ...(meta.changelog ?? []).map((c) => c.date)].filter(Boolean));

	for (const name of listDir(path.join(postsDir, slug, 'published'))) {
		if (!valid.has(name)) {
			warn(
				slug,
				`published/${name}/ matches no date in meta.json — re-run npm run export-pngs to remove it`
			);
		}
	}
}

function checkCardImage(slug, meta, charts) {
	if (meta.cardImage && !(meta.cardImage in charts)) {
		error(slug, `meta.json cardImage "${meta.cardImage}" is not a chart in charts.js`);
	}
}

function checkImages(slug) {
	const dir = path.join(postsDir, slug);

	const files = [
		...listDir(path.join(dir, 'images')).map((f) => ({ file: path.join(dir, 'images', f), rel: `images/${f}` })),
		...listDir(path.join(dir, 'published')).flatMap((date) =>
			listDir(path.join(dir, 'published', date)).map((f) => ({
				file: path.join(dir, 'published', date, f),
				rel: `published/${date}/${f}`,
				generated: true
			}))
		)
	].filter(({ file }) => file.endsWith('.png'));

	for (const { file, rel, generated } of files) {
		const info = inspectPng(file);

		if (info.bytes > MAX_PNG_BYTES) {
			error(
				slug,
				`${rel} is ${(info.bytes / 1048576).toFixed(2)} MB, over the ${MAX_PNG_BYTES / 1048576} MB limit — ` +
					`quantise it (npm run optimize-pngs) or export it smaller`
			);
		}

		if (!info.isPalette) {
			warn(slug, `${rel} is not quantised (stored as full colour) — see npm run optimize-pngs`);
		}

		// Exports are named by their real pixel width, so a mismatch means the
		// exporter and the file have diverged and the Download links will 404.
		if (generated) {
			const declared = Number(path.basename(rel, '.png').split('-').at(-1));
			if (Number.isFinite(declared) && declared !== info.width) {
				error(slug, `${rel} is ${info.width}px wide but its name says ${declared}px`);
			}
		}
	}
}

/** meta.json is read directly first, so a syntax error names the file. */
function readMetaFiles(slugs) {
	const metas = {};
	for (const slug of slugs) {
		const file = path.join(postsDir, slug, 'meta.json');
		if (!fs.existsSync(file)) {
			error(slug, 'has no meta.json');
			continue;
		}
		try {
			metas[slug] = JSON.parse(fs.readFileSync(file, 'utf8'));
		} catch (err) {
			error(slug, `meta.json is not valid JSON — ${err.message}`);
		}
	}
	return metas;
}

function report(strict) {
	const errors = problems.filter((p) => p.level === 'error');
	const warnings = problems.filter((p) => p.level === 'warning');

	for (const slug of [...new Set(problems.map((p) => p.post))].sort()) {
		console.log(`\nposts/${slug}`);
		for (const { level, message } of problems.filter((p) => p.post === slug)) {
			console.log(`  ${level === 'error' ? 'error  ' : 'warning'}  ${message}`);
		}
	}

	const failing = errors.length > 0 || (strict && warnings.length > 0);
	console.log(
		`\n${errors.length} error(s), ${warnings.length} warning(s)` +
			(strict && warnings.length ? ' — warnings count as errors under --strict' : '')
	);
	return failing;
}

async function main() {
	const strict = process.argv.includes('--strict');

	const slugs = fs
		.readdirSync(postsDir, { withFileTypes: true })
		.filter((e) => e.isDirectory())
		.map((e) => e.name)
		.sort();

	if (slugs.length === 0) {
		console.error('Error: no posts found in posts/');
		process.exit(1);
	}

	const metas = readMetaFiles(slugs);

	// Stop here if any meta.json failed to parse. posts.js globs them all
	// eagerly, so loading it below would throw Vite's own error over the top of
	// the message above, which names the post and the syntax problem.
	if (problems.some((p) => p.level === 'error')) {
		report(strict);
		process.exit(1);
	}

	// charts.js uses import.meta.glob, which only Vite can resolve — the same
	// approach export-png.js uses to read post metadata outside a build.
	const server = await createServer({
		server: { middlewareMode: true },
		optimizeDeps: { noDiscovery: true },
		logLevel: 'error'
	});
	let posts;
	try {
		({ posts } = await server.ssrLoadModule('/src/lib/posts.js'));
	} finally {
		await server.close();
	}

	for (const slug of slugs) {
		const meta = metas[slug];
		const charts = posts[slug]?.charts;

		if (!charts) {
			error(slug, 'has no charts.js, or it exports nothing');
			continue;
		}
		if (!meta) continue; // already reported

		checkMeta(slug, meta);
		checkCharts(slug, charts);
		checkCardImage(slug, meta, charts);
		checkVersions(slug, meta);
		checkImages(slug);
	}

	// Checked at the only moment it is at risk: when someone edits it for a domain
	// move. Every absolute link on the site — canonical, og:url, og:image, the
	// Share dialog, the embed snippet — is this value plus a path, so a missing
	// scheme or a trailing slash produces links that read as plausible and are
	// broken. Nothing else surfaces that.
	//
	// It cannot catch the value simply being out of date, which is the other way
	// this goes wrong; only a person comparing it against the live domain can.
	if (!SITE_ORIGIN) {
		error('(site)', 'SITE_ORIGIN in src/lib/site.js is empty — every absolute link on the site depends on it');
	} else if (!/^https?:\/\/[^/\s]+$/.test(SITE_ORIGIN)) {
		error(
			'(site)',
			`SITE_ORIGIN "${SITE_ORIGIN}" must be scheme and host with no trailing slash, ` +
				`e.g. "https://schoolofcities.github.io"`
		);
	}

	if (problems.length === 0) {
		const chartCount = slugs.reduce((n, s) => n + Object.keys(posts[s]?.charts ?? {}).length, 0);
		console.log(`${slugs.length} post(s), ${chartCount} chart(s) — no problems found.`);
		return;
	}

	if (report(strict)) process.exit(1);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
