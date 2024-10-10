<script lang="ts">
	import { page } from '$app/stores';
	// import type { LayoutData } from './$types';
	import { base } from '$app/paths';
	import Item from './navbarItem.svelte';
	import BibleNavBar from './bible/navbarBible.svelte';
	import classNames from 'classnames';
	// export let data: LayoutData;

	$: isBible = $page.url.pathname.startsWith(`${base}/bible`);
</script>

<div class="flex flex-col h-dvh w-dvw">
	<div class="h-full">
		<slot />
	</div>

	<div class="z-40 w-full transition-all bg-black border-t-2 border-gray-600">
		<!-- Bible nav bar -->
		{#if isBible}
			<BibleNavBar />
		{/if}

		<nav class="grid grid-flow-col">
			<Item title="Home" path="home" icon="home" />
			<Item title="Bible" path="bible" icon="book_2" />
			<Item title="Settings" path="settings" icon="settings" />
		</nav>
	</div>
</div>
