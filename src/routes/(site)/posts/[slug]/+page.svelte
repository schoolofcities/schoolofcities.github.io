<script>
	import PostMeta from '$lib/PostMeta.svelte';
	import Title from '$lib/Title.svelte';
	import Byline from '$lib/Byline.svelte';
	import Password from '$lib/Password.svelte';

	let { data } = $props();
</script>

<PostMeta
	meta={data.meta}
	charts={data.charts}
	card={data.card}
	route="/posts/{data.slug}/"
	noindex={data.meta.protected !== false}
/>

<Password slug={data.slug} locked={data.meta.protected !== false}>
	<Title meta={data.meta} />
	<Byline meta={data.meta} />
	<data.Body />
</Password>
