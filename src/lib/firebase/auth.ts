import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithCredential
} from 'firebase/auth';
import { firebaseAuth } from './firebase';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';

const auth = firebaseAuth;
auth.useDeviceLanguage();

export async function loginWithGoogle() {
	const options = {
		customParameters: [{ key: 'prompt', value: 'select_account' }]
	};
	if (!Capacitor.isNativePlatform()) {
		await FirebaseAuthentication.signInWithGoogle({ ...options, mode: 'popup' });
		if (!firebaseAuth.currentUser) throw new Error('Google sign-in did not return a user');
		return firebaseAuth.currentUser;
	}

	const result = await FirebaseAuthentication.signInWithGoogle(options);
	const credential = GoogleAuthProvider.credential(result.credential?.idToken);
	return (await signInWithCredential(firebaseAuth, credential)).user;
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
		await signInWithEmailAndPassword(firebaseAuth, username, password);
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
	await firebaseAuth.signOut();
}
