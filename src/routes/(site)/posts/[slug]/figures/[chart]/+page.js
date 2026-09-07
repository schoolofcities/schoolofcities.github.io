import { posts, chartEntries } from '$lib/posts.js';
import { error } from '@sveltejs/kit';

export const prerender = true;
export const entries = () => chartEntries;

const bodies = import.meta.glob('/posts/*/charts/*.svelte');

export async function load({ params }) {
	const post = posts[params.slug];
	const meta = post?.charts[params.chart];
	if (!meta) throw error(404);

	const load = bodies[`/posts/${params.slug}/charts/${params.chart}.svelte`];
	return {
		slug: params.slug,
		meta,
		post: post.meta,
		Chart: (await load()).default,
		chartKey: params.chart
	};
}
