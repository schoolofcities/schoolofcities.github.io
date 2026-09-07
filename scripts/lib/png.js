// Shared PNG post-processing, used by export-png.js (and, later, by the
// optimizer for hand-made images and by validate.js's build gate).
//
// Quantising a PNG to a palette is the single biggest size win available on a
// flat-colour map or chart: it drops the file from 4 bytes/pixel to 1 before
// compression starts, and — more importantly — collapses anti-aliasing fringes
// onto a handful of indices, which is what lets DEFLATE find repeats at all.
// Measured on this repo's chart exports it removes ~44%, and on the library map
// it took 6.14 MB to 2.14 MB.
//
// It is also lossy, and what it loses first is thin, saturated, low-area
// features. A 1px transit line or a small dot covers few pixels, so a palette
// chosen by pixel population spends no entries on it. Dropping the library map
// to 32 colours turned its red transit lines grey — while *lowering* mean
// absolute error, because a few important pixels moving a long way is invisible
// to an average taken over five million of them. That is why the guard below
// measures per-colour drift on the colours that occupy real area, not MAE.

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const run = promisify(execFile);

// Colours covering at least this share of the image are treated as design
// colours that must survive. 0.05% is below the smallest deliberate element
// measured here (the library map's transit lines, at 0.37%) with room to spare.
const SIGNIFICANT_SHARE = 0.0005;

// Sum of |dR|+|dG|+|dB| (0-765) that a design colour is allowed to move.
// Calibrated against the library map, where the visible failure point sits
// well above the safe range: 256 colours drifts 12, 128 drifts 32, 64 drifts
// 97, and 32 drifts 137 (visibly wrong). 24 leaves headroom over the former
// without reaching the latter.
const MAX_DRIFT = 24;

// Guard against a pathological source where nearly every colour clears the
// share threshold; the dominant colours are the ones that matter.
const MAX_SIGNIFICANT = 64;

let enginePromise;

/**
 * Which quantiser is available, preferring pngquant: it weights colours
 * perceptually rather than purely by pixel count, so it protects exactly the
 * thin features the guard below is watching. ImageMagick is the fallback
 * because it ships preinstalled on GitHub's runners and on most desktops.
 */
export function detectEngine() {
	enginePromise ??= (async () => {
		for (const [engine, probe] of [
			['pngquant', ['--version']],
			['convert', ['--version']]
		]) {
			try {
				await run(engine, probe);
				return engine;
			} catch {
				// not installed; try the next one
			}
		}
		return null;
	})();
	return enginePromise;
}

// A 2160x2400 image is ~15 MB of raw RGB; leave generous headroom above that.
const RAW_BUFFER = 512 * 1024 * 1024;

/**
 * Exact colour histogram as a Map of packed 0xRRGGBB -> pixel count.
 *
 * Counted from raw pixels rather than ImageMagick's own `histogram:` output,
 * which silently approximates above a few thousand distinct colours — it
 * reduced a 111k-colour map to 256 entries in testing, which would have meant
 * measuring drift against an approximation of the thing being checked.
 */
async function histogram(file) {
	const { stdout } = await run('convert', [file, '-depth', '8', 'rgb:-'], {
		encoding: 'buffer',
		maxBuffer: RAW_BUFFER
	});

	const counts = new Map();
	for (let i = 0; i + 2 < stdout.length; i += 3) {
		const key = (stdout[i] << 16) | (stdout[i + 1] << 8) | stdout[i + 2];
		counts.set(key, (counts.get(key) ?? 0) + 1);
	}
	return { counts, total: Math.floor(stdout.length / 3) };
}

function drift(a, b) {
	return (
		Math.abs((a >> 16) - (b >> 16)) +
		Math.abs(((a >> 8) & 255) - ((b >> 8) & 255)) +
		Math.abs((a & 255) - (b & 255))
	);
}

function rgb(key) {
	return [key >> 16, (key >> 8) & 255, key & 255];
}

/**
 * Worst distance any significant source colour had to travel to reach its
 * nearest neighbour in the quantised image's palette. This is the number that
 * separated the good quantisations from the bad ones in testing; mean error
 * did not.
 */
function worstDrift(source, quantised) {
	const palette = [...quantised.counts.keys()];

	const significant = [...source.counts.entries()]
		.filter(([, count]) => count / source.total >= SIGNIFICANT_SHARE)
		.sort((a, b) => b[1] - a[1])
		.slice(0, MAX_SIGNIFICANT)
		.map(([key]) => key);

	let worst = 0;
	let culprit = null;
	for (const colour of significant) {
		// An exact match is by far the common case, so skip the scan for it.
		if (quantised.counts.has(colour)) continue;

		let nearest = Infinity;
		for (const entry of palette) nearest = Math.min(nearest, drift(colour, entry));
		if (nearest > worst) {
			worst = nearest;
			culprit = colour;
		}
	}
	return { worst, culprit, checked: significant.length };
}

async function writeQuantised(engine, input, output, colours) {
	if (engine === 'pngquant') {
		// --quality's lower bound makes pngquant refuse (non-zero exit, no output)
		// rather than write something bad, which is a second guard underneath ours.
		await run('pngquant', [
			`--quality=65-95`,
			'--strip',
			'--force',
			'--output',
			output,
			'--',
			input
		]);
	} else {
		await run('convert', [input, '-strip', '-colors', String(colours), output]);
	}
}

/**
 * Header facts about a PNG, read straight from IHDR with no external tool —
 * validate.js runs on every contributor's machine and in CI, so its check has
 * to work with nothing installed.
 */
export function inspectPng(file) {
	const buf = fs.readFileSync(file);
	if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error(`not a PNG: ${file}`);

	const width = buf.readUInt32BE(16);
	const height = buf.readUInt32BE(20);
	const colourType = buf[25];

	return {
		width,
		height,
		colourType,
		// 3 is the palette type; 0/2/4/6 all store full colour per pixel.
		isPalette: colourType === 3,
		bytes: buf.length,
		bytesPerPixel: buf.length / (width * height)
	};
}

/**
 * Quantise `file`, but only if every significant colour survives and the
 * result is actually smaller. Writes over `file` unless `out` names somewhere
 * else. Returns what happened; never throws for a rejected quantisation, since
 * keeping the original is a valid outcome.
 */
export async function quantizePng(file, { colours = 256, out } = {}) {
	const engine = await detectEngine();
	const before = fs.statSync(file).size;

	if (!engine) {
		return { applied: false, before, reason: 'no quantiser found (install pngquant)' };
	}

	const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'png-')), path.basename(file));

	try {
		try {
			await writeQuantised(engine, file, tmp, colours);
		} catch {
			// pngquant exits non-zero when it can't meet --quality; treat any
			// engine failure the same way, as "this image should stay as it is".
			return { applied: false, before, engine, reason: 'quantiser declined' };
		}

		const after = fs.statSync(tmp).size;
		if (after >= before) {
			return { applied: false, before, after, engine, reason: 'no size win' };
		}

		// If the check itself can't run, keep the original — an unverified
		// quantisation is not one to apply silently.
		let worst, culprit, checked;
		try {
			({ worst, culprit, checked } = worstDrift(await histogram(file), await histogram(tmp)));
		} catch (err) {
			return { applied: false, before, after, engine, reason: `could not verify (${err.code ?? err.message})` };
		}

		if (worst > MAX_DRIFT) {
			const colour = culprit === null ? 'a colour' : `rgb(${rgb(culprit).join(',')})`;
			return {
				applied: false,
				before,
				after,
				engine,
				reason: `${colour} would shift by ${worst} (limit ${MAX_DRIFT})`
			};
		}

		fs.copyFileSync(tmp, out ?? file);
		return { applied: true, before, after, engine, drift: worst, checked, path: out ?? file };
	} finally {
		fs.rmSync(path.dirname(tmp), { recursive: true, force: true });
	}
}

export function formatBytes(n) {
	return n >= 1048576 ? `${(n / 1048576).toFixed(2)} MB` : `${Math.round(n / 1024)} KB`;
}
