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

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet<[any]>;
	}

	let { data, children }: Props = $props();

	// Auto Login Logic
	// if (data.requireLogin && !$session.loggedIn) {
	// 	loading = true;
	// 	onMount(async () => {
	// 		$session.loggedIn = success;
	// 		if (!success) goto(`${base}/login`);
	// 		loading = false;
	// 	});
	// } else {
	// 	loading = false;
	// }

	let loading: boolean = $state(true);
	let loggedIn: boolean = false;
	// $: console.log('loggedin', $session.loggedIn?.toString());

	let loadingResult = $state(true);
	// session.subscribe((cur: any) => {
	// 	loading = cur?.loading;
	// 	loggedIn = cur?.loggedIn;
	// });

	onMount(async () => {
		setMode('dark'); // TODO Default to dark mode first, maybe add light mode in the future
		console.log('Logging In');
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
		loadingResult = false;
	});
</script>

<ModeWatcher defaultMode={'dark'} track={false} />
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
