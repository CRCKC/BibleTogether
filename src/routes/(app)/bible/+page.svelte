<script lang="ts">
	import type { PageData } from './$types';
	import { bibleStore } from '$lib/bible';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	export let data: PageData;

	goto(`${base}/bible/${$bibleStore.scroll}/${$bibleStore.chapter}`);
</script>

<!--  Loading indicator -->
<div
	class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center"
>
	<div class="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
</div>
