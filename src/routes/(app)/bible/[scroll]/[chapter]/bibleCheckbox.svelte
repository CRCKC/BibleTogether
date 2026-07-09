<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label/index.js';
	import { onDestroy, onMount } from 'svelte';
	import { t } from 'svelte-i18n';

	let { checked = $bindable(false) }: { checked: boolean } = $props();

	// ponytail: animation fires on check, no cleanup needed (single-shot $effect)
	let animating = $state(false);
	let prevChecked = $state(checked);

	$effect(() => {
		if (checked && !prevChecked) {
			animating = true;
		}
		prevChecked = checked;
	});

	function onRippleEnd() {
		animating = false;
	}

	// Shake on scroll-into-view to prompt user to check the box
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				if (!checked && !entry.target.classList.contains('in-view')) {
					entry.target.classList.add('animated');
				}
				entry.target.classList.add('in-view');
			}
		});
	});

	onMount(() => {
		const el = document.querySelector('.bibleCheckbox');
		if (el) observer.observe(el);
	});

	onDestroy(() => {
		const el = document.querySelector('.bibleCheckbox');
		if (el) observer.unobserve(el);
	});
</script>

<div class="inline-flex items-center gap-2 bibleCheckbox" class:check-animating={animating}>
	<div class="relative size-6">
		{#if animating}
			<div class="ripple-ring" onanimationend={onRippleEnd}></div>
		{/if}
		<Checkbox class="flex items-center justify-center size-6" id="bibleCheckbox" bind:checked />
	</div>
	<Label for="bibleCheckbox">
		<div class="font-semibold">{$t('bibleCheckboxLabel')}</div>
	</Label>
</div>

<style>
	@keyframes checkPulse {
		0% { transform: scale(1); box-shadow: 0 0 0 0 oklch(65% 0.18 145 / 0.5); }
		40% { transform: scale(1.3); box-shadow: 0 0 0 12px oklch(65% 0.18 145 / 0.3); }
		100% { transform: scale(1); box-shadow: 0 0 0 0 oklch(65% 0.18 145 / 0); }
	}

	@keyframes rippleExpand {
		0% { transform: scale(0.4); opacity: 0.6; }
		100% { transform: scale(2.5); opacity: 0; }
	}

	@keyframes shake {
		0% { transform: translate(0, 0) rotate(0deg); }
		50% { transform: translate(6%, -6%) rotate(4deg); }
		100% { transform: translate(0, 0) rotate(0deg); }
	}

	/* Prompt nudge on scroll-into-view (fires once) */
	.bibleCheckbox:global(.animated) {
		transform-origin: 50% 50%;
		animation-delay: 0.2s;
		animation-name: shake;
		animation-duration: 0.2s;
		animation-iteration-count: 1;
	}

	/* Celebration pulse on check */
	.check-animating :global(button[data-state='checked']) {
		animation: checkPulse 0.35s cubic-bezier(0.25, 1, 0.5, 1) forwards;
	}

	.ripple-ring {
		position: absolute;
		inset: 0;
		margin: auto;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		border: 2px solid oklch(65% 0.18 145 / 0.7);
		animation: rippleExpand 0.3s cubic-bezier(0.25, 1, 0.5, 1) forwards;
		pointer-events: none;
		z-index: 1;
	}

	/* ponytail: bits-ui sets data-state not data-checked, so data-checked:bg-primary from base component never matches.
	   Override both unchecked and checked states with visible colors. */
	.bibleCheckbox :global(button[data-state='unchecked']) {
		background-color: #f9fafb;
		border-color: #9ca3af;
	}

	.bibleCheckbox :global(button[data-state='checked']) {
		background-color: #16a34a;
		color: white;
		transition: background-color 0.15s ease;
	}

	:global(.dark) .bibleCheckbox :global(button[data-state='unchecked']) {
		background-color: #374151;
		border-color: #6b7280;
	}
</style>
