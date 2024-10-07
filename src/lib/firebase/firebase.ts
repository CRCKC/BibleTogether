import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getDatabase } from "firebase/database";

const firebaseConfig = {
};

console.log("YOoo");

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