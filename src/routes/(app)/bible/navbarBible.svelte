<script lang="ts">
	import BibleSelector from './bibleSelector.svelte';
	import {
		currentChapterStore,
		bibleChinese,
		nextChapter,
		prevChapter,
		playChapterAudio,
		stopChapterAudio,
		type BibleChapter
	} from '$lib/bible';

	$: isSelecting = false;
	let audioPaused = true;
	let chapterChnaged = true;
	let lastBible: BibleChapter;

	// currentChapterStore.subscribe((value) => {
	// 	lastBible = value;
	// });

	function onClickPlay() {
		const bible = $currentChapterStore;

		chapterChnaged = lastBible !== bible;
		lastBible = bible;
		if (audioPaused) {
			playChapterAudio(bible, chapterChnaged);
			chapterChnaged = false;
			audioPaused = false;
		} else {
			stopChapterAudio();
			audioPaused = true;
		}
	}

	function stopPlayback() {
		audioPaused = true;
		stopChapterAudio();
	}

	function gotoNextChapter() {
		stopPlayback();
		nextChapter($currentChapterStore);
	}

	function gotoPrevChapter() {
		stopPlayback();
		prevChapter($currentChapterStore);
	}
</script>

{#if isSelecting}
	<BibleSelector onClose={() => (isSelecting = false)} />
{/if}

<div class="flex items-center justify-center w-full">
	<div class="flex flex-row items-center w-full h-10 m-2 bg-gray-600 rounded-full max-w-80">
		<button class="flex items-center h-10" on:click={gotoPrevChapter}
			><div class="ml-2 mr-1 material-symbols-outlined">chevron_left</div>
		</button>
		<button
			class="w-full h-10"
			on:click={() => {
				isSelecting = true;
				stopPlayback();
			}}
		>
			{bibleChinese[$currentChapterStore.scroll]}
			{$currentChapterStore.chapter}
		</button>
		<button class="flex items-center h-10" on:click={gotoNextChapter}
			><div class="ml-1 mr-2 material-symbols-outlined">chevron_right</div>
		</button>
	</div>
	<div class="flex items-center justify-center bg-gray-600 rounded-full size-10 min-w-10">
		<button class="text-3xl material-symbols-outlined" on:click={() => onClickPlay()}
			>{audioPaused ? 'play_arrow' : 'pause'}
		</button>
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
