import { writable } from "svelte/store";
import bibleJson from '$lib/bibleList.json';

// Convert bibleList to a dictionary
const bibleList = bibleJson as { [scroll: string]: number; }

export const bible = writable({
    scroll: "GEN",
    chapter: 1,
});

export function setBible(scroll: string, chapter: number) {
    bible.set({ scroll, chapter });
}

export function isChapterValid(scroll: string, chapter: number) {
    // Check if scroll is a key in the bibleList
    const maxChap: number | undefined = bibleList[scroll];

    if (maxChap === undefined) {
        return false;
    }

    // Check if chapter is in the range of the scroll
    if (chapter < 0 || chapter > maxChap) {
        return false;
    }

    return true;
}