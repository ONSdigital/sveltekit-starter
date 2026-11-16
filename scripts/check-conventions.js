// Checks for mistakes that the compiler and svelte-check don't report (run by `npm run verify`):
//
// - Svelte 4 syntax that still compiles in runes mode, but is deprecated or silently ignored:
//   `on:` event directives (except on svelte-maps and svelte-charts components, which still
//   dispatch Svelte 4-style events), `<slot>`, and `slot="..."` (svelte-components 2 takes snippets,
//   so slotted content isn't rendered).
// - Root-absolute URLs (eg. href="/about/", fetch("/data/file.csv")), which break when the app is
//   built with relative URLs or deployed to a sub-path. Use pageUrl() from $lib/paths.js for pages
//   and asset() from $app/paths for files in static/.
//
// Usage: node scripts/check-conventions.js [files or directories...] (default: src)

import fs from "node:fs";
import path from "node:path";
import { parse } from "svelte/compiler";

const LEGACY_EVENT_PACKAGES = ["@onsvisual/svelte-maps", "@onsvisual/svelte-charts"];
const ROOT_URL = /^\/(?!\/)/; // "/path", but not "//cdn.example.com"

/** @param {string} target @returns {string[]} */
function listFiles(target) {
	if (!fs.existsSync(target)) return [];
	if (fs.statSync(target).isFile()) return [target];
	return fs
		.readdirSync(target, { withFileTypes: true })
		.flatMap((entry) => listFiles(path.join(target, entry.name)))
		.filter((file) => /\.(svelte|js)$/.test(file));
}

/** @param {string} source @param {number} index */
const lineOf = (source, index) => source.slice(0, index).split("\n").length;

/**
 * Names imported from the packages whose components still use Svelte 4-style events
 * @param {string} source
 */
function legacyEventComponents(source) {
	const names = new Set();
	for (const match of source.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/g)) {
		if (!LEGACY_EVENT_PACKAGES.includes(match[2])) continue;
		for (const name of match[1].split(",")) {
			const local = name
				.trim()
				.split(/\s+as\s+/)
				.pop();
			if (local) names.add(local);
		}
	}
	return names;
}

/**
 * Root-absolute URLs in JavaScript: fetch("/..."), and href/src properties such as { href: "/" }
 * @param {string} source
 * @param {number} [offset] where this code starts in the file
 */
function scriptProblems(source, offset = 0) {
	/** @type {{ index: number; message: string }[]} */
	const problems = [];
	for (const match of source.matchAll(/\bfetch\(\s*["'`](\/(?!\/)[^"'`]*)/g))
		problems.push({
			index: offset + /** @type {number} */ (match.index),
			message: `fetch("${match[1]}") uses a root-absolute URL: wrap it in asset() from $app/paths`
		});
	for (const match of source.matchAll(/\b(href|src)\s*:\s*["'`](\/(?!\/)[^"'`]*)/g))
		problems.push({
			index: offset + /** @type {number} */ (match.index),
			message: `${match[1]}: "${match[2]}" is a root-absolute URL: use pageUrl() from $lib/paths.js (pages) or asset() from $app/paths (files)`
		});
	return problems;
}

/** @param {string} file @param {string} source */
function svelteProblems(file, source) {
	/** @type {{ index: number; message: string }[]} */
	const problems = [];
	const ast = parse(source, { modern: true, filename: file });
	const legacy = legacyEventComponents(source);
	for (const script of [ast.instance, ast.module]) {
		if (!script) continue;
		const content = /** @type {{ start: number; end: number }} */ (
			/** @type {unknown} */ (script.content)
		);
		problems.push(...scriptProblems(source.slice(content.start, content.end), content.start));
	}

	/** @param {any} node */
	function walk(node) {
		if (!node || typeof node !== "object") return;
		if (Array.isArray(node)) return node.forEach(walk);
		if (node.type === "SlotElement")
			problems.push({
				index: node.start,
				message:
					"<slot> is Svelte 4 syntax: take a `children` snippet prop and use {@render children()}"
			});
		for (const attribute of node.attributes ?? []) {
			if (attribute.type === "OnDirective" && !(node.type === "Component" && legacy.has(node.name)))
				problems.push({
					index: attribute.start,
					message:
						node.type === "Component"
							? `on:${attribute.name} on <${node.name}>: use its callback prop instead (eg. on${attribute.name[0].toUpperCase()}${attribute.name.slice(1)}={...})`
							: `on:${attribute.name} is Svelte 4 syntax: use the on${attribute.name} attribute instead (eg. on${attribute.name}={...})`
				});
			if (attribute.type === "Attribute" && attribute.name === "slot")
				problems.push({
					index: attribute.start,
					message:
						'slot="..." content isn\'t rendered by Svelte 5 components: pass a snippet instead (eg. {#snippet name()}...{/snippet})'
				});
			if (
				attribute.type === "Attribute" &&
				["href", "src", "action"].includes(attribute.name) &&
				Array.isArray(attribute.value) &&
				attribute.value[0]?.type === "Text" &&
				ROOT_URL.test(attribute.value[0].data)
			)
				problems.push({
					index: attribute.start,
					message: `${attribute.name}="${attribute.value[0].data}" is a root-absolute URL: use pageUrl() from $lib/paths.js (pages) or asset() from $app/paths (files)`
				});
		}
		for (const [key, value] of Object.entries(node))
			if (key !== "attributes" && key !== "parent" && value && typeof value === "object")
				walk(value);
	}
	walk(ast.fragment);
	return problems;
}

const targets = process.argv.slice(2);
const files = (targets.length ? targets : ["src"]).flatMap(listFiles);
let count = 0;
for (const file of files) {
	const source = fs.readFileSync(file, "utf8");
	const problems = file.endsWith(".svelte") ? svelteProblems(file, source) : scriptProblems(source);
	for (const { index, message } of problems.sort((a, b) => a.index - b.index)) {
		console.error(`${file}:${lineOf(source, index)}: ${message}`);
		count++;
	}
}
if (count) {
	console.error(
		`\n${count} problem${count === 1 ? "" : "s"} found by scripts/check-conventions.js`
	);
	process.exit(1);
}
console.log(`Checked ${files.length} files: no problems found.`);
