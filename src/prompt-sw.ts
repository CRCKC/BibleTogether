/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
import {
	cleanupOutdatedCaches,
	createHandlerBoundToURL,
	precacheAndRoute
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

declare let self: ServiceWorkerGlobalScope;

self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// clean old assets
cleanupOutdatedCaches();

// self.__WB_MANIFEST is default injection point
// precacheAndRoute(self.__WB_MANIFEST);
precacheAndRoute([{ url: '/' }, { url: '/home' }, { url: '/bible' }]);

console.log('Service worker: ', self.__WB_MANIFEST);

let allowlist: undefined | RegExp[];
if (import.meta.env.DEV) allowlist = [/^\/*$/, /^\/bible\/*$/];

// to allow work offline
registerRoute(new NavigationRoute(createHandlerBoundToURL('/'), { allowlist }));

console.log('Allow list: ', allowlist);
