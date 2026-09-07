// Quantises hand-made PNGs — the base images that charts draw on top of, made
// in QGIS/Inkscape/GIMP and dropped into posts/{slug}/images/.
//
// Usage:
//   npm run optimize-pngs -- --post <slug> [--accept]
//   npm run optimize-pngs -- --path <file-or-dir> [--accept]
//
// Two passes on purpose. The first writes a candidate next to each original
// ({name}-opt.png) and changes nothing else; you open it and check the parts
// quantising puts at risk — thin lines, small dots, small text. The second,
// with --accept, moves the candidate you just looked at over the original and
// removes the candidate.
//
// Unlike the chart exports in export-png.js, these files can't be regenerated
// from this repo — the QGIS project lives in the pipeline repo — so nothing is
// overwritten without a person having seen the replacement first.
//
// There is deliberately no --all. Scoping to one post keeps the candidates to
// a handful you'll actually look at, rather than dozens across the archive
// that get accepted unread.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { detectEngine, formatBytes, inspectPng, quantizePng } from './lib/png.js';

const rootDir = fileURLToPath(new URL('..', import.meta.url));
const SUFFIX = '-opt';

function parseArgs(argv) {
	const args = { post: null, path: null, accept: false };
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === '--post') args.post = argv[++i];
		else if (arg === '--path') args.path = argv[++i];
		else if (arg === '--accept') args.accept = true;
	}
	return args;
}

function usageError(message) {
	console.error(`Error: ${message}\n`);
	console.error('Usage:');
	console.error('  npm run optimize-pngs -- --post <slug> [--accept]');
	console.error('  npm run optimize-pngs -- --path <file-or-dir> [--accept]');
	process.exit(1);
}

function candidateFor(file) {
	const dir = path.dirname(file);
	return path.join(dir, `${path.basename(file, '.png')}${SUFFIX}.png`);
}

/** Every .png under `target`, ignoring the candidates this script writes. */
function collect(target) {
	const stat = fs.statSync(target);
	if (stat.isFile()) return target.endsWith('.png') ? [target] : [];

	return fs
		.readdirSync(target, { withFileTypes: true })
		.flatMap((entry) => {
			const full = path.join(target, entry.name);
			if (entry.isDirectory()) return collect(full);
			return entry.name.endsWith('.png') ? [full] : [];
		})
		.filter((f) => !path.basename(f, '.png').endsWith(SUFFIX))
		.sort();
}

function resolveTarget(args) {
	if (args.post) {
		const dir = path.join(rootDir, 'posts', args.post, 'images');
		if (!fs.existsSync(dir)) {
			usageError(`no images folder for post "${args.post}" (looked in posts/${args.post}/images)`);
		}
		return dir;
	}

	const target = path.resolve(rootDir, args.path);
	if (!fs.existsSync(target)) usageError(`no such file or directory: ${args.path}`);
	return target;
}

function rel(file) {
	const relative = path.relative(rootDir, file);
	// --path can point outside the repo, where a relative path is just noise.
	return relative.startsWith('..') ? file : relative;
}

/** Move each reviewed candidate over its original, keeping the original's name
 *  so nothing that imports it has to change. */
function accept(files) {
	let accepted = 0;
	let saved = 0;

	for (const file of files) {
		const candidate = candidateFor(file);
		if (!fs.existsSync(candidate)) continue;

		const before = fs.statSync(file).size;
		const after = fs.statSync(candidate).size;
		fs.renameSync(candidate, file);
		accepted++;
		saved += before - after;

		console.log(`accepted: ${rel(file)}  (${formatBytes(before)} -> ${formatBytes(after)})`);
	}

	if (accepted === 0) {
		console.log('No candidates found. Run without --accept first, then review them.');
		return;
	}
	console.log(`\n${accepted} file(s) accepted, ${formatBytes(saved)} saved.`);
}

/** Write a candidate beside each file that would benefit, and report. */
async function review(files) {
	let candidates = 0;
	let skipped = 0;
	let rejected = 0;

	for (const file of files) {
		const info = inspectPng(file);

		if (info.isPalette) {
			skipped++;
			continue;
		}

		const candidate = candidateFor(file);
		const result = await quantizePng(file, { out: candidate });

		if (!result.applied) {
			rejected++;
			console.log(`  ${rel(file)}`);
			console.log(`    ${formatBytes(info.bytes)} — left alone: ${result.reason}\n`);
			continue;
		}

		candidates++;
		const pct = Math.round((100 * result.after) / result.before);
		// `checked` is how many colours covered enough of the image to be worth
		// verifying. Zero means the guard had nothing to test — true of photos and
		// noise, where every colour is a sliver — so the review matters more, not less.
		const verdict =
			result.checked === 0
				? 'no colour covers enough area to verify — check this one closely'
				: `worst shift ${result.drift} across ${result.checked} significant colour(s)`;

		console.log(`  ${rel(file)}`);
		console.log(
			`    ${formatBytes(result.before)} -> ${formatBytes(result.after)} (${pct}%), ${verdict}`
		);
		console.log(`    candidate: ${path.basename(candidate)}\n`);
	}

	if (skipped) console.log(`${skipped} file(s) already quantised, skipped.`);
	if (rejected) console.log(`${rejected} file(s) left as full colour (see reasons above).`);

	if (candidates === 0) {
		console.log('Nothing to review.');
		return;
	}

	console.log(
		`\n${candidates} candidate(s) written. Open them and check the thin lines,\n` +
			'small dots, and small text — those are what quantising loses first.\n' +
			'Then re-run the same command with --accept.'
	);
}

async function main() {
	const args = parseArgs(process.argv.slice(2));

	if (!args.post && !args.path) usageError('specify --post <slug> or --path <file-or-dir>');
	if (args.post && args.path) usageError('use --post or --path, not both');

	const target = resolveTarget(args);
	const files = collect(target);

	if (files.length === 0) usageError(`no PNGs found in ${rel(target)}`);

	if (args.accept) {
		accept(files);
		return;
	}

	const engine = await detectEngine();
	if (!engine) {
		console.error('No quantiser found.');
		console.error('  Install one with:  sudo apt install pngquant   (or: brew install pngquant)');
		process.exit(1);
	}

	console.log(`Quantising with ${engine}. Reviewing ${files.length} file(s) in ${rel(target)}:\n`);
	await review(files);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
