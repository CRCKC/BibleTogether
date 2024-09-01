<script>
	import { getContext } from 'svelte';
	import BibleSelector from './bibleSelector.svelte';

	// import { page } from '$app/stores';
	// import { bible } from '$lib/bible';
	const bible = getContext('bible');
	$: isSelecting = false;
</script>

{#if isSelecting}
	<BibleSelector onClose={() => (isSelecting = false)} />
{/if}

<div class="flex justify-center items-center w-full">
	<button
		class="bg-gray-600 max-w-80 w-full h-10 m-2 rounded-full flex items-center justify-center"
		on:click={() => (isSelecting = true)}
	>
		{$bible.scroll}
		{$bible.chapter}
	</button>
	<div class="bg-gray-600 size-10 min-w-10 rounded-full flex items-center justify-center">
		<span class="material-symbols-outlined text-3xl"> play_arrow </span>
	</div>
</div>

<style lang="postcss">
	.material-symbols-outlined {
		font-variation-settings:
			'FILL' 1,
			'wght' 400,
			'GRAD' 0,
			'opsz' 24;
	}
</style>
