import { asset } from "$app/paths";
import { feature } from "topojson-client";
import { csvParse, autoType } from "d3-dsv";
import { ckmeans } from "simple-statistics";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { topoPath, geoLevel } from "./config.js";

/**
 * Load the indicator CSV and the matching boundaries from the TopoJSON.
 * Only boundaries with a row in the CSV are kept, so superseded areas
 * (eg. pre-2019 districts that overlap current ones) are never drawn or matched.
 * @param {string} dataPath - Path to the indicator CSV within /static
 * @returns {Promise<{data: object[], features: object[]}>} Rows sorted by name, and GeoJSON features with data merged into their properties
 */
export async function loadMapData(dataPath) {
	const [topo, csv] = await Promise.all([
		fetch(asset(topoPath)).then((res) => {
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.json();
		}),
		fetch(asset(dataPath)).then((res) => {
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			return res.text();
		})
	]);

	const data = csvParse(csv, autoType)
		.filter((d) => d.areacd && Number.isFinite(d.value))
		.sort((a, b) => a.areanm.localeCompare(b.areanm));
	const lookup = Object.fromEntries(data.map((d) => [d.areacd, d]));

	const features = feature(topo, topo.objects[geoLevel])
		.features.filter((f) => lookup[f.properties.areacd])
		.map((f) => ({
			...f,
			properties: { ...lookup[f.properties.areacd] },
			bbox: calculateBounds(f.geometry)
		}));

	return { data, features };
}

/**
 * Calculate bounding box from geometry
 * @param {object} geometry - GeoJSON geometry
 * @returns {number[]|null} [west, south, east, north]
 */
export function calculateBounds(geometry) {
	if (!geometry || !geometry.coordinates) return null;

	let minLng = Infinity,
		maxLng = -Infinity,
		minLat = Infinity,
		maxLat = -Infinity;

	function processBounds(coords) {
		if (typeof coords[0] === "number" && typeof coords[1] === "number") {
			const [lng, lat] = coords;
			minLng = Math.min(minLng, lng);
			maxLng = Math.max(maxLng, lng);
			minLat = Math.min(minLat, lat);
			maxLat = Math.max(maxLat, lat);
		} else if (Array.isArray(coords[0])) {
			coords.forEach((c) => processBounds(c));
		}
	}

	processBounds(geometry.coordinates);

	return isFinite(minLng) ? [minLng, minLat, maxLng, maxLat] : null;
}

function round(val, dp, mode = "round") {
	const rounder = mode === "floor" ? Math.floor : mode === "ceil" ? Math.ceil : Math.round;
	const multiplier = Math.pow(10, dp);
	return rounder(val * multiplier) / multiplier;
}

/**
 * Natural (ckmeans) breaks, rounded and de-duplicated, as used by ELS
 * @param {number[]} values - Data values
 * @param {number} dp - Decimal places to round breaks to
 * @param {number} count - Number of classes
 * @returns {number[]} Break values, including min and max
 */
export function valuesToBreaks(values, dp = 0, count = 5) {
	const clusters = ckmeans(values, values.length < count ? values.length : count);
	const breaks = [
		...clusters.map((c) => c[0]),
		clusters[clusters.length - 1][clusters[clusters.length - 1].length - 1]
	];
	return Array.from(
		new Set(
			breaks.map((d, i) =>
				round(d, dp, i === 0 ? "floor" : i === breaks.length - 1 ? "ceil" : "round")
			)
		)
	);
}

/**
 * Get the colour of the class that a value falls into
 * @param {number} value - Data value
 * @param {number[]} breaks - Break values from valuesToBreaks()
 * @param {string[]} colors - One colour per class
 * @returns {string} Colour
 */
export function valueToColor(value, breaks, colors) {
	for (let i = 0; i < breaks.length - 1; i++) {
		if (value < breaks[i + 1]) return colors[i];
	}
	return colors[breaks.length - 2];
}

/**
 * Fetch postcode suggestions from postcodes.io API
 * @param {string} query - Partial or full postcode
 * @returns {Promise<string[]>} Array of postcode suggestions
 */
export async function fetchPostcodes(query) {
	const q = query === null || typeof query === "undefined" ? "" : String(query).trim();
	if (!q) return [];

	const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(q)}/autocomplete`;
	try {
		const response = await fetch(url);
		if (!response.ok) return [];
		const json = await response.json();
		return json && Array.isArray(json.result) ? json.result : [];
	} catch (e) {
		return [];
	}
}

/**
 * Look up a postcode's coordinates from postcodes.io API
 * @param {string} postcode - Full postcode
 * @returns {Promise<[number, number]|null>} [lng, lat], or null if not found
 */
export async function fetchPostcodeLocation(postcode) {
	const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`;
	const response = await fetch(url);
	if (!response.ok) return null;
	const json = await response.json();
	const lng = +json?.result?.longitude;
	const lat = +json?.result?.latitude;
	return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null;
}

/**
 * Find the feature containing a point
 * @param {object[]} features - GeoJSON features from loadMapData()
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @returns {object|null} Feature containing point, or null
 */
export function findFeatureAtPoint(features, lng, lat) {
	const point = [lng, lat];
	for (const f of features) {
		const [w, s, e, n] = f.bbox;
		if (lng < w || lng > e || lat < s || lat > n) continue;
		if (booleanPointInPolygon(point, f.geometry)) return f;
	}
	return null;
}
