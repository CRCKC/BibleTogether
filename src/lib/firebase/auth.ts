import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseAuth } from "./firebase";

const auth = firebaseAuth;

const provider = new GoogleAuthProvider();
// provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
provider.setCustomParameters({
  prompt: 'select_account',

});

auth.useDeviceLanguage();

export async function loginWithGoogle() {
  signInWithRedirect(auth, provider);
}

export function getGoogleRedirectResult() {
  console.log('Getting redirect result');
  getRedirectResult(auth)
    .then((result) => {
      console.log('Result: ', result);
      if (!result) return;
      // This gives you a Google Access Token. You can use it to access Google APIs.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;


      // The signed-in user info.
      const user = result.user;
      console.log(user.displayName);
      console.log(token);
    }).catch((error) => {
      // Handle Errors here.
      // const errorCode = error.code;
      // const errorMessage = error.message;
      // // The email of the user's account used.
      // const email = error.customData.email;
      // // The AuthCredential type that was used.
      // const credential = GoogleAuthProvider.credentialFromError(error);

      console.log("Error: ", error);
    });
}

export async function createUserWithEmail(email: string, password: string) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log(userCredential);
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
      console.log(error);
    });
}