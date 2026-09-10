<script>
	import ChartFrame from '$lib/ChartFrame.svelte';
	import PostMeta from '$lib/PostMeta.svelte';
	import Password from '$lib/Password.svelte';

	let { data } = $props();

	// A figure page describes the chart, not the post it came from: the title and
	// alt text are the chart's, and the only image worth showing in a social card
	// is this chart's own export. It stays noindex so it doesn't compete with the
	// post in search, but people do paste these links into Slack and social, so
	// the card should still say what it is.
	const chartMeta = $derived({
		...data.post,
		title: data.meta.title,
		summary: data.meta.subtitle ?? data.meta.alt
	});
</script>

<PostMeta
	meta={chartMeta}
	charts={{ [data.chartKey]: data.meta }}
	route="/posts/{data.slug}/figures/{data.chartKey}/"
	noindex={true}
/>

<Password slug={data.slug} locked={data.post.protected !== false}>
	<ChartFrame
		meta={data.meta}
		authors={data.post.authors}
		license={data.post.license}
		chartKey={data.chartKey}
		standalone={true}
	>
		<data.Chart />
	</ChartFrame>
</Password>
