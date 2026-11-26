// /robots.txt for the whole schoolofcities.github.io domain — crawlers only
// read it at the domain root, so it also covers the sibling project sites
// (/tariffs/ and so on). Keep it permissive: a Disallow here would hide those too.
//
// Password-protected posts are not blocked here. They carry a noindex tag
// (see PostMeta.svelte), which keeps them out of search, and their HTML holds
// only the password gate. Listing them here would publish the URLs of
// unreleased posts, and would stop crawlers seeing that noindex tag.
//
// The sitemap lists live posts only. Its URL comes from SITE_ORIGIN, so a
// domain move updates this with no edit here.

import { BASE_PATH, SITE_ORIGIN } from '$lib/site.js';

export const prerender = true;

// The site-wide 'always' would write this out as robots.txt/index.html.
export const trailingSlash = 'never';

export function GET() {
	const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${SITE_ORIGIN}${BASE_PATH}/sitemap.xml`, ''].join('\n');

	return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
}
