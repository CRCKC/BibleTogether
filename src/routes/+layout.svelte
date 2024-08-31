<script lang="ts">
	// import type { LayoutData } from './$types';

	// export let data: LayoutData;

	import '../app.css';

	import { bibleStore } from '$lib/bible';
	import { setContext } from 'svelte';
	setContext('bible', bibleStore);
</script>

<slot class="overflow-hidden" />
