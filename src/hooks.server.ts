
import { error, type Handle } from "@sveltejs/kit";
import { base } from "$app/paths";
// export async function handle({ event, resolve }) {
// 	if (event.url.pathname.startsWith('/custom')) {
// 		return new Response('custom response');
// 	}

// 	const response = await resolve(event);
// 	return response;
// }

const FIREBASE_DOMAIN = "https://bibletogether.firebaseapp.com";
const FIREBASE_AUTH_PATH = "/__/auth";

const handleFirebaseAuthProxy: Handle = async ({ event }) => {
    const origin = event.request.headers.get("Origin");

    // reject requests that don't come from the webapp, to avoid your proxy being abused.
    if (!origin || new URL(origin).origin !== event.url.origin) {
        console.log("Request Origin: ", origin);
        console.log("Event URL Origin: ", event.url.origin);
        throw error(403, "Request Forbidden.");
    }

    // strip `/api-proxy` from the request path
    const strippedPath = event.url.pathname.substring(base.length);
    // build the new URL path with your API base URL, the stripped path and the query string
    const urlPath = `${FIREBASE_DOMAIN}${strippedPath}${event.url.search}`;
    const proxiedUrl = new URL(urlPath);


    console.log("Proxying request to: ", proxiedUrl.toString());

    const newRequest = event.request.clone();
    // newRequest.headers.set("Accept", "application/html");

    return fetch(proxiedUrl, newRequest).catch((err) => {
        console.log("Could not proxy API request: ", err);
        throw err;
    });
};

export const handle: Handle = async ({ event, resolve }) => {
    // intercept requests to `/api-proxy` and handle them with `handleApiProxy`
    if (event.url.pathname.startsWith(base + FIREBASE_AUTH_PATH)) {
        console.log("Proxying API request");
        return handleFirebaseAuthProxy({ event, resolve });
    }

    // ...the rest of your `handle` logic goes here
    return await resolve(event);
};