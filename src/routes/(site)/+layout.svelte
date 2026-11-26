<svelte:head>
	<script async src="https://www.googletagmanager.com/gtag/js?id=G-XB09CWTEWB"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}
		gtag('js', new Date());
		gtag('config', 'G-XB09CWTEWB');
	</script>
</svelte:head>

<script>
	import { page } from '$app/state';
	import Header from '$lib/Header.svelte';
	import Footer from '$lib/Footer.svelte';
	import { unlocked } from '$lib/gate.svelte.js';
	import { HOME_PROTECTED } from '$lib/homeGate.js';

	let { children } = $props();

	// The home page opens with a navy banner, so the header sits flat against
	// it; a post keeps the lifted header.
	const onPost = $derived(page.url.pathname.includes('/posts/'));

	// A page behind a password gate (the home page, or a post still in progress) shows no header
	// or footer until it is unlocked, only the gate.
	const gate = $derived(
		page.url.pathname === '/'
			? HOME_PROTECTED
				? 'home'
				: null
			: page.data?.meta && page.data.meta.protected !== false
				? page.data.slug
				: null
	);
	const gated = $derived(gate !== null && !unlocked[gate]);
</script>

{#if !gated}
	<Header flat={!onPost} />
{/if}
<main class:gated>
	{@render children()}
</main>
{#if !gated}
	<Footer flat={!onPost} />
{/if}

<style>
	/* Only the gate: centred in the window. */
	main.gated {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
	}
</style>
