import { writable } from "svelte/store";
import bibleJson from '$lib/bibleList.json';
import { base } from '$app/paths';
// Convert bibleList to a dictionary
// import { browser } from "$app/environment"

const bibleList = bibleJson as { [scroll: string]: number; }

interface Bible {
    scroll: string
    chapter: number
}


export const bibleStore = writable<Bible>({
    scroll: "GEN",
    chapter: 1,
});




// bibleStore.subscribe((value) => { if (browser) return (localStorage.bible = JSON.stringify(value)) });


export function getBibleUrl(bible: Bible) {
    return `${base}/bible/${bible.scroll.toLowerCase()}/${bible.chapter}`;
}

export function setBible(bible: Bible) {
    bibleStore.set(bible);
}

export function isChapterValid(bible: Bible): boolean {
    // Check if scroll is a key in the bibleList
    const maxChap: number | undefined = bibleList[bible.scroll];

    if (maxChap === undefined) {
        return false;
    }

    // Check if chapter is in the range of the scroll
    if (bible.chapter < 0 || bible.chapter > maxChap) {
        return false;
    }

    return true;
}