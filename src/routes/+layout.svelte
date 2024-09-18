<script lang="ts">
	import type { LayoutData } from './$types';
	import { goto } from '$app/navigation';
	import { loggedIn } from '$lib/userSession';
	import { onMount } from 'svelte';

	export let data: LayoutData;

	import '../app.css';

	if (data.requireLogin && !$loggedIn) {
		onMount(() => {
			goto('login');
		});
	}
	console.log('Reloaded Page');
</script>

<slot class="overflow-hidden" />
