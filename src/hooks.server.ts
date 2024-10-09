
import { error, type Handle } from "@sveltejs/kit";
import { base } from "$app/paths";
import { PUBLIC_FIREBASE_PROXY_TARGET } from "$env/static/public";


const FIREBASE_DOMAIN = PUBLIC_FIREBASE_PROXY_TARGET;
const FIREBASE_AUTH_PATH = "/__/auth";

const handleFirebaseAuthProxy: Handle = async ({ event }) => {

    const origin = event.request.headers.get("Origin");
    
    // reject requests that don't come from the webapp, to avoid your proxy being abused.
    if (!origin || new URL(origin).origin !== event.url.origin) {
        console.log("Request Origin: ", origin);
        console.log("Event URL Origin: ", event.url.origin);
        throw error(403, "Request Forbidden.");
    }

    // strip `base` from the request path
    const strippedPath = event.url.pathname.substring(base.length);
    // build the new URL path with your API base URL, the stripped path and the query string
    const urlPath = `${FIREBASE_DOMAIN}${strippedPath}${event.url.search}`;
    const proxiedUrl = new URL(urlPath);

    const newRequest = event.request.clone();
    newRequest.headers.set("accept-encoding", "");

    return fetch(proxiedUrl, newRequest).catch((err) => {
        console.log("Could not proxy API request: ", err);
        throw err;
    });
};

export const handle: Handle = async ({ event, resolve }) => {
    // intercept requests to `/FIREBASE_AUTH_PATH` and handle them with `handleFirebaseAuthProxy`
    if (event.url.pathname.startsWith(base + FIREBASE_AUTH_PATH)) {
        console.log("Proxying API request");
        return handleFirebaseAuthProxy({ event, resolve });
    }

    // otherwise, continue with the request as-is
    return await resolve(event);
};