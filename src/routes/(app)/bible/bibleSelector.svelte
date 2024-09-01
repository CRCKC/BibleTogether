<script lang="ts">
	import { goto } from '$app/navigation';
	import { bibleList, getBibleUrl, bibleStore, setBible } from '$lib/bible';

	// define a variable that stores a void function
	export let onClose: () => void;

	let expandedScroll: string | undefined = undefined;
	$: expandedScroll;

	// Create a $ variable that stores the type of "string | undefined"
</script>

<!-- A full screen div that covers all other elements -->
<div class="fixed inset-0 bg-black z-50 w-dvw">
	<div class="flex justify-end p-4">
		<button on:click={onClose}>
			<span class="material-symbols-outlined">close</span>
		</button>
	</div>
	<!-- A div that contains the modal -->
	<div class="p-4 grid grid-cols-1 gap-2 h-dvh overflow-y-scroll">
		<!-- A div that contains the close button -->
		<!-- For each key in bibleList create a rectangle with the name of it -->
		{#each Object.keys(bibleList) as key}
			<button
				class="w-full"
				on:click={() => (expandedScroll = expandedScroll == key ? undefined : key)}
			>
				<div class="bg-gray-900 h-12 rounded-full flex items-center justify-center">
					{key}
				</div>
			</button>
			{#if expandedScroll === key}
				<!-- If the expandedScroll is equal to the key, create a div with a grid layout -->
				<div class="grid grid-cols-[repeat(auto-fill,minmax(3rem,1fr))] gap-2">
					<!-- For each key create bibleList[key] amount of boxes -->
					{#each Array.from({ length: bibleList[key] + 1 }) as _, i}
						<button
							class="bg-gray-800 size-12 rounded-lg flex items-center justify-center"
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
		{/each}
	</div>
</div>
