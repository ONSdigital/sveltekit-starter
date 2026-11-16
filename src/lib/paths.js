import { resolve } from "$app/paths";

/**
 * The URL of a page in this app, for links, eg. `href={pageUrl("/article")}` or
 * `href={pageUrl("/[area]", { area: "E06000001" })}`. It's resolve() from $app/paths, plus the
 * trailing slash that this app's URLs have (trailingSlash = "always" in src/routes/+layout.js).
 * For files in static/ (data, images), use asset() from $app/paths instead.
 * @param {Parameters<typeof resolve>} args
 * @returns {string}
 */
export function pageUrl(...args) {
	const url = resolve(...args);
	const [path, rest = ""] = url.split(/(?=[?#])/);
	return (path.endsWith("/") ? path : `${path}/`) + rest;
}
