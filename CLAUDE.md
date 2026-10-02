# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A collection of SvelteKit starter page templates for ONS (Office for National Statistics) data visualisation, built on the [`@onsvisual/svelte-components`](https://github.com/ONSvisual/svelte-components/) library ([Storybook docs](https://onsvisual.github.io/svelte-components/)). Each route in `src/routes/` is a self-contained template (`article`, `feature`, `embed`, `mapsearch`). The root `+page.svelte` is an index linking to them. The intended workflow is that users copy one template's `+page.svelte` over `src/routes/+page.svelte` and delete the rest.

## Commands

```bash
npm install
npm run dev            # dev server at localhost:5173, base path ''
npm run build          # production static build -> /build (base_prod), then scripts/js-fix.js
npm run build:preview  # preview/GitHub Pages build (base_preview, SPA fallback 404.html)
npm run preview        # serve the built app
npm run lint           # prettier --check
npm run format         # prettier --write
```

There is no test suite.

## Architecture and build behaviour

- **Static only**: `@sveltejs/adapter-static` outputs to `build/`. There is no server-side code.
- **Base path switching** (`svelte.config.js`): the base path comes from `src/app.config.js`.
  - Dev: `''`
  - `NODE_ENV=production`: `base_prod` (`/visualisations/sveltekit-starter`, the ONS website)
  - `PUBLIC_APP_ENV=preview`: `base_preview` (`/sveltekit-starter`, the datavisweb preview server or GitHub Pages)

  Never hard-code root-absolute URLs, and do not use the deprecated `base`/`assets` exports. Wrap route links in `resolve()` from `$app/paths` (e.g. `resolve("/article/")`) and static-file URLs (anything in `static/`, including `fetch` calls) in `asset()` (e.g. `asset("/style.json")`). `paths.relative` is `false`.
- **Prerendering** (`src/routes/+layout.js`): prerendering is on unless `PUBLIC_APP_ENV=preview`, in which case the preview build is an SPA with a `404.html` fallback. `trailingSlash = 'always'`.
- **`scripts/js-fix.js`** runs after `npm run build` only. It prepends `//js\n` to every JS file in `build/_app/` to avoid MIME-type errors on the ONS hosting. `build:preview` skips it.
- **`vite.config.js`** drops `console` and `debugger` in builds, so `console.log` output only appears in dev.
- **Global styles**: `src/routes/+layout.svelte` imports the svelte-components CSS, the maplibre-gl CSS and `src/app.css`.
- **`src/lib/config.js`** holds the analytics config (GTM ID and `analyticsProps` placeholders to fill in per product), the colour themes, and demo data (regions, palettes, units).
- **Svelte 5** is installed, but the templates mix syntax. `feature` uses runes (`$state`), while `mapsearch` uses legacy `$:` reactive statements. Match the style of the file you are editing.

## Map + search template (`src/routes/mapsearch/`)

See `src/routes/mapsearch/MAPSEARCH_IMPLEMENTATION.md` for the full design. In summary:
- `src/lib/map-utils.js` loads `static/master-topo.json` (UK boundaries at several geography levels, keyed by `areacd`/`areanm`) through `topojson-client` and caches it in module state.
- It builds the name and code lookups, and does postcode autocomplete through the postcodes.io API.
- It finds the LTLA at a point with `@turf/boolean-point-in-polygon`.
- The page renders the map with `@onsvisual/svelte-maps` using `static/style.json`, and runs search with `AccessibleSelect`.

## Deployment

`.github/workflows/deploy.yml` runs `npm run build:preview` on pushes and PRs to `main`. On a push to `main`, it deploys `build/` to the `gh-pages` branch. Its actions are pinned to commit SHAs, so keep that pinning when you edit the workflow.
