import { bibleProgressStore, getProgressIndex, migrateProgress } from '$lib/bible/progress';
import {
	collection,
	deleteDoc,
	doc,
	getCountFromServer,
	getDoc,
	getDocFromServer,
	onSnapshot,
	query,
	setDoc,
	where
} from 'firebase/firestore';
import { firebaseAuth, firebaseFirestore } from './firebase';
import { get } from 'svelte/store';
import type { HighlightSession, PendingHighlightOperation } from '$lib/bible/highlights';
import { normalizeVerseId } from '$lib/bible/highlights';
import { getAuthGeneration } from './authState';

function bibleProgressRef(uid: string) {
	return doc(firebaseFirestore, 'bibleProgress', uid);
}

export async function uploadBibleProgress() {
	const userId = firebaseAuth.currentUser?.uid;
	const BibleProgressDocRef = userId ? bibleProgressRef(userId) : undefined;

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
	const BibleProgressDocRef = userId ? bibleProgressRef(userId) : undefined;

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

export function subScribeUpdates(
	userId = firebaseAuth.currentUser?.uid,
	generation = getAuthGeneration()
) {
	const progressRef = userId ? bibleProgressRef(userId) : undefined;
	if (!progressRef) return undefined;

	return onSnapshot(
		progressRef,
		(snapshot) => {
			if (firebaseAuth.currentUser?.uid !== userId || getAuthGeneration() !== generation) return;
			const progress = snapshot.data();
			if (progress) bibleProgressStore.set(progress);
		},
		() => undefined
	);
}

export async function queryChapterCount(scroll: string, chapter: number) {
	const userId = firebaseAuth.currentUser?.uid;
	if (!userId) {
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

function decodeUserData(value: unknown): UserData {
	const data = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
	return {
		displayName: typeof data.displayName === 'string' ? data.displayName : null,
		fellowshipGroup: typeof data.fellowshipGroup === 'string' ? data.fellowshipGroup : null
	};
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
		return decodeUserData(userSnapshot.data());
	} else {
		const data: UserData = {
			displayName: firebaseAuth.currentUser?.displayName || null,
			fellowshipGroup: null
		};
		await setDoc(userDoc, data);
		return data;
	}
}

export interface HighlightChange {
	type: 'added' | 'modified' | 'removed';
	id: string;
	highlighted?: boolean;
}

export interface HighlightTransport {
	set(id: string): Promise<void>;
	delete(id: string): Promise<void>;
	subscribe(
		onChange: (changes: HighlightChange[]) => void,
		onError: (error: unknown) => void
	): () => void;
	read(id: string): Promise<boolean>;
}

export interface HighlightSyncOptions {
	transport?: HighlightTransport;
	isOnline?: () => boolean;
	/** Test seam; production uses the shared observer's generation. */
	generationMatches?: () => boolean;
}

export interface HighlightSyncSession {
	readonly uid: string;
	readonly generation: number;
	retry(): void;
	flush(): void;
	teardown(): void;
}

export function privateHighlightPath(uid: string, verseId: string): string {
	const id = normalizeVerseId(verseId);
	if (!uid || !id) throw new TypeError('Invalid private highlight path');
	return `userData/${uid}/privateHighlights/${id}`;
}

function onlineByDefault(): boolean {
	return typeof navigator === 'undefined' || navigator.onLine;
}

function firestoreHighlightTransport(uid: string): HighlightTransport {
	const highlights = collection(firebaseFirestore, 'userData', uid, 'privateHighlights');
	const refFor = (id: string) => {
		const normalized = normalizeVerseId(id);
		if (!normalized) throw new TypeError('Invalid private highlight id');
		return doc(highlights, normalized);
	};
	return {
		set: async (id) => {
			await setDoc(refFor(id), { highlighted: true });
		},
		delete: async (id) => {
			await deleteDoc(refFor(id));
		},
		subscribe: (onChange, onError) =>
			onSnapshot(
				highlights,
				(snapshot) =>
					onChange(
						snapshot.docChanges().map((change) => ({
							type: change.type,
							id: change.doc.id,
							highlighted: change.doc.data().highlighted
						}))
					),
				onError
			),
		read: async (id) => {
			const snapshot = await getDocFromServer(refFor(id));
			return snapshot.exists();
		}
	};
}

/** Own one listener and a UID/generation-fenced write queue for one local session. */
export function createHighlightSyncSession(
	uid: string,
	generation: number,
	local: HighlightSession,
	options: HighlightSyncOptions = {}
): HighlightSyncSession {
	if (!uid || local.uid !== uid) throw new TypeError('Highlight UID mismatch');
	const transport = options.transport ?? firestoreHighlightTransport(uid);
	const isOnline = options.isOnline ?? onlineByDefault;
	let disposed = false;
	let flushing = false;
	let flushRequested = false;
	let unsubscribe: (() => void) | undefined;

	const current = () =>
		!disposed &&
		local.uid === uid &&
		(options.generationMatches?.() ?? getAuthGeneration() === generation);
	const flush = async () => {
		if (!current() || !isOnline()) return;
		if (flushing) {
			flushRequested = true;
			return;
		}
		flushing = true;
		const started = new Map(
			[...local.getState().pending.entries()].map(([id, operation]) => [id, operation.operationId])
		);
		try {
			await Promise.all(
				[...local.getState().pending.entries()].map(
					async ([id, operation]: [string, PendingHighlightOperation]) => {
						if (!current() || !isOnline()) return;
						try {
							if (operation.desired === 'set') await transport.set(id);
							else await transport.delete(id);
							if (current()) local.acknowledge(id, operation.operationId);
						} catch {
							if (current()) local.markSyncError();
						}
					}
				)
			);
		} finally {
			flushing = false;
			const changed = [...local.getState().pending.entries()].some(
				([id, operation]) => started.get(id) !== operation.operationId
			);
			if (flushRequested && changed && current() && isOnline()) {
				flushRequested = false;
				queueMicrotask(() => void flush());
			} else {
				flushRequested = false;
			}
		}
	};

	unsubscribe = transport.subscribe(
		(changes) => {
			if (!current()) return;
			for (const change of changes) {
				const id = normalizeVerseId(change.id);
				if (!id || local.getState().pendingIds.has(id)) continue;
				if (change.type === 'removed') {
					void transport
						.read(id)
						.then((exists) => {
							if (current() && !exists && !local.getState().pendingIds.has(id)) {
								local.applyRemote(id, false);
							}
						})
						.catch(() => {
							if (current()) local.markSyncError();
						});
				} else if (change.highlighted === true) {
					local.applyRemote(id, true);
				}
			}
			void flush();
		},
		() => {
			if (current()) local.markSyncError();
		}
	);

	const onOnline = () => void flush();
	if (typeof window !== 'undefined') window.addEventListener('online', onOnline);
	void flush();

	return {
		uid,
		generation,
		retry: () => {
			if (current()) {
				local.retry();
				void flush();
			}
		},
		flush: () => void flush(),
		teardown: () => {
			if (disposed) return;
			disposed = true;
			unsubscribe?.();
			unsubscribe = undefined;
			if (typeof window !== 'undefined') window.removeEventListener('online', onOnline);
		}
	};
}

export const createHighlightSyncAdapter = createHighlightSyncSession;
