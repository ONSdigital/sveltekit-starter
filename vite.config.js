// vite.config.js
import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
        plugins: [sveltekit()],
        //removes console.logs in production
        esbuild: {
                drop: ['console', 'debugger'],
        }
};

export default config;
