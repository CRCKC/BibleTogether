import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
    const chap = Number.parseInt(params.chapter)
    const scroll = params.scroll.toUpperCase();
    const bibleContent = await loadChapter(scroll, chap);
    return {
        bibleContent,
    };
}) satisfies PageServerLoad;

async function loadChapter(scroll: string, chapter: number) {
    let bibleContent = '';
    try {
        // Use local file from lib/bible
        const path = await import(`../../../../../lib/bible/${scroll}_${chapter}.html?raw`);
        bibleContent = path.default;

        // Use fetch to get file from remote server
        // const response = await fetch();
        // const content = await response.text();
    } catch (error) {
        console.error('Error reading file:', error);
    }

    return bibleContent;
}