<script lang="ts">
	import { getBibleUrl, currentChapterStore } from '$lib/bible/bible';

	const url = getBibleUrl($currentChapterStore);
</script>

<div class="flex flex-col items-center justify-center size-full">
	<h1 class="text-3xl">Scroll or Chapter not found</h1>
	<a class="p-2 px-4 m-4 bg-gray-700 rounded-full hover:bg-gray-800" href={url}
		>Click here to go back to the Bible</a
	>
</div>
