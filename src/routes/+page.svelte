<script>
	import { pageUrl } from "$lib/paths.js";
	import { Header, Main, Section, Grid, Card, Footer } from "@onsvisual/svelte-components";
</script>

<Header title="Svelte Kit starter templates" />

<Main>
	<Section marginTop={true}>
		<p>
			Select a template below to preview. These templates are created using the <a
				href="https://github.com/ONSdigital/svelte-components/">ONS svelte-components library</a
			>. To use them in Svelte Kit projects, follow the
			<a href="https://github.com/ONSdigital/sveltekit-starter/">guidance in this readme</a>.
		</p>
	</Section>

	<Grid>
		<Card title="Regular article" href={pageUrl("/article")} mode="featured" baseline>
			An article page in a style that matches the ONS website.
		</Card>
		<Card title="Feature article" href={pageUrl("/feature")} mode="featured" baseline>
			A full page template for scrollytelling or media-rich articles.
		</Card>
		<Card title="Embedded interactive" href={pageUrl("/embed")} mode="featured" baseline>
			A template for interactive content to be embedded within an iframe.
		</Card>
		<Card title="Data page" href={pageUrl("/data")} mode="featured" baseline>
			A page that loads data from a CSV file, with an area search, a chart, a table and a stat.
		</Card>
		<Card title="Map and search" href={pageUrl("/map")} mode="featured" baseline>
			A choropleth map in the style of Explore Local Statistics, with area and postcode search.
		</Card>
	</Grid>

	<Section>
		<p>
			For more documentation and usage examples for the ONS svelte-components library, you can visit
			the <a href="https://onsdigital.github.io/svelte-components/">Storybook pages</a>.
		</p>
	</Section>
</Main>

<Footer compact />
