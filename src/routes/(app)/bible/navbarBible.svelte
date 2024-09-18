<script lang="ts">
	import BibleSelector from './bibleSelector.svelte';
	import { currentChapterStore, bibleChinese } from '$lib/bible';
	$: isSelecting = false;
</script>

{#if isSelecting}
	<BibleSelector onClose={() => (isSelecting = false)} />
{/if}

<div class="flex items-center justify-center w-full">
	<button
		class="flex items-center justify-center w-full h-10 m-2 bg-gray-600 rounded-full max-w-80"
		on:click={() => (isSelecting = true)}
	>
		{bibleChinese[$currentChapterStore.scroll]}
		{$currentChapterStore.chapter}
	</button>
	<div class="flex items-center justify-center bg-gray-600 rounded-full size-10 min-w-10">
		<span class="text-3xl material-symbols-outlined"> play_arrow </span>
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
