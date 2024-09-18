const BASEPATH = "https://script.google.com/macros/s/AKfycby2mo2a4fS_l_OGtg7_8zzsjmTYPzzu8fOr6IgsWIqqHArG155lvk7dEOxL5f-eN4QL/exec";

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
    // let loginStatus = '';

    // try {
    //     const response = await fetch(`${BASEPATH}?action=login&username=${username}&password=${password}`);
    //     const content = await response.text();
    //     loginStatus = content;
    // } catch (error) {
    //     console.error('Error reading file:', error);
    // }
    // return loginStatus;
}

export async function register(username: string, password: string) {
    // let registerStatus = '';

    // try {
    //     const response = await fetch(`${BASEPATH}?action=register&username=${username}&password=${password}`);
    //     const content = await response.text();
    //     registerStatus = content;
    // } catch (error) {
    //     console.error('Error reading file:', error);
    // }
    // return registerStatus;
}

export async function syncChapterProgress(params: type) {

}


