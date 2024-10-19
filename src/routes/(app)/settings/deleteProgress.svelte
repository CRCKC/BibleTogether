<script lang="ts">
	import { resetProgress } from '$lib/bibleProgress';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger
		class="flex items-center justify-center h-12 mt-4 text-white bg-red-700 rounded-md w-80"
		>Delete Progress</AlertDialog.Trigger
	>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete your bible progress
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action on:click={() => resetProgress()}>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
