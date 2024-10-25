<script lang="ts">
	import type { PageData } from './$types';
	import { currentChapterStore } from '$lib/bible';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	onMount(() => {
		goto(`bible/${$currentChapterStore.scroll}/${$currentChapterStore.chapter}`);
	});
</script>
