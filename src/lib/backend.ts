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

export async function login(username: string, password: string): Promise<boolean> {

    try {
        const response = await doPost('login', { username, password });

        const content = await response.json();
        return updateServiceWorkerToken(content.token);

    } catch (error) {
        console.error('Error reading file:', error);
        return false;
    }
}

export async function signup(username: string, password: string): Promise<boolean> {
    try {
        const response = await doPost('signup', { username, password });

        const content = await response.json();
        return updateServiceWorkerToken(content.token);


    } catch (error) {
        console.error('Error reading file:', error);
        return false;
    }
}

export async function renewToken(): Promise<boolean> {
    console.log('Renewing token');
    const response = await doPost('renewToken', {});
    const content = await response.json();
    return updateServiceWorkerToken(content.token);

}

export async function syncChapterProgress() {
    try {
        await doPost('syncChapterProgress', {

        });
    } catch (error) {
        console.error('Error reading file:', error);
    }
}


export async function logout() {
    navigator.serviceWorker.controller?.postMessage({
        type: 'CLEAR_TOKEN'
    })
}

function updateServiceWorkerToken(token: string): boolean {
    console.log('Updating token', token);
    if (token === undefined || token === '') {
        return false;
    }

    navigator.serviceWorker.controller?.postMessage({
        type: 'SET_TOKEN',
        token: token
    })

    return true;
}

async function doPost(action: string, data: object) {
    return await fetch(`${BASEPATH}?action=${action}`, {
        method: 'POST',
        body: JSON.stringify(data),
        redirect: 'follow',
    });
}