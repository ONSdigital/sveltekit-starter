// Start an app from one of the templates: npm run use-template -- <name>
//
// Moves the files of src/routes/<name>/ into src/routes/ (replacing the index page) and deletes the
// other templates and the example pages (eg. analytics). It refuses to run if git has uncommitted changes, so it can be undone with git.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROUTES = "src/routes";
const TEMPLATES = {
	article: "An article page in the style of the ONS website",
	feature: "A full page feature article, with scrollytelling",
	embed: "An interactive designed to be embedded in an iframe",
	data: "A page that loads a CSV file, with an area search, a chart, a table and a stat",
	map: "An interactive choropleth map, with area and postcode search"
};
// Example pages to copy code from, which are deleted along with the unused templates
const EXAMPLES = ["analytics"];

const name = process.argv[2];
if (!name || !(name in TEMPLATES)) {
	console.error("Usage: npm run use-template -- <name>\n\nTemplates:");
	for (const [key, description] of Object.entries(TEMPLATES))
		console.error(`  ${key.padEnd(8)} ${description}`);
	process.exit(1);
}

const present = Object.keys(TEMPLATES).filter((t) => fs.existsSync(path.join(ROUTES, t)));
if (!present.includes(name)) {
	console.error(`src/routes/${name}/ doesn't exist (has a template already been chosen?)`);
	process.exit(1);
}

try {
	const status = execFileSync("git", ["status", "--porcelain"], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "ignore"]
	});
	if (status.trim()) {
		console.error(
			"Commit or stash your changes first, so that this can be undone with git:\n" + status
		);
		process.exit(1);
	}
} catch {
	console.error(`This script needs a git repository, so that its changes can be undone. If you
downloaded the starter as a ZIP file, start one with:

  git init && git add -A && git commit -m "Start from sveltekit-starter"

and run this again.`);
	process.exit(1);
}

const source = path.join(ROUTES, name);
for (const file of fs.readdirSync(source)) {
	fs.renameSync(path.join(source, file), path.join(ROUTES, file));
	console.log(`moved src/routes/${name}/${file} -> src/routes/${file}`);
}
for (const template of [
	...present,
	...EXAMPLES.filter((e) => fs.existsSync(path.join(ROUTES, e)))
]) {
	fs.rmSync(path.join(ROUTES, template), { recursive: true, force: true });
	console.log(`deleted src/routes/${template}/`);
}

console.log(`
Your app now starts from the "${name}" template. Next:
- In src/app.config.js, set app_url (and base_prod/base_preview if the app has a fixed path).
- Set the page title and description in src/routes/+layout.js.
- Run npm run verify, then commit.`);
