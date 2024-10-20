export function setupTooltip() {
	const supTags = document.querySelectorAll('.bible sup');
	supTags.forEach((sup) => {
		sup.addEventListener('mouseenter', showTooltip);
		sup.addEventListener('mouseleave', hideTooltip);
		sup.addEventListener('click', toggleTooltip);
	});
}

function showTooltip(event: Event) {
	const target = event.target as HTMLElement;
	const tooltip = createTooltip(target.innerText);
	document.body.appendChild(tooltip);
	positionTooltip(event as MouseEvent, tooltip);
}

function hideTooltip() {
	const tooltip = document.querySelector('.tooltip');
	if (tooltip) {
		tooltip.remove();
	}
}

function toggleTooltip(event: Event) {
	const tooltip = document.querySelector('.tooltip');
	if (tooltip) {
		tooltip.remove();
	} else {
		showTooltip(event);
	}
}

function createTooltip(text: string): HTMLDivElement {
	const tooltip = document.createElement('div');
	tooltip.className = 'tooltip';
	tooltip.innerText = text;
	tooltip.style.position = 'absolute';
	tooltip.style.backgroundColor = '#333';
	tooltip.style.color = '#fff';
	tooltip.style.padding = '5px';
	tooltip.style.borderRadius = '5px';
	tooltip.style.zIndex = '1000';
	return tooltip;
}

function positionTooltip(event: MouseEvent, tooltip: HTMLDivElement) {
	const target = event.target as HTMLElement;
	const rect = target.getBoundingClientRect();
	tooltip.style.top = `${rect.top + window.scrollY - tooltip.offsetHeight - 5}px`;
	tooltip.style.left = `${rect.left + window.scrollX + (rect.width - tooltip.offsetWidth) / 2}px`;
}