<script lang="ts">
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { t } from 'svelte-i18n';
	import { logout } from '$lib/firebase/auth';
	import { session } from '$lib/session.svelte';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	function onConfirm() {
		logout();
		session.v.loggedIn = false;
		goto(`${base}/login`);
	}
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger
		class="flex items-center justify-center h-12 mt-4 text-white bg-blue-500 rounded-md w-80"
		>{$t('logout')}</AlertDialog.Trigger
	>
	<AlertDialog.Content class="" interactOutsideBehavior="close">
		<AlertDialog.Header>
			<AlertDialog.Title>{$t('logoutTitle')}</AlertDialog.Title>
			<AlertDialog.Description>
				{$t('logoutDesc')}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{$t('cancel')}</AlertDialog.Cancel>
			<AlertDialog.Action class="" onclick={onConfirm}>{$t('confirm')}</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
