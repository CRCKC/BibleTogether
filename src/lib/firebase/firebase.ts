import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
/**
* Your firebase client SDK config goes here
*/
const config = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
}

let firebaseApp: FirebaseApp | undefined;

// create singleton of firebase client app
if (!getApps().length) {
    firebaseApp = initializeApp(config);
}
else {
    firebaseApp = getApps()[0]
}

const firebaseAuth: Auth = getAuth(firebaseApp);

// export the firebase app
export { firebaseApp, firebaseAuth }