import { persisted } from 'svelte-persisted-store';
import { get, writable, type Readable, type Writable } from 'svelte/store';
import { isChapterValid } from './bible';
import { bibleshort } from './constants';

export const HIGHLIGHTS_VERSION = 1 as const;
export const HIGHLIGHTS_STORAGE_KEY = 'bibleHighlights';
const MAX_IDS = 10_000;

type VersePart = string | number;
export type HighlightOperation = 'set' | 'delete';
export type HighlightStatus =
	'ready' | 'pending' | 'saved locally' | 'degraded durability' | 'sync error';

export interface VerseIdentity {
	bookCode: string;
	chapter: number;
	verse: number;
}

export interface VerseIdentityWithScroll {
	scroll: string;
	chapter: number;
	verse: number;
}

export interface PendingHighlightOperation {
	operationId: string;
	sequence: number;
	desired: HighlightOperation;
	/** Alias retained in the durable shape for transport adapters. */
	op: HighlightOperation;
}

/** The only durable shape used by this feature. Keep it JSON-serializable. */
export interface HighlightRecord {
	version: typeof HIGHLIGHTS_VERSION;
	uid: string;
	highlightedIds: string[];
	pending: Record<string, PendingHighlightOperation>;
}

export interface HighlightProjection {
	uid: string;
	ready: boolean;
	status: HighlightStatus;
	durability: 'persistent' | 'memory';
	highlightedIds: ReadonlySet<string>;
	pendingIds: ReadonlySet<string>;
	pending: ReadonlyMap<string, PendingHighlightOperation>;
	quarantined: boolean;
}

export interface HighlightSession extends Readable<HighlightProjection> {
	readonly uid: string;
	getState(): HighlightProjection;
	getSnapshot(): HighlightProjection;
	hydrate(): HighlightProjection;
	set(id: string): PendingHighlightOperation | undefined;
	delete(id: string): PendingHighlightOperation | undefined;
	toggle(id: string): PendingHighlightOperation | undefined;
	isHighlighted(id: string): boolean;
	acknowledge(id: string, operationId: string): boolean;
	applyRemote(id: string, highlighted: boolean): boolean;
	markSyncError(): void;
	retry(): void;
	teardown(): void;
	destroy(): void;
}

export function normalizeBookCode(bookCode: string): string | null {
	if (typeof bookCode !== 'string') return null;
	const normalized = bookCode.toUpperCase();
	return bibleshort.includes(normalized) ? normalized : null;
}

function normalizePositiveInteger(value: VersePart): number | null {
	if (typeof value === 'number') {
		return Number.isSafeInteger(value) && value > 0 ? value : null;
	}
	if (!/^[1-9]\d*$/.test(value)) return null;
	const parsed = Number(value);
	return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Return the canonical ID, or null for an invalid identity. Leading-zero
 * aliases are deliberately rejected rather than silently normalized.
 */
export function tryCanonicalVerseId(
	bookCode: string,
	chapter: VersePart,
	verse: VersePart
): string | null {
	const book = normalizeBookCode(bookCode);
	const chapterNumber = normalizePositiveInteger(chapter);
	const verseNumber = normalizePositiveInteger(verse);
	if (!book || chapterNumber === null || verseNumber === null) return null;
	if (!isChapterValid({ scroll: book, chapter: chapterNumber })) return null;
	return `${book}:${chapterNumber}:${verseNumber}`;
}

export function canonicalVerseId(bookCode: string, chapter: VersePart, verse: VersePart): string;
export function canonicalVerseId(identity: VerseIdentity | VerseIdentityWithScroll): string;
export function canonicalVerseId(
	bookOrIdentity: string | VerseIdentity | VerseIdentityWithScroll,
	chapter?: VersePart,
	verse?: VersePart
): string {
	const bookCode =
		typeof bookOrIdentity === 'string'
			? bookOrIdentity
			: 'bookCode' in bookOrIdentity
				? bookOrIdentity.bookCode
				: bookOrIdentity.scroll;
	const chapterPart = typeof bookOrIdentity === 'string' ? chapter : bookOrIdentity.chapter;
	const versePart = typeof bookOrIdentity === 'string' ? verse : bookOrIdentity.verse;
	if (chapterPart === undefined || versePart === undefined)
		throw new TypeError('Invalid verse identity');
	const id = tryCanonicalVerseId(bookCode, chapterPart, versePart);
	if (!id) throw new TypeError('Invalid verse identity');
	return id;
}

export const createVerseId = canonicalVerseId;
export const getCanonicalVerseId = canonicalVerseId;

/** Validate and normalize an already serialized canonical ID. */
export function normalizeVerseId(id: string): string | null {
	if (typeof id !== 'string') return null;
	const match = /^(.*?):([^:]+):([^:]+)$/.exec(id);
	return match ? tryCanonicalVerseId(match[1], match[2], match[3]) : null;
}

export function isValidVerseId(id: string): boolean {
	return normalizeVerseId(id) !== null;
}

export function getHighlightsStorageKey(uid: string): string {
	return `${HIGHLIGHTS_STORAGE_KEY}:${encodeURIComponent(uid)}`;
}

function emptyRecord(uid: string): HighlightRecord {
	return { version: HIGHLIGHTS_VERSION, uid, highlightedIds: [], pending: {} };
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeRecord(
	value: unknown,
	uid: string
): { record: HighlightRecord; quarantined: boolean } {
	if (!isObject(value) || value.version !== HIGHLIGHTS_VERSION || value.uid !== uid) {
		return { record: emptyRecord(uid), quarantined: value != null };
	}

	let quarantined = false;
	const highlightedIds: string[] = [];
	const seen = new Set<string>();
	if (Array.isArray(value.highlightedIds)) {
		for (const candidate of value.highlightedIds.slice(0, MAX_IDS)) {
			const id = typeof candidate === 'string' ? normalizeVerseId(candidate) : null;
			if (!id || seen.has(id)) {
				quarantined = true;
				continue;
			}
			seen.add(id);
			highlightedIds.push(id);
		}
		if (value.highlightedIds.length > MAX_IDS) quarantined = true;
	} else {
		quarantined = true;
	}

	const pending: Record<string, PendingHighlightOperation> = {};
	if (isObject(value.pending)) {
		for (const [candidate, raw] of Object.entries(value.pending).slice(0, MAX_IDS)) {
			const id = normalizeVerseId(candidate);
			if (!id || !isObject(raw)) {
				quarantined = true;
				continue;
			}
			const operationId = typeof raw.operationId === 'string' ? raw.operationId : '';
			const sequence = raw.sequence;
			const desired = raw.desired === 'set' || raw.desired === 'delete' ? raw.desired : null;
			if (
				!operationId ||
				typeof sequence !== 'number' ||
				!Number.isSafeInteger(sequence) ||
				sequence < 1 ||
				!desired
			) {
				quarantined = true;
				continue;
			}
			pending[id] = { operationId, sequence, desired, op: desired };
		}
		if (Object.keys(value.pending).length > MAX_IDS) quarantined = true;
	} else {
		quarantined = true;
	}

	return { record: { version: HIGHLIGHTS_VERSION, uid, highlightedIds, pending }, quarantined };
}

function operationIdentity(): string {
	const cryptoObject = globalThis.crypto as Crypto | undefined;
	if (cryptoObject?.randomUUID) return cryptoObject.randomUUID();
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${++operationCounter}`;
}
let operationCounter = 0;

function cloneRecord(record: HighlightRecord): HighlightRecord {
	return {
		version: HIGHLIGHTS_VERSION,
		uid: record.uid,
		highlightedIds: [...record.highlightedIds],
		pending: Object.fromEntries(
			Object.entries(record.pending).map(([id, operation]) => [id, { ...operation }])
		)
	};
}

function projection(
	record: HighlightRecord,
	uid: string,
	ready: boolean,
	status: HighlightStatus,
	durability: 'persistent' | 'memory',
	quarantined: boolean
): HighlightProjection {
	return {
		uid,
		ready,
		status,
		durability,
		highlightedIds: new Set(record.highlightedIds),
		pendingIds: new Set(Object.keys(record.pending)),
		pending: new Map(Object.entries(record.pending).map(([id, op]) => [id, { ...op }])),
		quarantined
	};
}

/** Create one local, UID-fenced highlight state session. */
export function createHighlightSession(uid: string): HighlightSession {
	if (typeof uid !== 'string' || !uid.trim()) throw new TypeError('A UID is required');

	const key = getHighlightsStorageKey(uid);
	let quarantined = false;
	let durableWriteFailed = false;
	let memoryOnly = false;
	let disposed = false;
	let ready = false;
	let status: HighlightStatus = 'ready';
	let durability: 'persistent' | 'memory' = 'persistent';
	let recordStore: Writable<HighlightRecord>;
	const initial = emptyRecord(uid);

	const beforeRead = (value: unknown) => {
		const sanitized = sanitizeRecord(value, uid);
		quarantined ||= sanitized.quarantined;
		return sanitized.record;
	};
	try {
		recordStore = persisted<HighlightRecord>(key, initial, {
			syncTabs: true,
			beforeRead,
			onWriteError: () => {
				durableWriteFailed = true;
				memoryOnly = true;
				durability = 'memory';
				status = 'degraded durability';
				emit();
			}
		});
	} catch {
		recordStore = writable(initial);
		durableWriteFailed = true;
		memoryOnly = true;
		durability = 'memory';
		status = 'degraded durability';
	}

	let current = get(recordStore);
	const projectionStore = writable<HighlightProjection>(
		projection(current, uid, ready, status, durability, quarantined)
	);
	const emit = () =>
		projectionStore.set(projection(current, uid, ready, status, durability, quarantined));
	const unsubscribe = recordStore.subscribe((next) => {
		const sanitized = sanitizeRecord(next, uid);
		current = sanitized.record;
		quarantined ||= sanitized.quarantined;
		ready = true;
		if (status === 'ready' && Object.keys(current.pending).length) status = 'pending';
		emit();
	});

	function update(
		idInput: string,
		desired: HighlightOperation
	): PendingHighlightOperation | undefined {
		if (disposed) return undefined;
		const id = normalizeVerseId(idInput);
		if (!id) return undefined;
		const next = cloneRecord(current);
		const highlighted = new Set(next.highlightedIds);
		if (desired === 'set') highlighted.add(id);
		else highlighted.delete(id);
		next.highlightedIds = [...highlighted].sort();
		const sequence =
			Math.max(0, ...Object.values(next.pending).map((operation) => operation.sequence)) + 1;
		const operation: PendingHighlightOperation = {
			operationId: operationIdentity(),
			sequence,
			desired,
			op: desired
		};
		next.pending[id] = operation;
		durableWriteFailed = false;
		status = memoryOnly ? 'degraded durability' : 'saved locally';
		recordStore.set(next);
		if (!durableWriteFailed && !memoryOnly) durability = 'persistent';
		emit();
		return { ...operation };
	}

	const session: HighlightSession = {
		uid,
		subscribe: projectionStore.subscribe,
		getState: () => get(projectionStore),
		getSnapshot: () => get(projectionStore),
		hydrate: () => {
			if (!disposed) {
				ready = true;
				emit();
			}
			return get(projectionStore);
		},
		set: (id) => update(id, 'set'),
		delete: (id) => update(id, 'delete'),
		toggle: (id) => update(id, session.isHighlighted(id) ? 'delete' : 'set'),
		isHighlighted: (id) => {
			const normalized = normalizeVerseId(id);
			return normalized !== null && current.highlightedIds.includes(normalized);
		},
		acknowledge: (idInput, operationId) => {
			if (disposed) return false;
			const id = normalizeVerseId(idInput);
			if (!id || current.pending[id]?.operationId !== operationId) return false;
			const next = cloneRecord(current);
			delete next.pending[id];
			status = Object.keys(next.pending).length ? 'pending' : 'ready';
			recordStore.set(next);
			emit();
			return true;
		},
		applyRemote: (idInput, highlighted) => {
			if (disposed) return false;
			const id = normalizeVerseId(idInput);
			if (!id || typeof highlighted !== 'boolean' || current.pending[id]) return false;
			const next = cloneRecord(current);
			const ids = new Set(next.highlightedIds);
			if (highlighted) ids.add(id);
			else ids.delete(id);
			next.highlightedIds = [...ids].sort();
			recordStore.set(next);
			emit();
			return true;
		},
		markSyncError: () => {
			if (!disposed) {
				status = 'sync error';
				emit();
			}
		},
		retry: () => {
			if (!disposed) {
				status = Object.keys(current.pending).length ? 'pending' : 'ready';
				emit();
			}
		},
		teardown: () => {
			if (!disposed) {
				disposed = true;
				unsubscribe();
				projectionStore.set(projection(current, uid, ready, status, durability, quarantined));
			}
		},
		destroy: () => session.teardown()
	};

	return session;
}

export const createHighlightStore = createHighlightSession;
export const createHighlightState = createHighlightSession;
export const createHighlightsStore = createHighlightSession;
