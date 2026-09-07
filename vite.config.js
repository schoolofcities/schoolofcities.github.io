import { sveltekit } from '@sveltejs/kit/vite';
import dsv from '@rollup/plugin-dsv';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
	// dsv must come before sveltekit so `import data from './x.csv'`
	// is parsed into an array of objects at build time.
	plugins: [dsv(), sveltekit()],

	server: {
		// posts/ lives outside src/, which SvelteKit's dev server otherwise
		// refuses to serve files from directly (see notes doc: content lives
		// in a top-level posts/ folder, not under src/routes/).
		fs: {
			allow: [projectRoot]
		},
		// This project lives inside a Dropbox-synced folder. Dropbox's sync
		// client rewrites files in ways that can confuse native filesystem
		// watch events, so poll for changes instead of relying on them.
		watch: {
			usePolling: true
		}
	}
});
