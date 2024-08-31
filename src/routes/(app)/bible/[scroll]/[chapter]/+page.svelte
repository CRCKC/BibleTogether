<script lang="ts">
	import type { PageData } from './$types';
	import { setBible } from '$lib/bible';
	export let data: PageData;

	if (data.scroll && data.chapter) {
		setBible(data.scroll, data.chapter);
	}

	$: bibleContent = data.bibleContent;
</script>

<div class="bible mx-4">
	{@html bibleContent}
</div>

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
	.bible :global(b) {
	}
	.bible :global(b) {
	}
	.bible :global(b) {
	}
	.bible :global(b) {
	}
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
