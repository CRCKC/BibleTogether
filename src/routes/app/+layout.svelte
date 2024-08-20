<script lang="ts">
	import type { LayoutData } from './$types';
	import Item from './navbarItem.svelte';

	// export let data: LayoutData;
</script>

<slot />

<nav class="grid grid-flow-col w-full bottom-0 absolute border-t-2 border-gray-600">
	<Item title="Home" path="home" icon="home" />
	<Item title="Bible" path="bible" icon="book_2" />
</nav>
