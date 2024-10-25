<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { resetProgress } from '$lib/bibleProgress';
	import { logout } from '$lib/firebase/auth';
	import { session } from '$lib/session';
	import { locale, t } from 'svelte-i18n';
	// import type { PageData } from './$types';
	import ZoomPopup from './zoomPopup.svelte';
	import DeleteProgress from './deleteProgress.svelte';
	let popupFontSize = false;

	// export let data: PageData;
</script>

<!-- Change font size, logout -->
<div class="flex flex-col items-center h-full p-8">
	<div class="flex flex-col items-center justify-center">
		<h1 class="text-4xl font-bold">{$t('settings')}</h1>
		<p class="text-gray-400">{$t('settingsDesc')}</p>
	</div>
	<div class="flex flex-col items-center justify-center mt-8">
		<div class="flex flex-col items-center justify-center text-black">
			<ZoomPopup />
			<!-- Change Language -->
			<!-- <button
				class="flex items-center justify-center h-12 mt-4 text-white bg-gray-600 rounded-md w-80"
				onclick={() => {
					locale.set('zh');
				}}
			>
				Change Language
			</button> -->

			<button
				class="flex items-center justify-center h-12 mt-4 text-white bg-blue-500 rounded-md w-80"
				onclick={() => {
					logout();
					$session.loggedIn = false;
					goto(`${base}/login`);
				}}
			>
				{$t('logout')}
			</button>
			<DeleteProgress />
		</div>
	</div>
</div>
