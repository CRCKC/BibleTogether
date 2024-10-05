//This file is here to trigger the service worker build for dev, but in production somehow this is the actual file thats being used

// These listeners will make the service worker immediately available for the page
self.addEventListener('install', function (event) {
    event.waitUntil(self.skipWaiting());
    console.log('[SW] serviceworker installed!');
});

self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim());
    console.log('[SW] serviceworker ready!');
});

// Hardocded checks for origins/paths to send credentials to
const whitelistedOrigins = [
    // "http://localhost:4000", // dev
    "https://script.google.com",
]

const whitelistedPath = "/macros/s/AKfycbyHK1TAydIP8IpLlqRk5buaei-KpbUGUl_eG6FZ-7Z3uFUQ2IyvYWHzQDPIiNYYKnyl/exec"


// const whitelistedPathRegex = /\/exec*$/ // anything under /api

// Global token variable in the service worker
let token = '';


// Exposed "method" for saving the token
self.addEventListener('message', function (event) {
    if (event.data && event.data.type === 'SET_TOKEN') {
        token = event.data.token;
        console.log("[SW] token set! ");
    }
    if (event.data && event.data.type == 'CLEAR_TOKEN') {
        token = undefined;
        console.log('[SW] token cleared!');
    }
    if (event.data && event.data.type == 'HAS_TOKEN') {
        console.log('[SW] checking token state!');
    }
})

// Helper function to add the auth header if the oubound request matches the whitelists
const addAuthHeader = function (event) {
    const destURL = new URL(event.request.url);
    // if (whitelistedOrigins.includes(destURL.origin) && whitelistedPathRegex.test(destURL.pathname)) {
    if (whitelistedOrigins.includes(destURL.origin) && destURL.pathname.startsWith(whitelistedPath) && event.request.method === 'POST') {
        console.log("[SW] Intercepted request to whitelisted origin: ", destURL.url);
        event.respondWith((async () => {
            const body = await event.request.clone().json();

            // Check if the request body is a json object
            if (body && body.constructor === Object && token) {
                console.log("[SW] Added token to request");
                body.token = token;
            }
            const authReq = new Request(
                event.request,
                {
                    body: JSON.stringify(body),
                }
            );

            return fetch(authReq);
        }
        )());
    }

}

// Intercept all fetch requests and add the auth header
self.addEventListener('fetch', addAuthHeader);