import {
	DEFAULT_HIGHLIGHT_COLOR,
	hexToRgb,
	normalizeHighlightColor,
	tryCanonicalVerseId
} from '$lib/bible/highlights';

export interface HighlightRoute {
	scroll?: string;
	bookCode?: string;
	chapter: number | string;
}

export interface HighlightEnhancer {
	update(
		highlightedIds?: Iterable<string> | ReadonlySet<string>,
		colors?: ReadonlyMap<string, string> | Record<string, string>
	): void;
	isManagedMarker(marker: Element | null): marker is HTMLButtonElement;
	isManagedColorControl(control: Element | null): control is HTMLButtonElement;
	destroy(): void;
}

const INTERACTIVE_SELECTOR =
	'a, button, input, select, textarea, summary, [contenteditable="true"], [contenteditable=""]';
const GENERATED_MARKER = 'button[data-verse-marker="true"]';
const GENERATED_COLOR_CONTROL = 'button[data-verse-color-control="true"]';
const generatedMarkers = new WeakSet<HTMLButtonElement>();
const generatedColorControls = new WeakSet<HTMLButtonElement>();
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

function setState(
	button: HTMLButtonElement,
	text: HTMLSpanElement,
	colorControl: HTMLButtonElement,
	highlighted: boolean,
	colorInput: string
) {
	const value = String(highlighted);
	const color = normalizeHighlightColor(colorInput) ?? DEFAULT_HIGHLIGHT_COLOR;
	const rgb = hexToRgb(color)!;
	button.setAttribute('aria-pressed', value);
	button.dataset.highlighted = value;
	if (highlighted) button.dataset.highlightColor = color;
	else delete button.dataset.highlightColor;
	text.dataset.highlighted = value;
	text.classList.toggle('verse-highlighted', highlighted);
	colorControl.hidden = !highlighted;
	colorControl.tabIndex = highlighted ? 0 : -1;
	colorControl.dataset.highlighted = value;
	if (highlighted) {
		colorControl.dataset.highlightColor = color;
		colorControl.style.setProperty('--highlight-color', color);
		colorControl.style.setProperty('--highlight-rgb', `${rgb.r} ${rgb.g} ${rgb.b}`);
	} else {
		delete colorControl.dataset.highlightColor;
		colorControl.style.removeProperty('--highlight-color');
		colorControl.style.removeProperty('--highlight-rgb');
	}
	if (highlighted) text.dataset.highlightColor = color;
	else delete text.dataset.highlightColor;
	text.style.setProperty('--highlight-rgb', `${rgb.r} ${rgb.g} ${rgb.b}`);
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
	const entries = new Map<
		string,
		{ button: HTMLButtonElement; text: HTMLSpanElement; colorControl: HTMLButtonElement }
	>();
	const managedMarkers = new WeakSet<HTMLButtonElement>();
	const managedColorControls = new WeakSet<HTMLButtonElement>();
	const seen = new Set<string>();
	const highlighted = new Set(initialHighlightedIds);
	const colors = new Map<string, string>();
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
			let text = marker.nextElementSibling;
			if (text?.matches(GENERATED_COLOR_CONTROL)) text = text.nextElementSibling;
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
			let colorControl: HTMLButtonElement;
			const existingColorControl = marker.nextElementSibling;
			if (
				existingColorControl instanceof HTMLButtonElement &&
				existingColorControl.matches(GENERATED_COLOR_CONTROL) &&
				generatedColorControls.has(existingColorControl)
			) {
				colorControl = existingColorControl;
			} else {
				colorControl = root.ownerDocument.createElement('button');
				colorControl.type = 'button';
				colorControl.dataset.verseColorControl = 'true';
				colorControl.dataset.verseColorId = id;
				colorControl.dataset.verseNumber = number;
				colorControl.setAttribute('aria-label', `Change highlight color for verse ${number}`);
				colorControl.setAttribute('aria-haspopup', 'dialog');
				colorControl.setAttribute('aria-expanded', 'false');
				colorControl.classList.add('verse-color-control');
				button.after(colorControl);
				generatedColorControls.add(colorControl);
			}
			text.dataset.verseId = id;
			text.classList.add('verse-highlight-text');
			entries.set(id, { button, text, colorControl });
			managedMarkers.add(button);
			managedColorControls.add(colorControl);
		}
	}

	const apply = () => {
		for (const [id, { button, text, colorControl }] of entries)
			setState(
				button,
				text,
				colorControl,
				highlighted.has(id),
				colors.get(id) ?? DEFAULT_HIGHLIGHT_COLOR
			);
	};
	apply();

	return {
		isManagedMarker(marker): marker is HTMLButtonElement {
			return !destroyed && marker instanceof HTMLButtonElement && managedMarkers.has(marker);
		},
		isManagedColorControl(control): control is HTMLButtonElement {
			return (
				!destroyed && control instanceof HTMLButtonElement && managedColorControls.has(control)
			);
		},
		update(ids = [], nextColors = {}) {
			highlighted.clear();
			for (const id of ids) highlighted.add(id);
			colors.clear();
			if (nextColors instanceof Map) {
				for (const [id, color] of nextColors) {
					const normalized = normalizeHighlightColor(color);
					if (normalized) colors.set(id, normalized);
				}
			} else {
				for (const [id, color] of Object.entries(nextColors)) {
					const normalized = normalizeHighlightColor(color);
					if (normalized) colors.set(id, normalized);
				}
			}
			apply();
		},
		destroy() {
			if (destroyed) return;
			destroyed = true;
			for (const { button, text, colorControl } of entries.values()) {
				colorControl.remove();
				button.replaceWith(
					Object.assign(root.ownerDocument.createElement('b'), { textContent: button.textContent })
				);
				text.removeAttribute('data-verse-id');
				text.removeAttribute('data-highlighted');
				text.removeAttribute('data-highlight-color');
				text.style.removeProperty('--highlight-rgb');
				text.classList.remove('verse-highlight-text', 'verse-highlighted');
			}
			entries.clear();
		}
	};
}

export const setupHighlight = enhanceHighlights;
export const enhanceVerseHighlights = enhanceHighlights;
