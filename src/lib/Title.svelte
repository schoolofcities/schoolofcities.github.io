<script>
	import { documentGroups, formatAuthorList, lastUpdated, licenseLabel, licenseUrl } from './meta.js';

	let { meta } = $props();

	const documentLabels = {
		report: 'Report',
		brief: 'Policy brief',
		slides: 'Slides',
		'project-site': 'Project',
		paper: 'Academic paper',
		explorer: 'Data explorer',
		post: 'Post',
		dataset: 'Data',
		code: 'Code repository'
	};

	function documentLabel(doc) {
		return documentLabels[doc.type] ?? doc.type;
	}

	// APA joins multiple authors with "&" before the last one, not a plain comma list.
	function formatApaAuthors(authors) {
		if (authors.length <= 1) return authors[0] ?? '';
		return `${authors.slice(0, -1).join(', ')}, & ${authors[authors.length - 1]}`;
	}


	// Grouped by the full set of relations each document carries, so one that is
	// both `from` and `for` is listed once under a combined heading rather than
	// appearing twice as if it were two works. See $lib/meta.js.
	const groups = $derived(documentGroups(meta.documents));

	const documentColors = {
		paper: 'var(--brandMedGreen)',
		brief: 'var(--brandLightGreen)',
		report: 'var(--brandLightGreen)'
	};

	function documentColor(doc) {
		return documentColors[doc.type] ?? 'var(--brandLightBlue)';
	}


</script>

<div class="title-hero">
	<div class="text title-inner">
		<h1>{meta.title}</h1>

		{#if meta.summary}
			<p class="summary">{meta.summary}</p>
		{/if}

		<div class="byline">
			<p class="credit-line dotted author-line">
				<!-- <span class="dot" style="background-color: var(--brandLightBlue);"></span> -->
				{formatAuthorList(meta.authors)} · {meta.published} {#if lastUpdated(meta.changelog)}· Updated {lastUpdated(meta.changelog)}{/if}
			</p>
			{#if meta.license}
				<p class="credit-line license-line">
					Licensed under
					{#if licenseUrl(meta.license)}
						<a href={licenseUrl(meta.license)} target="_blank" rel="noopener noreferrer"
							>{licenseLabel(meta.license)}</a
						>
					{:else}
						{meta.license}
					{/if}
				</p>
			{/if}
			{#if meta.documents?.length}
				<hr class="byline-divider" />
			{/if}
			{#each groups as group}
					<p class="documents-heading">{group.heading}</p>
					{#each group.docs as doc}
						<p class="credit-line dotted">
							<span class="dot" style="background-color: {documentColor(doc)};"></span>
							<span>
								<strong>{documentLabel(doc)}:</strong>
								{formatApaAuthors(doc.authors)} ({doc.year}). {doc.title}.
								{#if doc.publication}
									<em>{doc.publication}</em>.
								{/if}
								<!-- No link key means the work isn't published yet. Show the
								     citation alone rather than a label pointing nowhere. -->
								{#if doc.link}
									<a href={doc.link} target="_blank" rel="noopener noreferrer">{doc.linkType}</a>
								{/if}
							</span>
						</p>
					{/each}
			{/each}
		</div>
	</div>
</div>

<style>
	.title-hero {
		background-color: var(--brandDarkBlue);
		padding-top: 80px;
		padding-bottom: 70px;
		margin-bottom: 70px;
		border-bottom: 2px solid var(--brandLightBlue);
	}

	.title-inner h1 {
		font-size: 44px;
		color: var(--brandWhite);
		border-bottom: 2px solid var(--brandYellow);
		padding-bottom: 20px;
		margin-bottom: 20px;
	}

	.summary {
		font-family: SourceSerifItalic;
		font-weight: normal;
		font-size: 26px;
		line-height: 35px;
		color: var(--brandWhite);
		margin-top: 0;
		margin-bottom: 65px;
	}

	.credit-line {
		font-family: OpenSans;
		font-weight: normal;
		font-size: 14px;
		line-height: 20px;
		color: var(--brandGray10);
		margin: 0 0 6px 0;
	}

	.credit-line:last-child {
		margin-bottom: 0;
	}

	.credit-line strong {
		font-family: OpenSansBold;
		color: var(--brandGray10);
		font-weight: normal;
	}

	.credit-line.dotted {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		margin-bottom: 10px;
	}

	.author-line {
		color: var(--brandGray05);
	}

	.license-line {
		font-size: 12px;
		color: var(--brandGray35);
	}

	/* Two classes, so this beats `.credit-line a` on specificity rather than on
	   source order. `inherit` takes .license-line's colour above, so changing it
	   there moves both together. Hover stays yellow — `.credit-line a:hover` is
	   more specific still — and is worth keeping, since at 12px in grey the
	   hover is the only cue the text is clickable. */
	.credit-line.license-line a {
		/* text-decoration: none; */
		color: inherit;
	}

	.byline {
		margin-top: 100px;
		margin-bottom: 50px;
		padding: 20px 24px;
		border: solid 1px rgba(255, 255, 255, 0.15);
		border-radius: 4px;
	}

	.documents-heading {
		font-family: OpenSansItalic;
		font-weight: normal;
		font-size: 12px;
		line-height: 19px;
		color: var(--brandGray35);
		margin: 4px 0 8px 0;
	}

	.byline-divider {
		border: none;
		height: 1px;
		background-color: var(--brandWhite);
		opacity: 0.15;
		margin: 16px 0 24px 0;
	}

	.dot {
		flex-shrink: 0;
		width: 9px;
		height: 9px;
		border-radius: 50%;
		margin-top: 5px;
	}

	.credit-line em {
		font-family: OpenSansItalic;
		font-style: normal;
	}

	.credit-line a {
		color: var(--brandWhite);
		font-family: inherit;
	}

	.credit-line a:hover {
		color: var(--brandYellow);
	}
</style>
