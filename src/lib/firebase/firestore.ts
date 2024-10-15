import { bibleProgressStore } from "$lib/bibleProgress";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firebaseAuth, firebaseFirestore } from "./firebase";
import { get } from "svelte/store";

const userId = firebaseAuth.currentUser?.uid;

const BibleProgressDocRef = userId ? doc(firebaseFirestore, "bibleProgress", userId) : undefined;

export function uploadBibleProgress() {
    if (!BibleProgressDocRef) {
        console.error('User not logged in');
        return;
    }

    const data = get(bibleProgressStore);

    return setDoc(BibleProgressDocRef, data);
}

export async function downloadBibleProgress() {
    if (!BibleProgressDocRef) {
        console.error('User not logged in');
        return;
    }

    const snapShot = await getDoc(BibleProgressDocRef);
    if (snapShot.exists()) {
        const progress = snapShot.data();
        if (progress) {
            bibleProgressStore.set(progress);
        }
    }
}




