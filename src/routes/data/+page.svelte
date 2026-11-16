<script>
	import {
		PhaseBanner,
		Header,
		Hero,
		Main,
		Section,
		Select,
		ChangeStat,
		Table,
		Footer
	} from "@onsvisual/svelte-components";
	import { BarChart } from "@onsvisual/svelte-charts";
	import { median } from "simple-statistics";

	// Data from +page.js (an array of { areacd, areanm, period, value } rows)
	let { data } = $props();

	const rows = $derived(data.rows);
	// The rows sorted from highest to lowest median age, for ranking
	const ranked = $derived([...rows].sort((a, b) => b.value - a.value));
	const overall = $derived(median(rows.map((row) => row.value)));
	const year = $derived(rows[0]?.period.getFullYear());

	// Options for the area selector, in the { id, label } format that Select expects
	const options = $derived(rows.map((row) => ({ id: row.areacd, label: row.areanm })));

	// The selected area ({ id, label }), bound to the Select. null until one is chosen. In "search"
	// mode, Select clears the value after each selection unless autoClear is false.
	let selected = $state(null);

	const selectedRow = $derived(selected ? rows.find((row) => row.areacd === selected.id) : null);
	const rank = $derived(selectedRow ? ranked.indexOf(selectedRow) + 1 : null);
	const difference = $derived(selectedRow ? selectedRow.value - overall : 0);

	// The chart shows the 11 areas ranked closest to the selected area, or the top 11
	const chartRows = $derived.by(() => {
		const start = rank ? Math.max(0, Math.min(rank - 6, ranked.length - 11)) : 0;
		return ranked.slice(start, start + 11);
	});

	const columns = [
		{ key: "areanm", label: "Area" },
		{ key: "areacd", label: "Code" },
		{ key: "value", label: "Median age (years)", numeric: true, dp: 0 }
	];
</script>

<PhaseBanner phase="Prototype" />
<Header />
<Main>
	<Hero
		title="Median age by local authority"
		lede="An example page that loads data from a CSV file, with an area selector, a chart and a table."
		theme="grey"
		meta={[{ key: "Data", value: `Mid-${year} population estimates` }]}
	/>

	<Section title="Find an area" marginTop={true}>
		<p>
			Across the {rows.length} local authorities in the UK, the median of their median ages is {overall}
			years.
		</p>
		<Select
			id="area"
			mode="search"
			label="Search for a local authority"
			placeholder="eg. Hartlepool"
			{options}
			bind:value={selected}
			autoClear={false}
			clearable={true}
		/>

		{#if selectedRow}
			<p class="ons-u-fs-l ons-u-mt-l ons-u-mb-xs">
				The median age in <strong>{selectedRow.areanm}</strong> is
				<strong>{selectedRow.value} years</strong>.
			</p>
			<ChangeStat
				value={difference === 0
					? null
					: `${Math.abs(difference)} year${Math.abs(difference) === 1 ? "" : "s"}`}
				direction={difference > 0 ? "up" : difference < 0 ? "down" : "neutral"}
				label={difference > 0 ? "older" : difference < 0 ? "younger" : "the same as the median"}
				context={difference === 0 ? null : "than the median local authority"}
			/>
			<p class="ons-u-mt-s">It ranks {rank} of {rows.length}, where 1 is the oldest.</p>
		{/if}
	</Section>

	<Section>
		<!-- svelte-charts don't update their axis labels when the categories in the data change, so
		{#key} recreates the chart when the selection changes -->
		{#key selectedRow?.areacd}
			<BarChart
				data={chartRows}
				xKey="value"
				yKey="areanm"
				idKey="areacd"
				selected={selectedRow?.areacd ?? null}
				title={selectedRow
					? `Areas ranked closest to ${selectedRow.areanm}`
					: "Local authorities with the highest median age"}
				subtitle="Median age, years"
				footer="Source: Office for National Statistics"
			/>
		{/key}
	</Section>

	<Section title="All local authorities">
		<Table data={rows} {columns} sortable compact height={400} />
	</Section>
</Main>
<Footer compact />
