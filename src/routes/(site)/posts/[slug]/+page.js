import { error } from '@sveltejs/kit';
import { posts } from '$lib/posts.js';

export const prerender = true;
export const entries = () => Object.keys(posts).map((slug) => ({ slug }));

const bodies = import.meta.glob('/posts/*/+page.svelte');

export async function load({ params }) {
	const post = posts[params.slug];
	if (!post) throw error(404);

	const body = bodies[`/posts/${params.slug}/+page.svelte`];
	return { slug: params.slug, meta: post.meta, charts: post.charts, Body: (await body()).default };
}
