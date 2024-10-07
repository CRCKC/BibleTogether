import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyBZVR0Y2AofdON2Tz2J6hEikRTiHmJHShE",
    // authDomain: "bibletogether.firebaseapp.com",
    authDomain: "localhost:4000",
    databaseURL: "https://bibletogether-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bibletogether",
    storageBucket: "bibletogether.appspot.com",
    messagingSenderId: "369676244209",
    appId: "1:369676244209:web:b81380fa6ed66c49880550",
    measurementId: "G-XBBV0KDHEL",
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