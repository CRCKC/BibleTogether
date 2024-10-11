import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { isChapterValid, getBibleUrl } from '$lib/bible';

export const load = (async ({ params, url }) => {
    // Fromat the parameters
    const chapter = Number.parseInt(params.chapter);
    const scroll = params.scroll.toUpperCase();

    if (!isChapterValid({ scroll, chapter })) throw new Error("Invalid chapter");

    // Redirect to pretty path if the path is not pretty
    const prettyPath = getBibleUrl({ scroll, chapter });
    if (!url.pathname.endsWith(prettyPath)) redirect(308, prettyPath);
    // Check if the chapter is valid
    // Return an error page

    return {
        bible: { scroll, chapter }
    };

}) satisfies PageLoad;



