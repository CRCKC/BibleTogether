import { getFileData } from "./data/downloadBible";

// const BASEPATH = "https://script.google.com/macros/s/AKfycbyHK1TAydIP8IpLlqRk5buaei-KpbUGUl_eG6FZ-7Z3uFUQ2IyvYWHzQDPIiNYYKnyl/exec";

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

export async function syncChapterProgress() {
    try {
        // TODO
    } catch (error) {
        console.error('Error reading file:', error);
    }
}