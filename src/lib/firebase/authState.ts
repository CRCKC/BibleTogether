import { onAuthStateChanged, type User } from 'firebase/auth';
import { writable, type Readable } from 'svelte/store';
import { firebaseAuth } from './firebase';

export interface AuthState {
	user: User | null;
	generation: number;
	loading: boolean;
}

const state = writable<AuthState>({ user: null, generation: 0, loading: true });
let observerStarted = false;
let observerUnsubscribe: (() => void) | undefined;
let initialState: Promise<User | null> | undefined;

/** Start the one process-wide Firebase auth observer. */
export function ensureAuthObserver(): void {
	if (observerStarted) return;
	observerStarted = true;
	initialState = new Promise<User | null>((resolve, reject) => {
		let initial = true;
		observerUnsubscribe = onAuthStateChanged(
			firebaseAuth,
			(user) => {
				state.update((current) => ({
					user,
					generation: current.generation + 1,
					loading: false
				}));
				if (initial) {
					initial = false;
					resolve(user);
				}
			},
			(error) => {
				state.update((current) => ({ ...current, loading: false }));
				if (initial) {
					initial = false;
					reject(error);
				}
			}
		);
	});
}

export function subscribeAuthState(run: (value: AuthState) => void): () => void {
	ensureAuthObserver();
	const unsubscribe = state.subscribe(run);
	return unsubscribe;
}

export function authStateStore(): Readable<AuthState> {
	ensureAuthObserver();
	return state;
}

export async function getAuthState(): Promise<User | null> {
	ensureAuthObserver();
	const initial = initialState;
	if (!initial) throw new Error('Auth observer failed to initialize');
	return initial;
}

export function getAuthGeneration(): number {
	let generation = 0;
	state.subscribe((value) => (generation = value.generation))();
	return generation;
}

export function stopAuthObserverForTests(): void {
	observerUnsubscribe?.();
	observerUnsubscribe = undefined;
	observerStarted = false;
	initialState = undefined;
	state.set({ user: null, generation: 0, loading: true });
}
