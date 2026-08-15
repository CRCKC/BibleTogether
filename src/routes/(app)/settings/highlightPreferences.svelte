<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { t } from 'svelte-i18n';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import {
		HIGHLIGHT_PRESETS,
		type HighlightProjection,
		type HighlightSession
	} from '$lib/bible/highlights';
	import type { HighlightSyncSession } from '$lib/firebase/firestore';
	import { subscribeAuthState } from '$lib/firebase/authState';

	interface HighlightContext {
		readonly session: HighlightSession | null;
		readonly sync: HighlightSyncSession | null;
	}

	const highlightContext = getContext<HighlightContext | undefined>('highlightSession');
	let session = $state<HighlightSession | null>(null);
	let projection = $state<HighlightProjection | null>(null);
	let stop: (() => void) | undefined;
	let dialogOpen = $state(false);

	onMount(() => {
		const sync = () => {
			const next = highlightContext?.session ?? null;
			if (next === session) return;
			stop?.();
			stop = undefined;
			session = next;
			projection = null;
			if (next) {
				next.hydrate();
				projection = next.getState();
				stop = next.subscribe((state) => (projection = state));
			}
		};
		const stopAuth = subscribeAuthState(() => queueMicrotask(sync));
		sync();
		return () => {
			stopAuth();
			stop?.();
		};
	});

	function setDefault(color: string) {
		session?.setDefaultColor(color);
		highlightContext?.sync?.flush();
	}

	function deleteCustom(color: string) {
		session?.deleteCustomColor(color);
		highlightContext?.sync?.flush();
	}
</script>

{#if projection}
	<Dialog.Root bind:open={dialogOpen}>
		<Dialog.Trigger>
			<Button
				class="h-12 mt-4 rounded-md w-80"
				variant="secondary"
				data-highlight-preferences-trigger
			>
				{$t('highlightPreferences')}
			</Button>
		</Dialog.Trigger>
		<Dialog.Content class="max-h-[calc(100dvh-2rem)] overflow-y-auto">
			<Dialog.Header>
				<Dialog.Title>{$t('highlightPreferences')}</Dialog.Title>
				<Dialog.Description>{$t('highlightPreferencesDesc')}</Dialog.Description>
			</Dialog.Header>
			<section class="highlight-preferences">
				<div class="preference-list">
					{#each HIGHLIGHT_PRESETS as preset}
						<div class="preference-row">
							<span class="color-dot" style={`--swatch-color: ${preset.color}`} aria-hidden="true"
							></span>
							<span class="color-name"
								>{$t(`highlightColor${preset.id[0].toUpperCase()}${preset.id.slice(1)}`)}</span
							>
							<Button
								class="preference-action"
								variant={projection.preferences.defaultColor === preset.color
									? 'default'
									: 'outline'}
								aria-pressed={projection.preferences.defaultColor === preset.color}
								onclick={() => setDefault(preset.color)}
							>
								{projection.preferences.defaultColor === preset.color
									? $t('highlightDefaultSelected')
									: $t('highlightSetDefault')}
							</Button>
						</div>
					{/each}
					{#each projection.preferences.savedColors as color}
						<div class="preference-row">
							<span class="color-dot" style={`--swatch-color: ${color}`} aria-hidden="true"></span>
							<span class="color-name">{color}</span>
							<Button
								class="preference-action"
								variant={projection.preferences.defaultColor === color ? 'default' : 'outline'}
								aria-pressed={projection.preferences.defaultColor === color}
								onclick={() => setDefault(color)}
							>
								{projection.preferences.defaultColor === color
									? $t('highlightDefaultSelected')
									: $t('highlightSetDefault')}
							</Button>
							<Button
								variant="ghost"
								aria-label={`${$t('highlightDeleteCustom')}: ${color}`}
								onclick={() => deleteCustom(color)}
							>
								×
							</Button>
						</div>
					{/each}
				</div>
			</section>
		</Dialog.Content>
		<Dialog.Close />
	</Dialog.Root>
{/if}

<style>
	.highlight-preferences {
		width: min(100%, 20rem);
		margin-top: 1.5rem;
		color: #f5f7fa;
	}

	.preference-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.preference-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 2.25rem;
	}

	.color-dot {
		width: 1rem;
		height: 1rem;
		flex: 0 0 auto;
		border: 1px solid #f5f7fa;
		border-radius: 50%;
		background: var(--swatch-color);
	}

	.color-name {
		min-width: 0;
		flex: 1;
		font-size: 0.875rem;
	}

	:global(.preference-action) {
		min-width: 7rem;
	}
</style>
