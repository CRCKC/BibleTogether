<script lang="ts">
	// import type { LayoutData } from './$types';
	import { navigating } from '$app/stores';

	// export let data: LayoutData;

	let showLoading = false;

	// This code delays the showing of the loading indicator,
	// so if it takes less thatn 0.5 seconds to load, it completely hides it instead
	$: if ($navigating) {
		showLoading = false;
		setTimeout(() => (showLoading = $navigating ? true : false), 500);
	} else {
		showLoading = false;
	}
</script>

<div class="relative size-full">
	{#if showLoading}
		<div
			class="absolute z-10 flex items-center justify-center w-full h-full bg-black bg-opacity-80"
		>
			<div class="w-32 h-32 border-b-2 border-white rounded-full animate-spin"></div>
		</div>
	{/if}
	<div class="absolute overflow-y-scroll size-full">
		<slot />
	</div>
</div>

<style lang="postcss">
</style>
