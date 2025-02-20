import {
	getRedirectResult,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	type UserCredential,
	GoogleAuthProvider,
	signInWithCredential
} from 'firebase/auth';
import { firebaseAuth } from './firebase';
import { session } from '$lib/session.svelte';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

const auth = firebaseAuth;
auth.useDeviceLanguage();

export async function loginWithGoogle() {
	const result = await FirebaseAuthentication.signInWithGoogle({
		mode: 'redirect',
		customParameters: [{ key: 'prompt', value: 'select_account' }]
	});
	const credential = GoogleAuthProvider.credential(result.credential?.idToken);
	await signInWithCredential(firebaseAuth, credential);
}

export async function createUserWithEmail(email: string, password: string) {
	createUserWithEmailAndPassword(auth, email, password)
		.then(() => {})
		.catch((error) => {
			console.log('Failed to create account: ', error);
		});
}

export async function login(username: string, password: string): Promise<boolean> {
	try {
		const result = await signInWithEmailAndPassword(firebaseAuth, username, password);

		const { user }: UserCredential = result;
		session.set({
			loggedIn: true,
			user: {
				displayName: user?.displayName,
				email: user?.email,
				photoURL: user?.photoURL,
				uid: user?.uid
			}
		});

		return true;
	} catch (error) {
		console.error('Error signing in:', error);
		return false;
	}
}

export async function signup(username: string, password: string): Promise<boolean> {
	try {
		await createUserWithEmail(username, password);

		return true;
	} catch (error) {
		console.error('Error signing up:', error);
		return false;
	}
}

export async function logout() {
	firebaseAuth.signOut();
}
