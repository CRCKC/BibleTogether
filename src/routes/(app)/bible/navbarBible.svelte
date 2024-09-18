<script lang="ts">
	import BibleSelector from './bibleSelector.svelte';
	import { currentChapterStore, bibleChinese, nextChapter, prevChapter } from '$lib/bible';
	$: isSelecting = false;

	function gotoNextChapter() {
		nextChapter($currentChapterStore);
	}

	function gotoPrevChapter() {
		prevChapter($currentChapterStore);
	}
</script>

{#if isSelecting}
	<BibleSelector onClose={() => (isSelecting = false)} />
{/if}

<div class="flex items-center justify-center w-full">
	<div class="flex flex-row items-center w-full h-10 m-2 bg-gray-600 rounded-full max-w-80">
		<button class="flex items-center h-10" on:click={gotoPrevChapter}
			><div class="ml-2 material-symbols-outlined">chevron_left</div>
		</button>
		<button class="w-full h-10" on:click={() => (isSelecting = true)}>
			{bibleChinese[$currentChapterStore.scroll]}
			{$currentChapterStore.chapter}
		</button>
		<button class="flex items-center h-10" on:click={gotoNextChapter}
			><div class="mr-2 material-symbols-outlined">chevron_right</div>
		</button>
	</div>
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
