<script lang="ts">
	import { getContext, onMount } from 'svelte';
	import { t } from 'svelte-i18n';
	import Button from '$lib/components/ui/button/button.svelte';
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
	<section class="highlight-preferences" aria-labelledby="highlight-preferences-title">
		<h2 id="highlight-preferences-title">{$t('highlightPreferences')}</h2>
		<p>{$t('highlightPreferencesDesc')}</p>
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
						variant={projection.preferences.defaultColor === preset.color ? 'default' : 'outline'}
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
{/if}

<style>
	.highlight-preferences {
		width: min(100%, 20rem);
		margin-top: 1.5rem;
		color: #f5f7fa;
	}

	h2 {
		font-size: 1.125rem;
		font-weight: 600;
	}

	p {
		margin: 0.25rem 0 0.75rem;
		color: #8896a6;
		font-size: 0.875rem;
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
