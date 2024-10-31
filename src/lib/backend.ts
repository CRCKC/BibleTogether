import { getFileData } from "./bible/download";

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
