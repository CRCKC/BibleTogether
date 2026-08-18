<script lang="ts">
	import { page } from '$app/state';
	// import type { LayoutData } from './$types';
	import { base, resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import Item from './navbarItem.svelte';
	import BibleNavBar from './bible/navbarBible.svelte';
	import { onDestroy, onMount, setContext } from 'svelte';
	import {
		createHighlightPreferencesTransport,
		createHighlightSyncSession,
		subScribeUpdates,
		type HighlightSyncSession
	} from '$lib/firebase/firestore';
	import { createHighlightSession, type HighlightSession } from '$lib/bible/highlights';
	import { subscribeAuthState } from '$lib/firebase/authState';
	import type { Unsubscribe } from 'firebase/firestore';
	import {
		changelogEntries,
		currentVersion,
		markLastSeenVersion,
		readLastSeenVersion,
		shouldShowChangelogNotice
	} from '$lib/changelog';
	import { toast } from 'svelte-sonner';
	import { t } from 'svelte-i18n';
	// export let data: LayoutData;
	import SettingsIcon from '~icons/material-symbols/settings';
	import SettingsOutline from '~icons/material-symbols/settings-outline';
	import Book2Icon from '~icons/material-symbols/book-2';
	import Book2Outline from '~icons/material-symbols/book-2-outline';
	import HomeIcon from '~icons/material-symbols/home';
	import HomeOutline from '~icons/material-symbols/home-outline';

	let { children } = $props();

	let subscribtion: Unsubscribe | undefined = $state();
	let highlightSession = $state<HighlightSession | null>(null);
	let highlightSync = $state<HighlightSyncSession | null>(null);
	let isBible = $derived(page.url.pathname.startsWith(`${base}/bible`));
	let embedded = $derived(page.url.searchParams.get('embed') === '1');

	setContext('highlightSession', {
		get session() {
			return highlightSession;
		},
		get sync() {
			return highlightSync;
		}
	});

	onMount(() => {
		if (embedded || !changelogEntries.length) return;

		const lastSeenVersion = readLastSeenVersion();
		if (!lastSeenVersion) {
			markLastSeenVersion(currentVersion);
			return;
		}
		if (!shouldShowChangelogNotice(lastSeenVersion)) return;

		let seen = false;
		const markSeen = () => {
			if (!seen) {
				seen = true;
				markLastSeenVersion(currentVersion);
			}
		};

		toast.info($t('whats_new_available'), {
			duration: 12000,
			position: 'top-center',
			closeButton: true,
			action: {
				label: $t('whats_new_view'),
				onClick: () => {
					void goto(resolve('/changelog'))
						.then(markSeen)
						.catch(() => undefined);
				}
			},
			onDismiss: markSeen
		});
	});

	onMount(() =>
		subscribeAuthState(({ user, generation }) => {
			if (subscribtion) {
				subscribtion();
				subscribtion = undefined;
			}
			highlightSync?.teardown();
			highlightSession?.teardown();
			highlightSync = null;
			highlightSession = null;
			if (user?.uid && user.emailVerified) {
				subscribtion = subScribeUpdates(user.uid, generation);
				highlightSession = createHighlightSession(user.uid);
				highlightSync = createHighlightSyncSession(user.uid, generation, highlightSession, {
					preferences: createHighlightPreferencesTransport(user.uid)
				});
			}
		})
	);

	onDestroy(() => {
		if (subscribtion) subscribtion();
		subscribtion = undefined;
		highlightSync?.teardown();
		highlightSession?.teardown();
	});
</script>

<div class="flex flex-col h-dvh w-full">
	{#key page.url.pathname}
		<div class="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden" data-app-content>
			{@render children?.()}
		</div>
	{/key}
	{#if !embedded}
		<div class="z-40 w-full shrink-0 transition-all bg-background border-t-2 border-gray-600">
			<!-- Bible nav bar -->
			{#if isBible}
				<BibleNavBar />
			{/if}

			<div class="icon-ms-settings"></div>
			<nav class="grid grid-flow-col" data-bottom-navigation>
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
	{/if}
</div>
