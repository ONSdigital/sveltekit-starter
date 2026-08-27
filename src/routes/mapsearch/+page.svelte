<script>
  import { onMount } from "svelte";
  import { Map, MapSource, MapLayer } from "@onsvisual/svelte-maps";
  import { AccessibleSelect, Container, Section } from "@onsvisual/svelte-components";
  import { loadTopoJSON, getBoundariesGeoJSON, getBoundaryById, getBoundaryByName, getAreaNames, fetchPostcodes, findBoundaryAtPoint } from "../../lib/map-utils.js";

  let map;
  let geojson;
  let selectedBoundary = null;
  let selectedFeatureId = null;
  let hovered = null;
  let selected = null;
  let zoom;
  let center = {};
  let loading = true;
  let error = null;

  // UK bounds
  const bounds = {
    uk: [
      [-9, 49],
      [2, 61],
    ],
  };

  let mapStyle = null;
  let allAreaNames = [];
  let selectedValue = null;
  let clearInput;
  let selectElement;

  onMount(async () => {
    try {
      await loadTopoJSON();
      
      allAreaNames = getAreaNames();
      
      geojson = getBoundariesGeoJSON();
      
      // Load the style
      const styleResponse = await fetch('/style.json');
      mapStyle = await styleResponse.json();
      
      loading = false;
    } catch (e) {
      error = "Failed to load map data";
      loading = false;
    }
  });

  // When selected changes, update selectedBoundary and zoom
  $: if (selected !== null && selected !== undefined) {
    const boundary = getBoundaryById(selected);
    if (boundary) {
      selectBoundary(boundary);
    }
  } else if (selected === null && selectedFeatureId) {
    // Cleared selection
    clearSelection();
  }

  async function customLoadOptions(query, populateResults) {
    
    const results = [];
    
    if (!query) {
      // Show all area names
      const options = allAreaNames.map((name) => ({
        id: name,
        label: name,
        type: 'area',
      }));
      populateResults(options);
      return;
    }

    const queryLower = query.toLowerCase();
    
    // Add matching area names
    const areaMatches = allAreaNames.filter(name =>
      name.toLowerCase().includes(queryLower)
    );
    
    areaMatches.forEach((name) => {
      results.push({
        id: name,
        label: name,
        type: 'area',
      });
    });


    // Fetch postcode suggestions
    try {
      const postcodes = await fetchPostcodes(query);
      postcodes.forEach((postcode) => {
        results.push({
          id: postcode,
          label: postcode,
          type: 'postcode',
        });
      });
    } catch (e) {
    }

    populateResults(results);
  }

  function handleSelectChange(value) {
    
    if (!value) return;

    const selectedOption = value;
    const { type, id } = selectedOption;
    
    
    if (type === 'postcode') {
      selectAreaByPostcode(id);
    } else if (type === 'area') {
      const boundary = getBoundaryByName(id);
      if (boundary) {
        selectBoundary(boundary);
      }
    }
    
    // Reset selection
    selectedValue = null;
  }

  function closeSearchMenu() {
    if (selectElement) {
      const input = selectElement.querySelector('input');
      if (input) {
        input.blur();
      }
    }
  }

  function selectBoundary(boundary) {
    selectedBoundary = boundary;
    selectedFeatureId = boundary.id;

    // Populate search box with selected area
    selectedValue = {
      id: boundary.name,
      label: boundary.name,
      type: 'area',
    };

    // Close search menu
    closeSearchMenu();

    if (map) {
      // Zoom to the selected boundary
      const [minLng, minLat, maxLng, maxLat] = [
        boundary.bounds[0][0],
        boundary.bounds[0][1],
        boundary.bounds[1][0],
        boundary.bounds[1][1],
      ];

      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        {
          padding: 50,
          duration: 1000,
        }
      );
    }
  }

  async function selectAreaByPostcode(code) {
    const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(code)}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        error = "Invalid postcode";
        return;
      }

      const json = await response.json();
      if (!json || !json.result) {
        error = "Invalid postcode";
        return;
      }

      const lon = +json.result.longitude;
      const lat = +json.result.latitude;
      if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
        error = "Area unavailable";
        return;
      }

      // Find the LTLA boundary containing this postcode
      const ltla = findBoundaryAtPoint(lon, lat, 'ltla');
      if (ltla) {
        selectBoundary(ltla);
      } else {
        error = "Area not found for this postcode";
      }
    } catch (e) {
      error = "Area unavailable";
    }
  }

  function clearSelection() {
    selectedBoundary = null;
    selectedFeatureId = null;
    selected = null;
    selectedValue = null;
    error = null;

    if (clearInput) {
      clearInput();
    }

    // Zoom back to UK bounds
    if (map) {
      map.fitBounds(
        [
          [-9, 49],
          [2, 61],
        ],
        {
          padding: 50,
          duration: 1000,
        }
      );
    }
  }
</script>

<Section>
  <Container>
    {#if error}
      <div class="error-message">
        <p><strong>Error:</strong> {error}</p>
      </div>
    {:else if loading}
      <div class="loading-message">
        <p>Loading map data...</p>
      </div>
    {:else}
      <div bind:this={selectElement}>
        <AccessibleSelect
          id="search-input"
          label="Search for an area or postcode"
          placeholder="e.g. London, SW1A 1AA, North East..."
          mode="search"
          bind:value={selectedValue}
          bind:clearInput
          loadOptions={customLoadOptions}
          on:change={(e) => handleSelectChange(e.detail)} />
      </div>
    {/if}
  </Container>
</Section>

<Section>
  <Container>
    <div class="map-wrapper">
      {#if geojson && mapStyle}
        <Map
          id="mapsearch-map"
          style={mapStyle}
          location={{ bounds: bounds.uk }}
          bind:map
          bind:zoom
          bind:center
          controls={true}
          attribution={true}
          scrollZoomGuard={true}>
          <MapSource
            id="boundaries"
            type="geojson"
            data={geojson}
            promoteId="id">
            <MapLayer
              id="boundaries-fill"
              type="fill"
              hover={true}
              bind:hovered
              select={true}
              bind:selected
              paint={{
                "fill-color": [
                  "case",
                  ["==", ["feature-state", "selected"], true],
                  "#ff6b35",
                  ["==", ["feature-state", "hovered"], true],
                  "#e8d4b8",
                  "#c9c9c9",
                ],
                "fill-opacity": [
                  "case",
                  ["==", ["feature-state", "selected"], true],
                  0.8,
                  ["==", ["feature-state", "hovered"], true],
                  0.6,
                  0.4,
                ],
              }} />
            <MapLayer
              id="boundaries-outline"
              type="line"
              paint={{
                "line-color": [
                  "case",
                  ["==", ["feature-state", "selected"], true],
                  "#cc4420",
                  ["==", ["feature-state", "hovered"], true],
                  "#bbb",
                  "#999",
                ],
                "line-width": [
                  "case",
                  ["==", ["feature-state", "selected"], true],
                  2,
                  ["==", ["feature-state", "hovered"], true],
                  1,
                  0.5,
                ],
              }} />
          </MapSource>
        </Map>
      {/if}
    </div>
    {#if selectedBoundary}
        <div class="selection-info">
          <p>
            <strong>Selected:</strong>
            {selectedBoundary.name}
            ({selectedBoundary.type})
          </p>
          <button on:click={clearSelection} class="clear-btn">Clear Selection</button>
        </div>
      {/if}

      <p class="map-info">
        <strong>Map Info:</strong>
        Zoom: {zoom ? zoom.toFixed(1) : "—"} | Lng: {center.lng
          ? center.lng.toFixed(2)
          : "—"} | Lat: {center.lat ? center.lat.toFixed(2) : "—"}
        {#if hovered}
          | Hovered: {hovered}
        {/if}
      </p>
  </Container>
</Section>

<style>
  .error-message {
    padding: 12px 16px;
    background-color: #fef2f2;
    border-left: 4px solid #dc2626;
    border-radius: 2px;
    margin: 16px 0;
  }

  .error-message p {
    margin: 0;
    font-size: 13px;
    color: #7f1d1d;
  }

  .loading-message {
    padding: 12px 16px;
    background-color: #f3f4f6;
    border-left: 4px solid #9ca3af;
    border-radius: 2px;
    margin: 16px 0;
  }

  .loading-message p {
    margin: 0;
    font-size: 13px;
    color: #374151;
  }

  .selection-info {
    padding: 12px 16px;
    background-color: #f0f7ff;
    border-left: 4px solid #0078d4;
    border-radius: 2px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin: 16px 0;
  }

  .selection-info p {
    margin: 0;
    font-size: 13px;
  }

  .clear-btn {
    padding: 6px 12px;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    transition: background-color 0.2s;
  }

  .clear-btn:hover {
    background-color: #f0f0f0;
  }

  .map-info {
    font-size: 12px;
    color: #666;
    margin: 16px 0 0 0;
    padding: 8px 12px;
    background-color: #f9f9f9;
    border-radius: 3px;
    border: 1px solid #ddd;
    font-family: "Courier New", monospace;
  }

  .map-wrapper {
    height: 600px;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .map-wrapper :global(.mapboxgl-canvas) {
    cursor: pointer;
  }

  @media (max-width: 768px) {
    .map-wrapper {
      height: 400px;
    }

    .selection-info {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
