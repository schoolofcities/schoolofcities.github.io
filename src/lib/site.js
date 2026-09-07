// Where the site lives. Both values move together when the domain changes, so
// they're defined here once and imported by svelte.config.js as well as by
// components — a mismatch between them produces links that are subtly wrong
// rather than broken, which is the kind of thing nobody notices for weeks.
//
// Currently the organisation's GitHub Pages site, served from the root of the
// repo named schoolofcities.github.io:
//
//   SITE_ORIGIN + BASE_PATH  =  https://schoolofcities.github.io
//
// BASE_PATH is empty because an org site serves from the domain root. Note that
// sibling project repos still own their own first path segment — /tariffs/ and
// /renters/ are served by those repos, not by this site — so top-level route
// names must not collide with a repo name.
//
// When the site moves to its own domain, only SITE_ORIGIN changes; paths map
// across one to one.
//
// SITE_ORIGIN is scheme + host with no trailing slash; BASE_PATH is a leading
// slash and no trailing one, or '' when served from a domain root.

export const SITE_ORIGIN = 'https://schoolofcities.github.io';
export const BASE_PATH = '';
