import JSZip from 'jszip';
import { PUBLIC_BIBLE_DOWNLOAD_URL } from '$env/static/public'
import Completer from '$lib/utils/completer';

const storeName = 'bibleStore';
const dbName = 'bibleLocalDatabase';
const storeKeyName = 'name';

export async function downloadAndUnzip(): Promise<boolean | undefined> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
        console.error('IndexedDB is not available in this environment.');
        return undefined;
    }
    try {
        // Create a completer for the download and unzip process
        const completer = new Completer();
        // Fetch the ZIP file
        const response = await fetch(PUBLIC_BIBLE_DOWNLOAD_URL);
        const blob = await response.blob();
        // Unzip the file
        const zip = await JSZip.loadAsync(blob);
        const files = Object.keys(zip.files);

        // Open IndexedDB
        const dbRequest = indexedDB.open(dbName, 1);
        dbRequest.onupgradeneeded = () => {
            const db = dbRequest.result;
            db.createObjectStore(storeName, { keyPath: storeKeyName });
        };

        dbRequest.onsuccess = async () => {
            const db = dbRequest.result;

            const bibleList: Array<{ name: string, data: string }> = [];
            // Save each file to IndexedDB
            const saveFilePromises = files.map(async (fileName) => {
                const fileData = await zip.file(fileName)?.async('text');

                if (fileData) {
                    // console.log('Saving file:', fileData);
                    bibleList.push({ [storeKeyName]: fileName, data: fileData });
                    // console.log('Saved file:', fileName);

                } else {
                    console.log("File not found: ", fileName);
                    completer.complete(false);
                }
            });

            await Promise.all(saveFilePromises);

            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);

            bibleList.forEach((file) => {
                store.put(file)
            });


            transaction.oncomplete = () => {
                completer.complete(true);
            };
        };

        dbRequest.onerror = (err) => {
            console.error('Error opening IndexedDB:', dbRequest.error, err);
            completer.complete(false);
        };
        return completer.future as Promise<boolean>;
    } catch (error) {
        console.error('Error downloading or unzipping file:', error);
    }
    return false;
}

// Function to get file data by file name
export async function getFileData(fileName: string): Promise<string | undefined> {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
        console.error('IndexedDB is not available in this environment.');
        return undefined;
    }
    return new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open(dbName, 1);

        dbRequest.onsuccess = () => {
            const db = dbRequest.result;
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const getRequest = store.get(fileName);

            getRequest.onsuccess = () => {
                resolve(getRequest.result?.data);
            };

            getRequest.onerror = () => {
                reject(`Error retrieving file: ${fileName}`);
            };
        };

        dbRequest.onerror = (err) => {
            reject(`Error opening IndexedDB: ${err}`);
        };
    });
}



