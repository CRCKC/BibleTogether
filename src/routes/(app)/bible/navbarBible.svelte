<script lang="ts">
	import { run } from 'svelte/legacy';

	import BibleSelector from './bibleSelector.svelte';
	import AudioBar from './audioBar.svelte';
	import { currentChapterStore, nextChapter, prevChapter } from '$lib/bible/bible';
	import { bibleChinese } from '$lib/bible/constants';
	import { getAudioLink } from '$lib/bible/audio';

	import ChevronRight from '~icons/material-symbols/chevron-right';
	import ChevronLeft from '~icons/material-symbols/chevron-left';
	import PlayArrow from '~icons/material-symbols/play-arrow';
	import Pause from '~icons/material-symbols/pause';
	import { updateProgress } from '$lib/bible/progress';
	import { t } from 'svelte-i18n';
	import { settingsStore } from '$lib/userSettings';

	let isSelecting = $state(false);
	let paused = $state(true);
	let chapterChnaged = $state(true);
	let audioSrc: string = $state('');

	let duration: number = $state(10);
	let audioPlayer: HTMLAudioElement | undefined = $state();
	let currentTime: number = $state(0);

	function onClickPlay() {
		if (chapterChnaged) {
			chapterChnaged = false;
			audioPlayer?.load(); // Such that the audio doesn't load on page load but only when the user clicks play
		}
		if (paused) {
			audioPlayer?.play();
		} else {
			audioPlayer?.pause();
		}
	}

	function stopPlayback() {
		audioPlayer?.pause();
	}

	function gotoNextChapter() {
		stopPlayback();
		nextChapter($currentChapterStore);
	}

	function gotoPrevChapter() {
		stopPlayback();
		prevChapter($currentChapterStore);
	}

	$effect(() => {
		chapterChnaged = true;
		audioSrc = getAudioLink($currentChapterStore);
	});

	const PlayPauseIcon = $derived(paused ? PlayArrow : Pause);
	let expandedScroll = $state<string | undefined>(undefined);

	function scrollAndCheck() {
		const element = document.querySelector('#bibleCheckbox');
		if (element) {
			// create an observer instance to ensure that the function is triggered after the scroll is completed
			const intersectionObserver = new IntersectionObserver((entries) => {
				let [entry] = entries;
				if (entry.isIntersecting) {
					setTimeout(() => {
						if ($settingsStore.autoCheck) updateProgress($currentChapterStore, true);
					}, 100);
				}
			});
			// start observing
			intersectionObserver.observe(element);
			element?.scrollIntoView({ behavior: 'smooth' });
		}
	}
</script>

<BibleSelector bind:visible={isSelecting} {expandedScroll} />

<div class="flex flex-col items-center justify-center">
	{#if !chapterChnaged && audioPlayer}
		<div class="w-full px-4 pt-3 max-w-96">
			<!-- Audio control bar -->
			<AudioBar {audioPlayer} {currentTime} {duration} />
		</div>
	{/if}

	<div class="flex items-center justify-center w-full">
		<div class="flex flex-row items-center w-full h-10 m-2 bg-gray-600 rounded-full max-w-80">
			<button class="flex items-center h-10" onclick={gotoPrevChapter}
				><ChevronLeft class="ml-2 mr-1 text-xl" />
			</button>
			<button
				class="w-full h-10"
				onclick={() => {
					expandedScroll = $currentChapterStore.scroll;
					isSelecting = true;
					stopPlayback();
				}}
			>
				<!-- {bibleChinese[$currentChapterStore.scroll]} -->
				<!-- {$currentChapterStore.chapter == 0 ? $t('intro') : $currentChapterStore.chapter} -->
				{$t('menu')}
			</button>
			<button class="flex items-center h-10" onclick={gotoNextChapter}
				><ChevronRight class="ml-1 mr-2 text-xl" />
			</button>
		</div>
		<button
			class="flex items-center justify-center bg-gray-600 rounded-full size-10 min-w-10 disabled:opacity-60 disabled:cursor-not-allowed"
			onclick={() => onClickPlay()}
			disabled={$currentChapterStore.chapter == 0}
		>
			<PlayPauseIcon class="text-xl" />
		</button>
	</div>
</div>

<!-- The actual audio element -->
<audio
	class="fixed hidden"
	bind:this={audioPlayer}
	bind:duration
	bind:currentTime
	bind:paused
	onended={() => {
		scrollAndCheck();
	}}
>
	<source src={audioSrc} />
</audio>
