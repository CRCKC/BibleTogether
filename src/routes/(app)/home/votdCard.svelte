<script lang="ts">
	import { bibleChinese } from '$lib/bible/constants';
	import { t } from 'svelte-i18n';
	import * as Card from '$lib/components/ui/card';

	let {
		votd
	}: {
		votd: {
			text: string | undefined;
			scroll: string;
			chapter: number;
			verse: number;
		};
	} = $props();
</script>

<Card.Root class="w-full max-w-2xl">
	{#if votd.text != undefined}
		<Card.Header>
			<Card.Title>{$t('verse_of_the_day')}</Card.Title>
			<Card.Description
				>{`${bibleChinese[votd.scroll]} ${votd.chapter}:${votd.verse}`}</Card.Description
			>
		</Card.Header>
		<Card.Content class="flex flex-col items-center justify-center">
			<div class="text-lg text-center">
				{votd.text}
			</div>
		</Card.Content>
		<Card.Footer class="flex items-center justify-between"></Card.Footer>
	{:else}
		<Card.Header>
			<Card.Title>{$t('verse_of_the_day_loading')}</Card.Title>
		</Card.Header>
		<Card.Content class="flex items-center justify-center">
			<div class="w-16 h-16 border-b-2 border-white rounded-full animate-spin"></div>
		</Card.Content>
	{/if}
</Card.Root>
