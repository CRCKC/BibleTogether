import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
	connectAuthEmulator,
	getAuth,
	indexedDBLocalPersistence,
	initializeAuth
} from 'firebase/auth';
// import { connectDatabaseEmulator, getDatabase } from "firebase/database";
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { base } from '$app/paths';
import { dev } from '$app/environment';

import { env as publicEnv } from '$env/dynamic/public';
import {
	PUBLIC_FIREBASE_API_KEY,
	PUBLIC_FIREBASE_APP_ID,
	PUBLIC_FIREBASE_AUTH_DOMAIN,
	PUBLIC_FIREBASE_AUTH_DOMAIN_DEV,
	PUBLIC_FIREBASE_DATABASE_URL,
	PUBLIC_FIREBASE_MEASUREMENT_ID,
	PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	PUBLIC_FIREBASE_PROJECT_ID,
	PUBLIC_FIREBASE_STORAGE_BUCKET
} from '$env/static/public';
import { Capacitor } from '@capacitor/core';

const firebaseConfig = {
	apiKey: PUBLIC_FIREBASE_API_KEY,
	authDomain: (dev ? PUBLIC_FIREBASE_AUTH_DOMAIN_DEV : PUBLIC_FIREBASE_AUTH_DOMAIN) + base,
	databaseURL: PUBLIC_FIREBASE_DATABASE_URL,
	projectId: PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: PUBLIC_FIREBASE_APP_ID,
	measurementId: PUBLIC_FIREBASE_MEASUREMENT_ID
};

let firebaseApp: FirebaseApp | undefined;

// create singleton of firebase client app
if (!getApps().length) {
	firebaseApp = initializeApp(firebaseConfig);
} else {
	firebaseApp = getApps()[0];
}

// const firebaseAuth = getAuth(firebaseApp);
const firebaseAuth =
	Capacitor.isNativePlatform() && firebaseApp
		? initializeAuth(firebaseApp!, {
				persistence: indexedDBLocalPersistence
			})
		: getAuth(firebaseApp);

// const firebaseDatabase = getDatabase(firebaseApp);
const firebaseFirestore = getFirestore(firebaseApp);

// Emulator routing is opt-in. Never fall back to the production project when enabled.
export const firebaseEmulatorEnabled = publicEnv.PUBLIC_USE_FIREBASE_EMULATOR === 'true';
if (firebaseEmulatorEnabled) {
	try {
		connectAuthEmulator(firebaseAuth, 'http://127.0.0.1:9099');
		connectFirestoreEmulator(firebaseFirestore, '127.0.0.1', 8080);
	} catch {
		throw new Error('Firebase emulator initialization failed');
	}
}

// export the firebase app
export {
	firebaseApp,
	firebaseAuth,
	// firebaseDatabase,
	firebaseFirestore
};
