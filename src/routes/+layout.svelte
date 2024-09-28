<script lang="ts">
	import type { LayoutData } from './$types';
	import { goto } from '$app/navigation';
	import { loggedIn } from '$lib/userSession';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { renewToken } from '$lib/backend';

	export let data: LayoutData;

	import '../app.css';

	if (data.requireLogin && !$loggedIn) {
		onMount(async () => {
			const success = await renewToken();
			$loggedIn = success;
			console.log('renewToken', success);
			if (!success) goto(`${base}/login`);
		});
	}
	console.log('Reloaded Page');
</script>

<slot class="overflow-hidden" />
