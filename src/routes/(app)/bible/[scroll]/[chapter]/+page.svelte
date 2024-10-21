<script lang="ts">
	import type { PageData } from './$types';
	import {
		currentChapterStore,
		setCurrentChapter,
		bibleChinese,
		type BibleChapter
	} from '$lib/bible';
	import viewport from '$lib/viewportAction';
	import { bibleProgressStore, getProgressIndex, updateProgress } from '$lib/bibleProgress';
	import { settingsStore } from '$lib/userSettings';
	import { loadChapter } from '$lib/backend';
	import { downloadAndUnzip } from '$lib/data/downloadBible';
	import { queryChapterCount } from '$lib/firebase/firestore';
	import { setupTooltip } from './tooltip';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label/index.js';

	export let data: PageData;

	// $: bibleContent = data.bibleContent;
	let chapterCompleted = false;
	let firstTimeScrolledToBottom = true;

	let downloadingBible = false;
	$: {
		const completed = $bibleProgressStore[getProgressIndex(data.bible.scroll, data.bible.chapter)];
		queryChapterCount(data.bible.scroll, data.bible.chapter).then((count) => {
			if (count != undefined) queryCount = count;
		});

		onLoadChapter(completed);
	}

	$: queryCount = -1;

	$: chapterCompleted ? checkChapter : unCheckChapter;

	async function bibleContentPromise(bible: BibleChapter): Promise<string> {
		const content = await loadChapter(bible.scroll, bible.chapter);
		if (content.length < 20) {
			downloadingBible = true;
			await downloadAndUnzip();
			downloadingBible = false;
			return loadChapter(bible.scroll, bible.chapter);
			// TODO add error handling
		}
		console.log('bibleContentPromise');
		return content;
	}

	function onLoadChapter(completed: boolean) {
		firstTimeScrolledToBottom = true;
		chapterCompleted = completed;
	}

	if (data.bible) {
		setCurrentChapter(data.bible);
	}

	function checkChapter() {
		chapterCompleted = true;
		updateProgress(data.bible);
	}

	function unCheckChapter() {
		chapterCompleted = false;
		updateProgress(data.bible, false);
	}

	function handleScrollFinish() {
		if (firstTimeScrolledToBottom) {
			firstTimeScrolledToBottom = false;
			// Run finishChapter after 0.5 second if autoComplete is enabled
			if ($settingsStore.autoCheck) setTimeout(() => checkChapter(), 500);
		}
	}
</script>

<!-- Title Widget -->
<div class="inline-block w-full mt-4 text-2xl text-center text-gray-400">
	{bibleChinese[$currentChapterStore.scroll]}
</div>
<div class="inline-block w-full mt-2 mb-5 text-5xl text-center">
	{$currentChapterStore.chapter == 0 ? '簡介' : $currentChapterStore.chapter}
</div>
<div>
	Number of people also finished this chapter: {queryCount}
</div>

<!-- Await for bibleContent -->
{#await bibleContentPromise(data.bible)}
	{#if downloadingBible}
		<!-- Loading Placeholder -->
		<div class="flex items-center justify-center w-full">Downloading Content...</div>
	{/if}
{:then bibleContent}
	<!-- Actual Bible -->
	<div class="mx-4 bible" style="zoom: {$settingsStore.fontZoom};">
		{@html bibleContent}
		{#key bibleContent}
			{(() => {
				// Run setupTooltip after bibleContent is loaded, here I made a function to return empty string after running setupTooltip,
				// as setupTooltip will return undefined and it will be displayed on the html,
				// the setTimeout 0 fixes an issue where it doesnt replace the html element rendered in bibleContent
				setTimeout(() => setupTooltip(), 0);
				return '';
			})()}
		{/key}
	</div>
	<!-- Bottom Div -->
	<div class="flex flex-row items-center justify-center w-full h-6 mt-4 text-center text-gray-400">
		<!-- <Checkbox />
		Mark chapter as completed
		<input type="checkbox"  /> -->
		<Checkbox class="mr-2 size-6" id="mark" bind:checked={chapterCompleted} />
		<Label for="mark">Mark chapter as completed</Label>
	</div>
	<div
		class="h-4"
		use:viewport={{
			onEnter: handleScrollFinish
		}}
	></div>
{/await}

<style lang="postcss">
	.bible {
		display: inline-block;
		letter-spacing: normal;
		word-spacing: normal;
		vertical-align: top;
	}
	.bible :global(h1),
	:global(h2),
	:global(h3),
	:global(h4),
	:global(h5),
	:global(h6),
	:global(strong),
	:global(b) {
		font-weight: bold;
	}

	.bible :global(span) {
		@apply align-baseline;
	}

	.bible :global(i) {
		font-style: normal;
		border-bottom: 1px solid #777;
	}
	/* Add a hover effect for <i> */
	.bible :global(p) {
		text-indent: 1em;
		line-height: 1.5;
	}
	.bible :global(b) {
		color: #aaa;
		padding: 0 0.2em;
		font-weight: normal;
		cursor: default;
		font-size: 85%;
		vertical-align: text-top;
	}

	.bible :global(h1) {
		@apply fixed hidden;

		font-size: 100%;
		color: #aaa;
		font-weight: normal;
		margin: 0 0 0.8em 0;
		border-bottom: 1px solid #eee;
		text-align: center;
		padding-bottom: 5px;
	}

	.bible :global(h2) {
		@apply fixed hidden;

		font-size: 123.1%;
		margin: 1em 0;
		font-size: 1.5em;
		margin-block-start: 0.83em;
		margin-block-end: 0.83em;
		margin-inline-start: 0px;
		margin-inline-end: 0px;
		font-weight: bold;
		unicode-bidi: isolate;
	}

	.bible :global(h3) {
		display: block;
		margin-block-start: 1em;
		margin-block-end: 1em;
		margin-inline-start: 0px;
		margin-inline-end: 0px;
		unicode-bidi: isolate;
		margin: 1em 0 0 0;
		font-size: 100%;
		color: rgb(0, 179, 255);
	}

	.bible :global(h6) {
		display: block;
		font-size: 0.67em;
		margin-block-start: 2.33em;
		margin-block-end: 2.33em;
		margin-inline-start: 0px;
		margin-inline-end: 0px;
		font-weight: bold;
		unicode-bidi: isolate;
	}
</style>
