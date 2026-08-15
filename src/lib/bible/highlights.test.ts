// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';

vi.hoisted(() => {
	const storage = new Map<string, string>();
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => storage.get(key) ?? null,
		setItem: (key: string, value: string) => storage.set(key, value),
		removeItem: (key: string) => storage.delete(key)
	});
});
import {
	canonicalVerseId,
	createHighlightSession,
	DEFAULT_HIGHLIGHT_COLOR,
	getHighlightsStorageKey,
	HIGHLIGHT_PRESETS,
	hexToHsv,
	hsvToHex,
	isValidVerseId,
	normalizeHighlightColor,
	normalizeVerseId,
	tryCanonicalVerseId
} from './highlights';

const sessions: Array<{ teardown: () => void }> = [];

afterEach(() => {
	for (const session of sessions.splice(0)) session.teardown();
});

describe('canonical verse identity', () => {
	it('normalizes supported book codes and round-trips canonical IDs', () => {
		expect(canonicalVerseId('gen', 1, 1)).toBe('GEN:1:1');
		expect(canonicalVerseId('1sa', '3', '4')).toBe('1SA:3:4');
		expect(normalizeVerseId('1sa:3:4')).toBe('1SA:3:4');
		expect(isValidVerseId('GEN:1:1')).toBe(true);
	});

	it('rejects aliases, intro chapter zero, unknown books, and non-positive parts', () => {
		for (const value of [
			['GEN', '01', 1],
			['GEN', 1, '01'],
			['GEN', 0, 1],
			['NOPE', 1, 1],
			['GEN', -1, 1],
			['GEN', 1, 0]
		] as const) {
			expect(tryCanonicalVerseId(value[0], value[1], value[2])).toBeNull();
		}
		expect(() => canonicalVerseId('GEN', 0, 1)).toThrow(TypeError);
	});
});

describe('highlight colors', () => {
	it('normalizes presets and six-digit hex values', () => {
		expect(normalizeHighlightColor('BLUE')).toBe(HIGHLIGHT_PRESETS[1].color);
		expect(normalizeHighlightColor('#12aBc0')).toBe('#12abc0');
		expect(normalizeHighlightColor('#fff')).toBeNull();
		expect(normalizeHighlightColor('#12aBc000')).toBeNull();
	});

	it('round-trips HSV picker values through hex', () => {
		const color = '#12abc0';
		const hsv = hexToHsv(color);
		expect(hsvToHex(hsv)).toBe(color);
	});
});

describe('UID-scoped local highlight state', () => {
	it('sets, recolors, deletes, and retains pending delete intent', () => {
		const session = createHighlightSession('happy-user');
		sessions.push(session);
		const id = 'GEN:1:1';
		const set = session.set(id, '#12aBc0');
		expect(set?.color).toBe('#12abc0');
		expect(session.getColor(id)).toBe('#12abc0');
		expect(session.recolor(id, '#12abc0')).toBeUndefined();
		expect(session.recolor(id, DEFAULT_HIGHLIGHT_COLOR)?.color).toBe(DEFAULT_HIGHLIGHT_COLOR);
		expect(set?.desired).toBe('set');
		expect(session.getState().highlightedIds.has(id)).toBe(true);
		const deletion = session.delete(id);
		expect(deletion?.desired).toBe('delete');
		expect(session.getState().highlightedIds.has(id)).toBe(false);
		expect(session.getState().pendingIds.has(id)).toBe(true);
		expect(session.getState().status).toBe('saved locally');
	});

	it('keeps only the latest operation identity for rapid changes', () => {
		const session = createHighlightSession('sequence-user');
		sessions.push(session);
		const first = session.set('GEN:1:1');
		const second = session.delete('GEN:1:1');
		const third = session.set('GEN:1:1');
		expect(new Set([first?.operationId, second?.operationId, third?.operationId]).size).toBe(3);
		expect(session.getState().pending.get('GEN:1:1')?.operationId).toBe(third?.operationId);
		expect(session.acknowledge('GEN:1:1', second!.operationId)).toBe(false);
		expect(session.acknowledge('GEN:1:1', third!.operationId)).toBe(true);
		expect(session.isHighlighted('GEN:1:1')).toBe(true);
	});

	it('hydrates legacy colors as gold and maps named presets', () => {
		localStorage.setItem(
			getHighlightsStorageKey('legacy-color-user'),
			JSON.stringify({
				version: 1,
				uid: 'legacy-color-user',
				highlightedIds: ['GEN:1:1'],
				colors: { 'GEN:1:1': 'blue' },
				pending: {}
			})
		);
		const session = createHighlightSession('legacy-color-user');
		sessions.push(session);
		expect(session.getColor('GEN:1:1')).toBe(HIGHLIGHT_PRESETS[1].color);
	});

	it('quarantines malformed records and fences users from one another', () => {
		const userA = createHighlightSession('user-a');
		const userB = createHighlightSession('user-b');
		sessions.push(userA, userB);
		userA.set('GEN:1:1');
		expect(userB.isHighlighted('GEN:1:1')).toBe(false);
		expect(userB.getState().uid).toBe('user-b');
		localStorage.setItem(
			getHighlightsStorageKey('malformed-user'),
			JSON.stringify({
				version: 1,
				uid: 'malformed-user',
				highlightedIds: ['GEN:01:1'],
				pending: {}
			})
		);
		const malformed = createHighlightSession('malformed-user');
		sessions.push(malformed);
		expect(malformed.getState().quarantined).toBe(true);
	});

	it('reports persisted pending work after reload', () => {
		const first = createHighlightSession('reload-user');
		first.set('GEN:1:1');
		first.teardown();
		const reloaded = createHighlightSession('reload-user');
		sessions.push(reloaded);
		expect(reloaded.getState().pendingIds.has('GEN:1:1')).toBe(true);
		expect(reloaded.getState().status).toBe('pending');
	});

	it('retains local intent after a sync error without reverting the highlight', () => {
		const session = createHighlightSession('error-user');
		sessions.push(session);
		session.markSyncError();
		expect(session.getState().status).toBe('sync error');
		session.set('GEN:1:1');
		expect(session.isHighlighted('GEN:1:1')).toBe(true);
		expect(session.getState().pendingIds.has('GEN:1:1')).toBe(true);
	});
});
