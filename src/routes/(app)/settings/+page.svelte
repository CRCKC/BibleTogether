<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { t } from 'svelte-i18n';
	// import type { PageData } from './$types';
	import ZoomPopup from './zoomPopup.svelte';
	// import DeleteProgress from './deleteProgress.svelte';
	// import MigrateProgress from './migrateProgress.svelte';
	import LogoutButton from './logoutButton.svelte';
	import * as Tabs from "$lib/components/ui/tabs";
	import { session } from '$lib/session.svelte';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Label } from '$lib/components/ui/label';
	import { Button } from '$lib/components/ui/button';

	// export let data: PageData;
	const imageUrl = session.v.user?.photoURL
	const displayName = session.v.user?.displayName
	const email = session.v.user?.email
</script>

<!-- Change font size, logout -->
<div class="flex flex-col items-center h-full p-8 ">
	<Avatar.Root class="size-24">
		<Avatar.Image src={imageUrl} />
		<Avatar.Fallback>CN</Avatar.Fallback>
	</Avatar.Root>
	<Label class="pt-2 text-xl font-bold" >{displayName}</Label>
	<Label class="text-muted-foreground" >{email}</Label>
	<!-- <p class="mt-2 text-lg font-semibold">{}</p> -->

	<div class="flex flex-col items-center justify-center mt-8">
		<div class="flex flex-col items-center justify-center text-black">
			<Button
				class="flex items-center justify-center h-12 mb-4 rounded-md w-80"
				variant="secondary"
				href={`${base}/settings/profile`}
			>
				{$t('profile_settings')}
			</Button>
			<ZoomPopup />
			<!-- <MigrateProgress /> -->
			<!-- Change Language -->
			<!-- <button
				class="flex items-center justify-center h-12 mt-4 text-white bg-gray-600 rounded-md w-80"
				onclick={() => {
					locale.set('zh');
				}}
			>
				Change Language
			</button> -->

			<Button
				class="flex items-center justify-center h-12 mt-4 rounded-md w-80"
				variant="secondary"
				onclick={() => {
					goto(`${base}/feedback`);
				}}
			>
				{$t('feedback_submit')}
			</Button>
			<LogoutButton />
			<!-- <DeleteProgress /> -->
		</div>
	</div>
</div>
