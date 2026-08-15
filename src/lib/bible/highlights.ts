import { persisted } from 'svelte-persisted-store';
import { get, writable, type Readable, type Writable } from 'svelte/store';
import { isChapterValid } from './bible';
import { bibleshort } from './constants';

export const HIGHLIGHTS_VERSION = 2 as const;
export const HIGHLIGHTS_STORAGE_KEY = 'bibleHighlights';
export const DEFAULT_HIGHLIGHT_COLOR = '#facc15';
export const MAX_SAVED_HIGHLIGHT_COLORS = 5;
const MAX_IDS = 10_000;

export const HIGHLIGHT_PRESETS = [
	{ id: 'gold', color: '#facc15' },
	{ id: 'blue', color: '#60a5fa' },
	{ id: 'green', color: '#4ade80' },
	{ id: 'rose', color: '#fb7185' },
	{ id: 'violet', color: '#a78bfa' }
] as const;

const PRESET_COLORS: Record<string, string> = Object.fromEntries(
	HIGHLIGHT_PRESETS.map(({ id, color }) => [id, color])
);

export interface HSV {
	h: number;
	s: number;
	v: number;
}

export interface HighlightPreferences {
	defaultColor: string;
	savedColors: string[];
}

export interface PendingHighlightPreferencesOperation {
	operationId: string;
	sequence: number;
	preferences: HighlightPreferences;
}

export function normalizeHighlightColor(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const preset = PRESET_COLORS[value.toLowerCase()];
	if (preset) return preset;
	return /^#[0-9a-f]{6}$/i.test(value) ? value.toLowerCase() : null;
}

export function hexToRgb(value: string): { r: number; g: number; b: number } | null {
	const color = normalizeHighlightColor(value);
	if (!color) return null;
	return {
		r: Number.parseInt(color.slice(1, 3), 16),
		g: Number.parseInt(color.slice(3, 5), 16),
		b: Number.parseInt(color.slice(5, 7), 16)
	};
}

export function hexToHsv(value: string): HSV {
	const { r, g, b } = hexToRgb(value) ?? hexToRgb(DEFAULT_HIGHLIGHT_COLOR)!;
	const red = r / 255;
	const green = g / 255;
	const blue = b / 255;
	const max = Math.max(red, green, blue);
	const min = Math.min(red, green, blue);
	const delta = max - min;
	let h = 0;
	if (delta) {
		if (max === red) h = 60 * (((green - blue) / delta) % 6);
		else if (max === green) h = 60 * ((blue - red) / delta + 2);
		else h = 60 * ((red - green) / delta + 4);
		if (h < 0) h += 360;
	}
	return { h, s: max ? delta / max : 0, v: max };
}

export function hsvToHex({ h, s, v }: HSV): string {
	const hue = ((h % 360) + 360) % 360;
	const chroma = v * s;
	const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
	const match = v - chroma;
	const [red, green, blue] =
		hue < 60
			? [chroma, x, 0]
			: hue < 120
				? [x, chroma, 0]
				: hue < 180
					? [0, chroma, x]
					: hue < 240
						? [0, x, chroma]
						: hue < 300
							? [x, 0, chroma]
							: [chroma, 0, x];
	const channel = (value: number) =>
		Math.round((value + match) * 255)
			.toString(16)
			.padStart(2, '0');
	return `#${channel(red)}${channel(green)}${channel(blue)}`;
}

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
	color?: string;
	/** Alias retained in the durable shape for transport adapters. */
	op: HighlightOperation;
}

/** The only durable shape used by this feature. Keep it JSON-serializable. */
export interface HighlightRecord {
	version: typeof HIGHLIGHTS_VERSION;
	uid: string;
	highlightedIds: string[];
	colors: Record<string, string>;
	preferences: HighlightPreferences;
	pendingPreferences?: PendingHighlightPreferencesOperation;
	pending: Record<string, PendingHighlightOperation>;
}

export interface HighlightProjection {
	uid: string;
	ready: boolean;
	status: HighlightStatus;
	durability: 'persistent' | 'memory';
	highlightedIds: ReadonlySet<string>;
	colors: ReadonlyMap<string, string>;
	preferences: HighlightPreferences;
	pendingPreferences: PendingHighlightPreferencesOperation | null;
	pendingIds: ReadonlySet<string>;
	pending: ReadonlyMap<string, PendingHighlightOperation>;
	quarantined: boolean;
}

export interface HighlightSession extends Readable<HighlightProjection> {
	readonly uid: string;
	getState(): HighlightProjection;
	getSnapshot(): HighlightProjection;
	hydrate(): HighlightProjection;
	set(id: string, color?: string): PendingHighlightOperation | undefined;
	delete(id: string): PendingHighlightOperation | undefined;
	recolor(id: string, color: string): PendingHighlightOperation | undefined;
	toggle(id: string): PendingHighlightOperation | undefined;
	isHighlighted(id: string): boolean;
	getColor(id: string): string;
	setDefaultColor(color: string): PendingHighlightPreferencesOperation | undefined;
	saveCustomColor(
		color: string,
		replaceIndex?: number
	): PendingHighlightPreferencesOperation | undefined;
	deleteCustomColor(color: string): PendingHighlightPreferencesOperation | undefined;
	acknowledgePreferences(operationId: string): boolean;
	applyRemotePreferences(preferences: HighlightPreferences): boolean;
	acknowledge(id: string, operationId: string): boolean;
	applyRemote(id: string, highlighted: boolean, color?: string): boolean;
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

export function defaultHighlightPreferences(): HighlightPreferences {
	return { defaultColor: DEFAULT_HIGHLIGHT_COLOR, savedColors: [] };
}

export function normalizeHighlightPreferences(value: unknown): HighlightPreferences | null {
	if (!isObject(value)) return null;
	const defaultColor = normalizeHighlightColor(value.defaultColor) ?? null;
	if (!defaultColor || !Array.isArray(value.savedColors)) return null;
	if (value.savedColors.length > MAX_SAVED_HIGHLIGHT_COLORS) return null;
	const savedColors: string[] = [];
	for (const rawColor of value.savedColors) {
		const color = normalizeHighlightColor(rawColor);
		if (!color || savedColors.includes(color)) continue;
		savedColors.push(color);
		if (savedColors.length === MAX_SAVED_HIGHLIGHT_COLORS) break;
	}
	const isPreset = HIGHLIGHT_PRESETS.some((preset) => preset.color === defaultColor);
	if (!isPreset && !savedColors.includes(defaultColor)) return null;
	return { defaultColor, savedColors };
}

function emptyRecord(uid: string): HighlightRecord {
	return {
		version: HIGHLIGHTS_VERSION,
		uid,
		highlightedIds: [],
		colors: {},
		preferences: defaultHighlightPreferences(),
		pending: {}
	};
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeRecord(
	value: unknown,
	uid: string
): { record: HighlightRecord; quarantined: boolean } {
	if (
		!isObject(value) ||
		(value.version !== HIGHLIGHTS_VERSION && value.version !== 1) ||
		value.uid !== uid
	) {
		return { record: emptyRecord(uid), quarantined: value != null };
	}

	let quarantined = value.version === 1;
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

	const colors: Record<string, string> = {};
	if (isObject(value.colors)) {
		for (const [candidate, rawColor] of Object.entries(value.colors).slice(0, MAX_IDS)) {
			const id = normalizeVerseId(candidate);
			const color = normalizeHighlightColor(rawColor);
			if (!id || !seen.has(id) || !color) {
				quarantined = true;
				continue;
			}
			colors[id] = color;
		}
		if (Object.keys(value.colors).length > MAX_IDS) quarantined = true;
	} else if (value.version !== 1) {
		quarantined = true;
	}

	const rawPreferences = value.preferences;
	const preferences =
		normalizeHighlightPreferences(rawPreferences) ?? defaultHighlightPreferences();
	if (rawPreferences !== undefined && !normalizeHighlightPreferences(rawPreferences))
		quarantined = true;

	let pendingPreferences: PendingHighlightPreferencesOperation | undefined;
	if (value.pendingPreferences !== undefined) {
		if (isObject(value.pendingPreferences)) {
			const operationId =
				typeof value.pendingPreferences.operationId === 'string'
					? value.pendingPreferences.operationId
					: '';
			const sequence = value.pendingPreferences.sequence;
			const pendingPreferencesValue = normalizeHighlightPreferences(
				value.pendingPreferences.preferences
			);
			if (
				operationId &&
				typeof sequence === 'number' &&
				Number.isSafeInteger(sequence) &&
				sequence > 0 &&
				pendingPreferencesValue
			) {
				pendingPreferences = {
					operationId,
					sequence,
					preferences: pendingPreferencesValue
				};
			} else quarantined = true;
		} else quarantined = true;
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
			const color: string | undefined =
				desired === 'set'
					? raw.color === undefined
						? DEFAULT_HIGHLIGHT_COLOR
						: (normalizeHighlightColor(raw.color) ?? undefined)
					: undefined;
			if (desired === 'set' && !color) {
				quarantined = true;
				continue;
			}
			pending[id] = { operationId, sequence, desired, color, op: desired };
		}
		if (Object.keys(value.pending).length > MAX_IDS) quarantined = true;
	} else {
		quarantined = true;
	}

	return {
		record: {
			version: HIGHLIGHTS_VERSION,
			uid,
			highlightedIds,
			colors,
			preferences,
			...(pendingPreferences ? { pendingPreferences } : {}),
			pending
		},
		quarantined
	};
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
		colors: { ...record.colors },
		preferences: {
			defaultColor: record.preferences.defaultColor,
			savedColors: [...record.preferences.savedColors]
		},
		...(record.pendingPreferences
			? {
					pendingPreferences: {
						...record.pendingPreferences,
						preferences: {
							defaultColor: record.pendingPreferences.preferences.defaultColor,
							savedColors: [...record.pendingPreferences.preferences.savedColors]
						}
					}
				}
			: {}),
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
		colors: new Map(Object.entries(record.colors)),
		preferences: {
			defaultColor: record.preferences.defaultColor,
			savedColors: [...record.preferences.savedColors]
		},
		pendingPreferences: record.pendingPreferences ? { ...record.pendingPreferences } : null,
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
		if (status === 'ready' && (Object.keys(current.pending).length || current.pendingPreferences))
			status = 'pending';
		emit();
	});

	function update(
		idInput: string,
		desired: HighlightOperation,
		colorInput = DEFAULT_HIGHLIGHT_COLOR
	): PendingHighlightOperation | undefined {
		if (disposed) return undefined;
		const id = normalizeVerseId(idInput);
		if (!id) return undefined;
		const color = desired === 'set' ? normalizeHighlightColor(colorInput) : undefined;
		if (desired === 'set' && !color) return undefined;
		const alreadyHighlighted = current.highlightedIds.includes(id);
		const pending = current.pending[id];
		if (
			desired === 'set' &&
			alreadyHighlighted &&
			current.colors[id] === color &&
			(!pending || (pending.desired === 'set' && pending.color === color))
		)
			return undefined;

		const next = cloneRecord(current);
		const highlighted = new Set(next.highlightedIds);
		if (desired === 'set') {
			highlighted.add(id);
			next.colors[id] = color!;
		} else {
			highlighted.delete(id);
			delete next.colors[id];
		}
		next.highlightedIds = [...highlighted].sort();
		const sequence =
			Math.max(0, ...Object.values(next.pending).map((operation) => operation.sequence)) + 1;
		const operation: PendingHighlightOperation = {
			operationId: operationIdentity(),
			sequence,
			desired,
			...(color ? { color } : {}),
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

	function updatePreferences(
		preferencesInput: HighlightPreferences
	): PendingHighlightPreferencesOperation | undefined {
		if (disposed) return undefined;
		const preferences = normalizeHighlightPreferences(preferencesInput);
		if (!preferences) return undefined;
		if (
			!current.pendingPreferences &&
			JSON.stringify(current.preferences) === JSON.stringify(preferences)
		)
			return undefined;
		const next = cloneRecord(current);
		const sequence =
			Math.max(
				0,
				...Object.values(next.pending).map((operation) => operation.sequence),
				next.pendingPreferences?.sequence ?? 0
			) + 1;
		const operation: PendingHighlightPreferencesOperation = {
			operationId: operationIdentity(),
			sequence,
			preferences
		};
		next.preferences = preferences;
		next.pendingPreferences = operation;
		durableWriteFailed = false;
		status = memoryOnly ? 'degraded durability' : 'saved locally';
		recordStore.set(next);
		if (!durableWriteFailed && !memoryOnly) durability = 'persistent';
		emit();
		return {
			...operation,
			preferences: { ...preferences, savedColors: [...preferences.savedColors] }
		};
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
		set: (id, color = DEFAULT_HIGHLIGHT_COLOR) => update(id, 'set', color),
		delete: (id) => update(id, 'delete'),
		recolor: (id, color) => (session.isHighlighted(id) ? update(id, 'set', color) : undefined),
		toggle: (id) =>
			update(id, session.isHighlighted(id) ? 'delete' : 'set', current.preferences.defaultColor),
		isHighlighted: (id) => {
			const normalized = normalizeVerseId(id);
			return normalized !== null && current.highlightedIds.includes(normalized);
		},
		getColor: (id) => {
			const normalized = normalizeVerseId(id);
			return (normalized && current.colors[normalized]) || DEFAULT_HIGHLIGHT_COLOR;
		},
		setDefaultColor: (colorInput) => {
			const color = normalizeHighlightColor(colorInput);
			if (!color) return undefined;
			const isPreset = HIGHLIGHT_PRESETS.some((preset) => preset.color === color);
			if (!isPreset && !current.preferences.savedColors.includes(color)) return undefined;
			return updatePreferences({ ...current.preferences, defaultColor: color });
		},
		saveCustomColor: (colorInput, replaceIndex) => {
			const color = normalizeHighlightColor(colorInput);
			if (!color) return undefined;
			const savedColors = [...current.preferences.savedColors];
			const existingIndex = savedColors.indexOf(color);
			if (existingIndex >= 0) return updatePreferences(current.preferences);
			let defaultColor = current.preferences.defaultColor;
			if (savedColors.length >= MAX_SAVED_HIGHLIGHT_COLORS) {
				if (replaceIndex === undefined || replaceIndex < 0 || replaceIndex >= savedColors.length)
					return undefined;
				if (defaultColor === savedColors[replaceIndex]) defaultColor = DEFAULT_HIGHLIGHT_COLOR;
				savedColors[replaceIndex] = color;
			} else savedColors.push(color);
			return updatePreferences({ defaultColor, savedColors });
		},
		deleteCustomColor: (colorInput) => {
			const color = normalizeHighlightColor(colorInput);
			if (!color || !current.preferences.savedColors.includes(color)) return undefined;
			return updatePreferences({
				defaultColor:
					current.preferences.defaultColor === color
						? DEFAULT_HIGHLIGHT_COLOR
						: current.preferences.defaultColor,
				savedColors: current.preferences.savedColors.filter((saved) => saved !== color)
			});
		},
		acknowledgePreferences: (operationId) => {
			if (disposed || current.pendingPreferences?.operationId !== operationId) return false;
			const next = cloneRecord(current);
			delete next.pendingPreferences;
			status = Object.keys(next.pending).length || next.pendingPreferences ? 'pending' : 'ready';
			recordStore.set(next);
			emit();
			return true;
		},
		applyRemotePreferences: (preferencesInput) => {
			if (disposed || current.pendingPreferences) return false;
			const preferences = normalizeHighlightPreferences(preferencesInput);
			if (!preferences) return false;
			const next = cloneRecord(current);
			next.preferences = preferences;
			recordStore.set(next);
			emit();
			return true;
		},
		acknowledge: (idInput, operationId) => {
			if (disposed) return false;
			const id = normalizeVerseId(idInput);
			if (!id || current.pending[id]?.operationId !== operationId) return false;
			const next = cloneRecord(current);
			delete next.pending[id];
			status = Object.keys(next.pending).length || next.pendingPreferences ? 'pending' : 'ready';
			recordStore.set(next);
			emit();
			return true;
		},
		applyRemote: (idInput, highlighted, colorInput) => {
			if (disposed) return false;
			const id = normalizeVerseId(idInput);
			if (!id || typeof highlighted !== 'boolean' || current.pending[id]) return false;
			const color = highlighted
				? colorInput === undefined
					? DEFAULT_HIGHLIGHT_COLOR
					: normalizeHighlightColor(colorInput)
				: undefined;
			if (highlighted && !color) return false;
			const next = cloneRecord(current);
			const ids = new Set(next.highlightedIds);
			if (highlighted) {
				ids.add(id);
				next.colors[id] = color!;
			} else {
				ids.delete(id);
				delete next.colors[id];
			}
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
				status =
					Object.keys(current.pending).length || current.pendingPreferences ? 'pending' : 'ready';
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
