import { bibleProgressStore, getProgressIndex, migrateProgress } from '$lib/bible/progress';
import {
	collection,
	doc,
	getCountFromServer,
	getDoc,
	onSnapshot,
	query,
	setDoc,
	where
} from 'firebase/firestore';
import { firebaseAuth, firebaseFirestore } from './firebase';
import { get } from 'svelte/store';

export async function uploadBibleProgress() {
	const userId = firebaseAuth.currentUser?.uid;
	const BibleProgressDocRef = userId ? doc(firebaseFirestore, 'bibleProgress', userId) : undefined;

	if (!BibleProgressDocRef) {
		console.error('User not logged in');
		return;
	}

	const data = get(bibleProgressStore);

	try {
		await setDoc(BibleProgressDocRef, data);
		return true;
	} catch (error) {
		if (Object.keys(data).length == 1255) {
			console.log('Error writing document: ', error);
			return false;
		} else {
			const newData = migrateProgress(data);
			try {
				await setDoc(BibleProgressDocRef, newData);
				return true;
			} catch (error) {
				console.error('Error writing document: ', error);
				return false;
			}
		}
	}
}

export async function downloadBibleProgress() {
	const userId = firebaseAuth.currentUser?.uid;
	const BibleProgressDocRef = userId ? doc(firebaseFirestore, 'bibleProgress', userId) : undefined;

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
	const BibleProgressDocRef = userId ? doc(firebaseFirestore, 'bibleProgress', userId) : undefined;

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

export async function queryChapterCount(scroll: string, chapter: number) {
	const userId = firebaseAuth.currentUser?.uid;
	const BibleProgressDocRef = userId ? doc(firebaseFirestore, 'bibleProgress', userId) : undefined;

	if (!BibleProgressDocRef) {
		console.error('User not logged in');
		return;
	}
	const chapNum = getProgressIndex(scroll, chapter);
	const coll = collection(firebaseFirestore, 'bibleProgress');
	const q = query(coll, where(chapNum.toString(), '==', true));
	const snapshot = await getCountFromServer(q);

	return snapshot.data().count;
}

export interface UserData {
	displayName: string | null;
	fellowshipGroup: string | null;
	// settings: Settings;
}

export async function updateUserProfile(uid: string, data: UserData) {
	if (!uid) {
		console.error('No user id provided');
		return;
	}
	try {
		const userDocRef = doc(firebaseFirestore, 'userData', uid);
		await setDoc(userDocRef, data, { merge: true });
		return true;
	} catch (error) {
		console.error('Error updating user profile:', error);
		return false;
	}
}

export async function fetchUserData() {
	const uid = firebaseAuth.currentUser?.uid;
	if (!uid) {
		return undefined;
	}
	const db = firebaseFirestore;
	const userDoc = doc(db, 'userData', uid);
	const userSnapshot = await getDoc(userDoc);

	if (userSnapshot.exists()) {
		const userData = userSnapshot.data() as UserData;
		return userData;
	} else {
		const data: UserData = {
			displayName: firebaseAuth.currentUser?.displayName || null,
			fellowshipGroup: null
		};
		await setDoc(userDoc, data);
		return data;
	}
}
