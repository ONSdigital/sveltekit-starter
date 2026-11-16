---
name: review-page
description: Review a page in this app against the project rules (svelte-components usage, Svelte 5, URLs, data loading, accessibility, leftover template content). Use before publishing or when asked to review or check a page.
---

Review the page (or the pages changed on this branch) against [AGENTS.md](../../../AGENTS.md). Report problems with file and line, most important first, and fix them only if asked.

- **Checks**: does `npm run verify` pass?
- **Components**: are svelte-components used where one exists (eg. `Section`, `Table`, `Select`), with props that exist in `node_modules/@onsvisual/svelte-components/dist/llms-full.txt`? No `Container` inside a `Section`?
- **Svelte 5**: callback props on svelte-components (`on:` only on svelte-maps/svelte-charts components), snippets not slots, `$state`/`$derived`/`$props`, and bound variables that start with a value?
- **URLs and data**: page links use `pageUrl()`, files in `static/` use `asset()`, no root-absolute URLs; data a page needs is loaded in its `+page.js`?
- **Accessibility**: a label on every form control, `alt` text on images, a title on every chart and its data also available as text or a table, headings in order, and `Main` on every page with a `Header`?
- **Content**: no leftover template text (lorem ipsum, "Section title", placeholders), a real page title and description, a source line for each chart and table, numbers that match the data?
- **Behaviour**: in `npm run dev`, does the page work when used (searching, selecting, scrolling, clearing a selection), with no errors in the browser console? Does it work on a narrow (mobile) screen?
