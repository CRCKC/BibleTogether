import { mount, unmount } from 'svelte';
import Tooltip from './tooltip.svelte';

type TooltipRoot = Document | HTMLElement;

export interface TooltipCleanup {
	(): void;
	destroy(): void;
	cleanup: () => void;
	handles: readonly unknown[];
}

const active = new WeakMap<object, TooltipCleanup>();

/** Mount tooltips only inside the supplied chapter root. */
export function setupTooltip(root: TooltipRoot = document): TooltipCleanup {
	const key = root as object;
	const existing = active.get(key);
	if (existing) return existing;

	const documentRoot: Document =
		root.nodeType === 9 ? (root as Document) : (root.ownerDocument ?? document);
	const boundary =
		(root instanceof Element && root.closest('#bible-tooltip-boundary')) ??
		(root instanceof Element ? root.querySelector<HTMLElement>('#bible-tooltip-boundary') : null) ??
		(documentRoot.getElementById('bible-tooltip-boundary') as HTMLElement | null);
	const handles: unknown[] = [];

	if (boundary) {
		const sups = root.querySelectorAll<HTMLElement>(
			'sup[title]:not([data-tooltip-enhanced="true"])'
		);
		for (const sup of sups) {
			const text = sup.getAttribute('title') ?? '';
			const target = documentRoot.createElement('span');
			target.dataset.tooltipEnhanced = 'true';
			const component = mount(Tooltip, {
				target: target as HTMLElement,
				props: { text, boundary: boundary as HTMLElement }
			});
			const node = target.firstChild ?? target;
			handles.push({ component, node, original: sup });
			sup.replaceWith(node);
		}
	}

	let destroyed = false;
	const destroy = () => {
		if (destroyed) return;
		destroyed = true;
		for (const handle of handles as {
			component: Record<string, unknown>;
			node: Node;
			original: HTMLElement;
		}[]) {
			try {
				unmount(handle.component);
			} catch {
				// The chapter root may already have been removed.
			}
			handle.node.parentNode?.replaceChild(handle.original, handle.node);
		}
		active.delete(key);
	};
	const cleanup = destroy as TooltipCleanup;
	cleanup.destroy = destroy;
	cleanup.cleanup = destroy;
	cleanup.handles = handles;
	active.set(key, cleanup);
	return cleanup;
}
