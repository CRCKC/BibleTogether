<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label/index.js';
	import { onDestroy, onMount } from 'svelte';
	import { t } from 'svelte-i18n';

	let { checked = $bindable(false) }: { checked: boolean } = $props();

	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				console.log('In view');
				if (!checked && !entry.target.classList.contains('in-view')) {
					entry.target.classList.add('animated');
				}
				entry.target.classList.add('in-view');
			} else {
				console.log('Out of view');
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

<span class="bibleCheckbox">
	<Checkbox class="flex items-center justify-center mr-2 size-6" id="bibleCheckbox" bind:checked />
</span>
<Label for="bibleCheckbox">{$t('bibleCheckboxLabel')}</Label>

<style>
	@keyframes scaleUpDown {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.3);
		}
		100% {
			transform: scale(1);
		}
	}

	.bibleCheckbox:global(.animated) {
		animation: scaleUpDown 0.5s ease-in-out;
	}
</style>
