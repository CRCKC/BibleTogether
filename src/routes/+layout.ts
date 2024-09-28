import type { LayoutLoad } from './$types';

export const load = (async ({ route }) => {

    let requireLogin = false;

    if (route.id?.startsWith("/(app)")) {
        // Check if loggedin and redirect to /login if not
        requireLogin = true;
        // if (await renewToken()) {
        //     requireLogin = false;
        // } else {
        //     requireLogin = true;
        // }
    }

    // requireLogin = false; // Comment this line to enable login

    return {
        requireLogin,
    };
}) satisfies LayoutLoad;