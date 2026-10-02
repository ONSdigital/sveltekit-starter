<script>
	// Search for a single area by name or postcode, wrapping AccessibleSelect.
	// Clearing the input (with its clear button) clears the selection.
	import { AccessibleSelect } from "@onsvisual/svelte-components";
	import { fetchPostcodes, fetchPostcodeLocation, findFeatureAtPoint } from "./map-utils.js";

	let {
		features, // GeoJSON features with areacd and areanm properties (from loadMapData)
		selected = $bindable(null), // areacd of the selected area
		id = "search-input",
		label = "Find an area or postcode",
		placeholder = "e.g. Manchester or SW1A 1AA"
	} = $props();

	let value = $state(null); // Option shown in the search box
	let error = $state(null);

	let areas = $derived(
		features.map((f) => f.properties).sort((a, b) => a.areanm.localeCompare(b.areanm))
	);
	let lookup = $derived(Object.fromEntries(areas.map((a) => [a.areacd, a])));

	// Keep the search box in sync when the selection changes (including by clicking the map)
	$effect(() => {
		const area = selected ? lookup[selected] : null;
		value = area ? { id: area.areacd, label: area.areanm, type: "area" } : null;
	});

	let latestQuery = null;

	async function loadOptions(query, populateResults) {
		latestQuery = query;
		const queryLower = (query || "").toLowerCase();
		const results = areas
			.filter((a) => a.areanm.toLowerCase().includes(queryLower))
			.map((a) => ({ id: a.areacd, label: a.areanm, type: "area" }));

		// Fall back to postcode suggestions only when no area names match
		if (query && results.length === 0) {
			const postcodes = await fetchPostcodes(query);
			postcodes.forEach((postcode) =>
				results.push({ id: postcode, label: postcode, type: "postcode" })
			);
		}

		// Ignore results for an earlier query that resolved after a later one
		if (query === latestQuery) populateResults(results);
	}

	function handleChange(option) {
		if (!option) return;
		error = null;

		if (option.type === "postcode") selectAreaByPostcode(option.id);
		else if (option.type === "area") selectArea(option.id);
	}

	function selectArea(areacd) {
		selected = areacd;
		// Show the area name, even if the area was already selected (eg. via a postcode within it)
		value = { id: areacd, label: lookup[areacd].areanm, type: "area" };
	}

	async function selectAreaByPostcode(postcode) {
		try {
			const location = await fetchPostcodeLocation(postcode);
			if (!location) {
				error = "Invalid postcode";
				return;
			}
			// Find the area containing this postcode
			const area = findFeatureAtPoint(features, ...location);
			if (area) selectArea(area.properties.areacd);
			else error = "Area not found for this postcode";
		} catch (e) {
			error = "Area unavailable";
		}
	}

	function handleClear() {
		selected = null;
		error = null;
	}
</script>

<AccessibleSelect
	{id}
	{label}
	{placeholder}
	mode="search"
	clearable={true}
	autoClear={false}
	bind:value
	{loadOptions}
	on:change={(e) => handleChange(e.detail)}
	on:clear={handleClear}
/>
{#if error}
	<div class="error-message">
		<p><strong>Error:</strong> {error}</p>
	</div>
{/if}

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
</style>
