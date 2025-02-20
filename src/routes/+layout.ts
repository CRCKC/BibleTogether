import type { LayoutLoad } from './$types';
import { firebaseAuth } from '$lib/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export const load = (async ({ route, url }) => {
	let requireLogin = false;

	if (route.id?.startsWith('/(app)')) {
		// Check if loggedin and redirect to /login if not
		requireLogin = true;
	}

	// requireLogin = false; // Comment this line to disable login

	function getAuthUser() {
		return new Promise((resolve) => {
			onAuthStateChanged(firebaseAuth, (user) => resolve(user ? user : false));
		});
	}

	return {
		getAuthUser: getAuthUser,
		url: url.pathname,
		requireLogin
	};
}) satisfies LayoutLoad;
