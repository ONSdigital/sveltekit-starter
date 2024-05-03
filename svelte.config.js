/** @type {import('@sveltejs/kit').Config} */
import adapter from '@sveltejs/adapter-static';
import { base_preview, base_prod } from "./src/app.config.js";

const base = process.env.APP_ENV === 'preview' ? base_preview : base_prod;
const production = process.env.NODE_ENV === 'production';

const config = {
	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		adapter: adapter({
			// Options below are defaults
			pages: 'build',
			assets: 'build',
			strict: false,
		}),
		prerender: {
			handleHttpError: 'warn',
			handleMissingId: 'warn',
		},
		paths: {
			base: production ? base : '',
			relative: false,
		}
	}
};

export default config;