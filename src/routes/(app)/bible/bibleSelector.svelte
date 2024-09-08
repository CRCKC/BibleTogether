<script lang="ts">
	import { goto } from '$app/navigation';
	import { bibleList, getBibleUrl, setBible, bibleChinese } from '$lib/bible';
	import classNames from 'classnames';

	// define a variable that stores a void function
	export let onClose: () => void;

	let expandedScroll: string | undefined = undefined;
	let searchQuery: string = '';

	function isSearch(key: string, q: string): boolean {
		const query = q.trim().toLowerCase();
		console.log(`Query: ${query}`);
		if (query.length === 0) return true;
		const isEqualKey = key.toLowerCase().startsWith(q);
		if (isEqualKey) return true;
		// Check if equal chinese

		return false;
	}

	// Create a $ variable that stores the type of "string | undefined"
</script>

<!-- A full screen div that covers all other elements -->
<div class="fixed inset-0 z-50 flex flex-col bg-black w-dvw h-dvh">
	<div class="flex justify-end p-4">
		<!-- Search bar -->
		<div class="flex flex-row w-full p-2 mr-4 text-white bg-gray-800 rounded-lg">
			<span class="mr-2 material-symbols-outlined">search</span>
			<input class="w-full bg-gray-800" type="text" placeholder="Search" bind:value={searchQuery} />
		</div>

		<button class="mr-4" on:click={onClose}>
			<span class="material-symbols-outlined">close</span>
		</button>
	</div>
	<!-- A div that contains the modal -->
	<div class="grid h-full grid-cols-2 gap-2 p-4 overflow-y-scroll">
		<!-- A div that contains the close button -->
		<!-- For each key in bibleList create a rectangle with the name of it -->
		{#each Object.keys(bibleList) as key}
			{#if isSearch(key, searchQuery)}
				<div class={classNames({ 'col-span-2': expandedScroll === key })}>
					<button
						class="w-full"
						on:click={() => (expandedScroll = expandedScroll == key ? undefined : key)}
					>
						<div class="flex items-center justify-center h-12 bg-gray-900 rounded-full">
							{bibleChinese[key] || key}
						</div>
					</button>
					{#if expandedScroll === key}
						<!-- If the expandedScroll is equal to the key, create a div with a grid layout -->
						<div class="grid grid-cols-[repeat(auto-fill,minmax(3rem,1fr))] gap-2 my-2">
							<!-- For each key create bibleList[key] amount of boxes -->
							{#each Array.from({ length: bibleList[key] + 1 }) as _, i}
								<button
									class="flex items-center justify-center bg-gray-800 rounded-lg size-12"
									on:click={() => {
										console.log(`Scroll: ${key}, Chapter: ${i}`);
										setBible({ scroll: key, chapter: i });
										goto(getBibleUrl({ scroll: key, chapter: i }));
										onClose();
									}}
								>
									{i}
								</button>
							{/each}
						</div>
					{/if}
				</div>
			{/if}
		{/each}
	</div>
</div>
