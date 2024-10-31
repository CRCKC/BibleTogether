<script lang="ts">
	import { resetProgress } from '$lib/bible/progress';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { t } from 'svelte-i18n';
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger
		class="flex items-center justify-center h-12 mt-4 text-white bg-red-700 rounded-md w-80"
		>{$t('deleteProgress')}</AlertDialog.Trigger
	>
	<AlertDialog.Content class="border-red-700 bg-red-950" interactOutsideBehavior="close">
		<AlertDialog.Header>
			<AlertDialog.Title>{$t('deleteBibleProgressTitle')}</AlertDialog.Title>
			<AlertDialog.Description>
				{$t('deleteBibleProgressDesc')}
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>{$t('cancel')}</AlertDialog.Cancel>
			<AlertDialog.Action class="text-white bg-red-700" onclick={() => resetProgress()}
				>{$t('confirm')}</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
