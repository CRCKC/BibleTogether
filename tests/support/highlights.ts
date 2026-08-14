import { readFileSync } from 'node:fs';
import type { Page } from '@playwright/test';

export const HIGHLIGHT_EMAIL = 'highlights@example.test';
export const HIGHLIGHT_PASSWORD = 'Highlight-password-123!';
const firebaseApiKey =
	process.env.PUBLIC_FIREBASE_API_KEY || 'AIzaSyBZVR0Y2AofdON2Tz2J6hEikRTiHmJHShE';

export const HIGHLIGHT_FIXTURE = readFileSync(
	new URL('../fixtures/highlight-chapter.html', import.meta.url),
	'utf8'
);

/** Seed the app's existing store; the reader must not need a download in browser tests. */
export async function seedHighlightFixture(page: Page, html = HIGHLIGHT_FIXTURE) {
	await page.evaluate(
		async ({ html }) => {
			localStorage.setItem('firstVisit', 'false');
			await new Promise<void>((resolve, reject) => {
				const request = indexedDB.open('bibleLocalDatabase');
				request.onupgradeneeded = () => {
					const db = request.result;
					if (!db.objectStoreNames.contains('bibleStore'))
						db.createObjectStore('bibleStore', { keyPath: 'name' });
				};
				request.onerror = () => reject(request.error);
				request.onsuccess = () => {
					const db = request.result;
					if (!db.objectStoreNames.contains('bibleStore')) {
						db.close();
						reject(new Error('bibleStore is missing'));
						return;
					}
					const transaction = db.transaction('bibleStore', 'readwrite');
					transaction.objectStore('bibleStore').put({ name: 'GEN_1.html', data: html });
					transaction.oncomplete = () => {
						db.close();
						resolve();
					};
					transaction.onerror = () => reject(transaction.error);
				};
			});
		},
		{ html }
	);
}

/** Keep accidental production Firebase traffic out of emulator runs. */
export async function blockProductionFirebase(page: Page) {
	await page.route('**/*', async (route) => {
		const url = new URL(route.request().url());
		if (
			url.hostname.endsWith('googleapis.com') ||
			url.hostname.endsWith('firebaseio.com') ||
			url.hostname.endsWith('firebaseapp.com')
		) {
			await route.abort('blockedbyclient');
			return;
		}
		await route.continue();
	});
}

/** Create an emulator token and seed Firebase Auth's normal IndexedDB persistence. */
export async function signInVerifiedUser(
	page: Page,
	email = HIGHLIGHT_EMAIL,
	password = HIGHLIGHT_PASSWORD
) {
	const apiKey = firebaseApiKey;
	const response = await page.request.post(
		`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
		{ data: { email, password, returnSecureToken: true } }
	);
	if (!response.ok()) throw new Error(`Auth emulator sign-in failed: ${response.status()}`);
	let auth = await response.json();
	const lookup = await page.request.post(
		`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
		{ data: { idToken: auth.idToken } }
	);
	const account = lookup.ok() ? (await lookup.json()).users?.[0] : undefined;
	if (account?.emailVerified !== true) {
		const sendCode = await page.request.post(
			`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
			{ data: { requestType: 'VERIFY_EMAIL', idToken: auth.idToken } }
		);
		if (!sendCode.ok())
			throw new Error(`Auth emulator verification email failed: ${sendCode.status()}`);
		const codes = await page.request.get(
			'http://127.0.0.1:9099/emulator/v1/projects/bibletogether/oobCodes'
		);
		const code = (await codes.json()).oobCodes?.find(
			(entry: { email?: string; requestType?: string }) =>
				entry.email === email && entry.requestType === 'VERIFY_EMAIL'
		)?.oobCode;
		if (!code) throw new Error('Auth emulator verification code was not generated');
		const update = await page.request.post(
			`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:update?key=${apiKey}`,
			{ data: { oobCode: code } }
		);
		if (!update.ok()) throw new Error(`Auth emulator verification failed: ${update.status()}`);
		const verified = await page.request.post(
			`http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
			{ data: { email, password, returnSecureToken: true } }
		);
		if (!verified.ok()) throw new Error(`Auth emulator re-login failed: ${verified.status()}`);
		auth = await verified.json();
	}
	await page.evaluate(
		async ({ auth, apiKey }) => {
			await new Promise<void>((resolve, reject) => {
				const request = indexedDB.open('firebaseLocalStorageDb');
				request.onupgradeneeded = () => {
					if (!request.result.objectStoreNames.contains('firebaseLocalStorage'))
						request.result.createObjectStore('firebaseLocalStorage', { keyPath: 'fbase_key' });
				};
				request.onerror = () => reject(request.error);
				request.onblocked = () => reject(new Error('Firebase auth storage is blocked'));
				request.onsuccess = () => {
					const db = request.result;
					db.onversionchange = () => db.close();
					const transaction = db.transaction('firebaseLocalStorage', 'readwrite');
					transaction.objectStore('firebaseLocalStorage').put({
						fbase_key: `firebase:authUser:${apiKey}:[DEFAULT]`,
						value: {
							uid: auth.localId,
							email: auth.email,
							emailVerified: true,
							isAnonymous: false,
							providerData: [
								{
									providerId: 'password',
									uid: auth.email,
									displayName: null,
									email: auth.email,
									phoneNumber: null,
									photoURL: null
								}
							],
							stsTokenManager: {
								refreshToken: auth.refreshToken,
								accessToken: auth.idToken,
								expirationTime: Date.now() + Number(auth.expiresIn) * 1000
							},
							apiKey,
							appName: '[DEFAULT]'
						}
					});
					transaction.oncomplete = () => {
						db.close();
						resolve();
					};
					transaction.onerror = () => reject(transaction.error);
					transaction.onabort = () =>
						reject(transaction.error ?? new Error('Auth storage transaction aborted'));
				};
			});
		},
		{ auth, apiKey }
	);
}
