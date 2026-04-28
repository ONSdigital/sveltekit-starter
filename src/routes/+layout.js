import * as env from '$env/static/public';

export const prerender = env?.PUBLIC_APP_ENV !== 'preview';
export const trailingSlash = 'always';