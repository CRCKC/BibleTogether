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
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { promptInstall } from '$lib/pwa/pwa';

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet<[any]>;
	}

	let { data, children }: Props = $props();

	let loadingResult = $state(true);

	let firstVisit = firstVisitStore();

	onMount(async () => {
		setMode('dark'); // TODO Default to dark mode first, maybe add light mode in the future
		setTimeout(promptInstall, 0);

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
