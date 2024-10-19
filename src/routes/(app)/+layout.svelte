<script lang="ts">
	import { page } from '$app/stores';
	// import type { LayoutData } from './$types';
	import { base } from '$app/paths';
	import Item from './navbarItem.svelte';
	import BibleNavBar from './bible/navbarBible.svelte';
	import { onDestroy } from 'svelte';
	import { subScribeUpdates } from '$lib/firebase/firestore';
	import type { Unsubscribe } from 'firebase/firestore';
	import { session } from '$lib/session';
	import { t } from 'svelte-i18n';

	// export let data: LayoutData;

	let subscribtion: Unsubscribe | undefined;
	$: isBible = $page.url.pathname.startsWith(`${base}/bible`);
	$: {
		try {
			if ($session.loggedIn == true) {
				if (!subscribtion) {
					subScribeUpdates().then((sub) => {
						console.log('Subscribing to updates');
						if (sub) subscribtion = sub;
					});
				}
			} else {
				if (subscribtion) subscribtion();
			}
		} catch (error) {
			console.info("Verifying user's session");
		}
	}

	onDestroy(() => {
		if (subscribtion) subscribtion();
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
			<Item title={$t('home')} path="home" icon="home" />
			<Item title={$t('bible')} path="bible" icon="book_2" />
			<Item title={$t('settings')} path="settings" icon="settings" />
		</nav>
	</div>
</div>
