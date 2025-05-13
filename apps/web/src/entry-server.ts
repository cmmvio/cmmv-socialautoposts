//@ts-ignore
import { createSSRApp } from 'vue';
//@ts-ignore
import { loadEnv } from 'vite';
//@ts-ignore
import { createHead } from '@unhead/vue/server'
//@ts-ignore
import { renderToString } from 'vue/server-renderer';
import { createPiniaInstance } from "./store/index";
import { createRouter } from "./routes";

import App from './App.vue';

const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), 'VITE');

export async function render(url: string) {
    try {
        globalThis.__SSR_DATA__ = {};
        globalThis.__SSR_METADATA__ = {};

        const app = createSSRApp(App);
        const head = createHead();
        const pinia = createPiniaInstance();

        app.use(pinia);
        app.use(head);

        const router = createRouter();

        router.push(url);
        await router.isReady();

        const route = router.currentRoute.value
        const match = matchLegacyRedirect(route);

        if (match)
            return { redirect: match }

        app.use(router);
        await renderToString(app);

        const prefetchPromises = Object.values(globalThis.__SSR_DATA__ || {});
        await Promise.all(prefetchPromises);

        const resolvedData = await resolveSSRData(globalThis.__SSR_DATA__);
        const appFinal = createSSRApp(App);
        const headFinal = createHead();

        appFinal.use(router);
        appFinal.use(headFinal);
        appFinal.use(pinia);
        appFinal.provide('preloaded', resolvedData);

        const html = await renderToString(appFinal);

        return {
            html,
            head: headFinal,
            preloadedData: resolvedData,
            metadata: globalThis.__SSR_METADATA__,
            piniaState: pinia.state.value
        }
    } catch (e: any) {}
}

function matchLegacyRedirect(route: any): string | null {
    const slug = route.params.slug;

    const legacyPaths = [
        /^\/\d{4}\/\d{2}\/\d{2}\/(.+?)\/?$/,
        /^\/\d{4}\/\d{2}\/(.+?)\/?$/,
        /^\/arquivos\/(\d+)$/,
        /^\/\?p=(\d+)$/
    ];

    for (const pattern of legacyPaths) {
        const match = route.fullPath.match(pattern);

        if (match)
            return `/post/${match[1]}`;
    }

    return null;
}

async function resolveSSRData(obj: Record<string, Promise<any>>) {
    if (!obj || Object.keys(obj).length === 0) return {};

    const keys = Object.keys(obj)

    const resolvedEntries = await Promise.all(
        keys.map(async (key) => {
            try {
                const value = obj[key];
                const resolvedValue = value instanceof Promise ? await value : value;
                return [key, resolvedValue];
            } catch (error) {
                return [key, null];
            }
        })
    )

    return Object.fromEntries(resolvedEntries)
}
