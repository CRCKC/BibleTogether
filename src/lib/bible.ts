import { writable, type Writable } from "svelte/store";
import bibleJson from '$lib/bibleList.json';
import { base } from '$app/paths';
import { browser } from "$app/environment"
import { getContext } from "svelte";
// Convert bibleList to a dictionary

export const bibleList = bibleJson as { [scroll: string]: number; }

interface Bible {
    scroll: string
    chapter: number
}



// export const userId = writable(browser && localStorage.getItem("userId") || "webjeda")

export const bibleStore = writable<Bible>(browser && JSON.parse(localStorage.bible) as Bible
    || {
    scroll: "GEN",
    chapter: 1,
});

bibleStore.subscribe((val) => {
    if (browser) return (localStorage.bible = JSON.stringify(val))
})



// bibleStore.subscribe((value) => { if (browser) return (localStorage.bible = JSON.stringify(value)) });


export function getBibleUrl(bible: Bible) {
    return `${base}/bible/${bible.scroll.toLowerCase()}/${bible.chapter}`;
}

export function setBible(bible: Bible) {
    const b = getContext('bible') as Writable<Bible>
    b.set(bible);
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