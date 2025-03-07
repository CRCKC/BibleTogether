<script lang="ts">
	import Info from '~icons/material-symbols/info-outline';
	import { currentChapterStore, jumpToChapter } from '$lib/bible/bible';
	import { bibleProgressStore, getProgressIndex, isScrollCompleted } from '$lib/bible/progress';
	import { cn } from '$lib/utils';

	import SearchIcon from '~icons/material-symbols/search';
	import CloseIcon from '~icons/material-symbols/close';
	import { t } from 'svelte-i18n';
	import { bibleChinese, bibleList } from '$lib/bible/constants';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';

	let {
		visible = $bindable(false),
		expandedScroll = $bindable(undefined)
	}: {
		visible: boolean;
		expandedScroll?: string | undefined;
	} = $props();

	let searchQuery: string = $state('');
	let enableScroll = $state(false);

	function isSearch(key: string, q: string): boolean {
		const query = q.trim().toLowerCase();
		// console.log(`Query: ${query}`);
		if (query.length === 0) return true;
		const isEqualKey = key.toLowerCase().startsWith(q);
		if (isEqualKey) return true;
		// Check if equal chinese
		const chinese = bibleChinese[key];
		if (chinese && chinese.toLowerCase().includes(q)) return true;

		return false;
	}

	function onClose() {
		visible = false;
	}

	async function onOpen() {
		const divId = `#bibleScrollButton_${$currentChapterStore.scroll}`;
		await new Promise((resolve) => setTimeout(resolve, 0));
		const element = document.querySelector(divId);
		element?.scrollIntoView({ inline: 'center', block: 'center' });
		enableScroll = true;
	}
</script>

{#if visible}
	{onOpen()}
	<!-- A full screen div that covers all other elements -->
	<div class="fixed inset-0 z-50 flex flex-col bg-black w-dvw h-dvh">
		<div class="flex justify-end p-4">
			<!-- Search bar -->
			<div class="flex flex-row w-full p-2 mr-4 text-white bg-gray-800 rounded-lg">
				<SearchIcon class="mr-2 text-xl " />
				<input
					class="w-full bg-gray-800"
					type="text"
					placeholder={$t('search')}
					bind:value={searchQuery}
				/>
			</div>

			<button class="mr-4" onclick={onClose}>
				<CloseIcon class="text-xl" />
			</button>
		</div>
		<!-- A div that contains the modal -->
		<ScrollArea>
			<div class="grid grid-cols-2 gap-2 p-4 align-top">
				<!-- A div that contains the close button -->
				<!-- For each key in bibleList create a rectangle with the name of it -->
				{#each Object.keys(bibleList) as key}
					{#if isSearch(key, searchQuery)}
						<div id="bibleScrollButton_{key}" class={cn({ 'col-span-2': expandedScroll === key })}>
							<button
								class="w-full"
								onclick={() => (expandedScroll = expandedScroll == key ? undefined : key)}
							>
								<div
									class="flex items-center justify-center h-12 bg-gray-900 rounded-full
				{$currentChapterStore.scroll === key ? 'outline' : ''} 
				{isScrollCompleted(key) ? 'bg-green-600' : ''} 
				"
								>
									{bibleChinese[key] || key}
								</div>
							</button>
							{#if expandedScroll === key}
								<!-- If the expandedScroll is equal to the key, create a div with a grid layout -->
								<div class="grid grid-cols-[repeat(auto-fill,minmax(3rem,1fr))] gap-2 my-2">
									<!-- For each key create bibleList[key] amount of boxes -->
									{#each Array.from({ length: bibleList[key] + 1 }) as _, i}
										<button
											id="bibleChapterButton_{key}_{i}"
											class="flex items-center justify-center rounded-lg bg-gray-800 size-12
									{$bibleProgressStore[getProgressIndex(key, i)]
												? 'bg-green-600'
												: i == 0 && $bibleProgressStore[getProgressIndex(key, 1)]
													? 'bg-green-600'
													: ''}
									{$currentChapterStore.scroll === key && $currentChapterStore.chapter === i ? 'outline' : ''}
									"
											onclick={() => {
												jumpToChapter({ scroll: key, chapter: i });
												onClose();
											}}
										>
											{#if i == 0}
												<Info class="text-2xl" />
											{:else}
												{i}
											{/if}
										</button>
									{/each}
								</div>
							{/if}
						</div>
					{/if}
				{/each}
			</div>
		</ScrollArea>
	</div>
{/if}
