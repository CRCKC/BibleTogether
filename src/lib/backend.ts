import { getFileData } from './bible/download';

export async function loadChapter(scroll: string, chapter: number) {
	let bibleContent = '';

	try {
		const content = await getFileData(`${scroll}_${chapter}.html`);
		if (content) {
			bibleContent = content;
		} else {
			console.error('File not found:', `${scroll}_${chapter}.html`);
		}
	} catch (error) {
		console.error('Error reading file:', error);
	}
	return bibleContent;
}

export async function loadVerse(scroll: string, chapter: number, verse: number) {
	const chapterContent = await loadChapter(scroll, chapter);
	// Find the verse in the chapter content
	const verseContent = chapterContent.split('<b>').find((p) => p.includes(`${verse}</b>`));
	// Remove the first appearance of ${verse}</b>
	const noNum = verseContent?.slice(`${verse}</b>`.length);
	// Remove the <h3> tags and their content
	const noTitle = noNum?.replace(/<h3>.*<\/h3>/g, '');
	// Remove the <h5> tags and their content
	const noRef = noTitle?.replace(/<h5>.*<\/h5>/g, '');
	// Strip away all other tags
	const noTags = noRef?.replace(/<[^>]*>/g, '');

	// TODO Trace back 」』and see if there is a opening 「 if not, remove the 」

	// Remove the last 」』，
	const noEndQuote = noTags?.replace(/」$/, '');
	const noEndDQuote = noEndQuote?.replace(/』$/, '');
	const noEndComma = noEndDQuote?.replace(/，$/, '');
	const noEndSemiColon = noEndComma?.replace(/；$/, '');

	return noEndSemiColon;
}
