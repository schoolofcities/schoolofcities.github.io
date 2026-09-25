<script>
	import { tick } from 'svelte';
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import sofcMark from './images/sofc-dot-logo.svg';
	import Dialog from './Dialog.svelte';
	import CopyIcon from './CopyIcon.svelte';
	import { BASE_PATH, SITE_ORIGIN } from './site.js';
	import { formatAuthorList, licenseLabel, licenseUrl } from './meta.js';

	let { meta, children, authors, license, chartKey, standalone } = $props();

	// meta.license (set per-chart in charts.js) overrides the post-level default —
	// same override pattern as meta.graphicVerb ?? 'created' below.
	const chartLicense = $derived(meta.license ?? license);

	// meta.authors (set per-chart in charts.js) overrides the post-level author
	// list, for posts where not every listed author worked on every chart.
	const chartAuthors = $derived(meta.authors ?? authors);


	// Derived from the current route's slug so a folder rename (which changes the
	// slug) updates these links everywhere automatically, with nothing hardcoded.
	const slug = $derived(page.params.slug);
	const postRoute = $derived(slug ? `/posts/${slug}/` : undefined);
	const chartRoute = $derived(slug && chartKey ? `/posts/${slug}/figures/${chartKey}/` : undefined);

	// For links inside the page, SvelteKit's `base` — which under the default
	// paths.relative is a relative prefix like '../../..', so a built page keeps
	// working wherever it ends up being served from.
	const postPath = $derived(postRoute ? `${base}${postRoute}` : undefined);

	// Everything offered in the Download menu, resolved in charts.js against what
	// actually exists on disk (see $lib/downloads.js). Either list can be empty:
	// many maps have no single tabular file worth publishing, and a chart that
	// hasn't been through `npm run export-pngs` yet has no images.
	const downloads = $derived(meta.downloads ?? []);
	const images = $derived(meta.images ?? []);
	const hasDownloads = $derived(downloads.length + images.length > 0);


	// widthSnapCss, embedWidth, and the PNG download list below all assume smallest-to-largest
	// order — sorted here defensively in case a chart's meta.widths isn't authored that way.
	const sortedWidths = $derived(meta.widths ? [...meta.widths].sort((a, b) => a - b) : undefined);

	const uid = $props.id();
	const downloadId = $derived(`download-${uid}`);
	const shareId = $derived(`share-${uid}`);

	// Frame padding (2 x 20px) plus border (2 x 1px): what separates a snapped
	// width, which is the frame's outer width, from the graphic's own width.
	const FRAME_INSET = 42;

	// Sets --graphic-w, the exact width the graphic is drawn at, per viewport
	// step. The frame itself stays fluid (see .chart-frame.snapped) so its text
	// and buttons can reflow; only the graphic holds this width, and scrolls when
	// the frame is narrower than it.
	function widthSnapCss(id, widths) {
		if (!widths || widths.length === 0) return '';
		const [smallest, ...rest] = widths;
		let css = `#chart-frame-${id} { --graphic-w: ${smallest - FRAME_INSET}px; }`;
		for (const w of rest) {
			css += `@media (min-width: ${w}px) { #chart-frame-${id} { --graphic-w: ${w - FRAME_INSET}px; } }`;
		}
		return css;
	}

	async function copyText(text, onDone) {
		try {
			await navigator.clipboard.writeText(text);
			onDone(true);
			setTimeout(() => onDone(false), 1500);
		} catch {
			console.error('Could not copy to clipboard — select the text and copy manually.');
		}
	}

	let shareDialog = $state();
	let chartCopied = $state(false);
	let postCopied = $state(false);
	let embedCopied = $state(false);

	// Origin is a build-time constant so these render into the HTML, then gets
	// replaced by the real one on hydration — see $lib/site.js. Everything the
	// Share dialog shows is therefore present and correct with scripting off;
	// only the copy buttons need JavaScript, and CSS hides those when it's absent.
	// For links people copy out, the literal BASE_PATH — a relative prefix would
	// be meaningless once pasted somewhere else.
	let origin = $state(SITE_ORIGIN);
	const chartLink = $derived(chartRoute && origin ? `${origin}${BASE_PATH}${chartRoute}` : '');
	const postLink = $derived(postRoute && origin ? `${origin}${BASE_PATH}${postRoute}` : '');

	$effect(() => {
		origin = window.location.origin;
	});

	// Width the iframe embed is set to (the largest configured size).
	const embedWidth = $derived(meta.embed?.width ?? sortedWidths?.[sortedWidths.length - 1] ?? 680);

	// Height comes from export-png.js, which measured this exact frame in a real
	// browser at embedWidth (see its embed.json). It has to be measured rather
	// than derived — some charts wrap to a new row instead of scaling as a fixed
	// ratio of width — and doing it at export time is what lets the snippet be
	// prerendered. Charts not yet exported fall back to measuring on first open,
	// which needs JavaScript.
	let measuredHeight = $state();
	const embedHeight = $derived(meta.embed?.height ?? measuredHeight);

	// Needs a real origin as well as a height: an iframe with a relative src
	// resolves against whichever site it was pasted into, so a snippet without
	// one is worse than no snippet. Always available once JS runs.
	const embedSnippet = $derived(
		embedHeight && origin
			? `<iframe src="${chartLink}" width="${embedWidth}" height="${embedHeight}" style="border: none;" loading="lazy" title="${meta.title}"></iframe>`
			: ''
	);

	// Only mounted when there's no recorded height to use.
	let measureNode = $state();
	let measureMounted = $state(false);

	async function openShareDialog() {
		chartCopied = false;
		postCopied = false;
		embedCopied = false;

		if (!meta.embed) {
			measureMounted = true;
			await tick();
			measuredHeight = measureNode.offsetHeight;
		}

		// The button's `command` attribute already opened it wherever that's
		// supported; this covers browsers where it isn't.
		if (!shareDialog.open) shareDialog.showModal();
	}

	// Sets --shade-start / --shade-end on the scroller's wrapper: 1 on a side that
	// has more graphic to scroll to, 0 otherwise. The edge shadows in the styles
	// read them. Done here rather than with scroll-driven CSS animations, which
	// not every browser supports yet; with scripting off there is simply no
	// shadow and the scrollbar remains.
	function trackScroll(node) {
		const wrap = node.parentElement;
		const update = () => {
			const max = node.scrollWidth - node.clientWidth;
			wrap.style.setProperty('--shade-start', node.scrollLeft > 2 ? '1' : '0');
			wrap.style.setProperty('--shade-end', max > 1 && node.scrollLeft < max - 2 ? '1' : '0');
		};
		update();
		node.addEventListener('scroll', update, { passive: true });
		const observer = new ResizeObserver(update);
		observer.observe(node);
		if (node.firstElementChild) observer.observe(node.firstElementChild);
		return {
			destroy() {
				node.removeEventListener('scroll', update);
				observer.disconnect();
			}
		};
	}

	// Download dialog
	let downloadDialog = $state();

	function openDownloadDialog() {
		if (!downloadDialog.open) downloadDialog.showModal();
	}
</script>

<svelte:head>
	{#if sortedWidths}
		{@html `<style>${widthSnapCss(uid, sortedWidths)}</style>`}
	{/if}
	<!-- Writing to the clipboard has no HTML equivalent — it's gated behind a
	     scripted, user-initiated call for security — so with scripting off the
	     copy buttons can't work. A <noscript> stylesheet hides them, leaving the
	     text selectable in its field rather than a button that does nothing. -->
	<!-- Two classes, not one: svelte:head content is emitted above the stylesheet
	     links, so at equal specificity the sheet's `display: flex` would win on
	     source order. -->
	<noscript>
		<style>
			.app-dialog .dialog-action {
				display: none;
			}
		</style>
	</noscript>
</svelte:head>

<div
	id="chart-frame-{uid}"
	class="chart-frame"
	class:standalone
	class:snapped={sortedWidths}
	style={sortedWidths ? '' : 'max-width: 680px;'}
>
	{@render frameContent()}
</div>

{#if measureMounted}
	<div
		bind:this={measureNode}
		class="chart-frame chart-measure"
		style="width: {embedWidth}px;{sortedWidths ? ` --graphic-w: ${embedWidth - FRAME_INSET}px;` : ''}"
	>
		{@render frameContent()}
	</div>
{/if}

{#snippet frameContent()}
	<!-- Decorative: branding, not chart content. The credit line below names the
	     authors, so a real alt here just prefixes every figure with "School of
	     Cities, image" before its title. -->
	<img src={sofcMark} alt="" class="chart-mark" />

	<h3 class="chart-title">{meta.title}</h3>

	{#if meta.subtitle}
		<p class="chart-subtitle">{meta.subtitle}</p>
	{/if}

	<!-- tabindex/role/aria-label: this scrolls horizontally whenever the frame is
	     narrower than the graphic (charts with a fixed meta.widths, e.g. the
	     1080px maps), and a scroll container that is not focusable cannot be
	     scrolled by keyboard at all — WCAG 2.1.1. Focusable unconditionally, since
	     whether it actually overflows depends on the viewport. -->
	<div class="chart-scroll-wrap">
		<div class="chart-scroll" tabindex="0" role="group" aria-label={meta.title} use:trackScroll>
			<div class="chart-body" role="img" aria-label={meta.alt}>
				{#if children}
					{@render children()}
				{:else}
					<div class="chart-placeholder"></div>
				{/if}
			</div>
		</div>
	</div>

	<div class="chart-footer">
		<div class="chart-source-group">
			<p class="chart-source"><strong>Data source:</strong> {meta.source}</p>
			{#if meta.note}
				<p class="chart-source"><strong>Note:</strong> {meta.note}</p>
			{/if}
			{#if chartAuthors && chartAuthors.length > 0}
				<p class="chart-credit">Graphic {meta.graphicVerb ?? 'created'} by {formatAuthorList(chartAuthors)}</p>
			{/if}
		</div>

		<div class="chart-buttons">
			{#if chartLicense || (standalone && postPath)}
				<div class="chart-buttons-top">
					{#if chartLicense}
						<p class="chart-source chart-license-inline">
							{#if licenseUrl(chartLicense)}
								<a href={licenseUrl(chartLicense)} target="_blank" rel="noopener noreferrer"
									>{licenseLabel(chartLicense)}</a
								>
							{:else}
								{chartLicense}
							{/if}
						</p>
					{/if}
					{#if standalone && postPath}
						<a class="chart-read-more" href={postPath} target="_blank" rel="noopener noreferrer"
							>Read more</a
						>
					{/if}
				</div>
			{/if}
			<div class="chart-action-buttons">
				<button
					type="button"
					class="chart-download-button"
					command="show-modal"
					commandfor={downloadId}
					onclick={openDownloadDialog}
					disabled={!hasDownloads}>Download</button
				>
				{#if postPath && chartRoute}
					<button
						type="button"
						class="chart-share-button"
						command="show-modal"
						commandfor={shareId}
						onclick={openShareDialog}>Share</button
					>
				{:else}
					<button type="button" class="chart-share-button" disabled>Share</button>
				{/if}
			</div>
		</div>
	</div>
{/snippet}

{#snippet dataIcon()}
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		width="16"
		height="16"
	>
		<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
		<polyline points="14 2 14 8 20 8"></polyline>
		<line x1="16" y1="13" x2="8" y2="13"></line>
		<line x1="16" y1="17" x2="8" y2="17"></line>
	</svg>
{/snippet}

{#snippet imageIcon()}
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		width="16"
		height="16"
	>
		<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
		<circle cx="8.5" cy="8.5" r="1.5"></circle>
		<polyline points="21 15 16 10 5 21"></polyline>
	</svg>
{/snippet}

<Dialog id={shareId} title="Share" bind:dialogRef={shareDialog}>
	<div class="dialog-option">
		<p class="dialog-instructions">Link to this chart</p>
		<div class="dialog-row">
			<input class="dialog-code" readonly value={chartLink} />
			<button
				type="button"
				class="dialog-action"
				aria-label={chartCopied ? 'Copied' : 'Copy link'}
				title={chartCopied ? 'Copied' : 'Copy link'}
				onclick={() => copyText(chartLink, (v) => (chartCopied = v))}
			>
				<CopyIcon copied={chartCopied} />
			</button>
		</div>
	</div>
	<div class="dialog-option">
		<p class="dialog-instructions">Link to the full post</p>
		<div class="dialog-row">
			<input class="dialog-code" readonly value={postLink} />
			<button
				type="button"
				class="dialog-action"
				aria-label={postCopied ? 'Copied' : 'Copy link'}
				title={postCopied ? 'Copied' : 'Copy link'}
				onclick={() => copyText(postLink, (v) => (postCopied = v))}
			>
				<CopyIcon copied={postCopied} />
			</button>
		</div>
	</div>
	{#if embedSnippet}
	<div class="dialog-option">
		<p class="dialog-instructions">
			Embed (you may need to adjust the height depending on your site's width).
		</p>
		<div class="dialog-row">
			<textarea class="dialog-code" readonly rows="4" value={embedSnippet}></textarea>
			<button
				type="button"
				class="dialog-action"
				aria-label={embedCopied ? 'Copied' : 'Copy code'}
				title={embedCopied ? 'Copied' : 'Copy code'}
				onclick={() => copyText(embedSnippet, (v) => (embedCopied = v))}
			>
				<CopyIcon copied={embedCopied} />
			</button>
		</div>
	</div>
	{/if}
</Dialog>

<Dialog id={downloadId} title="Download" bind:dialogRef={downloadDialog}>
	<div class="dialog-download-list">
		{#each downloads as file}
			<a class="dialog-download-option" href={file.url} download={file.file}>
				{@render dataIcon()}
				<!-- One file can say what it is by type; several need their own names
				     to tell them apart. -->
				<span>{downloads.length > 1 ? file.file : `Data (.${file.type})`}</span>
			</a>
		{/each}
		{#each images as image}
			<a class="dialog-download-option" href={image.url} download={image.file}>
				{@render imageIcon()}
				<span>Image, {image.width}px wide (.png)</span>
			</a>
		{/each}
	</div>
</Dialog>

<style>
	/* Only the graphic scrolls; the title, subtitle and footer stay at the
	   frame's width and reflow through the container queries below. The negative
	   margin and matching padding (the frame's 20px padding plus its 1px border)
	   extend the scroll area to the frame's outer edge, so a graphic that bleeds
	   there with a negative margin of its own (demographics-grid's -21px) isn't
	   clipped, and a scrolling graphic runs right to the frame's border. */
	.chart-scroll-wrap {
		position: relative;
		margin: 0 -21px;
	}

	.chart-scroll {
		padding: 0 21px;
		overflow-x: auto;
		/* Where the browser draws a classic scrollbar (desktop), make it thin but
		   visible. Phones use overlay scrollbars that only appear while
		   scrolling, which is what the edge shadows below are for. */
		scrollbar-width: thin;
		scrollbar-color: var(--brandGray55) var(--brandGray10);
	}

	/* Edge shadows: a soft shade on whichever side has more graphic to scroll to,
	   fading out as that end is reached. They're siblings of the scroller, not
	   its background, because a graphic with its own opaque background (a map)
	   would paint straight over a background shadow. trackScroll sets the two
	   custom properties; without it both stay at 0 and nothing shows. */
	.chart-scroll-wrap::before,
	.chart-scroll-wrap::after {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		width: 10px;
		pointer-events: none;
		z-index: 1;
		transition: opacity 0.15s;
	}

	.chart-scroll-wrap::before {
		left: 0;
		opacity: var(--shade-start, 0);
		background: linear-gradient(
			to right,
			color-mix(in srgb, var(--brandDarkBlue) 18%, transparent),
			transparent
		);
	}

	.chart-scroll-wrap::after {
		right: 0;
		opacity: var(--shade-end, 0);
		background: linear-gradient(
			to left,
			color-mix(in srgb, var(--brandDarkBlue) 18%, transparent),
			transparent
		);
	}

	.chart-frame {
		background-color: var(--brandWhite);
		box-sizing: border-box;
		container-type: inline-size;
		position: relative;
		margin: 40px auto;
		padding: 20px;
		border: solid 1px var(--brandGray05);
		border-top: solid 3px var(--brandDarkBlue);
		border-bottom: solid 1px var(--brandDarkBlue);
	}

	.chart-frame.standalone {
		margin: 0 auto;
	}

	/* Charts with a fixed meta.widths: the frame takes the space it's given, up
	   to the snapped width for this viewport (--graphic-w plus the frame inset,
	   set by widthSnapCss). Narrower than that, the frame shrinks and the
	   graphic scrolls inside it. */
	.chart-frame.snapped {
		width: 100%;
		max-width: calc(var(--graphic-w) + 42px);
	}

	.chart-measure {
		position: absolute;
		left: -9999px;
		top: 0;
		margin: 0;
		visibility: hidden;
	}

	.chart-mark {
		position: absolute;
		top: 20px;
		right: 20px;
		height: 32px;
		width: auto;
	}

	.chart-title {
		font-family: TradeGothicBold;
		font-weight: normal;
		font-size: 25px;
		/* max-width: 720px; */
		color: var(--brandDarkBlue);
		margin: 0 0 12px 0;
		padding-right: 60px;
	}

	.chart-subtitle {
		font-family: OpenSans;
		font-weight: normal;
		font-size: 16px;
		line-height: 22px;
		color: var(--brandGray90);
		padding-bottom: 5px;
		border-bottom: solid 1px var(--brandYellow);
		margin: 0 0 16px 0;
	}

	/* The container charts query against (@container in a chart's own styles),
	   at the exact snapped width rather than the frame's, so a chart lays out
	   the same however narrow the frame is. No --graphic-w (charts without
	   meta.widths) just fills the frame. */
	.chart-body {
		container-type: inline-size;
		width: var(--graphic-w, auto);
		margin-bottom: 15px;
	}

	.chart-placeholder {
		height: 50px;
		background-color: var(--brandGray10);
	}

	.chart-footer {
		display: flex;
		flex-direction: column;
		gap: 14px;
		border-top: solid 1px var(--brandGray10);
		padding-top: 8px;
	}

	.chart-footer > * {
		width: 100%;
	}

	/* The wrapper divs exist only to group license+Read more and Download+Share
	   in the markup (so each pair can be reasoned about together); `contents`
	   removes them from layout entirely so their children sit directly in
	   .chart-buttons's own grid/flex — one shared set of tracks at narrow
	   widths, and the original flat row again at wider ones. */
	.chart-buttons-top,
	.chart-action-buttons {
		display: contents;
	}

	/* Narrow view: a plain 2-column grid, rather than two independent flex
	   rows, so Read more/license and Download/Share resolve to the same
	   column widths — otherwise each row sizes itself off only its own two
	   items and the columns drift out of alignment between rows. */
	.chart-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	.chart-license-inline {
		grid-column: 1 / -1;
		grid-row: 1;
	}

	.chart-read-more {
		grid-column: 1;
		grid-row: 1;
	}

	.chart-download-button {
		grid-column: 1;
		grid-row: 2;
	}

	.chart-share-button {
		grid-column: 2;
		grid-row: 2;
	}

	/* Only when Read more is present does the license line share row 1 with
	   it instead of spanning the row alone — moved to column 2, above Share,
	   and right-aligned to match. */
	.chart-buttons:has(.chart-read-more) .chart-license-inline {
		grid-column: 2;
		text-align: right;
	}

	/* 498px, not 540px: container queries measure .chart-frame's content-box,
	   which is its 540px outer width minus its own 40px padding + 2px border. */
	@container (min-width: 498px) {
		.chart-buttons {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: flex-end;
		}

		.chart-buttons:has(.chart-read-more) .chart-license-inline {
			text-align: left;
		}
	}

	/* 678px, not 720px: container queries measure .chart-frame's content-box,
	   which is its 720px outer width (the smallest core width above 540 — see
	   scripts/validate.js) minus its own 40px padding + 2px border. Using the
	   adjusted value means every chart at 720px or wider gets the same
	   source-text-left / buttons-right split, not just the 1080px+ ones. */
	@container (min-width: 678px) {
		.chart-footer {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			gap: 10px;
		}

		.chart-source-group {
			flex: 1 1 360px;
			max-width: 360px;
			min-width: 0;
		}

		.chart-buttons {
			display: flex;
			flex: 0 0 360px;
			width: 360px;
			justify-content: flex-end;
		}
	}

	/* 1038px, not 1080px: same content-box adjustment as above, for the next
	   core width up. The text column gets more room to breathe once there's
	   this much extra space next to the fixed 360px button column. */
	@container (min-width: 1038px) {
		.chart-source-group {
			flex-basis: 540px;
			max-width: 540px;
		}
	}

	.chart-source-group {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.chart-source,
	.chart-credit {
		font-family: OpenSans;
		font-weight: normal;
		font-size: 12px;
		line-height: 16px;
		color: var(--brandGray55);
		margin: 0;
		padding: 0;
	}

	/* 318px, not 360px: container queries measure .chart-frame's content-box,
	   which is its 360px outer width (the smallest snap width configured for
	   this chart) minus its own 40px padding + 2px border. */
	@container (max-width: 400px) {
		.chart-source,
		.chart-credit {
			font-size: 11px;
		}
	}

	.chart-source strong {
		font-family: OpenSansBold;
		font-weight: normal;
	}

	.chart-buttons button,
	.chart-buttons a {
		font-family: OpenSans;
		font-size: 13px;
		color: var(--brandGray70);
		background: none;
		border: solid 1px var(--brandGray20);
		border-radius: 4px;
		padding: 6px 12px;
		text-decoration: none;
		box-sizing: border-box;
	}

	.chart-buttons button:disabled {
		cursor: not-allowed;
	}

	.chart-buttons a,
	.chart-buttons button:not(:disabled) {
		cursor: pointer;
		text-align: center;
	}

	.chart-buttons a:hover,
	.chart-buttons button:not(:disabled):hover {
		background-color: var(--brandGray05);
	}

	/* Overrides .chart-buttons a's button look — same specificity, so this must
	   come after it in source order to win. Plain text, still a real link. */
	.chart-license-inline a {
		color: inherit;
		background: none;
		border: none;
		border-radius: 0;
		padding: 0;
		text-decoration: none;
		font-family: inherit;
		font-size: inherit;
	}

	.chart-license-inline a:hover {
		background: none;
	}

	/* Shared dialog-content styles (.dialog-instructions, .dialog-code, .dialog-action,
	   .dialog-option, .dialog-row) live in Dialog.svelte since they're used by content
	   authored in other components too (see Title.svelte's Cite dialog). */

	.dialog-download-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.dialog-download-option {
		display: flex;
		align-items: center;
		gap: 10px;
		font-family: OpenSans;
		font-size: 12px;
		color: var(--brandGray90);
		background: none;
		border: solid 1px var(--brandGray20);
		border-radius: 4px;
		padding: 9px 14px;
		text-decoration: none;
		box-sizing: border-box;
		cursor: pointer;
	}

	.dialog-download-option:hover {
		background-color: var(--brandGray05);
	}
</style>
