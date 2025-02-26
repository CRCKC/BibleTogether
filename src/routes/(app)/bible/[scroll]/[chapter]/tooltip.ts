import Tooltip from './tooltip.svelte';
import { mount } from "svelte";

export function setupTooltip() {
	document.querySelectorAll('.bible sup').forEach(sup => {
		const text = sup.getAttribute('title') ?? '';

		const tt = document.createElement('div');

		if (sup.parentElement === null) return;

		mount(Tooltip, {
        			target: tt,
        			props: { text }
        		});

		// Replace the <sup> element with the tooltip element
		sup.replaceWith(tt);
		tt.replaceWith(tt.firstChild ?? '');

	});
}