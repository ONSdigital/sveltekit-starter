import * as topojson from 'topojson-client';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

let boundaries = [];
let areaNames = [];
let areaNameToCode = {};
let topoData = null;

const UK_POSTCODE_RE = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;

/**
 * Load and cache TopoJSON data
 * @param {string} topoPath - Path to TopoJSON file (default: '/master-topo.json')
 * @returns {object|null} Loaded TopoJSON data or null if error
 */
export async function loadTopoJSON(topoPath = '/master-topo.json') {
  if (topoData) return topoData;
  
  try {
    const response = await fetch(topoPath);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    topoData = await response.json();
    buildAreaLookups(topoData);
    return topoData;
  } catch (error) {
    return null;
  }
}

/**
 * Build internal lookup structures from TopoJSON
 * @private
 */
function buildAreaLookups(topo) {
  boundaries = [];
  areaNames = [];
  areaNameToCode = {};
  const uniqueNames = new Set();

  for (const [key, geometryCollection] of Object.entries(topo.objects)) {
    const features = topojson.feature(topo, geometryCollection).features;
    
    features.forEach((feature) => {
      const props = feature.properties || {};
      const id = props.areacd || props.id || props.code;
      const name = props.areanm || props.name || props.NAME;

      if (!id || !name) return;

      const bounds = calculateBounds(feature.geometry);

      boundaries.push({
        id,
        name,
        bounds,
        geometry: feature.geometry,
        properties: props,
        type: key,
      });

      if (!uniqueNames.has(name.toLowerCase())) {
        areaNames.push(name);
        uniqueNames.add(name.toLowerCase());
      }
      areaNameToCode[name.toLowerCase()] = id;
    });
  }

  areaNames.sort((a, b) => a.localeCompare(b));
}

/**
 * Calculate bounding box from geometry
 * @private
 */
function calculateBounds(geometry) {
  if (!geometry || !geometry.coordinates) return null;

  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;

  function processBounds(coords) {
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      const [lng, lat] = coords;
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    } else if (Array.isArray(coords[0])) {
      coords.forEach(c => processBounds(c));
    }
  }

  processBounds(geometry.coordinates);

  return isFinite(minLng) ? [[minLng, minLat], [maxLng, maxLat]] : null;
}

/**
 * Normalize postcode format (trim, uppercase, normalize spaces)
 * @param {string} input - Raw postcode input
 * @returns {string} Normalized postcode
 */
export function normalizePostcode(input) {
  if (input === null || typeof input === 'undefined') return '';
  return String(input)
    .trim()
    .toUpperCase()
    .replace(/\s+/g, ' ');
}

/**
 * Check if input looks like UK postcode
 * @param {string} input - Input to validate
 * @returns {boolean} True if matches UK postcode pattern
 */
export function isLikelyUkPostcode(input) {
  const normalized = normalizePostcode(input);
  return UK_POSTCODE_RE.test(normalized);
}

/**
 * Fetch postcode suggestions from postcodes.io API
 * @param {string} query - Partial or full postcode
 * @returns {array} Array of postcode suggestions
 */
export async function fetchPostcodes(query) {
  const q = (query === null || typeof query === 'undefined') ? '' : String(query).trim();
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
 * Get boundary by ID
 * @param {string} id - Boundary ID
 * @returns {object|null} Boundary object or null
 */
export function getBoundaryById(id) {
  return boundaries.find((b) => b.id === id) || null;
}

/**
 * Get boundary by name
 * @param {string} name - Boundary name
 * @returns {object|null} Boundary object or null
 */
export function getBoundaryByName(name) {
  const id = areaNameToCode[name.toLowerCase()];
  return id ? getBoundaryById(id) : null;
}

/**
 * Get all area names for search
 * @returns {array} Sorted array of unique area names
 */
export function getAreaNames() {
  return [...areaNames];
}

/**
 * Convert boundaries to GeoJSON FeatureCollection
 * @returns {object} GeoJSON FeatureCollection with all boundaries as features
 */
export function getBoundariesGeoJSON() {
  const geojson = {
    type: "FeatureCollection",
    features: boundaries.map((boundary) => ({
      type: "Feature",
      id: boundary.id,
      properties: {
        id: boundary.id,
        name: boundary.name,
        ...boundary.properties,
      },
      geometry: boundary.geometry || {
        type: "Polygon",
        coordinates: [
          [
            [boundary.bounds[0][0], boundary.bounds[0][1]],
            [boundary.bounds[1][0], boundary.bounds[0][1]],
            [boundary.bounds[1][0], boundary.bounds[1][1]],
            [boundary.bounds[0][0], boundary.bounds[1][1]],
            [boundary.bounds[0][0], boundary.bounds[0][1]],
          ],
        ],
      },
    })),
  };
  return geojson;
}

/**
 * Find boundary of given type containing a point
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @param {string} boundaryType - Boundary type to search (default: 'ltla')
 * @returns {object|null} Boundary containing point, or null
 */
export function findBoundaryAtPoint(lng, lat, boundaryType = 'ltla') {
  const point = [lng, lat];
  
  for (const boundary of boundaries) {
    if (boundary.type !== boundaryType) continue;
    
    try {
      if (booleanPointInPolygon(point, boundary.geometry)) {
        return boundary;
      }
    } catch (e) {
      continue;
    }
  }
  
  return null;
}
