<script lang="ts">
	import { page } from '$app/stores';
	// import type { LayoutData } from './$types';
	import { base } from '$app/paths';
	import Item from './navbarItem.svelte';
	import BibleNavBar from './bible/navbarBible.svelte';
	import { onMount } from 'svelte';
	import { subScribeUpdates } from '$lib/firebase/firestore';
	import type { Unsubscribe } from 'firebase/firestore';
	import { session } from '$lib/session';
	// export let data: LayoutData;

	let subscribtion: Unsubscribe;
	$: isBible = $page.url.pathname.startsWith(`${base}/bible`);
	onMount(async () => {
		if (!$session.loggedIn) return;
		const sub = await subScribeUpdates();
		if (sub) subscribtion = sub;
	});
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
