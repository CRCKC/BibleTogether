/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
import { createHandlerBoundToURL } from 'workbox-precaching';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

declare let self: ServiceWorkerGlobalScope;

self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// clean old assets
cleanupOutdatedCaches();

// self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST);

// import { build, files, prerendered, version } from '$service-worker';

// const precache_list = [...build, ...files, ...prerendered].map((s) => ({
// 	url: s,
// 	revision: version
// }));

// precacheAndRoute([...precache_list]);

// let allowlist: undefined | RegExp[];
// if (import.meta.env.DEV) allowlist = [/^\/bible\/.*$/];

// precache([{ url: '/bible', revision: '1114244' }]);
// // to allow work offline
// registerRoute(
// 	new NavigationRoute(createHandlerBoundToURL('/'), {
// 		allowlist: [/^\/bible\/.{3}\/[0-9]{1,3}$/]
// 	})
// );

// console.log('Allow list: ', allowlist);

let allowlist: undefined | RegExp[];
if (import.meta.env.DEV) allowlist = [/^\/$/];

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL('/'), { allowlist }));
