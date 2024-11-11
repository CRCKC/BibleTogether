import { build, files, prerendered, version } from "$service-worker";
import { precacheAndRoute } from "workbox-precaching";

const precache_list = [
    ...build,
    ...files,
    ...prerendered,
].map((s) => ({
    url: s,
    revision: version,
}));

precacheAndRoute(precache_list);

// self.addEventListener('fetch', function (event) {
//     event.respondWith(fetch(event.request))
// })

self.addEventListener("install", () => {
    // The promise that skipWaiting() returns can be safely ignored.
    self.skipWaiting();
  
    // Perform any other actions required for your
    // service worker to install, potentially inside
    // of event.waitUntil();
  });
  