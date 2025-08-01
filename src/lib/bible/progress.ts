import { persisted } from 'svelte-persisted-store';
import { jumpToChapter, type BibleChapter } from './bible';
import { uploadBibleProgress } from '../firebase/firestore';
import { bibleIndex, bibleList } from '$lib/bible/constants';
import { get } from 'svelte/store';
import { bibleSchedule } from '$lib/bible/constants';

const TOTAL_CHAPTERS = 1255; // Including intro chapters
export interface BibleProgress {
	[scroll: string]: boolean;
}

function createEmptyProgress(setTrue = false): BibleProgress {
	const progress: BibleProgress = {};
	for (let i = 0; i < TOTAL_CHAPTERS; i++) {
		progress[i] = setTrue;
	}
	return progress;
}

export function resetProgress() {
	bibleProgressStore.set(createEmptyProgress());
}

export function completeAllProgress() {
	const progress = createEmptyProgress(true);
	bibleProgressStore.set(progress);
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
export const bibleProgressStore = persisted<BibleProgress>('bibleProgress', createEmptyProgress(), {
	syncTabs: true
});

export function getProgressIndex(scroll: string, chapter: number): number {
	const index = bibleIndex[scroll] + chapter;
	return index;
}

export function updateProgress(bible: BibleChapter, isComplete: boolean = true) {
	// console.log('updateProgress', bible, isComplete);
	const store = get(bibleProgressStore);

	if (store[bibleIndex[bible.scroll] + bible.chapter] != isComplete) {
		bibleProgressStore.update((progress) => {
			progress[bibleIndex[bible.scroll] + bible.chapter] = isComplete;
			return progress;
		});
		uploadBibleProgress();
	}
}

export function jumpToChapterWithProgress(scroll: string) {
	// get the newest chapter in the specified scroll that has not been read;
	const startIndex = bibleIndex[scroll];
	const scrollChapters = bibleList[scroll];
	const data = get(bibleProgressStore);

	if (!data[startIndex] && !data[startIndex + 1]) {
		jumpToChapter({ scroll, chapter: 0 });
		return;
	}

	for (let i = startIndex + 1; i < startIndex + scrollChapters + 1; i++) {
		if (!data[i]) {
			jumpToChapter({ scroll, chapter: i - startIndex });
			return;
		}
	}

	jumpToChapter({ scroll, chapter: scrollChapters });
}

export function isScrollCompleted(scroll: string): boolean {
	const startIndex = bibleIndex[scroll] + 1; // Skip the intro chapter
	const scrollChapters = bibleList[scroll];
	const data = get(bibleProgressStore);

	for (let i = startIndex; i < startIndex + scrollChapters; i++) {
		if (!data[i]) {
			return false;
		}
	}
	return true;
}

export function isChapterCompleted(bible: BibleChapter): boolean {
	const index = getProgressIndex(bible.scroll, bible.chapter);
	const data = get(bibleProgressStore);
	return data[index];
}

export function jumpToNextUnreadChapterInSchedule(year: number, month: number): void {
	let m = month;
	for (let y = year; y <= 2027; y++) {
		while (m <= 12) {
			const chapter = getFirstUnreadChapterInMonth(y, m);
			if (chapter) {
				jumpToChapter(chapter);
				return;
			}
			m++;
		}
		m = 1; // Reset month to January for the next year
	}
}

function getFirstUnreadChapterInMonth(year: number, month: number): BibleChapter | null {
	const schedule = bibleSchedule[year]?.[month];
	if (!schedule) return null;
	for (const item of schedule) {
		const chapter = getFirstUnreadChapterInScroll(item.scroll);
		if (chapter) {
			return chapter;
		}
	}
	return null;
}

function getFirstUnreadChapterInScroll(scroll: string): BibleChapter | null {
	const startIndex = bibleIndex[scroll];
	const scrollChapters = bibleList[scroll];
	const data = get(bibleProgressStore);

	for (let i = startIndex + 1; i < startIndex + scrollChapters + 1; i++) {
		if (!data[i]) {
			return { scroll, chapter: i - startIndex };
		}
	}
	return null;
}

export function getMonthlyProgress(year: number, month: number): number {
	const schedule = bibleSchedule[year]?.[month];
	if (!schedule) return 0;

	const progressData = get(bibleProgressStore);
	let totalChapters = 0;
	let completedChapters = 0;

	for (const item of schedule) {
		if (item.scroll in bibleList) {
			const startIndex = bibleIndex[item.scroll];
			const scheduleStart = Math.max(1, item.start);
			const scheduleEnd = Math.min(item.end, bibleList[item.scroll]);

			// Count chapters in this scheduled range
			for (let chapter = scheduleStart; chapter <= scheduleEnd; chapter++) {
				totalChapters++;
				const progressIndex = startIndex + chapter;
				if (progressData[progressIndex]) {
					completedChapters++;
				}
			}
		}
	}
	return totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
}
