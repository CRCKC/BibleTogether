import { persisted } from 'svelte-persisted-store'
import bibleJson from '$lib/bibleList.json';
import bibleChineseJson from '$lib/bibleChinese.json';
import { base } from '$app/paths';

// Convert bibleList to a dictionary
export const bibleList = bibleJson as { [scroll: string]: number; }
export const bibleChinese = bibleChineseJson as { [scroll: string]: string };

interface Bible {
    scroll: string
    chapter: number
}

export const bibleStore = persisted<Bible>('bible', {
    scroll: "GEN",
    chapter: 1,
},
    {
        syncTabs: false,
    }
);

export function getBibleUrl(bible: Bible) {
    return `${base}/bible/${bible.scroll.toLowerCase()}/${bible.chapter}`;
}

export function setBible(bible: Bible) {
    bibleStore.set(bible);
}


export function isChapterValid(bible: Bible): boolean {
    if (isNaN(bible.chapter)) return false;

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