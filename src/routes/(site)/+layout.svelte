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
	import Header from '$lib/Header.svelte';
	import Footer from '$lib/Footer.svelte';

	let { children } = $props();
</script>

<Header logoType="White" backgroundColor="var(--brandDarkBlue)" />
<main>
	{@render children()}
</main>
<Footer />
