import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { isChapterValid, getBibleUrl } from '$lib/bible';
import { loadChapter } from '$lib/server';
export const load = (async ({ params, url }) => {
    // Fromat the parameters
    const chapter = Number.parseInt(params.chapter)
    const scroll = params.scroll.toUpperCase();

    // Redirect to pretty path if the path is not pretty
    const prettyPath = getBibleUrl({ scroll, chapter });
    if (!url.pathname.endsWith(prettyPath)) redirect(308, prettyPath);
    // Check if the chapter is valid
    if (!isChapterValid({ scroll, chapter })) return {};

    const bibleContent = await loadChapter(scroll, chapter);
    return {
        bibleContent,
        bible: { scroll, chapter }
    };
}) satisfies PageServerLoad;



