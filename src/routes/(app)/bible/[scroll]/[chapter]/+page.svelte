<script lang="ts">
	import type { PageData } from './$types';
	import { currentChapterStore, setCurrentChapter, type BibleChapter } from '$lib/bible/bible';
	import viewport from '$lib/utils/viewportAction';
	import { bibleProgressStore, getProgressIndex, updateProgress } from '$lib/bible/progress';
	import { settingsStore } from '$lib/userSettings';
	import { loadChapter } from '$lib/backend';
	import { downloadAndUnzip } from '$lib/bible/download';
	import { queryChapterCount } from '$lib/firebase/firestore';
	import { setupTooltip } from './tooltip';
	import BibleCheckbox from './bibleCheckbox.svelte';
	import { t } from 'svelte-i18n';
	import { onMount } from 'svelte';
	import { bibleChinese } from '$lib/bible/constants';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let chapterCompleted = $state<boolean>(false);
	let firstTimeScrolledToBottom = true;
	let downloadingBible = $state(false);
	let localUserQueryCount = $state(0);

	onMount(() => {
		onLoadChapter(data.bible); // Run onLoadChapter after the component is mounted
	});

	// Chapter completed state controls
	let chapComDerived = $derived(
		$bibleProgressStore[getProgressIndex(data.bible.scroll, data.bible.chapter)]
	);

	$effect(() => {
		chapterCompleted = chapComDerived;
	});

	let prevchapterCompleted: boolean | undefined;
	$effect(() => {
		if (chapterCompleted != undefined) {
			if (prevchapterCompleted != undefined && prevchapterCompleted != chapterCompleted) {
				chapterCompleted ? checkChapter() : unCheckChapter();
			}
			prevchapterCompleted = chapterCompleted;
		}
	});

	function checkChapter() {
		updateProgress(data.bible);
		localUserQueryCount++; // Increment the query count to update the UI client side
	}

	function unCheckChapter() {
		updateProgress(data.bible, false);
		localUserQueryCount--;
	}

	// Bible load controls
	let prevBible = data.bible;
	$effect(() => {
		if (prevBible != data.bible) {
			onLoadChapter(data.bible);
			prevBible = data.bible;
		}
	});

	async function bibleContentPromise(bible: BibleChapter): Promise<string> {
		const content = await loadChapter(bible.scroll, bible.chapter);
		if (content.length < 20) {
			downloadingBible = true;
			await downloadAndUnzip();
			downloadingBible = false;
			return loadChapter(bible.scroll, bible.chapter);
			// TODO add error handling
		}
		return content;
	}

	function onLoadChapter(bible: BibleChapter) {
		localUserQueryCount = 0;
		// Don't query if it's the intro
		if (bible.chapter != 0) {
			queryChapterCount(bible.scroll, bible.chapter).then((count) => {
				if (count != undefined) queryCount = count;
			});
		}
		firstTimeScrolledToBottom = true;
	}

	if (data.bible) {
		setCurrentChapter(data.bible);
	}

	function handleScrollFinish() {
		if (firstTimeScrolledToBottom) {
			firstTimeScrolledToBottom = false;
			// Run finishChapter after 0.5 second if autoComplete is enabled
			if ($settingsStore.autoCheck) setTimeout(() => checkChapter(), 500);
		}
	}

	let queryCount: number | undefined = $state(undefined);
</script>

<ScrollArea class="size-full" style="zoom: {$settingsStore.fontZoom};">
	<!-- Title Widget -->
	<div class="inline-block w-full mt-4 text-2xl text-center text-gray-400">
		{bibleChinese[data.bible.scroll]}
	</div>
	<div class="inline-block w-full mt-2 mb-5 text-5xl text-center">
		{data.bible.chapter == 0 ? $t('intro') : data.bible.chapter}
	</div>

	<!-- Await for bibleContent -->
	{#await bibleContentPromise(data.bible)}
		{#if downloadingBible}
			<!-- Loading Placeholder -->
			<div class="flex items-center justify-center w-full">Downloading Content...</div>
		{/if}
	{:then bibleContent}condition
		{#if data.bible.chapter != 0}
			<div class="w-full px-8 text-lg text-right">
				{queryCount == undefined ? '...' : queryCount + localUserQueryCount}
				{$t('peopleAlreadyRead')}
			</div>
		{/if}
		<!-- Actual Bible -->
		<div class="mx-4 bible">
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
		<div
			class="flex flex-row items-center justify-center w-full h-6 mt-4 text-center text-gray-400"
		>
			{#if data.bible.chapter != 0}
				<BibleCheckbox bind:checked={chapterCompleted} />
			{/if}
		</div>
		<div
			class="h-4"
			use:viewport={{
				onEnter: handleScrollFinish
			}}
		></div>
	{/await}
</ScrollArea>

<style lang="postcss">
	.bible {
		@apply text-base;
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
