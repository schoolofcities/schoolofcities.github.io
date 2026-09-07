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


	// Derived from the current route's slug so a folder rename (which changes the
	// slug) updates these links everywhere automatically, with nothing hardcoded.
	const slug = $derived(page.params.slug);
	const postRoute = $derived(slug ? `/posts/${slug}/` : undefined);
	const chartRoute = $derived(slug && chartKey ? `/posts/${slug}/figures/${chartKey}/` : undefined);

	// For links inside the page, SvelteKit's `base` — which under the default
	// paths.relative is a relative prefix like '../../..', so a built page keeps
	// working wherever it ends up being served from.
	const postPath = $derived(postRoute ? `${base}${postRoute}` : undefined);
	const embedPath = $derived(chartRoute ? `${base}${chartRoute}` : undefined);

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

	function widthSnapCss(id, widths) {
		if (!widths || widths.length === 0) return '';
		const [smallest, ...rest] = widths;
		let css = `#chart-frame-${id} { width: ${smallest}px; }`;
		for (const w of rest) {
			css += `@media (min-width: ${w}px) { #chart-frame-${id} { width: ${w}px; } }`;
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

<div class="chart-scroll">
	<div
		id="chart-frame-{uid}"
		class="chart-frame"
		class:standalone
		style={sortedWidths ? '' : 'max-width: 680px;'}
	>
		{@render frameContent()}
	</div>
</div>

{#if measureMounted}
	<div bind:this={measureNode} class="chart-frame chart-measure" style="width: {embedWidth}px;">
		{@render frameContent()}
	</div>
{/if}

{#snippet frameContent()}
	<img src={sofcMark} alt="School of Cities" class="chart-mark" />

	<h3 class="chart-title">{meta.title}</h3>

	{#if meta.subtitle}
		<p class="chart-subtitle">{meta.subtitle}</p>
	{/if}

	<div class="chart-body" role="img" aria-label={meta.alt}>
		{#if children}
			{@render children()}
		{:else}
			<div class="chart-placeholder"></div>
		{/if}
	</div>

	<div class="chart-footer">
		<div class="chart-source-group">
			<p class="chart-source"><strong>Data source:</strong> {meta.source}</p>
			{#if meta.note}
				<p class="chart-source"><strong>Note:</strong> {meta.note}</p>
			{/if}
			{#if authors && authors.length > 0}
				<p class="chart-credit">Graphic {meta.graphicVerb ?? 'created'} by {formatAuthorList(authors)}</p>
			{/if}
		</div>

		<div class="chart-buttons">
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
				<a href={postPath} target="_blank" rel="noopener noreferrer">Read more</a>
			{/if}
			<button
				type="button"
				command="show-modal"
				commandfor={downloadId}
				onclick={openDownloadDialog}
				disabled={!hasDownloads}>Download</button
			>
			{#if postPath && embedPath}
				<button
					type="button"
					command="show-modal"
					commandfor={shareId}
					onclick={openShareDialog}>Share</button
				>
			{:else}
				<button type="button" disabled>Share</button>
			{/if}
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
	.chart-scroll {
		max-width: 100%;
		overflow-x: auto;
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

	.chart-body {
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

	.chart-buttons {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	/* 498px, not 540px: container queries measure .chart-frame's content-box,
	   which is its 540px outer width minus its own 40px padding + 2px border. */
	@container (min-width: 498px) {
		.chart-buttons {
			display: flex;
			align-items: center;
		}
	}

	@container (min-width: 720px) {
		.chart-footer {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			gap: 10px;
		}

		.chart-source-group {
			flex: 1 1 360px;
			min-width: 0;
		}

		.chart-buttons {
			display: flex;
			flex: 0 0 360px;
			width: 360px;
			justify-content: flex-end;
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
