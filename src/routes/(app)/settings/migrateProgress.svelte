<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { t } from 'svelte-i18n';
	import * as Table from '$lib/components/ui/table/index.js';
	import { bibleChinese, bibleSchedule } from '$lib/bible/constants';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';

	let dialogOpen = $state(false);
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger
		class="flex items-center justify-center h-12 mt-4 text-white bg-gray-600 rounded-md w-80"
		>{$t('migrateProgress')}</Dialog.Trigger
	>
	<Dialog.Content class="">
		<Dialog.Header>
			<Dialog.Title class="text-center">{$t('migrateProgress')}</Dialog.Title>
		</Dialog.Header>
		<ScrollArea class="h-72">
			<Table.Root>
				<Table.Caption>A list of your recent invoices.</Table.Caption>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-[100px]">Invoice</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Method</Table.Head>
						<Table.Head class="text-right">Amount</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each Object.entries(bibleSchedule) as y}
						{#each Object.entries(y) as m}
							{#each Object.entries(m) as item}
								<Table.Row>
									<Table.Cell class="font-medium">{y}</Table.Cell>
									<Table.Cell>Paid</Table.Cell>
									<Table.Cell>Credit Card</Table.Cell>
									<Table.Cell class="text-right">$250.00</Table.Cell>
								</Table.Row>
							{/each}
						{/each}
					{/each}
				</Table.Body>
			</Table.Root>
		</ScrollArea>
		<Dialog.Footer>
			<Button
				class="w-full"
				type="submit"
				onclick={() => {
					dialogOpen = false;
				}}
			>
				{$t('done')}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
	<Dialog.Close />
</Dialog.Root>
