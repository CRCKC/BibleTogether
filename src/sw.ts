/**
 * Service Worker for handling caching strategies and offline support.
 *
 * This service worker uses Workbox to precache assets and route navigation
 * requests. It listens for messages to skip waiting and cleans up outdated caches.
 *
 * References:
 * - https://developers.google.com/web/tools/workbox
 * - https://vitejs.dev/guide/features.html
 */

/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />

import { createHandlerBoundToURL } from 'workbox-precaching';
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

// Declare service worker global scope.
declare let self: ServiceWorkerGlobalScope;

// Listen for SKIP_WAITING message to immediately activate new service worker.
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});

// Cleanup outdated caches to ensure clients use updated assets.
cleanupOutdatedCaches();

// Precache assets injected by Workbox.
// self.__WB_MANIFEST is populated during the build process with asset revisions.
precacheAndRoute([...self.__WB_MANIFEST]);

// Additional precaching or routing configurations can be added below.
// Example:
// precacheAndRoute([...precache_list]);

// Example commented-out configuration using NavigationRoute:
// registerRoute(
//   new NavigationRoute(createHandlerBoundToURL('/'), {
//     allowlist: [/^\/bible\/.{3}\/[0-9]{1,3}$/]
//   })
// );

// Uncomment and configure the following for custom caching strategies:
// let allowlist: undefined | RegExp[];
// if (import.meta.env.DEV) allowlist = [/^\/bible\/.*$/];
// precache([{ url: '/bible', revision: '1114244' }]);
// registerRoute(new NavigationRoute(createHandlerBoundToURL('/'), { allowlist }));
// console.log('Allow list: ', allowlist);

// Additional note: The commented-out code sections are examples of additional configurations
// for offline support and routing. Modify them as required by your application's needs.
