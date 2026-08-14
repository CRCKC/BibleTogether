import type { LayoutLoad } from './$types';
import { getAuthState } from '$lib/firebase/authState';

export const load = (async ({ route, url }) => {
	let requireLogin = false;

	if (route.id?.startsWith('/(app)')) {
		// Check if loggedin and redirect to /login if not
		requireLogin = true;
	}

	// requireLogin = false; // Uncomment this line to disable login

	function getAuthUser() {
		return getAuthState();
	}

	return {
		getAuthUser: getAuthUser,
		url: url.pathname,
		requireLogin
	};
}) satisfies LayoutLoad;
