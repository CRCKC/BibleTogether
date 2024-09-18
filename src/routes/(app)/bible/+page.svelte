<script lang="ts">
	import type { PageData } from './$types';
	import { currentChapterStore } from '$lib/bible';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	export let data: PageData;

	onMount(() => {
		goto(`bible/${$currentChapterStore.scroll}/${$currentChapterStore.chapter}`);
	});
</script>
