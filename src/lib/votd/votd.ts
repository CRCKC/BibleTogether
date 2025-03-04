import type { BibleChapter } from '$lib/bible/bible';

export async function getVerseOfTheDay(): Promise<BibleChapter> {
	const options = { method: 'GET', headers: { accept: 'application/json' } };

	const request = await fetch(
		'https://beta.ourmanna.com/api/v1/get?format=json&order=daily',
		options
	);

	const response = await request.json();
	console.log(response);
	const ref = response.verse.details.reference;
	console.log(ref);

	return { scroll: 'GEN', chapter: 1 };
}
