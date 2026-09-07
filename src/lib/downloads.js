// Turns each chart's `data` and `widths` declarations into the concrete list of
// files ChartFrame offers in its Download menu.
//
// The globs themselves stay in each post's charts.js — import.meta.glob only
// resolves patterns relative to the file it appears in — but the logic that
// interprets their results lives here so it isn't copied into every post.
//
// Nothing that doesn't exist on disk is ever offered. A chart whose `data` is
// absent (many maps have no single tabular file worth publishing) simply has no
// data rows, and a chart that was never exported has no image rows. That is why
// this filters on `url` rather than trusting the declaration.

/**
 * Newest URL for each exported PNG filename.
 *
 * Export folders are `published/{date}/`, so an ISO-date sort ascending means a
 * later version's file overwrites an earlier one of the same name — the newest
 * snapshot wins without anyone re-deriving `lastUpdated` from the changelog and
 * having to agree with what export-png.js wrote.
 */
function newestByName(pngUrls) {
	const newest = {};
	for (const path of Object.keys(pngUrls).sort()) {
		newest[path.split('/').pop()] = pngUrls[path];
	}
	return newest;
}

/**
 * Attach `downloads` and `images` to every chart in `charts`.
 *
 * `data` may be a single filename, an array of them, or absent. The extension
 * is the file type — there is no separate `type` field to keep in sync.
 */
export function resolveDownloads(
	charts,
	{ dataUrls, pngUrls = {}, embedMeta = {} },
	{ scale = 2 } = {}
) {
	const images = newestByName(pngUrls);

	// Same newest-wins rule as the images: later version folders sort last.
	const embeds = {};
	for (const path of Object.keys(embedMeta).sort()) {
		Object.assign(embeds, embedMeta[path]);
	}

	for (const [key, chart] of Object.entries(charts)) {
		// Recorded by export-png.js from a real layout engine. Absent until a
		// chart has been exported, in which case ChartFrame measures at runtime.
		chart.embed = embeds[key];
		chart.downloads = [chart.data ?? []]
			.flat()
			.filter(Boolean)
			.map((file) => ({
				file,
				url: dataUrls[`./data/${file}`],
				// "travel-times.geojson" -> "geojson"
				type: file.split('.').pop()
			}))
			.filter((d) => d.url);

		// Files are named by their real pixel width, which is the design width in
		// `widths` multiplied by the export scale — see scripts/export-png.js.
		chart.images = (chart.widths ?? [])
			.map((width) => width * scale)
			.sort((a, b) => a - b)
			.map((width) => ({ width, file: `${key}-${width}.png`, url: images[`${key}-${width}.png`] }))
			.filter((i) => i.url);
	}

	return charts;
}
