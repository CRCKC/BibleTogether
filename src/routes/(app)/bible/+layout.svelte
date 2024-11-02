<script lang="ts">
	import { run } from 'svelte/legacy';

	// import type { LayoutData } from './$types';
	import { navigating } from '$app/stores';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();

	// export let data: LayoutData;

	let showLoading = $state(false);

	// This code delays the showing of the loading indicator,
	// so if it takes less thatn 0.5 seconds to load, it completely hides it instead
	run(() => {
		if ($navigating) {
			showLoading = false;
			setTimeout(() => (showLoading = $navigating ? true : false), 500);
		} else {
			showLoading = false;
		}
	});
</script>

<div class="relative size-full">
	{#if showLoading}
		<div
			class="absolute z-10 flex items-center justify-center w-full h-full bg-black bg-opacity-80"
		>
			<div class="w-32 h-32 border-b-2 border-white rounded-full animate-spin"></div>
		</div>
	{/if}
	<div class="absolute size-full">
		{@render children?.()}
	</div>
</div>

<style lang="postcss">
</style>
