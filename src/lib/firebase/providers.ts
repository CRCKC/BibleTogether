import { GoogleAuthProvider } from 'firebase/auth';

export const GoogleProvider = new GoogleAuthProvider();
// GoogleProvider.addScope('https://www.googleapis.com/auth/contacts.readonly');
GoogleProvider.setCustomParameters({
    prompt: 'select_account',
});