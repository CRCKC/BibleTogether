<script lang="ts">
	import type { PageData } from './$types';
	import { currentChapterStore, setCurrentChapter, bibleChinese } from '$lib/bible';
	import viewport from '$lib/viewportAction';
	import { bibleProgressStore, updateProgress } from '$lib/bibleProgress';

	export let data: PageData;

	// $: bibleContent = data.bibleContent;
	let chapterCompleted = false;
	let firstTimeScrolledToBottom = true;

	$: {
		data.bible;
		onLoadChapter();
	}

	function onLoadChapter() {
		firstTimeScrolledToBottom = true;
		chapterCompleted = $bibleProgressStore[data.bible.scroll][data.bible.chapter];
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
			// Run finishChapter after 0.5 second
			setTimeout(() => checkChapter(), 500);
		}
	}
</script>

<!-- Title Widget -->
<div class="inline-block w-full mt-4 text-2xl text-center text-gray-400">
	{bibleChinese[$currentChapterStore.scroll]}
</div>
<div class="inline-block w-full mt-2 mb-5 text-5xl text-center">{$currentChapterStore.chapter}</div>

<!-- Await for bibleContent -->
{#await data.bibleContent}
	<!-- Loading Placeholder -->
	<div class="flex items-center justify-center w-full">Loading...</div>
{:then bibleContent}
	<!-- Actual Content -->
	<div class="mx-4 bible">
		{@html bibleContent}
	</div>
	<!-- Bottom Div -->
	<div class="flex flex-row items-center justify-center w-full h-6 mt-4 text-center text-gray-400">
		Mark chapter as completed
		<input
			type="checkbox"
			class="w-6 h-6 mt-1 ml-4 transition-all bg-white border-2"
			bind:checked={chapterCompleted}
			on:change={chapterCompleted ? checkChapter : unCheckChapter}
		/>
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
		zoom: 1;
		letter-spacing: normal;
		word-spacing: normal;
		vertical-align: top;
		font:
			15px / 1.231 'Microsoft YaHei',
			tahoma,
			arial,
			'Hiragino Sans GB',
			\5b8b\4f53,
			sans-serif;
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

	/* .bible :global(b) {
	} */
	.bible :global(sup) {
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		-khtml-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		font-size: 0;
		text-indent: -9em;
		display: inline-block;
		cursor: pointer;
		width: 20px;
		height: 20px;
		background-color: white;
		/* background: url(o.png?0906) -180px -20px; */
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
