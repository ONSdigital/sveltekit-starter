import { asset } from "$app/paths";
import { csvParse, autoType } from "d3-dsv";

// Data for this page is loaded here, not in the component, so that it's included in the prerendered
// HTML (it runs at build time for the production build, and in the browser for the preview build).
// Use the `fetch` passed to load(), and wrap paths to files in static/ in asset().

/**
 * @typedef {{ areacd: string; areanm: string; period: Date; value: number }} Row
 */

/** @type {import("./$types").PageLoad} */
export async function load({ fetch }) {
	const res = await fetch(asset("/data/median-age.csv"));
	if (!res.ok) throw new Error(`Couldn't load the data (${res.status})`);
	/** @type {Row[]} */
	const rows = /** @type {any[]} */ (csvParse(await res.text(), autoType));

	return {
		rows,
		// These override the title and description set in src/routes/+layout.js
		pageTitle: "Median age by local authority - ONS",
		pageDescription: "An example data page: median age in each local authority."
	};
}
