/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// https://kit.svelte.dev/docs/service-workers#type-safety
const sw = self as unknown as ServiceWorkerGlobalScope;

import { build, files, version } from '$service-worker';

// Create a unique cache name for this deployment
const CACHE = `aj-cache-${version}`;

const ASSETS = [
    ...build, // the app itself
    ...files // everything in `static`
];

sw.addEventListener('install', (event) => {
    // Create a new cache and add all files to it
    async function addFilesToCacheAndSkipWaiting() {
        const cache = await caches.open(CACHE);
        await cache.addAll(ASSETS);
        await sw.skipWaiting();
    }
    event.waitUntil(addFilesToCacheAndSkipWaiting());
    console.log('Service worker installed');
});

sw.addEventListener('activate', (event) => {
    // Remove previous cached data from disk
    async function deleteOldCachesAndClaimClients() {
        for (const key of await caches.keys()) {
            if (key !== CACHE) await caches.delete(key);
        }

        await sw.clients.claim();
    }
    event.waitUntil(deleteOldCachesAndClaimClients());
    console.log('Service worker activated');
});

// // Hardocded checks for origins/paths to send credentials to
// const whitelistedOrigins = [
//     "http://localhost", // dev
//     "http://localhost:3000", // dev
//     "https://tokenstorage.ropnop.dev", // prod
// ]

// const whitelistedPathRegex = /\/api\/[^.]*$/ // anything under /api

// // Global token variable in the service worker
// let token = '';


// // Exposed "method" for saving the token
// self.addEventListener('message', function (event) {
//     if (event.data && event.data.type === 'SET_TOKEN') {
//         token = event.data.token;
//         console.log("[SW] token set!");
//     }
//     if (event.data && event.data.type == 'CLEAR_TOKEN') {
//         token = '';
//         console.log('[SW] token cleared!');
//     }
// })

// // Helper function to add the auth header if the oubound request matches the whitelists
// const addAuthHeader = function (event) {
//     destURL = new URL(event.request.url);
//     if (whitelistedOrigins.includes(destURL.origin) && whitelistedPathRegex.test(destURL.pathname)) {
//         const modifiedHeaders = new Headers(event.request.headers);
//         if (token) {
//             modifiedHeaders.append('Authorization', token)
//         }
//         const authReq = new Request(event.request, { headers: modifiedHeaders, mode: 'cors' });
//         event.respondWith((async () => fetch(authReq))());
//     }
// }

// // Intercept all fetch requests and add the auth header
// self.addEventListener('fetch', addAuthHeader);