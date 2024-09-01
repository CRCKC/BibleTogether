<script lang="ts">
	import type { PageData } from './$types';
	import { bibleStore } from '$lib/bible';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	export let data: PageData;

	onMount(() => {
		goto(`bible/${$bibleStore.scroll}/${$bibleStore.chapter}`);
	});
</script>
