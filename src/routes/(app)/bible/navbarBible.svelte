<script lang="ts">
	import BibleSelector from './bibleSelector.svelte';
	import AudioBar from './audioBar.svelte';
	import { currentChapterStore, bibleChinese, nextChapter, prevChapter } from '$lib/bible';
	import { getAudioLink } from '$lib/bibleAudio';

	import ChevronRight from '~icons/material-symbols/chevron-right';
	import ChevronLeft from '~icons/material-symbols/chevron-left';
	import PlayArrow from '~icons/material-symbols/play-arrow';
	import Pause from '~icons/material-symbols/pause';

	let isSelecting = false;
	let audioPaused = true;
	let chapterChnaged = true;
	let audioSrc: string;
	$: {
		chapterChnaged = true;
		audioSrc = getAudioLink($currentChapterStore);
		audioPlayer?.load();
	}

	let duration: number;
	let audioPlayer: HTMLAudioElement;
	let currentTime: number;

	function onClickPlay() {
		chapterChnaged = false;
		if (audioPaused) {
			audioPlayer.play();
			audioPaused = false;
		} else {
			audioPlayer.pause();
			audioPaused = true;
		}
	}

	function stopPlayback() {
		audioPaused = true;
		audioPlayer.pause();
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

<div class="flex flex-col items-center justify-center">
	{#if !chapterChnaged}
		<div class="w-full px-4 pt-3 max-w-96">
			<AudioBar {audioPlayer} {currentTime} {duration} />
		</div>
	{/if}

	<div class="flex items-center justify-center w-full">
		<div class="flex flex-row items-center w-full h-10 m-2 bg-gray-600 rounded-full max-w-80">
			<button class="flex items-center h-10" on:click={gotoPrevChapter}
				><ChevronLeft class="ml-2 mr-1 text-xl" />
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
				><ChevronRight class="ml-1 mr-2 text-xl" />
			</button>
		</div>
		<button
			class="flex items-center justify-center bg-gray-600 rounded-full size-10 min-w-10"
			on:click={() => onClickPlay()}
		>
			<svelte:component this={audioPaused ? PlayArrow : Pause} class="text-xl" />
		</button>
	</div>
</div>

<audio
	class="fixed hidden"
	bind:this={audioPlayer}
	bind:duration
	bind:currentTime
	on:ended={() => {
		audioPaused = true;
	}}
>
	<source src={audioSrc} />
</audio>
