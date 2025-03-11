import { loadVerse } from '$lib/backend';
import scrollMap from '$lib/votd/scrollMap.json';

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

export async function getVerseOfTheDay(random = false): Promise<string | undefined> {
	const { scroll, chapter, verse } = await getVerseOfTheDayData(random);

	const verseText = await loadVerse(scroll, chapter, verse);
	console.log('scroll', scroll, 'chapter', chapter, 'verse', verse);

	return verseText;
}
