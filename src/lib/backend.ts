const BASEPATH = "https://script.google.com/macros/s/AKfycbyHK1TAydIP8IpLlqRk5buaei-KpbUGUl_eG6FZ-7Z3uFUQ2IyvYWHzQDPIiNYYKnyl/exec";

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
        // const rr = await fetch(`${BASEPATH}?action=echo`, {
        //     method: 'POST',
        //     body: JSON.stringify({ username, password }),
        //     redirect: 'follow',
        //     // mode: 'no-cors',
        // });

        // const c = await rr.text();
        // console.log(c);
        // return;


        const response = await fetch(`${BASEPATH}?action=login`, {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            redirect: 'follow',
            // mode: 'no-cors',
        });

        const content = await response.json();
        console.log(content);
        navigator.serviceWorker.controller?.postMessage({
            type: 'SET_TOKEN',
            token: content.token
        })

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
        navigator.serviceWorker.controller?.postMessage({
            type: 'SET_TOKEN',
            token: content.token
        })

    } catch (error) {
        console.error('Error reading file:', error);
        return false;
    }
    return true;
}

export async function syncChapterProgress(params: type) {

}


export async function logout() {
    navigator.serviceWorker.controller?.postMessage({
        type: 'CLEAR_TOKEN'
    })
}
