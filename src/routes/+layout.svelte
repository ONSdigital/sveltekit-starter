<script>
	import "@onsvisual/svelte-components/css/main.css";
	import "maplibre-gl/dist/maplibre-gl.css";
	import "../app.css";
	import { page } from "$app/state";
	import { app_url } from "../app.config.js";
</script>

<svelte:head>
	<title>{page.data?.pageTitle || ""}</title>
	<link rel="icon" type="image/x-icon" href="{app_url}/favicon.ico" />
	<meta property="og:title" content={page.data?.pageTitle || ""} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={page.data?.canonicalUrl || app_url} />
	<meta property="og:image" content="{app_url}/img/og.png" />
	<meta property="og:image:type" content="image/png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta property="og:description" content={page.data?.pageDescription || ""} />
	<meta name="description" content={page.data?.pageDescription || ""} />
</svelte:head>

<slot />
