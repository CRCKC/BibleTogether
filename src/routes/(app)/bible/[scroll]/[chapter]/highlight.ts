import { tryCanonicalVerseId } from '$lib/bible/highlights';

export interface HighlightRoute {
	scroll?: string;
	bookCode?: string;
	chapter: number | string;
}

export interface HighlightEnhancer {
	update(highlightedIds?: Iterable<string> | ReadonlySet<string>): void;
	isManagedMarker(marker: Element | null): marker is HTMLButtonElement;
	destroy(): void;
}

const INTERACTIVE_SELECTOR =
	'a, button, input, select, textarea, summary, [contenteditable="true"], [contenteditable=""]';
const GENERATED_MARKER = 'button[data-verse-marker="true"]';
const generatedMarkers = new WeakSet<HTMLButtonElement>();
function routeBook(route: HighlightRoute): string | null {
	return route.scroll ?? route.bookCode ?? null;
}

function verseId(route: HighlightRoute, number: string): string | null {
	const chapter = route.chapter;
	if (typeof chapter === 'number' ? chapter <= 0 : !/^[1-9]\d*$/.test(chapter)) return null;
	return tryCanonicalVerseId(routeBook(route) ?? '', chapter, number);
}

function hasInteractiveAncestor(element: Element, root: Element): boolean {
	for (
		let current: Element | null = element.parentElement;
		current && current !== root;
		current = current.parentElement
	) {
		if (current.matches(INTERACTIVE_SELECTOR)) return true;
	}
	return root.matches(INTERACTIVE_SELECTOR); // an interactive root cannot contain a toggle
}

function hasInteractiveDescendant(element: Element): boolean {
	return element.querySelector(INTERACTIVE_SELECTOR) !== null;
}

function setState(button: HTMLButtonElement, text: HTMLSpanElement, highlighted: boolean) {
	const value = String(highlighted);
	button.setAttribute('aria-pressed', value);
	button.dataset.highlighted = value;
	text.dataset.highlighted = value;
	text.classList.toggle('verse-highlighted', highlighted);
}

/**
 * Enhance the existing <b>number</b><span>verse text</span> pairs in one
 * chapter root. The reader owns click delegation; this enhancer never adds
 * per-marker listeners.
 */
export function enhanceHighlights(
	root: HTMLElement,
	route: HighlightRoute,
	initialHighlightedIds: Iterable<string> | ReadonlySet<string> = []
): HighlightEnhancer {
	const entries = new Map<string, { button: HTMLButtonElement; text: HTMLSpanElement }>();
	const managedMarkers = new WeakSet<HTMLButtonElement>();
	const seen = new Set<string>();
	const highlighted = new Set(initialHighlightedIds);
	let destroyed = false;

	if (route.chapter !== 0 && route.chapter !== '0') {
		const markers = root.querySelectorAll<HTMLElement>(`b, ${GENERATED_MARKER}`);
		for (const marker of markers) {
			if (
				marker.matches(GENERATED_MARKER) &&
				(!(marker instanceof HTMLButtonElement) || !generatedMarkers.has(marker))
			)
				continue;
			if (marker.parentElement === null || hasInteractiveAncestor(marker, root)) continue;
			if (
				!marker.matches(GENERATED_MARKER) &&
				(hasInteractiveDescendant(marker) || marker.children.length > 0)
			)
				continue;

			const number = marker.textContent?.trim() ?? '';
			if (!/^[1-9]\d*$/.test(number)) continue;
			const text = marker.nextElementSibling;
			if (!(text instanceof HTMLSpanElement) || hasInteractiveAncestor(text, root)) continue;

			const id = verseId(route, number);
			if (!id || seen.has(id)) continue;
			if (seen.has(id)) continue;
			seen.add(id);

			let button: HTMLButtonElement;
			if (marker.matches(GENERATED_MARKER) && marker instanceof HTMLButtonElement) {
				button = marker;
			} else {
				button = root.ownerDocument.createElement('button');
				button.type = 'button';
				button.textContent = marker.textContent;
				marker.replaceWith(button);
				generatedMarkers.add(button);
			}
			button.dataset.verseMarker = 'true';
			button.dataset.verseId = id;
			button.dataset.verseNumber = number;
			button.setAttribute('aria-label', `Highlight verse ${number}`);
			button.classList.add('verse-highlight-marker');
			text.dataset.verseId = id;
			text.classList.add('verse-highlight-text');
			entries.set(id, { button, text });
			managedMarkers.add(button);
		}
	}

	const apply = () => {
		for (const [id, { button, text }] of entries) setState(button, text, highlighted.has(id));
	};
	apply();

	return {
		isManagedMarker(marker): marker is HTMLButtonElement {
			return !destroyed && marker instanceof HTMLButtonElement && managedMarkers.has(marker);
		},
		update(ids = []) {
			highlighted.clear();
			for (const id of ids) highlighted.add(id);
			apply();
		},
		destroy() {
			if (destroyed) return;
			destroyed = true;
			for (const { button, text } of entries.values()) {
				button.replaceWith(
					Object.assign(root.ownerDocument.createElement('b'), { textContent: button.textContent })
				);
				text.removeAttribute('data-verse-id');
				text.removeAttribute('data-highlighted');
				text.classList.remove('verse-highlight-text', 'verse-highlighted');
			}
			entries.clear();
		}
	};
}

export const setupHighlight = enhanceHighlights;
export const enhanceVerseHighlights = enhanceHighlights;
