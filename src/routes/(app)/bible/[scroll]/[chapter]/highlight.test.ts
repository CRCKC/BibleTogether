// @vitest-environment jsdom
// @vitest-environment-options {"url":"http://localhost/"}

import { beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('svelte', async (importOriginal) => ({
	...(await importOriginal<typeof import('svelte')>()),
	mount: (_component: unknown, options: { target: HTMLElement }) => {
		options.target.innerHTML = '<span class="bible-tooltip"></span>';
		return { target: options.target };
	},
	unmount: (component: { target: HTMLElement }) => component.target.replaceChildren()
}));

let setupTooltip: typeof import('./tooltip').setupTooltip;
let enhanceHighlights: typeof import('./highlight').enhanceHighlights;

beforeAll(async () => {
	const storage = new Map<string, string>();
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => storage.get(key) ?? null,
		setItem: (key: string, value: string) => storage.set(key, value),
		removeItem: (key: string) => storage.delete(key),
		clear: () => storage.clear()
	});
	({ enhanceHighlights } = await import('./highlight'));
	({ setupTooltip } = await import('./tooltip'));
});

function chapter(markup: string) {
	const root = document.createElement('div');
	root.innerHTML = markup;
	document.body.append(root);
	return root;
}

describe('enhanceHighlights', () => {
	it('enhances first, middle, and final verses with canonical route IDs', () => {
		const root = chapter(
			'<p><b>1</b><span>first</span><b>2</b><span>middle</span><b>3</b><span>final</span></p>'
		);
		const enhancer = enhanceHighlights(root, { scroll: 'gen', chapter: 1 }, ['GEN:1:2']);

		const buttons = root.querySelectorAll<HTMLButtonElement>('[data-verse-marker="true"]');
		expect(buttons).toHaveLength(3);
		expect([...buttons].map((button) => button.dataset.verseId)).toEqual([
			'GEN:1:1',
			'GEN:1:2',
			'GEN:1:3'
		]);
		expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
		expect(
			root.querySelector('span[data-verse-id="GEN:1:2"]')?.classList.contains('verse-highlighted')
		).toBe(true);
		expect(root.textContent).toBe('1first2middle3final');
		enhancer.destroy();
	});

	it('updates state without replacing verse text', () => {
		const root = chapter(
			'<p><b>1</b><span>alpha <sup title="note"></sup></span><b>2</b><span>beta</span></p>'
		);
		const text = root.querySelectorAll('span')[0];
		const original = text.textContent;
		const enhancer = enhanceHighlights(root, { bookCode: 'GEN', chapter: 1 });

		enhancer.update(new Set(['GEN:1:1']));
		expect(text.textContent).toBe(original);
		expect(text.dataset.highlighted).toBe('true');
		enhancer.update([]);
		expect(text.dataset.highlighted).toBe('false');
	});

	it('skips malformed markers, intro chapters, and interactive ancestors', () => {
		const root = chapter(
			'<p><b>0</b><span>zero</span><b>01</b><span>leading</span><b>x</b><span>bad</span>' +
				'<a><b>2</b><span>link</span></a><button><b>3</b><span>button</span></button>' +
				'<b><em>4</em></b><span>nested</span></p>'
		);
		enhanceHighlights(root, { scroll: 'GEN', chapter: 1 });
		expect(root.querySelectorAll('[data-verse-marker="true"]')).toHaveLength(0);
		enhanceHighlights(root, { scroll: 'GEN', chapter: 0 });
		expect(root.querySelectorAll('[data-verse-marker="true"]')).toHaveLength(0);
	});

	it('does not adopt forged marker buttons', () => {
		const root = chapter(
			'<button data-verse-marker="true" data-verse-id="GEN:1:1">1</button><span>one</span>'
		);
		const enhancer = enhanceHighlights(root, { scroll: 'GEN', chapter: 1 });
		expect(enhancer.isManagedMarker(root.querySelector('button'))).toBe(false);
	});

	it('is idempotent and does not duplicate markers', () => {
		const root = chapter('<p><b>1</b><span>one</span><b>1</b><span>duplicate</span></p>');
		enhanceHighlights(root, { scroll: 'GEN', chapter: 1 });
		enhanceHighlights(root, { scroll: 'GEN', chapter: 1 }, ['GEN:1:1']);
		expect(root.querySelectorAll('[data-verse-marker="true"]')).toHaveLength(1);
		expect(
			root
				.querySelector<HTMLButtonElement>('[data-verse-marker="true"]')
				?.getAttribute('aria-pressed')
		).toBe('true');
		expect(root.textContent).toBe('1one1duplicate');
	});
});

describe('tooltip coexistence', () => {
	it('keeps nested tooltip controls separate and cleans them up', () => {
		const root = chapter(
			'<div id="bible-tooltip-boundary"><b>1</b><span>text <sup title="note"></sup></span></div>'
		);
		const enhancer = enhanceHighlights(root, { scroll: 'GEN', chapter: 1 });
		const tooltip = setupTooltip(root);

		expect(root.querySelector('[data-verse-marker="true"] sup')).toBeNull();
		expect(root.querySelector('[data-verse-marker="true"]')).toBeTruthy();
		expect(root.querySelector('.bible-tooltip')).toBeTruthy();
		tooltip.destroy();
		expect(root.querySelector('.bible-tooltip')).toBeNull();
		expect(root.querySelector('sup[title="note"]')).toBeTruthy();
		enhancer.destroy();
	});
});
