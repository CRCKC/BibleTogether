import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase } from "firebase/database";
import { base } from '$app/paths';
import { dev } from '$app/environment';
import {
    PUBLIC_FIREBASE_API_KEY,
    PUBLIC_FIREBASE_APP_ID,
    PUBLIC_FIREBASE_AUTH_DOMAIN,
    PUBLIC_FIREBASE_AUTH_DOMAIN_DEV,
    PUBLIC_FIREBASE_DATABASE_URL,
    PUBLIC_FIREBASE_MEASUREMENT_ID,
    PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    PUBLIC_FIREBASE_PROJECT_ID,
    PUBLIC_FIREBASE_STORAGE_BUCKET,
  } from '$env/static/public'

const firebaseConfig = {
    apiKey: PUBLIC_FIREBASE_API_KEY,
    authDomain: (dev ?  PUBLIC_FIREBASE_AUTH_DOMAIN_DEV: PUBLIC_FIREBASE_AUTH_DOMAIN) + base,
    databaseURL: PUBLIC_FIREBASE_DATABASE_URL,
    projectId: PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: PUBLIC_FIREBASE_APP_ID,
    measurementId: PUBLIC_FIREBASE_MEASUREMENT_ID,
};


let firebaseApp: FirebaseApp | undefined;

// create singleton of firebase client app
if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
}
else {
    firebaseApp = getApps()[0]
}

const firebaseAuth: Auth = getAuth(firebaseApp);
const firebaseDatabase = getDatabase(firebaseApp);

// export the firebase app
export { firebaseApp, firebaseAuth, firebaseDatabase }