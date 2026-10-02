<script>
	// Adapted from the Explore Local Statistics map legend, simplified for a single selected area:
	// https://github.com/ONSdigital/explore-local-statistics-app/blob/develop/src/lib/components/charts/MapLegend.svelte
	import { colors as palette } from "./config.js";

	let {
		data,
		hovered = $bindable(null),
		selected = $bindable(null), // areacd of the selected area (clicking the legend selects an area)
		lineWidth = 3,
		barHeight = 15,
		labelHeight = 20,
		breaks,
		colors,
		format = (d) => d,
		prefix = "",
		suffix = "", // Added to tick labels and area labels
		labelSuffix = "", // Added to area labels only (eg. ' years')
		snapTicks = true,
		markerPadding = 6
	} = $props();

	let width = $state();

	const unit = $derived(100 / (breaks.length - 1));

	// Position of a value along the legend, as a percentage of its width
	const pos = (val, breaks) => {
		let i = 0;
		while (i < breaks.length - 2 && val > breaks[i + 1]) i += 1;
		const offset = (val - breaks[i]) / (breaks[i + 1] - breaks[i]);
		return (i + offset) * unit;
	};

	// Invisible hover targets spanning the midpoints between neighbouring values
	const makeCells = (data) => {
		const sorted = [...data].sort((a, b) => a.value - b.value);
		return sorted.map((d, i, arr) => {
			const prev = i === 0 ? d.value : (d.value + arr[i - 1].value) / 2;
			const next = i === arr.length - 1 ? d.value : (d.value + arr[i + 1].value) / 2;
			return { ...d, left: pos(prev, breaks), right: pos(next, breaks) };
		});
	};

	// Flip a label to the left of its marker if it would overflow the legend
	const alignLabel = (el, d) => {
		const update = () => {
			el.style.transform =
				el.offsetLeft + el.offsetWidth > width
					? "translateX(-100%) translateX(1.5px)"
					: "translateX(-1.5px)";
		};
		update();
		return { update };
	};

	let cells = $derived(makeCells(data));
	let selectedArea = $derived(selected ? data.find((d) => d.areacd === selected) : null);
	let hoveredArea = $derived(
		hovered && hovered !== selectedArea?.areacd ? data.find((d) => d.areacd === hovered) : null
	);
	let markers = $derived(
		[
			selectedArea && { ...selectedArea, color: palette.selected },
			hoveredArea && { ...hoveredArea, color: palette.hovered }
		].filter(Boolean)
	);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="container"
	style:height="{barHeight}px"
	style:margin-bottom="{10 + labelHeight}px"
	onmouseleave={() => (hovered = null)}
	bind:clientWidth={width}
>
	{#each breaks.slice(1) as brk, i}
		<div
			class="block"
			style:width="{unit}%"
			style:left="{i * unit}%"
			style:background-color={colors[i]}
		></div>
		<div class="line" style:left="{i * unit}%"></div>
		<div
			class="tick"
			style:left="{i * unit}%"
			style:transform="translateX({i == 0 && snapTicks ? '-2px' : '-50%'})"
		>
			{prefix}{format(breaks[i])}{suffix}
		</div>
	{/each}
	<div class="line" style:right="0"></div>
	<div class="tick" style:right="0" style:transform="translateX({snapTicks ? '2px' : '50%'})">
		{prefix}{format(breaks[breaks.length - 1])}{suffix}
	</div>

	{#each markers as d (d.areacd)}
		<div style:opacity={selectedArea && hoveredArea && d.areacd !== hovered ? "30%" : null}>
			<div
				class="marker"
				style:width="{lineWidth}px"
				style:left="calc({pos(d.value, breaks)}% - {lineWidth / 2}px)"
				style:background-color={d.color}
			></div>
			<div
				class="value"
				style:left="{pos(d.value, breaks)}%"
				style:bottom="{-labelHeight}px"
				style:color={d.color}
				style:padding="0 {markerPadding}px"
				use:alignLabel={d}
			>
				{d.areanm}, {prefix}{format(d.value)}{suffix}{labelSuffix}
			</div>
		</div>
	{/each}

	{#each cells as d (d.areacd)}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<div
			class="block cell"
			style:width="{d.right - d.left}%"
			style:left="{d.left}%"
			onmouseenter={() => (hovered = d.areacd)}
			onclick={() => (selected = d.areacd)}
		></div>
	{/each}
</div>

<style>
	.container {
		margin: 32px 0 0 0;
		box-sizing: border-box;
		position: relative;
		width: 100%;
		font-size: 14px;
		forced-color-adjust: none;
	}
	.block {
		position: absolute;
		top: 0;
		height: 100%;
	}
	.cell {
		cursor: pointer;
	}
	.line {
		position: absolute;
		bottom: 0;
		height: calc(100% + 10px);
		border-left: solid 1px black;
	}
	.tick {
		position: absolute;
		z-index: 1;
		bottom: calc(100% + 8px);
		text-align: center;
		transform: translateX(-50%);
		forced-color-adjust: auto;
	}
	.marker {
		position: absolute;
		z-index: 2;
		box-shadow:
			1px 0 white,
			-1px 0 white;
		pointer-events: none;
		bottom: -22px;
		height: calc(100% + 22px);
	}
	.value {
		position: absolute;
		z-index: 3;
		font-weight: bold;
		line-height: 1.2;
		text-align: center;
		white-space: nowrap;
		paint-order: stroke fill;
		-webkit-text-stroke: 4px white;
		pointer-events: none;
	}
</style>
