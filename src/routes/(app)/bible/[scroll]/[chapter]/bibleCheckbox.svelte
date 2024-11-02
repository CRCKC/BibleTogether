<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label/index.js';
	import { onDestroy, onMount } from 'svelte';
	import { t } from 'svelte-i18n';

	let { checked = $bindable(false) }: { checked: boolean } = $props();

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				// console.log('In view');
				if (!checked && !entry.target.classList.contains('in-view')) {
					entry.target.classList.add('animated');
				}
				entry.target.classList.add('in-view');
			} else {
				// console.log('Out of view');
				// entry.target.classList.remove('in-view');
			}
		});
	});

	onMount(() => {
		const bibleCheckbox = document.querySelector('.bibleCheckbox');
		if (bibleCheckbox) observer.observe(bibleCheckbox);
	});

	onDestroy(() => {
		const bibleCheckbox = document.querySelector('.bibleCheckbox');
		if (bibleCheckbox) observer.unobserve(bibleCheckbox);
	});
</script>

<div class="inline bibleCheckbox">
	<Checkbox
		class="flex items-center justify-center mr-2  size-6 data-[state=checked]:bg-green-600 data-[state=checked]:text-white "
		id="bibleCheckbox"
		bind:checked
	/>
</div>
<Label for="bibleCheckbox"><div class="font-semibold">{$t('bibleCheckboxLabel')}</div></Label>

<style>
	@keyframes shake {
		0% {
			transform: translate(0, 0) rotate(0deg);
		}
		25% {
			transform: translate(15%, -15%) rotate(10deg);
		}
		50% {
			transform: translate(0, 0) rotate(0deg) scale(1.2);
		}
		75% {
			transform: translate(-15%, -15%) rotate(-10deg);
		}
		100% {
			transform: translate(0, 0) rotate(0deg);
		}
	}

	.bibleCheckbox:global(.animated) {
		transform-origin: 50% 50%;
		animation-delay: 0.2s;
		animation-name: shake;
		animation-duration: 0.25s;
		animation-iteration-count: 2;
	}
</style>
