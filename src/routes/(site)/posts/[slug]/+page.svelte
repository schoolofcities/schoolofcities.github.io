<script>
	import PostMeta from '$lib/PostMeta.svelte';
	import Title from '$lib/Title.svelte';

	let { data } = $props();
</script>

<PostMeta meta={data.meta} charts={data.charts} route="/posts/{data.slug}/" />

<Title meta={data.meta} />
<data.Body />
