<script lang="ts">
	import type { LayoutData } from './$types';
	import { goto } from '$app/navigation';
	import { loggedIn } from '$lib/userSession';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { renewToken } from '$lib/backend';

	export let data: LayoutData;

	import '../app.css';

	let loading = false;

	if (data.requireLogin && !$loggedIn) {
		loading = true;
		onMount(async () => {
			const success = await renewToken();
			$loggedIn = success;
			if (!success) goto(`${base}/login`);
			loading = false;
		});
	} else {
		loading = false;
	}
</script>

{#if loading}
	<div class="flex items-center justify-center h-dvh">
		<div class="w-16 h-16 border-b-2 border-white rounded-full animate-spin"></div>
	</div>
{:else}
	<slot class="overflow-hidden" />
{/if}
