/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';

declare let self: ServiceWorkerGlobalScope;

self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

cleanupOutdatedCaches();
precacheAndRoute([...self.__WB_MANIFEST]);

// ponytail: SPA navigation fallback for offline.
// NetworkOnly tries the real server; when offline the handlerDidError plugin
// returns cached index.html so the app shell still loads for any route.
const CACHE = 'nav-shell';
self.addEventListener('install', (e) => {
	e.waitUntil(
		caches.open(CACHE).then(async (cache) => {
			try { const r = await fetch('/index.html'); cache.put('/index.html', r); } catch {}
		})
	);
});

registerRoute(new NavigationRoute(
	new NetworkOnly({
		plugins: [{
			handlerDidError: async () => caches.match('/index.html')
		}]
	}),
	{ denylist: [/^\/__\//] }
));
