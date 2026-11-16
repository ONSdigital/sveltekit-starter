/** @type {import('@sveltejs/kit').Config} */
import adapter from "@sveltejs/adapter-static";
import { base_preview, base_prod } from "./src/app.config.js";

const preview = process.env.PUBLIC_APP_ENV === "preview";
const production = process.env.NODE_ENV === "production";
const strict = process.env.STRICT_PRERENDER === "true";
// The preview build is not prerendered, so it can't use relative URLs (see src/app.config.js)
if (preview && !base_preview) {
	throw new Error(
		'base_preview must be set to a path (eg. "/my-app") in src/app.config.js for preview builds'
	);
}
// With no base path, use relative URLs so the build can be deployed to any path (see src/app.config.js)
const base = (preview ? base_preview : production ? base_prod : "") || "";
const relative = !base;

const config = {
	compilerOptions: {
		// Compile the app's own components in runes mode (Svelte 5 syntax), so Svelte 4 syntax such as
		// `export let`, `$:`, `<slot>` and `on:click` is an error. Files in node_modules are left alone,
		// because svelte-maps and svelte-charts are Svelte 4-style components.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes("node_modules") ? undefined : true)
	},
	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		adapter: adapter({
			// Options below are defaults
			pages: "build",
			assets: "build",
			strict: false,
			fallback: preview ? "404.html" : undefined
		}),
		prerender: {
			// Broken links and missing #ids are warnings, but `npm run verify` makes them errors
			handleHttpError: strict ? "fail" : "warn",
			handleMissingId: strict ? "fail" : "warn"
		},
		paths: {
			base,
			relative
		}
	}
};

export default config;
