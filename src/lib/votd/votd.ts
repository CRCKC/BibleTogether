import { loadVerse } from '$lib/backend';
import scrollMap from '$lib/votd/scrollMap.json';
import { persisted } from 'svelte-persisted-store';
import { get } from 'svelte/store';

export async function getVerseOfTheDayData(random = false): Promise<{
	scroll: string;
	chapter: number;
	verse: number;
}> {
	const options = { method: 'GET', headers: { accept: 'application/json' } };

	const request = await fetch(
		// 'https://beta.ourmanna.com/api/v1/get?format=json&order=random',
		`https://beta.ourmanna.com/api/v1/get?format=json&order=${random ? 'random' : 'daily'}`,
		options
	);

	const response = await request.json();
	const ref = response.verse.details.reference as string;
	// console.log('ref', ref);

	const [front, back] = ref.split(':');
	const verse = parseInt(back, 10);
	const idx = front.lastIndexOf(' ');
	const scrollFull = front.substring(0, idx);
	const chapter = parseInt(front.substring(idx + 1), 10);
	const scroll = (scrollMap as { [scroll: string]: string })[scrollFull];

	// console.log('scroll', scroll, 'chapter', chapter, 'verse', verse);
	return { scroll, chapter, verse };
}

const verseOfTheDayStore = persisted<{
	scroll: string;
	chapter: number;
	verse: number;
	text: string | undefined;
	time: number;
}>(
	'verseOfTheDay',
	{
		scroll: 'GEN',
		chapter: 1,
		verse: 1,
		text: 'In the beginning God created the heavens and the earth.',
		time: 0
	},
	{
		syncTabs: false
	}
);

// Make this function cache for today
export async function getVerseOfTheDay(random = false) {
	if (random === false) {
		const store = get(verseOfTheDayStore);
		const now = Date.now();

		if (store.time > now - 24 * 60 * 60 * 1000) {
			return {
				text: store.text,
				scroll: store.scroll,
				chapter: store.chapter,
				verse: store.verse
			};
		}
	}

	const { scroll, chapter, verse } = await getVerseOfTheDayData(random);

	const text = await loadVerse(scroll, chapter, verse);
	console.log('scroll', scroll, 'chapter', chapter, 'verse', verse);
	if (random === false) {
		verseOfTheDayStore.set({
			scroll,
			chapter,
			verse,
			text: text,
			time: Date.now()
		});
	}
	return { text, scroll, chapter, verse };
}
