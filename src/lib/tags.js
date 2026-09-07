// The permitted values for `tags` and `geography` in each post's meta.json.
// scripts/validate.js warns when a post uses anything not listed here.
//
// Why a fixed list: both fields are read by machines as well as people —
// `tags` becomes `keywords` in the JSON-LD block and `geography` becomes
// `spatialCoverage`. A post tagged "housing" and another tagged "Housing" or
// "housing-policy" read the same to a person and describe two different topics
// to a search engine. Across a hundred posts that can't be corrected after the
// fact, because nobody remembers which spelling was meant where.
//
// Extend either list by hand as new posts need terms. Prefer reusing an
// existing term over adding a near-synonym.

/** Topic tags. Lowercase. */
export const TAGS = ['urban', 'housing', 'tax', 'policy', 'public transit', 'accessibility', 'demographics', 'public libraries'];

/**
 * Place names, written as they should appear to a reader — these are published
 * as-is in spatialCoverage. List a containing region only when the post
 * genuinely covers it.
 */
export const GEOGRAPHY = [
	'Canada',
	'Alberta',
	'British Columbia',
	'Ontario',
	'Quebec',
	'Calgary',
	'Edmonton',
	'Montreal',
	'Toronto',
	'Vancouver'
];
