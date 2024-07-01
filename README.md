# sveltekit-starter

Starter page templates using the [ONS svelte-components library](https://github.com/ONSvisual/svelte-components/).

A preview of these templates can be [found here](https://onsvisual.github.io/sveltekit-starter/).

## Using these templates

Create a fork or local copy of this repository ([ZIP download](https://github.com/ONSvisual/sveltekit-starter/archive/refs/heads/main.zip)), and then run the following command to install dependencies:

```bash
npm install
```

With dependencies installed, you should be able to preview the templates locally at [localhost:5173](http://localhost:5173) using the following command:

```bash
npm run dev
```

You will find the code for the starter templates within the /src/routes/ folder. You will probably want to take the **+page.svelte** file for the relevant template folder, overwrite the **/src/routes/+pages.svelte** file, and then delete the templates that you don't intend to use.

To do more with the ONS svelte-components library, you will probably want to refer to the [Storybook pages](https://onsvisual.github.io/svelte-components/).

## Building the app

When you're ready to publish the app (either for preview or for production), you'll need to run the **build** or **build:preview** command. This will build a static version of the app in the **/build** folder, the contents of which can be copied to wherever you want to host the app:

```bash
npm run build
```

Before building the app, you'll need to customise the base paths in the **/app.config.js** file. The default path is **/sveltekit-starter**. You can set a separate base-relative path for a preview server (eg. **/my-app**) and for a production server (eg. **/visualisations/my-app**):

```javascript
export const base_prod = '/visualisations/sveltekit-starter'; // Directory on the ONS website
export const base_preview = '/sveltekit-starter'; // Directory on datavisweb preview server or Github Pages
```

To build the preview version of the app, which uses the alternate **base_preview** path, you'll need to run this command:

```bash
npm run build:preview
```

## Additional templates

The following semi-automated journalism (AKA "robo-journalism") templates are also available:

- [robo-article](https://github.com/ONSvisual/robo-article)
- [robo-embed](https://github.com/ONSvisual/robo-embed)
