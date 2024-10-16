import { bibleProgressStore } from "$lib/bibleProgress";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { firebaseAuth, firebaseFirestore } from "./firebase";
import { get } from "svelte/store";



export function uploadBibleProgress() {
    const userId = firebaseAuth.currentUser?.uid;
    const BibleProgressDocRef = userId ? doc(firebaseFirestore, "bibleProgress", userId) : undefined;

    if (!BibleProgressDocRef) {
        console.error('User not logged in');
        return;
    }

    const data = get(bibleProgressStore);

    return setDoc(BibleProgressDocRef, data);
}

export async function downloadBibleProgress() {
    const userId = firebaseAuth.currentUser?.uid;
    const BibleProgressDocRef = userId ? doc(firebaseFirestore, "bibleProgress", userId) : undefined;

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

export async function subScribeUpdates() {
    const userId = firebaseAuth.currentUser?.uid;
    const BibleProgressDocRef = userId ? doc(firebaseFirestore, "bibleProgress", userId) : undefined;

    console.log('subScribeUpdates');
    if (BibleProgressDocRef) {
        return onSnapshot(BibleProgressDocRef, (doc) => {
            // const source = doc.metadata.hasPendingWrites ? "Local" : "Server";
            // console.log(source, " data: ", doc.data());
            const progress = doc.data();
            if (progress) {
                bibleProgressStore.set(progress);
            }
        });
    }
    return undefined;
}




