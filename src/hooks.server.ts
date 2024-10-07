
// import { error, type Handle } from "@sveltejs/kit";
// import { base } from "$app/paths";
// // export async function handle({ event, resolve }) {
// // 	if (event.url.pathname.startsWith('/custom')) {
// // 		return new Response('custom response');
// // 	}

// // 	const response = await resolve(event);
// // 	return response;
// // }

// const MY_API_BASE_URL = "https://bibletogether.firebaseapp.com";
// const PROXY_PATH = "/__/auth/";

// const handleApiProxy: Handle = async ({ event }) => {
//   const origin = event.request.headers.get("Origin");

//   // reject requests that don't come from the webapp, to avoid your proxy being abused.
//   if (!origin || new URL(origin).origin !== event.url.origin) {
//     throw error(403, "Request Forbidden.");
//   }

//   // strip `/api-proxy` from the request path
//   const strippedPath = event.url.pathname.substring(base.length);
//   console.log(strippedPath);
//   // build the new URL path with your API base URL, the stripped path and the query string
//   const urlPath = `${MY_API_BASE_URL}${strippedPath}${event.url.search}`;
//   const proxiedUrl = new URL(urlPath);

//   // Strip off header added by SvelteKit yet forbidden by underlying HTTP request
//   // library `undici`.
//   // https://github.com/nodejs/undici/issues/1470
//   // event.request.headers.delete("connection");

//   return fetch(proxiedUrl.toString(), {
//     // propagate the request method and body
//     body: event.request.body,
//     method: event.request.method,
//     headers: event.request.headers,
//   }).catch((err) => {
//     console.log("Could not proxy API request: ", err);
//     throw err;
//   });
// };

// export const handle: Handle = async ({ event, resolve }) => {
//   // intercept requests to `/api-proxy` and handle them with `handleApiProxy`
//   console.log(event.url.pathname);
//   console.log(base + PROXY_PATH);
//   if (event.url.pathname.startsWith(base + PROXY_PATH)) {
//     console.log("Proxying API request");
//     return await handleApiProxy({ event, resolve });
//   }

//   // ...the rest of your `handle` logic goes here
//   return await resolve(event);
// };