---
name: new-app
description: Start a new ONS data visualisation app from one of the sveltekit-starter templates, from a brief to a checked page. Use when someone wants to build a new page, article, embed, map or data app with this starter.
---

Build a new ONS data visualisation app from this starter, following [AGENTS.md](../../../AGENTS.md).

1. **Understand the brief.** Ask for anything you need and don't have: what the page is for, which data (a file to put in `static/data/`, or where to get it), and how it will be published (a standalone page, an embed, or a feature).
2. **Choose a template** from the table in AGENTS.md: `article`, `feature`, `embed`, `data` or `map`. Say which one and why, then run `npm run use-template -- <name>` (commit or stash any changes first; if the project isn't a git repository yet, eg. it was downloaded as a ZIP, run `git init && git add -A && git commit -m "Start from sveltekit-starter"` first). If `src/routes/` has no template folders, a template has already been chosen: build on what's there.
3. **Configure the app**: set `app_url` in `src/app.config.js`, and the page title and description in `src/routes/+layout.js` or the page's `+page.js`.
4. **Build the page.** Before using a component, check its props in `node_modules/@onsvisual/svelte-components/dist/llms-full.txt`. Keep the patterns in the template: data loaded in `+page.js` with `asset()`, links with `pageUrl()`, callback props, `$state`/`$derived`. Replace all example text and data.
5. **Check it**: run `npm run verify` and fix everything it reports. Then run `npm run dev`, use the page (search, select, scroll) and check the browser console for errors. If you can't open a browser, say so and ask the user to check.
6. **Review it** with the checklist in the review-page workflow, and report what you built, how you checked it, and anything left to do (eg. analytics, real copy, sign-off).
