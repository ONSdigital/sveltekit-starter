/** @type {import('@sveltejs/kit').Config} */
import adapter from '@sveltejs/adapter-static';
import { base_preview, base_prod } from "./src/app.config.js";

const preview = process.env.PUBLIC_APP_ENV === 'preview';
const production = process.env.NODE_ENV === 'production';
const base = preview ? base_preview : production ? base_prod : '';

const config = {
	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		adapter: adapter({
			// Options below are defaults
			pages: 'build',
			assets: 'build',
			strict: false,
			fallback: preview ? '404.html' : undefined
		}),
		prerender: {
			handleHttpError: 'warn',
			handleMissingId: 'warn',
		},
		paths: {
			base,
			relative: false,
		}
	}
};

export default config;