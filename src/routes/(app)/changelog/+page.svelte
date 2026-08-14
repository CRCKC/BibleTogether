<script lang="ts">
	import { base } from '$app/paths';
	import { Button } from '$lib/components/ui/button';
	import { changelogEntries, getChangelogCopy, type ChangelogEntry } from '$lib/changelog';
	import { settingsStore } from '$lib/userSettings';
	import { locale, t } from 'svelte-i18n';

	const currentEntry = changelogEntries[0];
	const previousEntries = changelogEntries.slice(1);

	function copyFor(entry: ChangelogEntry) {
		return getChangelogCopy(entry, $locale ?? 'en');
	}
</script>

<svelte:head>
	<title>{$t('whats_new')}</title>
</svelte:head>

<main
	class="h-full overflow-y-auto px-4 pt-6 pb-[calc(6rem+env(safe-area-inset-bottom))]"
	style={`font-size: calc(1rem * ${$settingsStore.fontZoom})`}
>
	<div class="mx-auto w-full max-w-[65ch]">
		<Button variant="ghost" href={`${base}/settings`} class="mb-6 px-0">
			{$t('whats_new_back')}
		</Button>

		<h1 class="mb-8 text-2xl font-semibold">{$t('whats_new')}</h1>

		{#if currentEntry}
			<section aria-labelledby="current-release-heading">
				<h2 id="current-release-heading" class="mb-3 text-lg font-semibold">
					{$t('whats_new_current')}
				</h2>
				{@render ReleaseEntry(currentEntry)}
			</section>
		{/if}

		{#if previousEntries.length}
			<section aria-labelledby="previous-releases-heading" class="mt-8">
				<h2 id="previous-releases-heading" class="mb-3 text-lg font-semibold">
					{$t('whats_new_previous')}
				</h2>
				<div class="space-y-4">
					{#each previousEntries as entry (entry.version)}
						{@render ReleaseEntry(entry)}
					{/each}
				</div>
			</section>
		{/if}
	</div>
</main>

{#snippet ReleaseEntry(entry: ChangelogEntry)}
	{@const copy = copyFor(entry)}
	<article
		class="rounded-lg border border-border/60 bg-card/30 p-4"
		aria-labelledby={`release-${entry.version}`}
	>
		<div class="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
			<h3 id={`release-${entry.version}`} class="text-lg font-semibold">{copy.title}</h3>
			<p class="text-sm text-muted-foreground">
				<span>{$t('whats_new_version')} {entry.version}</span>
				<span aria-hidden="true"> · </span>
				<span>{$t('whats_new_updated')} <time datetime={entry.date}>{entry.date}</time></span>
			</p>
		</div>
		<ul class="list-disc space-y-2 pl-5 leading-relaxed">
			{#each copy.items as item, itemIndex (itemIndex + ':' + item)}
				<li>{item}</li>
			{/each}
		</ul>
	</article>
{/snippet}
