import { persisted } from "svelte-persisted-store";
import { bibleList, type BibleChapter } from "./bible";


const bible = bibleList as { [scroll: string]: number; }

interface BibleProgress {
    [scroll: string]: Array<boolean>
}

function createEmptyProgress(): BibleProgress {
    const progress: BibleProgress = {};
    for (const scroll in bible) {
        const maxChap = bible[scroll];
        progress[scroll] = maxChap === undefined ? [] : new Array(maxChap + 1).fill(false); // +1 because of intro chapter
    }
    return progress;
}

export const bibleProgressStore = persisted<BibleProgress>(
    'bibleProgress',
    createEmptyProgress(),
    {
        syncTabs: true,
    }
);

export function updateProgress(bible: BibleChapter, isComplete: boolean = true) {
    // console.log('updateProgress', bible, isComplete);

    bibleProgressStore.update((progress) => {
        progress[bible.scroll][bible.chapter] = isComplete;
        return progress;
    });
}

