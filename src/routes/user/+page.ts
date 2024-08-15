import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';


export const load = (async () => {
    redirect(308, `${base}/user/login`);
}) satisfies PageLoad;
