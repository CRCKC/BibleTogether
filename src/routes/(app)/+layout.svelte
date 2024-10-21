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
	import SettingsIcon from '~icons/material-symbols/settings?raw';
	import SettingsOutline from '~icons/material-symbols/settings-outline?raw';
	import Book2Icon from '~icons/material-symbols/book-2?raw';
	import Book2Outline from '~icons/material-symbols/book-2-outline?raw';
	import HomeIcon from '~icons/material-symbols/home?raw';
	import HomeOutline from '~icons/material-symbols/home-outline?raw';

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
		
		<div class="icon-ms-settings" />
		<nav class="grid grid-flow-col">
			<Item title={$t('home')} path="home" icon={HomeOutline} activeIcon={HomeIcon}/>
			<Item title={$t('bible')} path="bible" icon={Book2Outline} activeIcon = {Book2Icon} />
			<Item title={$t('settings')} path="settings" icon={SettingsOutline} activeIcon= {SettingsIcon} />
		</nav>
	</div>
</div>
