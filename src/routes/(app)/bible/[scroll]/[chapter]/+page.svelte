<script lang="ts">
	import type { PageData } from './$types';
	import { currentChapterStore, type BibleChapter } from '$lib/bible/bible';
	import viewport from '$lib/utils/viewportAction';
	import { bibleProgressStore, getProgressIndex, updateProgress } from '$lib/bible/progress';
	import { settingsStore } from '$lib/userSettings';
	import { loadChapter } from '$lib/backend';
	import { downloadAndUnzip } from '$lib/bible/download';
	import { queryChapterCount } from '$lib/firebase/firestore';
	import { setupTooltip } from './tooltip';
	import BibleCheckbox from './bibleCheckbox.svelte';
	import { t } from 'svelte-i18n';
	import { getContext, mount, onMount, tick, unmount, untrack } from 'svelte';
	import type { HighlightEnhancer } from './highlight';
	import { enhanceHighlights } from './highlight';
	import HighlightPalette, { type HighlightPaletteLabels } from './highlightPalette.svelte';
	import {
		DEFAULT_HIGHLIGHT_COLOR,
		normalizeHighlightColor,
		type HighlightProjection,
		type HighlightSession
	} from '$lib/bible/highlights';
	import type { HighlightSyncSession } from '$lib/firebase/firestore';
	import { subscribeAuthState } from '$lib/firebase/authState';
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
	let bibleRoot = $state<HTMLElement | null>(null);
	let chapterHeading = $state<HTMLElement | null>(null);
	let highlightSession = $state<HighlightSession | null>(null);
	let highlightProjection = $state<HighlightProjection | null>(null);
	let highlightSync = $state<HighlightSyncSession | null>(null);
	let stopHighlightSession: (() => void) | undefined;
	let enhancerReady = $state(false);
	let authLoading = $state(true);
	let activeEnhancer: HighlightEnhancer | undefined;
	let activeTooltip: ReturnType<typeof setupTooltip> | undefined;
	let activePalette:
		| {
				component: ReturnType<typeof mount>;
				target: HTMLElement;
				anchor: HTMLButtonElement;
		  }
		| undefined;
	let renderGeneration = 0;
	let focusVerseId: string | null = null;
	let focusToHeading = false;
	let contextSyncAlive = true;
	let chapterQueryGeneration = 0;
	let autoCheckTimer: ReturnType<typeof setTimeout> | undefined;

	interface HighlightContext {
		readonly session: HighlightSession | null;
		readonly sync: HighlightSyncSession | null;
	}

	const highlightContext = getContext<HighlightContext | undefined>('highlightSession');

	onMount(() => {
		const stopAuth = subscribeAuthState(({ loading }) => {
			authLoading = loading;
			// The app layout creates the UID session from the same auth transition.
			// Read the context after that update rather than creating a second session.
			queueMicrotask(syncHighlightContext);
		});
		syncHighlightContext();
		void tick().then(syncHighlightContext);
		return () => {
			contextSyncAlive = false;
			closePalette(false);
			stopAuth();
			stopHighlightSession?.();
			if (autoCheckTimer) clearTimeout(autoCheckTimer);
			chapterQueryGeneration++;
		};
	});

	function syncHighlightContext() {
		if (!contextSyncAlive) return;
		const next = highlightContext?.session ?? null;
		if (next === highlightSession) {
			highlightSync = highlightContext?.sync ?? null;
			return;
		}
		stopHighlightSession?.();
		stopHighlightSession = undefined;
		highlightProjection = null;
		highlightSession = next;
		highlightSync = highlightContext?.sync ?? null;
		if (next) {
			next.hydrate();
			highlightProjection = next.getState();
			stopHighlightSession = next.subscribe((state) => (highlightProjection = state));
		} else {
			focusToHeading = true;
		}
	}

	function rememberFocus(root: HTMLElement) {
		const focused = root.ownerDocument.activeElement;
		if (focused instanceof HTMLElement && root.contains(focused)) {
			focusVerseId = focused.dataset.verseId ?? null;
		}
	}

	function labelMarkers(root: HTMLElement) {
		for (const marker of root.querySelectorAll<HTMLButtonElement>(
			'button[data-verse-marker="true"]'
		)) {
			const number = marker.dataset.verseNumber ?? '';
			marker.tabIndex = 0;
			marker.setAttribute('aria-label', $t('highlightVerse', { values: { number } }));
		}
		for (const control of root.querySelectorAll<HTMLButtonElement>(
			'button[data-verse-color-control="true"]'
		)) {
			const number = control.dataset.verseNumber ?? '';
			control.setAttribute('aria-label', $t('changeHighlightColor', { values: { number } }));
		}
	}

	function paletteLabels(): HighlightPaletteLabels {
		return {
			title: $t('highlightColor'),
			custom: $t('highlightColorCustom'),
			remove: $t('removeHighlight'),
			apply: $t('apply'),
			cancel: $t('cancel'),
			hex: $t('highlightColorHex'),
			hue: $t('highlightColorHue'),
			saturation: $t('highlightColorSaturation'),
			brightness: $t('highlightColorBrightness'),
			invalidHex: $t('highlightColorInvalid'),
			preset: (id) => $t(`highlightColor${id[0].toUpperCase()}${id.slice(1)}`)
		};
	}

	function closePalette(restoreFocus = true) {
		if (!activePalette) return;
		const { component, target, anchor } = activePalette;
		activePalette = undefined;
		anchor.setAttribute('aria-expanded', 'false');
		unmount(component);
		target.remove();
		if (restoreFocus && anchor.isConnected) anchor.focus();
	}

	function applyPaletteColor(id: string, colorInput: string) {
		const color = normalizeHighlightColor(colorInput);
		if (!color || !highlightSession?.isHighlighted(id)) return;
		highlightSession.recolor(id, color);
		const state = highlightSession.getState();
		activeEnhancer?.update(state.highlightedIds, state.colors);
		highlightSync?.flush();
		closePalette();
	}

	function removePaletteHighlight(id: string) {
		if (!highlightSession) return;
		highlightSession.delete(id);
		const state = highlightSession.getState();
		activeEnhancer?.update(state.highlightedIds, state.colors);
		highlightSync?.flush();
		closePalette(false);
		bibleRoot
			?.querySelector<HTMLButtonElement>(
				`button[data-verse-marker="true"][data-verse-id="${CSS.escape(id)}"]`
			)
			?.focus();
	}

	function openPalette(control: HTMLButtonElement) {
		const id = control.dataset.verseColorId;
		if (!id || !highlightSession?.isHighlighted(id)) return;
		closePalette(false);
		control.setAttribute('aria-expanded', 'true');
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(HighlightPalette, {
			target,
			props: {
				anchor: control,
				initialColor:
					highlightProjection?.colors.get(id) ??
					highlightSession.getColor(id) ??
					DEFAULT_HIGHLIGHT_COLOR,
				labels: paletteLabels(),
				onApply: (color: string) => applyPaletteColor(id, color),
				onRemove: () => removePaletteHighlight(id),
				onClose: () => closePalette()
			}
		});
		activePalette = { component, target, anchor: control };
	}

	// One lifecycle owner follows the keyed chapter root. Async enhancement is generation-fenced.
	$effect(() => {
		const root = bibleRoot;
		const session = highlightSession;
		if (!root || !session) {
			enhancerReady = false;
			return;
		}
		const generation = ++renderGeneration;
		let cancelled = false;
		enhancerReady = false;
		void tick().then(() => {
			if (cancelled || generation !== renderGeneration || root !== bibleRoot) return;
			activeEnhancer?.destroy();
			activeTooltip?.destroy();
			const projection = untrack(() => highlightProjection);
			activeEnhancer = enhanceHighlights(root, data.bible, projection?.highlightedIds ?? []);
			activeEnhancer.update(projection?.highlightedIds ?? [], projection?.colors ?? {});
			labelMarkers(root);
			activeTooltip = setupTooltip(root);
			enhancerReady = true;
			if (focusVerseId) {
				const marker = root.querySelector<HTMLElement>(
					`[data-verse-marker="true"][data-verse-id="${CSS.escape(focusVerseId)}"]`
				);
				if (marker) marker.focus();
				focusVerseId = null;
			}
		});
		return () => {
			cancelled = true;
			++renderGeneration;
			closePalette(false);
			rememberFocus(root);
			activeEnhancer?.destroy();
			activeEnhancer = undefined;
			activeTooltip?.destroy();
			activeTooltip = undefined;
			if (focusToHeading && chapterHeading) {
				chapterHeading.focus();
				focusToHeading = false;
				focusVerseId = null;
			}
		};
	});

	$effect(() => {
		const ids = highlightProjection?.highlightedIds;
		activeEnhancer?.update(ids ?? [], highlightProjection?.colors ?? {});
		if (bibleRoot) labelMarkers(bibleRoot);
	});
	function handleBibleClick(event: MouseEvent) {
		if (!(event.target instanceof Element) || !bibleRoot || !highlightSession) return;
		const colorControl = event.target.closest<HTMLButtonElement>(
			'button[data-verse-color-control="true"][data-verse-color-id]'
		);
		if (
			colorControl &&
			bibleRoot.contains(colorControl) &&
			activeEnhancer?.isManagedColorControl(colorControl)
		) {
			event.preventDefault();
			openPalette(colorControl);
			return;
		}
		const marker = event.target.closest<HTMLButtonElement>(
			'button[data-verse-marker="true"][data-verse-id]'
		);
		if (!marker || !bibleRoot.contains(marker) || !activeEnhancer?.isManagedMarker(marker)) return;
		const id = marker.dataset.verseId;
		if (!id) return;
		if (marker.getAttribute('aria-pressed') === 'true') highlightSession.delete(id);
		else highlightSession.set(id);
		const state = highlightSession.getState();
		activeEnhancer?.update(state.highlightedIds, state.colors);
		highlightSync?.flush();
	}

	let highlightBusy = $derived(authLoading || !highlightProjection?.ready || !enhancerReady);

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
	$effect(() => {
		onLoadChapter(data.bible);
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
		if (autoCheckTimer) {
			clearTimeout(autoCheckTimer);
			autoCheckTimer = undefined;
		}
		const generation = ++chapterQueryGeneration;
		localUserQueryCount = 0;
		queryCount = undefined;
		// Don't query if it's the intro
		if (bible.chapter != 0) {
			void queryChapterCount(bible.scroll, bible.chapter)
				.then((count) => {
					if (generation === chapterQueryGeneration && count != undefined) queryCount = count;
				})
				.catch(() => undefined);
		}
		firstTimeScrolledToBottom = true;
	}

	$effect(() => {
		if (data.bible) {
			currentChapterStore.set(data.bible);
		}
	});

	function handleScrollFinish() {
		if (firstTimeScrolledToBottom) {
			firstTimeScrolledToBottom = false;
			// Run finishChapter after 0.5 second if autoComplete is enabled
			if ($settingsStore.autoCheck) {
				if (autoCheckTimer) clearTimeout(autoCheckTimer);
				const generation = chapterQueryGeneration;
				autoCheckTimer = setTimeout(() => {
					autoCheckTimer = undefined;
					if (generation === chapterQueryGeneration && contextSyncAlive) checkChapter();
				}, 500);
			}
		}
	}

	let queryCount: number | undefined = $state(undefined);
</script>

<ScrollArea class="size-full">
	<div id="bible-tooltip-boundary" class="h-full w-dvw">
		<!-- Title Widget -->
		<div
			class="inline-block w-full mt-4 text-2xl text-center text-gray-400"
			style="zoom: {$settingsStore.fontZoom};"
		>
			{bibleChinese[data.bible.scroll]}
		</div>
		<div
			bind:this={chapterHeading}
			id="bible-chapter-heading"
			class="inline-block w-full mt-2 mb-5 text-5xl text-center"
			tabindex="-1"
			style="zoom: {$settingsStore.fontZoom};"
		>
			{data.bible.chapter == 0 ? $t('intro') : data.bible.chapter}
		</div>

		<!-- Await for bibleContent -->
		{#await bibleContentPromise(data.bible)}
			{#if downloadingBible}
				<!-- Loading Placeholder -->
				<div
					class="flex items-center justify-center w-full"
					style="zoom: {$settingsStore.fontZoom};"
				>
					Downloading Content...
				</div>
			{/if}
		{:then bibleContent}
			{#if data.bible.chapter != 0}
				<div class="w-full px-8 text-lg text-right" style="zoom: {$settingsStore.fontZoom};">
					{queryCount == undefined ? '...' : queryCount + localUserQueryCount}
					{$t('peopleAlreadyRead')}
				</div>
			{/if}
			<!-- Actual Bible -->
			{#key bibleContent}
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<div
					bind:this={bibleRoot}
					class="mx-4 bible"
					aria-busy={highlightBusy}
					role="group"
					onclick={handleBibleClick}
					style="zoom: {$settingsStore.fontZoom};"
				>
					{@html bibleContent}
				</div>
			{/key}
			<!-- Bottom Div -->
			<div
				class="flex flex-row items-center justify-center w-full h-6 mt-4 text-center text-gray-400"
				style="zoom: {$settingsStore.fontZoom};"
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
	</div>
</ScrollArea>

<style lang="postcss">
	@reference "tailwindcss";
	.bible {
		@apply text-base;
		display: inline-block;
		letter-spacing: normal;
		word-spacing: normal;
		vertical-align: top;
		-webkit-text-size-adjust: none;
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

	.bible :global(.verse-highlight-marker) {
		box-sizing: border-box;
		display: inline-flex;
		min-width: 24px;
		min-height: 24px;
		align-items: center;
		justify-content: center;
		border: 0;
		border-radius: 0.25rem;
		padding: 0 0.2em;
		background: transparent;
		color: #b9b9b9;
		font: inherit;
		font-size: 85%;
		line-height: 1;
		vertical-align: text-top;
		cursor: pointer;
		transition:
			background-color 120ms ease,
			color 120ms ease;
	}

	.bible :global(.verse-highlight-marker:hover),
	.bible :global(.verse-highlight-marker:active) {
		background: rgb(199 161 78 / 18%);
		color: #f0d58b;
	}

	.bible :global(.verse-highlight-marker:focus-visible),
	.bible :global(.verse-color-control:focus-visible) {
		outline: 2px solid #f0d58b;
		outline-offset: 2px;
	}

	.bible :global(.verse-color-control) {
		box-sizing: border-box;
		display: inline-flex;
		width: 24px;
		height: 24px;
		align-items: center;
		justify-content: center;
		margin: 0 0.1em;
		border: 0;
		border-radius: 50%;
		padding: 4px;
		background: transparent;
		vertical-align: text-top;
		cursor: pointer;
	}

	.bible :global(.verse-color-control)::before {
		content: '';
		display: block;
		width: 12px;
		height: 12px;
		border: 1px solid #f5f7fa;
		border-radius: 50%;
		background: rgb(var(--highlight-rgb, 250 204 21) / 82%);
	}

	.bible :global(.verse-color-control:hover),
	.bible :global(.verse-color-control:active) {
		background: rgb(var(--highlight-rgb, 250 204 21) / 24%);
	}

	.bible :global(.verse-highlight-text.verse-highlighted) {
		border-radius: 0.15em;
		background: rgb(var(--highlight-rgb, 250 204 21) / 34%);
		color: inherit;
		box-decoration-break: clone;
		-webkit-box-decoration-break: clone;
	}

	@media (prefers-reduced-motion: reduce) {
		.bible :global(.verse-highlight-marker),
		.bible :global(.verse-color-control) {
			transition: none;
		}
	}

	@media (max-width: 420px) {
		.bible {
			max-width: calc(100vw - 2rem);
		}
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
