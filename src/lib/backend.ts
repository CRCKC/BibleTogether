const BASEPATH = "https://script.google.com/macros/s/AKfycbygTngNfc5fjdmbuGJ9l5wsBTDAR3oA6s1HSJ9ikRpr7aZj9d_N2OSXSCHCs1Nt7YHJ/exec";

export async function loadChapter(scroll: string, chapter: number) {
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

export async function login(username: string, password: string) {

    try {
        const response = await fetch(`${BASEPATH}?action=login`, {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            redirect: 'follow',
            // mode: 'no-cors',
        });

        const content = await response.json();
        console.log(content.token);
        // loginStatus = content;
    } catch (error) {
        console.error('Error reading file:', error);
        return false;
    }
    return true;
}

export async function signup(username: string, password: string) {
    try {
        const response = await fetch(`${BASEPATH}?action=signup`, {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            redirect: 'follow',
            // mode: 'no-cors',
        });

        const content = await response.json();
        console.log(content.token);
    } catch (error) {
        console.error('Error reading file:', error);
        return false;
    }
    return true;
}

export async function syncChapterProgress(params: type) {

}


