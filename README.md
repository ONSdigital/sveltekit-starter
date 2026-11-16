# sveltekit-starter

Starter page templates using the [ONS svelte-components library](https://github.com/ONSdigital/svelte-components/).

**[→ View live demo](https://onsdigital.github.io/sveltekit-starter/)**

## Using these templates

Create a fork or local copy of this repository ([ZIP download](https://github.com/ONSdigital/sveltekit-starter/archive/refs/heads/main.zip)), and then run the following command to install dependencies:

```bash
npm install
```

With dependencies installed, you should be able to preview the templates locally at [localhost:5173](http://localhost:5173) using the following command:

```bash
npm run dev
```

The templates are in the **/src/routes/** folder:

| Template  | What it is                                                                     |
| --------- | ------------------------------------------------------------------------------ |
| `article` | An article page in the style of the ONS website                                |
| `feature` | A full page feature article, with scrollytelling                               |
| `embed`   | An interactive designed to be embedded in an iframe                            |
| `data`    | A page that loads a CSV file, with an area search, a chart, a table and a stat |
| `map`     | A choropleth map with area and postcode search                                 |

To start an app from one of them, commit any changes and run this command, with the template's name. (If you downloaded the ZIP file, first start a git repository: `git init && git add -A && git commit -m "Start from sveltekit-starter"`.) It moves the template's files into **/src/routes/**, replacing the index page, and deletes the other templates:

```bash
npm run use-template -- data
```

Then set **app_url** in **/src/app.config.js**, and the page title and description in **/src/routes/+layout.js**.

To do more with the ONS svelte-components library, you will probably want to refer to the [Storybook pages](https://onsdigital.github.io/svelte-components/).

### Checking your changes

Run this command before you commit or publish:

```bash
npm run verify
```

It checks the formatting (fix it with `npm run format`), the components' props and types, some common mistakes (such as links that start with `/`, which break when the app is published to a sub-folder) and that every page builds, with no broken links. It also runs when you push to GitHub or open a pull request.

## Building with a coding agent

This starter is set up for coding agents such as Claude Code and GitHub Copilot (in agent mode):

- **[AGENTS.md](AGENTS.md)** tells agents how the project works, where to find the svelte-components docs (the `llms.txt` files in the package), the rules to follow and how to check their work. Claude Code reads it through **CLAUDE.md**, and Copilot reads it directly or through **.github/copilot-instructions.md**.
- **Svelte MCP server**: `.mcp.json` (Claude Code) and `.vscode/mcp.json` (VS Code) add the official [Svelte MCP server](https://svelte.dev/docs/mcp/overview), which gives agents the Svelte docs and a tool that checks the Svelte code they write. Your tool asks you to allow it the first time.
- **Workflows**: `new-app` starts an app from a brief, and `review-page` reviews a page before you publish it. In Claude Code, ask for them by name or type `/new-app`. In Copilot Chat, type `/new-app` or `/review-page` (they're in **.github/prompts/**).

Tips:

- Start by describing what you want, with the data, and ask the agent for a plan before it writes code.
- Ask it to run `npm run verify`, and look at the pages yourself in `npm run dev`. Agents can make pages that pass the checks but look or read wrong.
- Review the changes like any other code before you publish: the text, the numbers, the accessibility (labels, alt text, a table for each chart) and that no template text is left.

## Building and Deploying

When you're ready to publish the app (either for preview or for production), you'll need to run the **build** or **build:preview** command. This will build a static version of the app in the **/build** folder, the contents of which can be copied to wherever you want to host the app:

```bash
npm run build
```

### Automatic Deployment

This repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys to GitHub Pages on every push to `main`.

To enable automatic deployment:

1. Go to **Settings → Pages**
2. Set **Source** to "Deploy from a branch"
3. Set **Branch** to `gh-pages` and **Folder** to `/ (root)`
4. Save

The workflow will:

- Build the app using `npm run build:preview`
- Deploy to GitHub Pages automatically
- Be accessible at `https://onsdigital.github.io/your-repo-name/`

### Configuration

The base paths for the preview and production builds are set in the **/src/app.config.js** file:

```javascript
export const base_prod = null; // Directory on the ONS website (null = any path)
export const base_preview = "/sveltekit-starter"; // Directory on datavisweb preview server or Github Pages
```

- **null** (the default for production) builds the app with relative URLs. The contents of the **/build** folder can then be deployed to any path or sub-path.
- **A path** (eg. **/visualisations/my-app**) builds the app for that directory only, with absolute URLs.

The preview build needs a path, because it isn't prerendered and relies on a **404.html** fallback page, which always uses absolute URLs.

To build the preview version of the app, which uses the alternate **base_preview** path, you'll need to run this command:

```bash
npm run build:preview
```

## Additional templates

The following semi-automated journalism (AKA "robo-journalism") templates are also available:

- [robo-article](https://github.com/ONSdigital/robo-article)
- [robo-embed](https://github.com/ONSdigital/robo-embed)
