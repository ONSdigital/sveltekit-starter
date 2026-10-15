import * as env from "$env/static/public";
import { app_url } from "../app.config.js";

export const prerender = env?.PUBLIC_APP_ENV !== "preview";
export const trailingSlash = "always";

export function load({ url }) {
	const appUrl = new URL(app_url);
	const appPath = appUrl.pathname.replace(/\/$/, ""); // '' or '/my-app'

	const pathname = url.pathname;
	const relativePath =
		appPath && (pathname === appPath || pathname.startsWith(appPath + "/"))
			? pathname.slice(appPath.length) || "/"
			: pathname;

	return {
		// This title and description will populate the page metadata
		// You can override these layout-level values using per-route +page.js load functions
		pageTitle: "Page title - ONS",
		pageDescription: "A description of this page.",
		canonicalUrl: appUrl.origin + appPath + relativePath
	};
}
