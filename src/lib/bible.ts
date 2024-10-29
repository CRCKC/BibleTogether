import { persisted } from 'svelte-persisted-store'
import { base } from '$app/paths';
import { goto } from '$app/navigation';
import { writable } from 'svelte/store';
import { bibleList, bibleshort } from './bibleConstants';

// Convert bibleList to a dictionary

export interface BibleChapter {
    scroll: string
    chapter: number
}

export const currentChapterStore = persisted<BibleChapter>('currentChapter', {
    scroll: "GEN",
    chapter: 1,
},
    {
        syncTabs: false,
    }
);

export function getBibleUrl(bible: BibleChapter) {
    return `${base}/bible/${bible.scroll.toLowerCase()}/${bible.chapter}`;
}

export function setCurrentChapter(bible: BibleChapter) {
    currentChapterStore.set(bible);
}

export function jumpToChapter(bible: BibleChapter) {
    setCurrentChapter({ scroll: bible.scroll, chapter: bible.chapter });
    goto(getBibleUrl({ scroll: bible.scroll, chapter: bible.chapter }));
}


export function nextChapter(bible: BibleChapter) {
    let newBible: BibleChapter = bible;
    if (bible.chapter < bibleList[bible.scroll]) {
        newBible = { scroll: bible.scroll, chapter: bible.chapter + 1 };

    } else {
        const currentIndex = bibleshort.findIndex((v) => v == bible.scroll);
        const nextIndex = currentIndex + 1;
        if (bibleshort.length > nextIndex) {
            newBible = { scroll: bibleshort[nextIndex], chapter: 0 };
        }
    }
    jumpToChapter(newBible);
}

export function prevChapter(bible: BibleChapter) {
    let newBible: BibleChapter = bible;
    if (bible.chapter > 0) {
        newBible = { scroll: bible.scroll, chapter: bible.chapter - 1 };
    } else {
        const currentIndex = bibleshort.findIndex((v) => v == bible.scroll);
        const prevIndex = currentIndex - 1;
        const scroll = bibleshort[prevIndex];
        if (prevIndex >= 0) {
            newBible = { scroll: scroll, chapter: bibleList[scroll] };
        }
    }
    jumpToChapter(newBible);
}


export function isChapterValid(bible: BibleChapter): boolean {
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

// export let BIBLE_AUDIO: HTMLAudioElement | undefined;

export const audioStore = writable<HTMLAudioElement | undefined>(undefined);


