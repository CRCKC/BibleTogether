import { persisted } from 'svelte-persisted-store'
import bibleJson from '$lib/bibleList.json';
import bibleChineseJson from '$lib/bibleChinese.json';
import { base } from '$app/paths';
import { goto } from '$app/navigation';

// Convert bibleList to a dictionary
export const bibleList = bibleJson as { [scroll: string]: number; }
export const bibleChinese = bibleChineseJson as { [scroll: string]: string };
const bibleshort = ["GEN", "EXO", "LEV", "NUM", "DEU", "JOS", "JDG", "RUT", "1SA", "2SA", "1KI", "2KI", "1CH", "2CH", "EZR", "NEH", "EST", "JOB", "PSA", "PRO", "ECC", "SNG", "ISA", "JER", "LAM", "EZK", "DAN", "HOS", "JOL", "AMO", "OBA", "JON", "MIC", "NAM", "HAB", "ZEP", "HAG", "ZEC", "MAL", "MAT", "MRK", "LUK", "JHN", "ACT", "ROM", "1CO", "2CO", "GAL", "EPH", "PHP", "COL", "1TH", "2TH", "1TI", "2TI", "TIT", "PHM", "HEB", "JAS", "1PE", "2PE", "1JN", "2JN", "3JN", "JUD", "REV"];

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
    setCurrentChapter(newBible);
    goto(getBibleUrl(newBible));
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
    setCurrentChapter(newBible);
    goto(getBibleUrl(newBible));
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

let audio: HTMLAudioElement | undefined;

export async function playChapterAudio(bible: BibleChapter) {
    const index = bibleshort.findIndex((v) => v == bible.scroll) + 1;

    const link = `https://raw.githubusercontent.com/CRCKC/solid-waddle/refs/heads/main/audio/${index}_${bible.scroll}/${bible.scroll}_${bible.chapter}.mp3`;
    audio = new Audio(link);
    audio.play();
}

