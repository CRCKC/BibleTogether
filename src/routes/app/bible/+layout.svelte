<script lang="ts">
	import type { LayoutData } from './$types';
	// import Scroller from '@sveltejs/svelte-scroller';

	export let data: LayoutData;
</script>

<div class="overflow-y-scroll h-screen">
	<slot />
</div>
