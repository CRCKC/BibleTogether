<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { logout } from '$lib/firebase/auth';
	import { session } from '$lib/session';
	// import type { PageData } from './$types';
	import ZoomPopup from './zoomPopup.svelte';

	let popupFontSize = false;

	// export let data: PageData;
</script>

<!-- Change font size, logout -->
<div class="flex flex-col items-center h-full p-8">
	<div class="flex flex-col items-center justify-center">
		<h1 class="text-4xl font-bold">Settings</h1>
		<p class="text-gray-400">Change your settings here.</p>
	</div>
	<div class="flex flex-col items-center justify-center mt-8">
		<div class="flex flex-col items-center justify-center text-black">
			<button
				class="flex items-center justify-center h-12 mt-4 text-white bg-blue-500 rounded-md w-80"
				on:click={() => {
					popupFontSize = !popupFontSize;
				}}
			>
				Adjust Font Size
			</button>
			<button
				class="flex items-center justify-center h-12 mt-4 text-white bg-blue-500 rounded-md w-80"
				on:click={() => {
					logout();
					$session.loggedIn = false;
					goto(`${base}/login`);
				}}
			>
				Logout
			</button>
		</div>
	</div>
</div>

<ZoomPopup bind:visible={popupFontSize} />
