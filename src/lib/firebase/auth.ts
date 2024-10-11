import { signInWithRedirect, getRedirectResult, createUserWithEmailAndPassword, signInWithEmailAndPassword, type UserCredential } from "firebase/auth";
import { firebaseAuth } from "./firebase";
import { GoogleProvider } from "./providers";
import { session } from "$lib/session";

const auth = firebaseAuth;
auth.useDeviceLanguage();

export async function loginWithGoogle() {
  signInWithRedirect(auth, GoogleProvider);
}

export function getGoogleRedirectResult() {
  console.log('Getting redirect result');
  getRedirectResult(auth)
    .then((result) => {
      // console.log('Result: ', result);
      if (!result) return;

    }).catch((error) => {
      // // The email of the user's account used.
      // const email = error.customData.email;
      // // The AuthCredential type that was used.
      // const credential = GoogleAuthProvider.credentialFromError(error);

      console.log("Error: ", error);
    });
}

export async function createUserWithEmail(email: string, password: string) {
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {

    })
    .catch((error) => {
      console.log("Failed to create account: ", error);
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