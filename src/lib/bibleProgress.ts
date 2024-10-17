import { persisted } from "svelte-persisted-store";
import { type BibleChapter } from "./bible";
import bibleIndexJson from "$lib/data/bibleIndex.json";
import { uploadBibleProgress } from "./firebase/firestore";

const bibleIndex = bibleIndexJson as { [scroll: string]: number; }

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

export function migrateProgress(progress: BibleProgress) {
    const newProgress = createEmptyProgress();

    for (const [key, value] of Object.entries(progress)) {
        if (key in Object.keys(newProgress) && typeof value === typeof true) {
            newProgress[parseInt(key)] = value;
        }
    }
    return newProgress;
}

export const bibleProgressStore = persisted<BibleProgress>(
    'bibleProgress',
    createEmptyProgress(),
    {
        syncTabs: true,
    }
);

// Get function to get _bibleProgressStore
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

