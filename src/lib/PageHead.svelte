<script>
	// What a crawler, social card or AI system reads about a site page (the home page),
	// the counterpart to PostMeta.svelte, which does the same for
	// a post from its meta.json. Absolute URLs throughout: crawlers won't resolve
	// relative ones.
	import { BASE_PATH, SITE_ORIGIN } from './site.js';

	// `jsonLd` is an already-stringified schema.org object, for pages that have one.
	let { title, description, route, jsonLd, noindex = false } = $props();

	const SITE_NAME = 'School of Cities';
	const url = $derived(`${SITE_ORIGIN}${BASE_PATH}${route}`);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	{#if noindex}
		<meta name="robots" content="noindex" />
	{/if}

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />

	{#if jsonLd}
		{@html `<script type="application/ld+json">${jsonLd}<\/script>`}
	{/if}
</svelte:head>
