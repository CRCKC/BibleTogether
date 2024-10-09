const BASEPATH = "https://script.google.com/macros/s/AKfycbyHK1TAydIP8IpLlqRk5buaei-KpbUGUl_eG6FZ-7Z3uFUQ2IyvYWHzQDPIiNYYKnyl/exec";

export async function loadChapter(scroll: string, chapter: number, fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
) {
    let bibleContent = '';

    try {
        const response = await fetch(`${BASEPATH}?action=getBible&scroll=${scroll}&chapter=${chapter}`);
        const content = await response.text();
        bibleContent = content;
    } catch (error) {
        console.error('Error reading file:', error);
    }
    return bibleContent;
}

export async function syncChapterProgress() {
    try {
        await doPost('syncChapterProgress', {

        });
    } catch (error) {
        console.error('Error reading file:', error);
    }
}




async function doPost(action: string, data: object) {
    return await fetch(`${BASEPATH}?action=${action}`, {
        method: 'POST',
        body: JSON.stringify(data),
        redirect: 'follow',
    });
}