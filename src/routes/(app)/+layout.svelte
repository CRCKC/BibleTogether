<script lang="ts">
	import { page } from '$app/state';
	// import type { LayoutData } from './$types';
	import { base } from '$app/paths';
	import Item from './navbarItem.svelte';
	import BibleNavBar from './bible/navbarBible.svelte';
	import { onDestroy } from 'svelte';
	import { subScribeUpdates } from '$lib/firebase/firestore';
	import type { Unsubscribe } from 'firebase/firestore';
	import { session } from '$lib/session.svelte';
	import { t } from 'svelte-i18n';
	// export let data: LayoutData;
	import SettingsIcon from '~icons/material-symbols/settings';
	import SettingsOutline from '~icons/material-symbols/settings-outline';
	import Book2Icon from '~icons/material-symbols/book-2';
	import Book2Outline from '~icons/material-symbols/book-2-outline';
	import HomeIcon from '~icons/material-symbols/home';
	import HomeOutline from '~icons/material-symbols/home-outline';
	import { fade, fly } from 'svelte/transition';

	let { children } = $props();

	let subscribtion: Unsubscribe | undefined = $state();
	let isBible = $derived(page.url.pathname.startsWith(`${base}/bible`));
	$effect.pre(() => {
		try {
			if (session.v.loggedIn == true) {
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
	});

	onDestroy(() => {
		if (subscribtion) subscribtion();
	});
</script>

<div class="flex flex-col h-dvh w-dvw">
	{#key page.url.pathname}
		<div class="relative h-full">
			{@render children?.()}
		</div>
	{/key}
	<div class="z-40 w-full transition-all bg-black border-t-2 border-gray-600">
		<!-- Bible nav bar -->
		{#if isBible}
			<BibleNavBar />
		{/if}

		<div class="icon-ms-settings"></div>
		<nav class="grid grid-flow-col">
			<Item title={$t('home')} path="home" icon={HomeOutline} activeIcon={HomeIcon} />
			<Item title={$t('bible')} path="bible" icon={Book2Outline} activeIcon={Book2Icon} />
			<Item
				title={$t('settings')}
				path="settings"
				icon={SettingsOutline}
				activeIcon={SettingsIcon}
			/>
		</nav>
	</div>
</div>
