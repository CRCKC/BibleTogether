import Tooltip from './tooltip.svelte';

export function setupTooltip() {
	document.querySelectorAll('.bible sup').forEach(sup => {
		const text = sup.getAttribute('title') ?? '';

		const tooltip = document.createElement('span');
		// tooltip.style.display = 'inline-block';
		new Tooltip({
			target: tooltip,
			props: { text }
		});
		// Copy the content from <sup> to <h1>
		// tooltip.innerHTML = sup.innerHTML;

		sup.replaceWith(tooltip);
	});
}
