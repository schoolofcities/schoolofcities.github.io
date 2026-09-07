import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { BASE_PATH } from './src/lib/site.js';

const dev = process.argv.includes('dev');

// Defined in src/lib/site.js alongside SITE_ORIGIN, since the two have to agree:
// components build absolute share/embed links from origin + base.
const BASE = BASE_PATH;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: null,
			precompress: false,
			strict: true
		}),

		paths: {
			base: dev ? '' : BASE
		},

		prerender: {
			handleHttpError: 'fail'
		}
	}
};

export default config;
