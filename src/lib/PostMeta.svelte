<script>
	// Everything a crawler, social card, or AI system reads about a page. All of
	// it comes from meta.json, so a post author writes nothing extra.
	//
	// Absolute URLs throughout: crawlers won't resolve relative ones. Route paths
	// get SITE_ORIGIN + BASE_PATH; asset URLs from Vite already carry the base,
	// so they only get SITE_ORIGIN.
	import { BASE_PATH, SITE_ORIGIN } from './site.js';
	import { lastUpdated, licenseUrl, socialImage } from './meta.js';

	let { meta, charts, route, noindex = false } = $props();

	const SITE_NAME = 'School of Cities';

	const url = $derived(route ? `${SITE_ORIGIN}${BASE_PATH}${route}` : undefined);
	const modified = $derived(lastUpdated(meta.changelog));
	const image = $derived(socialImage(charts, meta.cardImage));
	const imageUrl = $derived(image ? `${SITE_ORIGIN}${image.url}` : undefined);

	// schema.org description of the post, for search engines and AI systems —
	// the machine-readable counterpart to the byline Title.svelte renders, where
	// authorship, dates, and licence become queryable rather than just visible.
	const jsonLd = $derived(
		JSON.stringify(
			{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: meta.title,
				description: meta.summary,
				author: (meta.authors ?? []).map((name) => ({ '@type': 'Person', name })),
				datePublished: meta.published,
				dateModified: modified ?? meta.published,
				license: licenseUrl(meta.license) ?? meta.license,
				publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_ORIGIN },
				url,
				image: imageUrl,
				// Topic tags and places are different claims, so they get different
				// properties: keywords for what the post is about, spatialCoverage for
				// where. spatialCoverage is the property a search engine or dataset
				// aggregator queries for "work about Toronto", which is most of ours.
				keywords: (meta.tags ?? []).join(', ') || undefined,
				spatialCoverage: (meta.geography ?? []).map((name) => ({ '@type': 'Place', name }))
			},
			// Drop undefined keys rather than emitting nulls.
			(_, value) => (value === undefined ? undefined : value)
		)
	);
</script>

<svelte:head>
	<title>{meta.title}</title>
	<meta name="description" content={meta.summary} />

	{#if noindex}
		<meta name="robots" content="noindex" />
	{/if}
	{#if url}
		<link rel="canonical" href={url} />
	{/if}

	<meta property="og:type" content="article" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.summary} />
	{#if url}
		<meta property="og:url" content={url} />
	{/if}
	{#if imageUrl}
		<meta property="og:image" content={imageUrl} />
		<meta property="og:image:alt" content={image.alt} />
	{/if}

	<!-- summary_large_image only renders large if an image is present; without
	     one, a plain summary card is the better fallback. -->
	<meta name="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
	<meta name="twitter:title" content={meta.title} />
	<meta name="twitter:description" content={meta.summary} />
	{#if imageUrl}
		<meta name="twitter:image" content={imageUrl} />
	{/if}

	<meta property="article:published_time" content={meta.published} />
	{#if modified}
		<meta property="article:modified_time" content={modified} />
	{/if}
	{#each meta.authors ?? [] as author}
		<meta property="article:author" content={author} />
	{/each}

	{@html `<script type="application/ld+json">${jsonLd}<\/script>`}
</svelte:head>
