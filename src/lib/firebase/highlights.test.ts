import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./firebase', () => ({ firebaseAuth: {}, firebaseFirestore: {} }));
let authCallback: ((user: { uid: string } | null) => void) | undefined;
vi.mock('firebase/auth', () => ({
	onAuthStateChanged: vi.fn((_auth, next) => {
		authCallback = next;
		return () => undefined;
	})
}));
import { createHighlightSession } from '$lib/bible/highlights';
import { onAuthStateChanged } from 'firebase/auth';
import {
	createHighlightSyncSession,
	decodeHighlightData,
	privateHighlightPath,
	type HighlightChange,
	type HighlightTransport
} from './firestore';
import { getAuthGeneration, stopAuthObserverForTests, subscribeAuthState } from './authState';

const sessions: Array<{ teardown: () => void }> = [];

afterEach(() => {
	for (const session of sessions.splice(0)) session.teardown();
	stopAuthObserverForTests();
	authCallback = undefined;
});

function transport() {
	let listener: ((changes: HighlightChange[]) => void) | undefined;
	const writes: string[] = [];
	const colors: string[] = [];
	const fake: HighlightTransport = {
		set: async (id, color) => {
			colors.push(`${id}:${color}`);
			writes.push(`set:${id}`);
		},
		delete: async (id) => void writes.push(`delete:${id}`),
		subscribe: (onChange) => {
			listener = onChange;
			return () => (listener = undefined);
		},
		read: async () => false
	};
	return { fake, writes, colors, emit: (changes: HighlightChange[]) => listener?.(changes) };
}

describe('shared auth observer', () => {
	it('owns one observer and advances the auth generation on transitions', () => {
		const first = subscribeAuthState(() => undefined);
		const second = subscribeAuthState(() => undefined);
		expect(vi.mocked(onAuthStateChanged).mock.calls).toHaveLength(1);
		authCallback?.({ uid: 'user-a' });
		expect(getAuthGeneration()).toBe(1);
		first();
		second();
	});
});

describe('private highlight sync adapter', () => {
	it('decodes legacy, canonical, and rejects malformed documents', () => {
		expect(decodeHighlightData({ highlighted: true })?.color).toBe('#facc15');
		expect(decodeHighlightData({ highlighted: true, color: '#12aBc0' })?.color).toBe('#12abc0');
		expect(decodeHighlightData({ highlighted: true, color: '#fff' })).toBeNull();
		expect(decodeHighlightData({ highlighted: true, extra: true })).toBeNull();
	});
	it('uses the owner-scoped private highlight path', () => {
		expect(privateHighlightPath('user-a', 'gen:1:1')).toBe(
			'userData/user-a/privateHighlights/GEN:1:1'
		);
		expect(() => privateHighlightPath('user-a', 'GEN:01:1')).toThrow(TypeError);
	});

	it('gates offline writes and retries the captured UID only', async () => {
		const local = createHighlightSession('user-a');
		sessions.push(local);
		const io = transport();
		let online = false;
		const sync = createHighlightSyncSession('user-a', 1, local, {
			transport: io.fake,
			isOnline: () => online,
			generationMatches: () => true
		});
		local.set('GEN:1:1', '#12aBc0');
		sync.retry();
		expect(io.writes).toEqual([]);
		online = true;
		sync.retry();
		await Promise.resolve();
		await Promise.resolve();
		expect(io.writes).toEqual(['set:GEN:1:1']);
		expect(io.colors).toEqual(['GEN:1:1:#12abc0']);
		expect(local.getState().pendingIds.size).toBe(0);
		sync.teardown();
	});

	it('flushes a newer operation added during an in-flight write', async () => {
		const local = createHighlightSession('race-user');
		sessions.push(local);
		const writes: string[] = [];
		let release!: () => void;
		const io: HighlightTransport = {
			set: async (id) => {
				writes.push(`set:${id}`);
				await new Promise<void>((resolve) => (release = resolve));
			},
			delete: async (id) => void writes.push(`delete:${id}`),
			subscribe: () => () => undefined,
			read: async () => false
		};
		const sync = createHighlightSyncSession('race-user', 1, local, {
			transport: io,
			isOnline: () => true,
			generationMatches: () => true
		});
		local.set('GEN:1:1');
		sync.flush();
		await Promise.resolve();
		await Promise.resolve();
		local.delete('GEN:1:1');
		sync.flush();
		release();
		await new Promise((resolve) => setTimeout(resolve, 0));
		await new Promise((resolve) => setTimeout(resolve, 0));
		expect(writes).toEqual(['set:GEN:1:1', 'delete:GEN:1:1']);
		expect(local.getState().pendingIds.size).toBe(0);
	});

	it('fences writes when the auth generation changes', async () => {
		const local = createHighlightSession('generation-user');
		sessions.push(local);
		const io = transport();
		let current = false;
		const sync = createHighlightSyncSession('generation-user', 2, local, {
			transport: io.fake,
			isOnline: () => true,
			generationMatches: () => current
		});
		local.set('GEN:1:2');
		sync.retry();
		expect(io.writes).toEqual([]);
		current = true;
		sync.retry();
		await Promise.resolve();
		await Promise.resolve();
		expect(io.writes).toEqual(['set:GEN:1:2']);
		sync.teardown();
	});

	it('ignores listener callbacks after UID session teardown', () => {
		const local = createHighlightSession('teardown-user');
		sessions.push(local);
		const io = transport();
		const sync = createHighlightSyncSession('teardown-user', 7, local, {
			transport: io.fake,
			isOnline: () => false,
			generationMatches: () => true
		});
		sync.teardown();
		io.emit([{ type: 'added', id: 'GEN:1:1', highlighted: true }]);
		expect(local.isHighlighted('GEN:1:1')).toBe(false);
	});
});
