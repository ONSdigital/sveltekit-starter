# AGENTS.md

Guidance for coding agents (Claude Code, GitHub Copilot and others) and for people working on this project. `CLAUDE.md` and `.github/copilot-instructions.md` point here.

## What this is

A SvelteKit app for ONS (Office for National Statistics) data visualisation, built on [`@onsvisual/svelte-components`](https://github.com/ONSdigital/svelte-components/) ([Storybook docs](https://onsdigital.github.io/svelte-components/)). The starter has one template per route in `src/routes/`, and the root `+page.svelte` is an index linking to them:

| Template  | Shows how to                                                                                                   |
| --------- | -------------------------------------------------------------------------------------------------------------- |
| `article` | lay out an article in the style of the ONS website: Hero, Sections, a chart, a blockquote                      |
| `feature` | build a full page feature, with a scrollytelling `Scroller` (snippets and callbacks)                           |
| `embed`   | make an interactive for an iframe (`Embed`), with a bound `Select`                                             |
| `data`    | load a CSV in `+page.js`, with an area search, `$derived` stats, `ChangeStat`, a chart and a `Table`           |
| `map`     | "Interactive map": draw a choropleth map with svelte-maps, with area and postcode search (see its `README.md`) |

There's also an example page, `analytics`, which shows the ONS cookie banner (`AnalyticsBanner`) and how to record interactions with `analyticsEvent()`. It isn't a template to start from: copy what you need from it.

A new app starts from one template: `npm run use-template -- <name>` moves that template's files into `src/routes/` and deletes the others, and the `analytics` example. If `src/routes/` has no template folders, that has already been done. Look at the templates for working examples of the patterns below. After `use-template`, the other templates are only on GitHub: [https://github.com/ONSdigital/sveltekit-starter](https://github.com/ONSdigital/sveltekit-starter) (eg. [the data template](https://github.com/ONSdigital/sveltekit-starter/blob/main/src/routes/data/+page.svelte)).

## Before writing code

- **Read the component docs before using a component, and don't guess prop names.** `node_modules/@onsvisual/svelte-components/dist/llms.txt` has the setup, the rules for using the components, and an index of them. `llms-full.txt` in the same folder adds every component's props (type, default, description) and an example. If you can't read files in `node_modules`, use https://onsdigital.github.io/svelte-components/llms.txt and https://onsdigital.github.io/svelte-components/llms-full.txt. Each component's types are also in `node_modules/@onsvisual/svelte-components/dist/components/<Folder>/<Name>.svelte.d.ts`.
- **Svelte and SvelteKit docs**: if the Svelte MCP server is available (it's configured in `.mcp.json` and `.vscode/mcp.json`), use `list-sections` and `get-documentation` to look up Svelte 5 and SvelteKit features, and run `svelte-autofixer` on the Svelte code you write until it reports no issues. Don't use its `playground-link` tool for code in this project.

## Commands

```bash
npm install
npm run dev            # dev server at http://localhost:5173
npm run verify         # run all the checks below (do this before finishing any change)
npm run lint           # prettier --check .
npm run format         # prettier --write .
npm run check          # svelte-check: types and component props
npm run check:conventions  # scripts/check-conventions.js (see "Checking your work")
npm run build          # production static build -> /build (relative URLs by default), then scripts/js-fix.js
npm run build:preview  # preview/GitHub Pages build (base_preview, SPA fallback 404.html)
npm run preview        # serve the built app
npm run use-template -- <name>  # start an app from one template (needs a clean git tree)
```

## Checking your work

There's no test suite. Instead:

1. **Run `npm run verify`, and fix everything it reports.** It passes on the unchanged starter, so any problem it reports comes from your change. It runs:
   - Prettier (`npm run format` fixes formatting);
   - `svelte-check`, which catches wrong or missing component props and type errors;
   - `scripts/check-conventions.js`, which catches Svelte 4 syntax that still compiles (`on:` directives, `<slot>`, `slot="..."`) and root-absolute URLs;
   - the production build, which prerenders every page, so server-side errors, broken internal links and links to missing `#ids` fail it.
2. **Look at the pages you changed** in `npm run dev`, use them (eg. choose options, scroll), and check the browser console for errors. A clean `verify` doesn't show that a page looks or works right.

## Rules

- **Svelte 5 only.** The app's components are compiled in runes mode (`svelte.config.js`), so `export let`, `$:` and the like are errors. Use `$props()`, `$state()`, `$derived()`, `{@render children()}`, snippets and `onclick`-style event attributes.
- **Events**: svelte-components take callback props, eg. `<Button onClick={...}>`, `<Select onChange={(value) => ...}>`. `@onsvisual/svelte-maps` and `@onsvisual/svelte-charts` components are Svelte 4-style, so use `on:` events (and `bind:`) with those only.
- **Bindings**: bind to a `$state` variable, eg. `let value = $state(null);` and `<Select bind:value />`.
- **URLs**: never write a root-absolute URL (`href="/about/"`, `fetch("/data/x.csv")`), because the app is built with relative URLs and deployed to sub-paths. Link to pages with `pageUrl()` from `$lib/paths.js` (eg. `href={pageUrl("/data")}`), which adds the trailing slash the app's URLs need. Use `asset()` from `$app/paths` for files in `static/` (eg. `asset("/data/median-age.csv")`). Don't use the deprecated `base`/`assets` exports. External links (`https://...`) are fine.
- **Data**: put data files in `static/data/`. Load data a page needs in its `+page.js`, with the `fetch` passed to `load()` and `asset()` (see [the data template's `+page.js`](https://github.com/ONSdigital/sveltekit-starter/blob/main/src/routes/data/+page.js)), so that it's in the prerendered page. Parse CSVs with `csvParse(text, autoType)` from `d3-dsv`. `simple-statistics` is installed for medians, quantiles and so on.
- **Page structure**: `Header`, then `Main` around the content, then `Footer`. `Header` has a skip link to `#main`, which `Main` provides, so `npm run verify` fails without it. Don't put a `Container` inside a `Section`, because `Section` already renders one (see "Architecture" below).
- **Styling**: use the components first, then ONS Design System classes (eg. `ons-u-mb-l`, `ons-grid`), which the svelte-components CSS includes (llms.txt says which version). Put app-wide CSS in `src/app.css`, and component CSS in `<style>` blocks.
- **Accessibility**: form components need a `label` (and an `id`). Charts need a `title`, and the data should also be available in another form, such as a `Table` or a sentence giving the key figures. Give images `alt` text.

### Traps found when building the templates

- `Select` in `mode="search"` clears its value after each selection (`autoClear`), so with `bind:value` set `autoClear={false}`, and `clearable={true}` to show a clear button.
- `BarChart` from svelte-charts doesn't update its axis labels when the categories in its data change (other svelte-charts may behave the same). Wrap the chart in `{#key ...}` on whatever changes the categories (see [the data template](https://github.com/ONSdigital/sveltekit-starter/blob/main/src/routes/data/+page.svelte)).
- svelte-charts animate between datasets, and throw "Cannot interpolate values of different type" in some cases when the data changes shape. `{#key}` avoids this too.
- In the map template's `ChoroplethMap.svelte`, the `Map` import from svelte-maps shadows the global `Map`, so don't use `new Map()` there.

## Starting a new app

1. `npm run use-template -- <name>` (commit any changes first).
2. In `src/app.config.js`, set `app_url`, and `base_prod`/`base_preview` if the app has a fixed path.
3. Set the page title and description in `src/routes/+layout.js` (or a page's `+page.js`).
4. Replace the template's example content and data, keeping the patterns above.
5. `npm run verify`, then look at the pages in `npm run dev`.

Analytics: to add the ONS cookie banner and analytics, fill in `analyticsProps` in `src/lib/config.js` and put `AnalyticsBanner` once in `src/routes/+layout.svelte`, as [the analytics example](https://github.com/ONSdigital/sveltekit-starter/blob/main/src/routes/analytics/+page.svelte) explains. Use `analyticsEvent()` to record interactions.

## Tooling

- **Node**: you need Node 20.19 or later for Vite 7 and `@sveltejs/vite-plugin-svelte` 6. CI uses Node 22.
- **Formatting**: `.prettierrc` matches [ONSdigital/svelte-components](https://github.com/ONSdigital/svelte-components/): tabs, no trailing commas, a print width of 100, and `prettier-plugin-svelte`.
  - `.vscode/settings.json` turns on format-on-save.
  - `.prettierignore` skips lockfiles and `static/`, which holds large data files such as `master-topo.json`. Prettier also skips everything in `.gitignore`.
- **Types**: `jsconfig.json` checks JavaScript with `strict` off, so it reports wrong props and types without needing JSDoc everywhere. Add JSDoc types where they help.
- **`npm audit`**: it reports 3 low-severity `cookie` advisories that come from SvelteKit 2. This is accepted. Don't add an npm `overrides` entry for it; it goes away with SvelteKit 3.

## Architecture and build behaviour

- **Static only**: `@sveltejs/adapter-static` outputs to `build/`. There is no server-side code.
- **Base path switching** (`svelte.config.js`): the base path comes from `src/app.config.js`.
  - Dev: `''`
  - `NODE_ENV=production`: `base_prod`. It defaults to `null`, which means no base path.
  - `PUBLIC_APP_ENV=preview`: `base_preview` (`/sveltekit-starter`, the datavisweb preview server or GitHub Pages)
  - With no base path, `paths.relative` is `true`, so the build works at any path or sub-path. This only works for prerendered pages. Each page works out its base from its own URL in the browser.
  - With a base path, `paths.relative` is `false`, and the app works only at that path.
  - `base_preview` must be a path, and `svelte.config.js` throws if it isn't. The preview build isn't prerendered, so multi-route apps (e.g. `/[areacode]/`) build quickly. It relies on a `404.html` fallback, which SvelteKit always gives absolute URLs. Both GitHub Pages and the internal preview server (via `web.config`) serve the `404.html`.
- **`pageUrl()`** (`src/lib/paths.js`) is `resolve()` from `$app/paths` plus a trailing slash. `resolve()`'s route types don't accept the trailing slash, and without it a link loads the page without the slash, and `src/app.html` then redirects to it.
- **`app_url`** (`src/app.config.js`) is the app's full public address, with no trailing slash. It is used only where a full URL is needed: share tags, the favicon, embed codes and the sitemap. It has no effect on the build or on paths, which come from `base_prod` and `base_preview`. Update it for each product.
- **Page metadata**: the `load` in `src/routes/+layout.js` returns `pageTitle`, `pageDescription` and `canonicalUrl`, and `src/routes/+layout.svelte` turns these into the `<title>`, description, Open Graph and Twitter tags.
  - To override the title or description for one route, add a `+page.js` that returns `pageTitle` and/or `pageDescription`. Page data is merged over layout data.
  - `canonicalUrl` is `app_url` plus the current route. If the URL path starts with `app_url`'s path, that part is removed first, so the base isn't added twice.
  - `og:image` (`static/img/og.png`) and the favicon use `{app_url}/...` rather than `asset()`, because share scrapers need absolute URLs. This is the only exception to the `asset()` rule.
  - The preview build is an SPA, so these tags are only added in the browser. Social scrapers won't see them on preview links, only on the prerendered production build.
- **Prerendering** (`src/routes/+layout.js`): prerendering is on unless `PUBLIC_APP_ENV=preview` (set by `build:preview`; `.env` declares it empty), in which case the preview build is an SPA with a `404.html` fallback. `trailingSlash = 'always'`. Broken links and missing `#ids` are warnings in `npm run build`, and errors in `npm run verify` (`STRICT_PRERENDER=true`).
- **Runes mode**: `compilerOptions.runes` in `svelte.config.js` forces runes mode for files outside `node_modules`. svelte-maps and svelte-charts are Svelte 4-style components, so `node_modules` is left to infer its own mode.
- **`scripts/js-fix.js`** runs after `npm run build` only. It prepends `//js\n` to every JS file in `build/_app/` to avoid MIME-type errors on the ONS hosting. `build:preview` skips it.
- **`vite.config.js`** drops `console` and `debugger` in builds, so `console.log` output only appears in dev.
- **Global styles**: `src/routes/+layout.svelte` imports the svelte-components CSS, the maplibre-gl CSS and `src/app.css`.
- **`src/lib/config.js`** holds the analytics config, the colour themes, and demo data (regions, palettes, units).
- **`Section` vs `Container`** (svelte-components): `Section` renders its own `Container`, which has `marginBottom` set to `true` and `width` set to `"narrow"` (8 of 12 columns at large widths). Don't nest a `Container` inside a `Section`. Use one or the other, and set the margins and width on whichever you use.

## Interactive map template (`src/routes/map/`)

This route is self-contained: its components, config and helpers all live in the folder, and its `README.md` explains how they fit together. After `npm run use-template -- map`, these files are in `src/routes/` instead. In summary:

- It draws an ELS-style choropleth of `static/data/median-age.csv`, using LTLA boundaries from `static/master-topo.json` and the basemap in `static/data/mapstyle.json`.
- Only boundaries with a CSV row are drawn and searchable. The TopoJSON also contains superseded districts that overlap current ones, so don't drop this filter.
- Map data is kept in `$state.raw`, because it is passed to MapLibre's web worker.
- **One `selected` area code is shared** by `AreaSearch`, the map fill layer and `MapLegend`, all through `bind:selected`. Clicking the map, clicking the legend or searching all select an area.
- **`AreaSearch.svelte` wraps `AccessibleSelect`**:
  - It uses `clearable={true}` and `autoClear={false}`. Search mode turns `autoClear` on by default, which hides the clear button. The clear button clears the selection, so there is no separate clear control.
  - It only asks postcodes.io for postcodes when no area names match the query.
  - It ignores results for any query that is no longer the latest one, so a slow lookup can't overwrite newer results.
  - Don't call `blur()` on the input after selecting. `accessible-autocomplete` keeps its own internal query, and blurring makes it write the typed text back over the area name.
- **Colours and units** are set in `config.js`: `colors.hovered` is `#f56927`, `colors.selected` is black, and the sequential palette is the ELS one. Legend ticks use `suffix`, while area labels also get `labelSuffix`, which is the indicator's `unit`.

## Deployment

`.github/workflows/deploy.yml` runs `npm run verify` and then `npm run build:preview` on pushes and PRs to `main`. On a push to `main`, it deploys `build/` to the `gh-pages` branch. Its actions are pinned to exact version tags (e.g. `actions/checkout@v4.4.0`).
