<script lang="ts">
	import type { LayoutData } from './$types';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { session } from '$lib/session';
	import '../app.css';

	export let data: LayoutData;

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

	let loading: boolean = true;
	let loggedIn: boolean = false;
	// $: console.log('loggedin', $session.loggedIn?.toString());

	session.subscribe((cur: any) => {
		loading = cur?.loading;
		loggedIn = cur?.loggedIn;
	});

	onMount(async () => {
		console.log('Checking auth');
		const user: any = await data.getAuthUser?.();

		const loggedIn = !!user && user?.emailVerified;
		session.update((cur: any) => {
			loading = false;
			return {
				...cur,
				user,
				loggedIn,
				loading: false
			};
		});
		console.log('Session', $session);
		if (loggedIn) {
			goto(base + '/home');
		} else {
			goto(base + '/login');
		}
	});
</script>

{#if loading}
	<div class="flex items-center justify-center h-dvh">
		<div class="w-16 h-16 border-b-2 border-white rounded-full animate-spin"></div>
	</div>
{:else}
	<slot class="overflow-hidden" />
{/if}
