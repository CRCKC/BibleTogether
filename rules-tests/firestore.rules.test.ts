import { readFileSync } from 'node:fs';
import {
	assertFails,
	assertSucceeds,
	initializeTestEnvironment,
	type RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

const projectId = 'bibletogether-rules-isolated';
const root = 'userData/owner/privateHighlights';
const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');

let testEnv: RulesTestEnvironment;

function highlightRef(
	context: ReturnType<RulesTestEnvironment['authenticatedContext']>,
	verseId: string
) {
	return doc(context.firestore(), `${root}/${verseId}`);
}

describe('private highlight Firestore rules', () => {
	beforeAll(async () => {
		testEnv = await initializeTestEnvironment({
			projectId,
			firestore: {
				rules,
				host: '127.0.0.1',
				port: 8080
			},
			auth: {
				host: '127.0.0.1',
				port: 9099
			}
		});
	});

	beforeEach(async () => {
		await testEnv.clearFirestore();
	});

	afterAll(async () => {
		await testEnv?.cleanup();
	});

	it('allows the owner to read, create, update, and delete a valid highlight', async () => {
		const owner = testEnv.authenticatedContext('owner');
		const reference = highlightRef(owner, 'GEN:1:1');

		await assertSucceeds(setDoc(reference, { highlighted: true }));
		await assertSucceeds(getDoc(reference));
		await assertSucceeds(updateDoc(reference, { highlighted: true }));
		await assertSucceeds(deleteDoc(reference));
		expect((await assertSucceeds(getDoc(reference))).exists()).toBe(false);
	});

	it('allows the owner to list their highlight collection', async () => {
		const owner = testEnv.authenticatedContext('owner');
		await assertSucceeds(setDoc(highlightRef(owner, 'GEN:1:1'), { highlighted: true }));
		await assertSucceeds(setDoc(highlightRef(owner, 'REV:151:200'), { highlighted: true }));

		const snapshot = await assertSucceeds(getDocs(collection(owner.firestore(), root)));
		expect(snapshot.size).toBe(2);
	});

	it('rejects unauthenticated and cross-user reads, lists, and writes', async () => {
		const owner = testEnv.authenticatedContext('owner');
		const other = testEnv.authenticatedContext('other');
		const unauthenticated = testEnv.unauthenticatedContext();
		const ownerReference = highlightRef(owner, 'GEN:1:1');

		await assertSucceeds(setDoc(ownerReference, { highlighted: true }));
		await assertFails(getDoc(highlightRef(other, 'GEN:1:1')));
		await assertFails(getDocs(collection(other.firestore(), root)));
		await assertFails(setDoc(highlightRef(other, 'GEN:1:2'), { highlighted: true }));
		await assertFails(updateDoc(highlightRef(other, 'GEN:1:1'), { highlighted: true }));
		await assertFails(deleteDoc(highlightRef(other, 'GEN:1:1')));
		await assertFails(getDoc(highlightRef(unauthenticated, 'GEN:1:1')));
		await assertFails(getDocs(collection(unauthenticated.firestore(), root)));
		await assertFails(setDoc(highlightRef(unauthenticated, 'GEN:1:2'), { highlighted: true }));
	});

	it('accepts supported books and the inclusive chapter and verse bounds', async () => {
		const owner = testEnv.authenticatedContext('owner');
		for (const verseId of ['GEN:1:1', '1SA:1:1', 'PSA:151:200', 'REV:151:200']) {
			await assertSucceeds(setDoc(highlightRef(owner, verseId), { highlighted: true }));
		}
	});

	it('rejects malformed, aliased, unsupported, and oversized verse IDs', async () => {
		const owner = testEnv.authenticatedContext('owner');
		const invalidIds = [
			'gen:1:1',
			'XXX:1:1',
			'GEN:01:1',
			'GEN:1:01',
			'GEN:0:1',
			'GEN:1:0',
			'GEN:152:1',
			'GEN:1:201',
			'GEN:999:999',
			'GEN:1',
			'GEN:1:1:1',
			'GEN:+1:1',
			'GEN:1:-1'
		];

		for (const verseId of invalidIds) {
			await assertFails(setDoc(highlightRef(owner, verseId), { highlighted: true }));
		}
	});

	it('requires exactly highlighted: true for creates and updates', async () => {
		const owner = testEnv.authenticatedContext('owner');
		const invalidDocuments = [
			{ highlighted: false },
			{ highlighted: 'true' },
			{ highlighted: 1 },
			{ highlighted: true, extra: 'nope' },
			{ extra: true },
			{}
		];

		for (const data of invalidDocuments) {
			await assertFails(setDoc(highlightRef(owner, 'GEN:1:1'), data));
		}

		const reference = highlightRef(owner, 'GEN:1:1');
		await assertSucceeds(setDoc(reference, { highlighted: true }));
		await assertFails(updateDoc(reference, { highlighted: false }));
		await assertFails(updateDoc(reference, { highlighted: true, extra: 'nope' }));
	});
});
