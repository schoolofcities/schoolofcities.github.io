// The list of public pages for search engines, at /sitemap.xml (format:
// https://www.sitemaps.org/protocol.html). robots.txt points crawlers here.
//
// The site's own page (the home page) comes first, then the live posts.
// Only posts with "protected": false are listed — the same test the post page
// uses for its password gate and noindex tag. Figure pages are left out: they
// are noindex so they don't compete with their post in search.
//
// URLs come from SITE_ORIGIN, so a domain move updates this with no edit here.

import { posts } from '$lib/posts.js';
import { lastUpdated } from '$lib/meta.js';
import { BASE_PATH, SITE_ORIGIN } from '$lib/site.js';
import { HOME_PROTECTED } from '$lib/homeGate.js';

export const prerender = true;

// The site-wide 'always' would write this out as sitemap.xml/index.html.
export const trailingSlash = 'never';

const escapeXml = (s) =>
	s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]);

// No lastmod on these: they change whenever anything is added, so a date here
// would only be a guess. A post's date is its own.
// The home page is left out while it is behind its password gate (and so noindex).
const PAGES = HOME_PROTECTED ? [] : ['/'];

export function GET() {
	const pages = PAGES.map((route) =>
		['\t<url>', `\t\t<loc>${escapeXml(`${SITE_ORIGIN}${BASE_PATH}${route}`)}</loc>`, '\t</url>'].join('\n')
	);

	const urls = Object.entries(posts)
		.filter(([, post]) => post.meta.protected === false)
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([slug, { meta }]) => {
			// Newest changelog date, or the publication date for a post never revised.
			const lastmod = lastUpdated(meta.changelog) ?? meta.published;
			return [
				'\t<url>',
				`\t\t<loc>${escapeXml(`${SITE_ORIGIN}${BASE_PATH}/posts/${slug}/`)}</loc>`,
				`\t\t<lastmod>${lastmod}</lastmod>`,
				'\t</url>'
			].join('\n');
		});

	const xml = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...pages,
		...urls,
		'</urlset>',
		''
	].join('\n');

	return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
}
