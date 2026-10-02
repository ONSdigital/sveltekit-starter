<script module>
	// This config ensures that maps render correctly in the app
	import { setWorkerUrl } from "maplibre-gl";
	import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
	setWorkerUrl(maplibreWorkerUrl);
</script>

<script>
	import { onMount } from "svelte";
	import { Container, Section } from "@onsvisual/svelte-components";
	import ChoroplethMap from "./ChoroplethMap.svelte";
	import AreaSearch from "./AreaSearch.svelte";
	import { loadMapData } from "./map-utils.js";
	import { indicator } from "./config.js";

	// Map data is kept as raw (non-proxied) state, as it is passed to MapLibre's web worker
	let data = $state.raw([]);
	let features = $state.raw([]);
	let loading = $state(true);
	let loadError = $state(null);

	let selected = $state(null); // areacd of the selected area
	let hovered = $state(null);

	let period = $derived(data[0]?.period);

	const formatValue = (d) =>
		d.toLocaleString("en-GB", { maximumFractionDigits: indicator.decimalPlaces });
	const formatPeriod = (d) =>
		d?.toLocaleDateString?.("en-GB", { day: "numeric", month: "long", year: "numeric" }) ?? d;

	onMount(async () => {
		try {
			({ data, features } = await loadMapData(indicator.dataPath));
		} catch (e) {
			loadError = "Failed to load map data";
		}
		loading = false;
	});
</script>

<Container width="medium" cls="ons-u-mb-s">
	<h1 class="ons-u-mt-l">{indicator.label} by local authority</h1>
	<h2 class="map-title">
		{indicator.label} ({indicator.unit}), {formatPeriod(period)}
	</h2>
	{#if loadError}
		<div class="error-message">
			<p><strong>Error:</strong> {loadError}</p>
		</div>
	{:else if loading}
		<div class="loading-message">
			<p>Loading map data...</p>
		</div>
	{:else}
		<AreaSearch {features} bind:selected />
	{/if}
</Container>

<Container width="medium">
	{#if data.length && features.length}
		<ChoroplethMap
			{data}
			{features}
			metadata={indicator}
			bind:selected
			bind:hovered
			{formatValue}
		/>
		<p class="map-source">Source: {indicator.source}</p>
	{/if}
</Container>

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

	.map-title {
		margin: -20px 0 12px;
		font-size: 1.125rem;
		font-weight: 400;
	}

	.map-source {
		font-size: 16px;
		margin: 0;
	}
</style>
