<script lang="ts">
	import type { LayoutData } from './$types';
	import Item from './navbarItem.svelte';
	// export let data: LayoutData;
</script>

<slot />
<!-- // Tailwind css keep the navbar at the bottom of the screen // https://tailwindcss.com/docs/position -->
<div class="grid grid-flow-col w-full bottom-0 absolute border-t-2 border-gray-600">
	<Item title="Home" path="home" icon="home" isActive={false} />
	<Item title="Bible" path="bible" icon="book_2" isActive={true} />
</div>
