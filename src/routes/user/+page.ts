import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { page } from '$app/stores';
import { get } from 'svelte/store';


export const load = (async () => {
    const path = get(page).url.pathname;
    console.log(path);
    redirect(308, `${path}/login`);

}) satisfies PageLoad;