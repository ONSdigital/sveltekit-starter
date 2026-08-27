# Mapsearch Route Implementation

## Overview
The mapsearch route provides an interactive map of 709 UK geographic boundaries with real-time search by area name or postcode. When a postcode is selected, it finds and highlights the parent Local Tier Local Authority (LTLA) and zooms to it.

## Components

### 1. Data Source: `/static/master-topo.json`
- **Size**: 689 KB (compressed TopoJSON format)
- **Features**: 709 geographic areas
- **Coverage**: UK at multiple administrative levels
  - cauth: 18 Combined Authorities
  - ctry: 4 Countries
  - cty: 27 Counties
  - ltla: 409 Lower Tier Local Authorities
  - mcty: 6 Metropolitan Counties
  - rgn: 12 Regions
  - uk: 1 UK boundary
  - utla: 232 Upper Tier Local Authorities

**Property Fields**:
- `areacd`: Unique area code (used as ID)
- `areanm`: Area name (used for search and display)

### 2. Styling: `/static/style.json`
- Professional ONS Mapbox styling (43 KB)
- Base layers, backgrounds, and professional colors
- Loaded at runtime and applied to map

### 3. Utilities: `/src/lib/map-utils.js`

#### Core Data Loading
```javascript
loadTopoJSON()
```
- Fetches master-topo.json asynchronously
- Caches result to avoid repeated loads
- Calls buildAreaLookups() to create search indexes

#### Search Indexing
```javascript
buildAreaLookups(topo)
```
Creates three internal data structures:
- `boundaries[]`: Array of boundary objects with geometry and bounds
- `areaNames[]`: Sorted array of **unique** area names (deduped across geometry types)
- `areaNameToCode{}`: Map from name (lowercase) → area code
- `areaCodeToFeature{}`: Map from area code → full feature

#### Search Implementation
```javascript
customLoadOptions(query, populateResults)
```
- Filters area names by substring match
- Fetches postcode suggestions from postcodes.io API
- Merges results: areas first, then postcodes
- Calls populateResults callback with combined options

```javascript
fetchPostcodes(query)
```
- Queries postcodes.io: `/postcodes/{query}/autocomplete`
- Returns array of postcode suggestions
- Silent failure on network errors

#### Postcode Utilities
```javascript
normalizePostcode(input)
```
- Trims whitespace, converts to uppercase

```javascript
isLikelyUkPostcode(input)
```
- Validates against UK postcode regex

#### LTLA Lookup
```javascript
findLTLAAtPoint(lng, lat)
```
- Uses turf.js `booleanPointInPolygon()` for robust point-in-polygon detection
- Searches all LTLA boundaries
- Returns LTLA boundary containing the point, or null

#### Data Access
```javascript
getBoundaryById(id) / getBoundaryByName(name)
```
- Look up boundary by area code or name
- Returns boundary object with geometry and bounds

```javascript
getBoundariesGeoJSON()
```
- Converts boundaries to GeoJSON FeatureCollection
- Sets feature.id to areacd (for Mapbox promoteId)

```javascript
getAreaNames()
```
- Returns sorted array of unique area names (for initial dropdown)

### 4. Page Component: `/src/routes/mapsearch/+page.svelte`

#### Data Loading
- `onMount()` async handler
- Loads TopoJSON, builds GeoJSON, loads style.json
- Sets `loading` and `error` states

#### Search UI
- `AccessibleSelect` component in "search" mode
- `customLoadOptions()` prop provides dynamic filtering
- Options include both area names and postcodes

#### Selection Routing
```javascript
handleSelectChange(value)
```
- Checks option type: 'postcode' or 'area'
- Routes to `selectAreaByPostcode()` or `selectBoundary()`

#### Map Display
- Renders all 709 boundaries as MapSource/MapLayer
- MapSource uses `promoteId="id"` to enable feature-state
- Click handler: `getBoundaryById()` → `selectBoundary()`
- Hover handler: displays hovered area name

#### Selection Handling
```javascript
selectBoundary(boundary)
```
- Sets feature-state `selected: true` for visual highlight
- Calls `map.fitBounds()` to zoom to boundary (1000ms animation, 50px padding)
- Clears previous selection using `removeFeatureState()`

```javascript
selectAreaByPostcode(code)
```
- Validates postcode via postcodes.io API
- Gets longitude/latitude from API response
- Calls `findLTLAAtPoint()` to find parent LTLA
- Calls `selectBoundary(ltla)` to zoom and highlight LTLA

```javascript
clearSelection()
```
- Removes feature-state from selected boundary (turns off highlight)
- Zooms map back to UK bounds (1000ms animation)
- Resets all state variables

#### Map Styling
- **boundaries-fill**: Uses feature-state `selected` to toggle colors
  - Selected: #ff6b35 (orange), opacity 0.8
  - Normal: #c9c9c9 (gray), opacity 0.4
- **boundaries-outline**: Uses feature-state `selected` to toggle width
  - Selected: #cc4420 (dark red), width 2px
  - Normal: #999 (gray), width 0.5px

## Data Flow Diagram

```
User Types Search Query
        │
        v
customLoadOptions(query, populateResults)
        │
        ├─ Filter areaNames by substring match
        │
        └─ fetchPostcodes(query) from postcodes.io API
                │
                v
        Merge results: areas + postcodes
        Call populateResults() callback
        │
        v
Display merged options in dropdown
        │
        v
User Selects Option
        │
        ├─ If type === 'postcode':
        │   │
        │   ├─ Validate via postcodes.io
        │   │
        │   ├─ Get longitude/latitude
        │   │
        │   └─ findLTLAAtPoint(lng, lat)
        │       │
        │       └─ Returns LTLA boundary or null
        │
        └─ If type === 'area':
            │
            └─ getBoundaryByName(name)
                │
                └─ Returns boundary object
                │
                v
        selectBoundary(boundary)
        │
        ├─ removeFeatureState() on previous selection
        │
        ├─ setFeatureState({ selected: true })
        │
        └─ map.fitBounds() → zoom to boundary
```

## Browser Usage

### Search for Area Name
1. Type area name (e.g., "London", "Manchester")
2. Matching area suggestions appear
3. Select from dropdown
4. Map zooms to selected area boundary with orange highlight

### Search for Postcode
1. Type postcode (e.g., "SW1A 1AA")
2. Postcode suggestions appear from postcodes.io
3. Select postcode from dropdown
4. Map finds parent LTLA containing postcode
5. Map zooms to LTLA boundary with orange highlight

### Click on Map
1. Click any boundary on the map
2. Boundary is selected and highlighted in orange
3. Map zooms to show boundary
4. Selection info displays area name and type

### Clear Selection
1. Click "Clear Selection" button
2. Orange highlight removed from boundary
3. Map zooms back to full UK view

## API Integrations

### postcodes.io Autocomplete
- **Endpoint**: `https://api.postcodes.io/postcodes/{query}/autocomplete`
- **Purpose**: Get postcode suggestions as user types
- **Returns**: Array of postcode strings

### postcodes.io Lookup
- **Endpoint**: `https://api.postcodes.io/postcodes/{postcode}`
- **Purpose**: Validate postcode and get coordinates
- **Returns**: Object with longitude, latitude, and other properties

## Point-in-Polygon Detection

Uses **turf.js** `booleanPointInPolygon()` for robust detection:
- Handles complex geometries (Polygon and MultiPolygon)
- Accounts for holes in polygons
- More reliable than manual ray-casting algorithms

```javascript
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

const isInside = booleanPointInPolygon([lng, lat], boundaryGeometry);
```

## Bounds Calculation

Accurately calculates minimum bounding box for each boundary:
```javascript
calculateBounds(geometry)
```
- Recursively traverses coordinate arrays
- Tracks min/max longitude and latitude
- Returns `[[minLng, minLat], [maxLng, maxLat]]` for `map.fitBounds()`

## Performance

- **TopoJSON caching**: Loaded once, cached in module scope
- **Area lookup**: O(1) via `areaNameToCode` map
- **Search filtering**: O(n) substring match
- **Point-in-polygon**: O(n) per test, turf.js optimized
- **GeoJSON generation**: Runs once on mount
- **Map rendering**: Mapbox efficiently renders 709 features

## Dependencies

- `topojson-client`: ^3.1.0 - TopoJSON to GeoJSON conversion
- `@turf/boolean-point-in-polygon`: Point-in-polygon geospatial testing
- `@onsvisual/svelte-maps`: Mapbox wrapper component
- `@onsvisual/svelte-components`: AccessibleSelect and other UI components

## Configuration

### TopoJSON Path
```javascript
const response = await fetch('/master-topo.json');
```

### Style Path
```javascript
const styleResponse = await fetch('/style.json');
```

### UK Bounds
```javascript
const bounds = {
  uk: [[-9, 49], [2, 61]],
};
```

### Zoom Animation
- Duration: 1000ms
- Padding: 50px from boundary

## File Locations

```
sveltekit-starter/
├── static/
│   ├── master-topo.json (689 KB - geographic data)
│   └── style.json (43 KB - Mapbox styling)
├── src/
│   ├── lib/
│   │   └── map-utils.js (utility functions)
│   └── routes/
│       └── mapsearch/
│           └── +page.svelte (UI component)
└── build/
    └── (deployed versions)
```

## Features

✓ 709 UK geographic boundaries
✓ Area name search with substring matching
✓ Postcode autocomplete via postcodes.io
✓ Postcode → parent LTLA resolution
✓ Click to select boundaries on map
✓ Smooth zoom animations
✓ Feature state highlighting (orange)
✓ Responsive design
✓ Professional ONS styling
✓ Error handling
✓ Loading states

## Recent Changes

- **Removed duplicate area names**: Deduplication via Set in buildAreaLookups()
- **Added postcode search**: Integrated postcodes.io autocomplete API
- **Added LTLA resolution**: Using turf.js point-in-polygon detection
- **Fixed bounds calculation**: Recursive coordinate traversal handles all geometry types
- **Improved feature state**: Using `removeFeatureState()` instead of `setFeatureState(false)`
- **Added zoom reset**: Clicking "Clear Selection" zooms back to UK bounds
- **Removed debug pages**: Cleaned up test/debug routes
- **Added style.json**: Professional ONS Mapbox styling
- **Removed logging**: Cleaned up console.log statements for production

## Browser Compatibility

- Modern browsers with ES2020+ support
- Requires Mapbox GL JS support
- Works on desktop and mobile (responsive design)

## Accessibility

- AccessibleSelect component uses accessible-autocomplete library
- Keyboard navigation supported
- ARIA labels and descriptions
- Semantic HTML markup

## Summary

A production-ready interactive map application featuring:
- 709 UK geographic boundaries from TopoJSON
- Dual search: area names + postcodes
- Intelligent postcode resolution to parent LTLA
- Smooth animations and responsive design
- Professional ONS styling
- Robust geospatial calculations with turf.js
