<script lang="ts">
	import type { LayoutData } from './$types';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { session } from '$lib/session.svelte';
	import '../app.css';
	import '../i18n';
	import { ModeWatcher, setMode } from 'mode-watcher';
	import initLocale from '../i18n';
	import { localStore } from '$lib/utils/localStore.svelte';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { promptInstall } from '$lib/pwa/pwa';
	import Pwa from '$lib/pwa/pwa.svelte';
	import { browser } from '$app/environment';
	import { subscribeAuthState } from '$lib/firebase/authState';
	import { page } from '$app/state';

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet<[any]>;
	}

	let { data, children }: Props = $props();

	let loadingResult = $state(true);
	let embedded = $derived(page.url.searchParams.get('embed') === '1');

	let firstVisit = localStore('firstVisit', true);

	onMount(() => {
		const unsubscribeAuth = subscribeAuthState(({ user, loading }) => {
			session.user = user;
			session.loggedIn = !!user?.emailVerified;
			session.loading = loading;
		});
		void (async () => {
			setMode('dark'); // TODO Default to dark mode first, maybe add light mode in the future
			if (!embedded) setTimeout(promptInstall, 0);

			if (firstVisit.value && !embedded) {
				firstVisit.value = false;
				console.log('First Visit');
				await goto(base + '/signup');
			} else {
				firstVisit.value = false;
				console.log('Logging In');
				await autoLogin();
			}

			loadingResult = false;
		})();
		return unsubscribeAuth;
	});

	async function autoLogin() {
		const user: any = await data.getAuthUser?.();
		const loggedIn = !!user && user?.emailVerified;
		const returnTo = page.url.searchParams.get('returnTo');

		// Session is projected by the shared auth observer above.
		if (loggedIn && !data.requireLogin) {
			const destination =
				returnTo?.startsWith('/') && !returnTo.startsWith('//') ? returnTo : base + '/home';
			await goto(destination);
		} else if (!loggedIn && data.requireLogin) {
			const currentPath = page.url.pathname + page.url.search;
			await goto(
				`${base}/login?returnTo=${encodeURIComponent(currentPath)}${embedded ? '&embed=1' : ''}`
			);
		}
	}
</script>

{#if browser && !embedded}
	<Pwa />
{/if}

<ModeWatcher defaultMode={'dark'} track={false} />

<Toaster />

<div class="background">
	{#await initLocale()}
		<div class="flex items-center justify-center h-dvh">
			<div class="w-16 h-16 border-b-2 border-white rounded-full animate-spin"></div>
		</div>
	{:then _}
		{#if loadingResult}
			<div class="flex items-center justify-center h-dvh">
				<div class="w-16 h-16 border-b-2 border-white rounded-full animate-spin"></div>
			</div>
		{:else}
			{@render children?.({ class: 'overflow-hidden' })}
		{/if}
	{/await}
</div>

<style>
	.background {
		background-image: url('$lib/assets/icons/icon.svg');
		background-repeat: no-repeat;
		background-position: center;
		background-blend-mode: darken;
		background-size: 50% 50%;
		background-color: rgba(0, 0, 0, 0.7); /* Adjust the alpha value to control the darkness */
	}
</style>
