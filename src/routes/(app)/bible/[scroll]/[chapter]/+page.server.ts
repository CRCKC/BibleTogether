import type { PageServerLoad } from './$types';
import bibleList from '$lib/bibleList.json';
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';

export const load = (async ({ params, url }) => {
    // Fromat the parameters
    const chap = Number.parseInt(params.chapter)
    const scroll = params.scroll.toUpperCase();

    // Redirect to pretty path if the path is not pretty
    const prettyPath = `/bible/${scroll.toLowerCase()}/${chap}`;
    if (!url.pathname.endsWith(prettyPath)) redirect(308, `${base}${prettyPath}`);
    // Check if the chapter is valid
    if (!isChapterValid(scroll, chap)) return {};

    const bibleContent = await loadChapter(scroll, chap);
    return {
        bibleContent,
    };
}) satisfies PageServerLoad;

async function loadChapter(scroll: string, chapter: number) {
    let bibleContent = '';

    try {
        // Use local file from lib/bible
        const path = await import(`$lib/bible/${scroll}_${chapter}.html?raw`);
        bibleContent = path.default;

        // Use fetch to get file from remote server
        // const response = await fetch();
        // const content = await response.text();
    } catch (error) {
        console.error('Error reading file:', error);
    }

    return bibleContent;
}

function isChapterValid(scroll: string, chapter: number) {

    // Convert bibleList to a dictionary
    const bible = bibleList as { [scroll: string]: number; }

    // Check if scroll is a key in the bibleList
    const maxChap: number | undefined = bible[scroll];

    if (maxChap === undefined) {
        return false;
    }

    // Check if chapter is in the range of the scroll
    if (chapter < 0 || chapter > maxChap) {
        return false;
    }

    return true;
}
