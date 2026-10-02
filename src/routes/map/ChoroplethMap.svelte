<script>
	// Adapted from the Explore Local Statistics choropleth map:
	// https://github.com/ONSdigital/explore-local-statistics-app/blob/develop/src/lib/components/charts/Map.svelte
	import { asset } from "$app/paths";
	import { Map, MapSource, MapLayer, MapTooltip } from "@onsvisual/svelte-maps";
	import MapLegend from "./MapLegend.svelte";
	import { valuesToBreaks, valueToColor } from "./map-utils.js";
	import { colors as palette, ukBounds, maxBounds, mapStylePath } from "./config.js";

	let {
		data,
		features,
		metadata,
		selected = $bindable(null),
		hovered = $bindable(null),
		formatValue = (d) => d,
		height = 500
	} = $props();

	const fitBoundsOptions = { padding: 10 };
	const featureCollection = (features) => ({ type: "FeatureCollection", features });

	let map = $state.raw();

	let breaks = $derived(
		valuesToBreaks(
			data.map((d) => d.value),
			metadata.decimalPlaces
		)
	);
	let colors = $derived(palette.sequential.slice(0, breaks.length - 1));

	let renderedFeatures = $derived(
		features.map((f) => ({
			...f,
			properties: { ...f.properties, color: valueToColor(f.properties.value, breaks, colors) }
		}))
	);
	let lookup = $derived(Object.fromEntries(renderedFeatures.map((f) => [f.properties.areacd, f])));
	let selectedFeature = $derived(selected ? lookup[selected] : null);

	// Zoom to the selected area, or back out to the UK when cleared
	$effect(() => {
		if (!map) return;
		map.fitBounds(selectedFeature ? selectedFeature.bbox : ukBounds, {
			padding: selectedFeature ? 50 : fitBoundsOptions.padding,
			duration: 1000
		});
	});
</script>

<p class="ons-u-vh">Map of {metadata.label}. Use the search box above to find an area.</p>
<div aria-hidden="true" class="map-outer">
	<div class="map-container" style:height="{height}px">
		<Map
			bind:map
			style={asset(mapStylePath)}
			location={{ bounds: [ukBounds.slice(0, 2), ukBounds.slice(2)] }}
			options={{
				fitBoundsOptions,
				maxBounds,
				cooperativeGestures: true,
				dragRotate: false
			}}
			controls
			mapDescription="Map of {metadata.label}"
		>
			<MapSource
				id="features"
				type="geojson"
				data={featureCollection(renderedFeatures)}
				promoteId="areacd"
			>
				<MapLayer
					id="fills"
					type="fill"
					paint={{
						"fill-color": ["get", "color"],
						"fill-opacity": 1
					}}
					order="place_other"
					hover
					bind:hovered
					select
					bind:selected
				>
					<MapTooltip content={lookup[hovered]?.properties?.areanm || ""} />
				</MapLayer>
				<MapLayer
					id="outline"
					type="line"
					paint={{
						"line-color": "white",
						"line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.5, 11, 1.2]
					}}
					order="place_other"
				/>
				<MapLayer
					id="hovered"
					type="line"
					paint={{
						"line-color": [
							"case",
							["==", ["feature-state", "hovered"], true],
							palette.hovered,
							"rgba(255,255,255,0)"
						],
						"line-width": 2.5
					}}
					order="place_suburb"
				/>
			</MapSource>
			<MapSource
				id="selected"
				type="geojson"
				data={featureCollection(selectedFeature ? [selectedFeature] : [])}
				promoteId="areacd"
			>
				<MapLayer
					id="highlighted-outline"
					type="line"
					paint={{
						"line-color": "white",
						"line-width": 4.5
					}}
					order="place_other"
				/>
				<MapLayer
					id="highlighted"
					type="line"
					paint={{
						"line-color": palette.selected,
						"line-width": 2.5
					}}
					order="place_other"
				/>
			</MapSource>
		</Map>
	</div>
	<MapLegend
		{data}
		{breaks}
		{colors}
		bind:hovered
		bind:selected
		prefix={metadata.prefix}
		suffix={metadata.suffix}
		labelSuffix={metadata.unit ? ` ${metadata.unit}` : ""}
		format={formatValue}
	/>
</div>

<style>
	.map-container {
		display: block;
		width: 100%;
	}
</style>
