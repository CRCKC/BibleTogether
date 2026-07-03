import JSZip from 'jszip';
import { PUBLIC_BIBLE_DOWNLOAD_URL } from '$env/static/public';

const storeName = 'bibleStore';
const dbName = 'bibleLocalDatabase';
const storeKeyName = 'name';

export async function downloadAndUnzip(): Promise<boolean | undefined> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
        console.error('IndexedDB is not available in this environment.');
        return undefined;
    }
    try {
        const response = await fetch(PUBLIC_BIBLE_DOWNLOAD_URL);
        const blob = await response.blob();
        const zip = await JSZip.loadAsync(blob);
        const files = Object.keys(zip.files);

        const dbRequest = await openDatabaseSafely();
        if (!dbRequest) return undefined;

        const db = dbRequest;

        if (!db.objectStoreNames.contains(storeName)) {
            console.error(`Object store "${storeName}" does not exist. Please reload the page to create it.`);
            return false;
        }

        const bibleList: Array<{ name: string; data: string }> = [];
        await Promise.all(files.map(async (fileName) => {
            const fileData = await zip.file(fileName)?.async('text');
            if (fileData) {
                bibleList.push({ [storeKeyName]: fileName, data: fileData });
            } else {
                console.log("File not found: ", fileName);
            }
        }));

        return new Promise<boolean>((resolve) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            bibleList.forEach((file) => store.put(file));
            transaction.oncomplete = () => resolve(true);
            transaction.onerror = () => resolve(false);
        });
    } catch (error) {
        console.error('Error downloading or unzipping file:', error);
    }
    return false;
}

export async function getFileData(fileName: string): Promise<string | undefined> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
        console.error('IndexedDB is not available in this environment.');
        return undefined;
    }

    const db = await openDatabaseSafely();
    return new Promise((resolve, reject) => {
        if (!db.objectStoreNames.contains(storeName)) {
            reject(`Object store ${storeName} not found in IndexedDB.`);
            return;
        }
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const getRequest = store.get(fileName);
        getRequest.onsuccess = () => resolve(getRequest.result?.data);
        getRequest.onerror = () => reject(`Error retrieving file: ${fileName}`);
    });
}

function openDatabaseSafely(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open(dbName);

        dbRequest.onupgradeneeded = (event) => {
            console.log('Creating object store');
            const db = (event.target as IDBOpenDBRequest).result;
            db.createObjectStore(storeName, { keyPath: storeKeyName });
        };

        dbRequest.onsuccess = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(storeName)) {
                console.error(`Object store "${storeName}" does not exist. Recreating the database.`);
                db.close();
                indexedDB.deleteDatabase(dbName).onsuccess = () => {
                    const newDbRequest = indexedDB.open(dbName);
                    newDbRequest.onupgradeneeded = (event) => {
                        console.log('Creating object store');
                        const db = (event.target as IDBOpenDBRequest).result;
                        db.createObjectStore(storeName, { keyPath: storeKeyName });
                    };
                    newDbRequest.onsuccess = (event) => {
                        resolve((event.target as IDBOpenDBRequest).result);
                    };
                    newDbRequest.onerror = (err) => {
                        console.error('Error opening IndexedDB:', newDbRequest.error, err);
                        reject(newDbRequest.error);
                    };
                };
            } else {
                resolve(db);
            }
        };

        dbRequest.onerror = (err) => {
            console.error('Error opening IndexedDB:', dbRequest.error, err);
            reject(dbRequest.error);
        };
    });
}
