<script lang="ts">
	import type { LayoutData } from './$types';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { session } from '$lib/session.svelte';
	import '../app.css';
	import { getGoogleRedirectResult } from '$lib/firebase/auth';
	import '../i18n';
	import { ModeWatcher, setMode } from 'mode-watcher';
	import initLocale from '../i18n';
	import { firstVisitStore } from '$lib/utils/firstVisit.svelte';
	import type { PWAInstallElement } from '@khmyznikov/pwa-install';
	import '@khmyznikov/pwa-install';

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet<[any]>;
	}

	let pwaInstallRef: PWAInstallElement;

	let { data, children }: Props = $props();

	let loadingResult = $state(true);

	let firstVisit = firstVisitStore();
	import { dev } from '$app/environment';

	onMount(async () => {
		setMode('dark'); // TODO Default to dark mode first, maybe add light mode in the future
		if (pwaInstallRef) {
			if (!pwaInstallRef.isUnderStandaloneMode) {
				pwaInstallRef.showDialog(true);
			}
		}
		if (firstVisit.value == true) {
			firstVisit.value = false;
			console.log('First Visit');
			await goto(base + '/signup');
		} else {
			console.log('Logging In');
			await autoLogin();
		}

		loadingResult = false;
	});

	async function autoLogin() {
		await getGoogleRedirectResult();

		const user: any = await data.getAuthUser?.();

		const loggedIn = !!user && user?.emailVerified;
		session.update((cur: any) => {
			return {
				...cur,
				user,
				loggedIn,
				loading: false
			};
		});
		// console.log('Session', $session);
		if (loggedIn) {
			if (!data.requireLogin) await goto(base + '/home');
		} else {
			await goto(base + '/login');
		}
	}
</script>

<ModeWatcher defaultMode={'dark'} track={false} />
<button
	class="flex items-center justify-center h-12 mt-4 text-white bg-blue-500 rounded-md w-80"
	onclick={() => {
		if (pwaInstallRef) {
			console.log(pwaInstallRef?.isInstallAvailable);
			console.log(pwaInstallRef?.isUnderStandaloneMode);
			pwaInstallRef.showDialog(true);
			// pwaInstallRef.install();
		}
	}}
>
	Install bro
</button>
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

<pwa-install bind:this={pwaInstallRef} manifest-url="/favicon/site.webmanifest"></pwa-install>

<style lang="less">
	.background {
		background-image: url('$lib/assets/icons/icon.svg');
		background-repeat: no-repeat;
		background-position: center;
		background-blend-mode: darken;
		background-size: 50% 50%;
		background-color: rgba(0, 0, 0, 0.7); /* Adjust the alpha value to control the darkness */
	}
</style>
