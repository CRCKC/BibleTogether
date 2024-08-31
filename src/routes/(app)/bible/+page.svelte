<script lang="ts">
	import type { PageData } from './$types';
	import { bibleStore } from '$lib/bible';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	export let data: PageData;

	goto(`${base}/bible/${$bibleStore.scroll}/${$bibleStore.chapter}`);
</script>

<h1>This is the bible page</h1>
