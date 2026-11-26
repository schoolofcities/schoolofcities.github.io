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
// that doesn't exist just drops a row from the Download menu, a chart never
// exported just leaves a post without a social image. That is the right
// behaviour for a reader and the wrong behaviour for an author, which is why
// these checks exist.

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
const linksDir = path.join(rootDir, 'links');

// The catalogue schema. Every item — a post here, or a link to work hosted
// elsewhere — shares these fields, so the home page can list and filter them the
// same way. Posts and links each add a few of their own below.
const REQUIRED_SHARED = ['title', 'type', 'summary', 'authors', 'published', 'tags', 'geography'];
const REQUIRED_META = [...REQUIRED_SHARED, 'license'];
const REQUIRED_LINK = [...REQUIRED_SHARED, 'url'];

// What a linked item can be. Posts hosted elsewhere (e.g. on the SofC
// WordPress site) are `post` too, so porting one here changes nothing about
// how it's described. A `project` is a standalone hub bringing several pieces
// of work together; those pieces can have entries of their own that name it
// in their `project` field. Projects only ever live in links/: posts/ holds
// nothing but posts.
const LINK_TYPES = ['post', 'feature', 'explorer', 'project'];

// Fields that only make sense for a post built in this repo.
const POST_ONLY = ['protected'];

// Every card image (the home page thumbnail, and a post's social card) is this
// size: 1.91:1, the shape social platforms show shared links at.
const CARD = { width: 1200, height: 630 };
const REQUIRED_CHART = ['title', 'source', 'alt'];
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Above this a single PNG is almost certainly a skipped optimisation step. The
// limit exists because git stores every revision of a binary file in full and
// forever, so an oversized image can't be taken back out later. For reference,
// the densest legitimate map here is 2.14 MB.
const MAX_PNG_BYTES = 5 * 1024 * 1024;

// The widths a chart is allowed to snap to (see widthSnapCss in ChartFrame.svelte).
// Keeping every chart on this shared set means a handful of container-query
// breakpoints in ChartFrame.svelte can be tuned once instead of per chart.
const CORE_WIDTHS = [1440, 1080, 720, 540, 360];

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

/** Checks every catalogue item gets, post or link. `key` labels the report. */
function checkShared(key, meta, required) {
	for (const field of required) {
		if (meta[field] === undefined || meta[field] === '' || (Array.isArray(meta[field]) && !meta[field].length)) {
			error(key, `meta.json is missing required field "${field}"`);
		}
	}

	if (meta.published !== undefined && !isValidDate(meta.published)) {
		error(key, `meta.json published "${meta.published}" is not a valid ISO date (YYYY-MM-DD)`);
	}

	checkVocabulary(key, meta);
}

function checkMeta(slug, meta) {
	checkShared(slug, meta, REQUIRED_META);

	// Explorers and features are built and hosted separately; one listed on the
	// home page belongs in links/, which points to it.
	if (meta.type !== undefined && meta.type !== 'post') {
		error(slug, `meta.json has type "${meta.type}" — posts/ only holds "post"; link to other work from links/`);
	}

	if (typeof meta.protected !== 'boolean') {
		error(slug, `meta.json "protected" must be true or false, got ${JSON.stringify(meta.protected)}`);
	}
}

/** Changelog dates, tags, geography and documents: the same rules for posts and links. */
function checkVocabulary(slug, meta) {
	for (const entry of meta.changelog ?? []) {
		if (!isValidDate(entry.date)) {
			error(slug, `meta.json changelog date "${entry.date}" is not a valid ISO date (YYYY-MM-DD)`);
		}
	}

	for (const tag of meta.tags ?? []) {
		if (!Object.hasOwn(TAGS, tag)) {
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

/**
 * A card.png, where there is one: the item's home page thumbnail, and a post's
 * social card. Required for links; optional for posts, which use a chart export
 * until they have one.
 */
function checkCard(key, dir, required) {
	const file = path.join(dir, 'card.png');
	if (!fs.existsSync(file)) {
		if (required) error(key, `has no card.png — the ${CARD.width} × ${CARD.height} image shown on the home page`);
		return;
	}

	const info = inspectPng(file);
	if (info.width !== CARD.width || info.height !== CARD.height) {
		error(key, `card.png is ${info.width} × ${info.height} — it must be exactly ${CARD.width} × ${CARD.height}`);
	}
	if (info.bytes > MAX_PNG_BYTES) {
		error(key, `card.png is ${(info.bytes / 1048576).toFixed(2)} MB, over the ${MAX_PNG_BYTES / 1048576} MB limit`);
	}
	// A card is a finished image, not work in progress, so both of these are
	// errors: flat (social platforms fill transparent areas with black, grey or
	// white unpredictably) and quantised (it's downloaded on every home page
	// view). An opaque quantised PNG carries no transparency data at all, so
	// once it's quantised, any transparency flagged here is real.
	if (!info.isPalette) {
		error(key, 'card.png is not quantised (stored as full colour) — run npm run optimize-pngs -- --path <file>');
	}
	if (info.hasTransparency) {
		error(
			key,
			'card.png has transparency — flatten it onto a background colour before quantising ' +
				'(e.g. convert in.png -background white -alpha remove out.png)'
		);
	}
}

/**
 * Items in links/: work hosted elsewhere — standalone explorers, features, and
 * posts on other sites — listed on the home page alongside the posts here. One
 * folder each, holding meta.json and card.png. Returns each parsed meta.json by folder name.
 */
function checkLinks() {
	const metas = {};
	const slugs = fs.existsSync(linksDir)
		? fs.readdirSync(linksDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort()
		: [];

	for (const slug of slugs) {
		const key = `links/${slug}`;
		const dir = path.join(linksDir, slug);

		if (!KEBAB.test(slug)) {
			error(key, 'folder name must be kebab-case — it identifies the item, and becomes its URL if it is ported to a post');
		}

		const file = path.join(dir, 'meta.json');
		if (!fs.existsSync(file)) {
			error(key, 'has no meta.json');
			continue;
		}
		let meta;
		try {
			meta = JSON.parse(fs.readFileSync(file, 'utf8'));
		} catch (err) {
			error(key, `meta.json is not valid JSON — ${err.message}`);
			continue;
		}

		metas[slug] = meta;
		checkShared(key, meta, REQUIRED_LINK);

		if (meta.type !== undefined && !LINK_TYPES.includes(meta.type)) {
			error(key, `meta.json has type "${meta.type}" — must be one of ${LINK_TYPES.join(', ')}`);
		}

		if (meta.url !== undefined) {
			let ok = false;
			try {
				ok = ['http:', 'https:'].includes(new URL(meta.url).protocol);
			} catch {
				// not a URL at all
			}
			if (!ok) error(key, `meta.json url "${meta.url}" is not a full http(s) address`);
		}

		for (const field of POST_ONLY) {
			if (meta[field] !== undefined) {
				error(key, `meta.json has "${field}", which only applies to posts built in this repo`);
			}
		}

		checkCard(key, dir, true);
	}

	return metas;
}

/**
 * An item's optional `project`: the folder name of the project in links/ it is
 * part of. Posts can name one too. Projects don't nest.
 */
function checkProject(key, meta, linkMetas) {
	if (meta.project === undefined) return;

	if (meta.type === 'project') {
		error(key, 'meta.json is a project, so it can\'t also belong to one — remove "project"');
		return;
	}

	const parent = linkMetas[meta.project];
	if (!parent) {
		error(key, `meta.json project "${meta.project}" is not a folder in links/`);
	} else if (parent.type !== 'project') {
		error(key, `meta.json project "${meta.project}" is a ${parent.type}, not a project`);
	}
}

function checkCharts(slug, charts) {
	const dir = path.join(postsDir, slug);
	const componentFiles = listDir(path.join(dir, 'charts')).filter((f) => f.endsWith('.svelte'));
	const componentKeys = componentFiles.map((f) => path.basename(f, '.svelte'));
	const dataFiles = listDir(path.join(dir, 'data'));
	const referencedData = new Set();
	const pageFile = path.join(dir, '+page.svelte');
	const pageSource = fs.existsSync(pageFile) ? fs.readFileSync(pageFile, 'utf8') : '';

	for (const [key, chart] of Object.entries(charts)) {
		if (!KEBAB.test(key)) {
			error(slug, `chart id "${key}" must be kebab-case — it becomes a filename and a URL segment`);
		}

		if (!componentKeys.includes(key)) {
			error(slug, `charts.js has "${key}" but charts/${key}.svelte does not exist`);
		} else {
			// Text checks on the source, like the data-import scan below: they
			// can't prove the component renders correctly, only that the
			// required pieces are written in. Both are errors rather than
			// warnings because the result is wrong, not unfinished.

			// ChartFrame gives every chart its title, alt text, source line and
			// Download/Share buttons. A chart missing from the page body, or drawn
			// without the frame, has none of them.
			const framed = new RegExp(`<ChartFrame\\b[^>]*\\bchartKey=["']${key}["']`);
			if (!framed.test(pageSource)) {
				error(
					slug,
					`chart "${key}" is not shown in a ChartFrame in +page.svelte — ` +
						`add <ChartFrame ... chartKey="${key}"> around its component`
				);
			}

			// ChartGraphic hides a chart's drawn parts from screen readers, which
			// get the alt text ChartFrame reads out instead. Without it they hear
			// every tick and label in markup order.
			const component = fs.readFileSync(path.join(dir, 'charts', `${key}.svelte`), 'utf8');
			if (!/<ChartGraphic\b/.test(component)) {
				error(
					slug,
					`charts/${key}.svelte does not use <ChartGraphic> — wrap its drawn parts ` +
						`(SVGs, images, legends, labels) in it, leaving any controls outside`
				);
			}
		}

		for (const field of REQUIRED_CHART) {
			if (!chart[field]) error(slug, `chart "${key}" is missing "${field}"`);
		}

		// `description` is optional and not checked: whether a chart needs more
		// than its alt, note and the post's text is a judgment for review (see
		// docs/visualization-review-checklist.md), not something a script can tell.

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

		for (const width of chart.widths ?? []) {
			if (!CORE_WIDTHS.includes(width)) {
				warn(
					slug,
					`chart "${key}" has width ${width}, which is not one of the core widths (${CORE_WIDTHS.join(', ')})`
				);
			}
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

	// Posts are reported by slug; links and site-wide checks already carry a
	// full label ("links/<slug>", "(site)").
	const label = (key) => (key.startsWith('links/') || key.startsWith('(') ? key : `posts/${key}`);

	for (const key of [...new Set(problems.map((p) => p.post))].sort()) {
		console.log(`\n${label(key)}`);
		for (const { level, message } of problems.filter((p) => p.post === key)) {
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
		checkVersions(slug, meta);
		checkImages(slug);
		checkCard(slug, path.join(postsDir, slug), false);
	}

	const linkMetas = checkLinks();
	const linkSlugs = Object.keys(linkMetas);

	for (const slug of slugs) if (metas[slug]) checkProject(slug, metas[slug], linkMetas);
	for (const [slug, meta] of Object.entries(linkMetas)) checkProject(`links/${slug}`, meta, linkMetas);

	// One name space across both folders: a link is ported by moving its folder
	// into posts/, and the home page identifies items by folder name.
	for (const slug of linkSlugs.filter((s) => slugs.includes(s))) {
		error(`links/${slug}`, `is also a post (posts/${slug}) — remove the link once a post replaces it`);
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

	// A repeated place would be offered twice in the home page's geography filter.
	for (const place of GEOGRAPHY.filter((p, i) => GEOGRAPHY.indexOf(p) !== i)) {
		error('(site)', `"${place}" is listed more than once in GEOGRAPHY in src/lib/tags.js`);
	}

	// Every tag is drawn as an icon above the title of any post that uses it, so
	// a tag added to the list without one would leave an empty circle.
	for (const [tag, icon] of Object.entries(TAGS)) {
		// An SVG path always starts with a moveto: M, or m for relative.
		if (typeof icon !== 'string' || !/^\s*[Mm]/.test(icon)) {
			error('(site)', `tag "${tag}" in src/lib/tags.js has no icon — add its SVG path (see the comment above TAGS)`);
		}
	}

	if (problems.length === 0) {
		const chartCount = slugs.reduce((n, s) => n + Object.keys(posts[s]?.charts ?? {}).length, 0);
		console.log(`${slugs.length} post(s), ${chartCount} chart(s), ${linkSlugs.length} link(s) — no problems found.`);
		return;
	}

	if (report(strict)) process.exit(1);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
