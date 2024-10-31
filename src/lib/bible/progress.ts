import { persisted } from "svelte-persisted-store";
import { jumpToChapter, type BibleChapter } from "./bible";
import { uploadBibleProgress } from "../firebase/firestore";
import { bibleIndex, bibleList } from "$lib/bible/constants";
import { get } from "svelte/store";


const TOTAL_CHAPTERS = 1255; // Including intro chapters
export interface BibleProgress {
    [scroll: string]: boolean
}

function createEmptyProgress(): BibleProgress {
    const progress: BibleProgress = {};
    for (let i = 0; i < TOTAL_CHAPTERS; i++) {
        progress[i] = false;
    }
    return progress;
}

export function resetProgress() {
    bibleProgressStore.set(createEmptyProgress());
}

/**  
 * It actually doesnt migrate from old data to new data, it just tries to fix the data if it is not in the correct format, 
 * but data is not guaranteed to persist if it is not in the correct format
**/
export function migrateProgress(progress: BibleProgress) {
    const newProgress = createEmptyProgress();

    for (const [key, value] of Object.entries(progress)) {
        if (key in Object.keys(newProgress) && typeof value === typeof true) {
            newProgress[parseInt(key)] = value;
        }
    }
    return newProgress;
}

/**
 * This is the store that holds the progress of the user in reading the Bible and it is persisted in the local storage
 */
export const bibleProgressStore = persisted<BibleProgress>(
    'bibleProgress',
    createEmptyProgress(),
    {
        syncTabs: true,
    }
);

export function getProgressIndex(scroll: string, chapter: number): number {
    const index = bibleIndex[scroll] + chapter;
    return index;
}

export function updateProgress(bible: BibleChapter, isComplete: boolean = true) {
    // console.log('updateProgress', bible, isComplete);
    bibleProgressStore.update((progress) => {
        progress[bibleIndex[bible.scroll] + bible.chapter] = isComplete;
        return progress;
    });
    uploadBibleProgress();
}

export function jumpToChapterWithProgress(scroll: string) {
    // get the newest chapter in the specified scroll that has not been read;
    const startIndex = bibleIndex[scroll];
    const scrollChapters = bibleList[scroll];
    const data = get(bibleProgressStore);

    for (let i = startIndex; i < startIndex + scrollChapters; i++) {
        if (!data[i]) {
            jumpToChapter({ scroll, chapter: i - startIndex });
            return;
        }
    }
}
