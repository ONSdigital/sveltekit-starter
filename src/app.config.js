// APP CONFIG

// BASE PATHS

// - base_prod is either a path (eg. "/visualisations/my-app") or null.
//   - A path builds the app for that directory only, with absolute URLs (paths.relative = false).
//   - null builds the app with relative URLs (paths.relative = true), so it can be deployed to any
//     path or sub-path. This relies on every route being prerendered, which the production build is.
export const base_prod = null; // Directory on the ONS website (null = any path)

// - base_preview must be a path, and the preview build fails without one. The preview build is not
//   prerendered (to keep multi-route apps quick to build): it is a single 404.html fallback page,
//   and SvelteKit always gives fallback pages absolute URLs.
export const base_preview = "/sveltekit-starter"; // Directory on datavisweb preview server or Github Pages

// - app_url is the public address of the app, with no trailing slash. This is only used in places where
//   the app needs a full, absolute URL (share tags, embed codes and the sitemap). It doesn't affect the
//   build or the paths the app uses, which are set by base_prod and base_preview above.
export const app_url = "https://onsdigital.github.io/sveltekit-starter";
