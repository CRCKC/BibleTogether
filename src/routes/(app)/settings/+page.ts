import { fetchUserData } from '$lib/firebase/firestore';
import type { PageLoad } from './$types';

// TODO move this to layout or something to avoid unnecessary calls
export const load = (async () => {
	const userdata = await fetchUserData();
	return {
		userdata
	};
}) satisfies PageLoad;
