<script lang="ts">
	import { bibleChinese } from '$lib/bible/constants';
	import { t } from 'svelte-i18n';
	import * as Card from '$lib/components/ui/card';
	import Button from '$lib/components/ui/button/button.svelte';
	import { fade } from 'svelte/transition';

	let {
		votd,
		error = null,
		onRetry
	}: {
		votd: {
			text: string | undefined;
			scroll: string;
			chapter: number;
			verse: number;
		};
		error?: string | null;
		onRetry: () => void;
	} = $props();
</script>

<Card.Root class="w-full max-w-sm">
	{#if error}
		<Card.Header>
			<Card.Title>{$t('verse_of_the_day')}</Card.Title>
		</Card.Header>
		<Card.Content class="flex flex-col items-center justify-center gap-3">
			<p class="text-sm text-muted-foreground text-center">{error}</p>
			<Button variant="outline" size="sm" onclick={onRetry}>{$t('retry')}</Button>
		</Card.Content>
	{:else if votd.text != undefined}
		<Card.Header>
			<Card.Title>{$t('verse_of_the_day')}</Card.Title>
			<Card.Description
				>{`${bibleChinese[votd.scroll]} ${votd.chapter}:${votd.verse}`}</Card.Description
			>
		</Card.Header>
		<Card.Content class="flex flex-col items-center justify-center">
			<div class="text-base text-center line-clamp-4" transition:fade={{ duration: 400 }}>
				{votd.text}
			</div>
		</Card.Content>
	{:else}
		<Card.Header>
			<Card.Title>{$t('verse_of_the_day_loading')}</Card.Title>
		</Card.Header>
		<Card.Content class="flex items-center justify-center">
			<div class="w-16 h-16 border-b-2 border-white rounded-full animate-spin"></div>
		</Card.Content>
	{/if}
</Card.Root>
