<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { settingsStore } from '$lib/userSettings';
	import { t } from 'svelte-i18n';

	let dialogOpen = $state(false);
</script>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Trigger>
		<Button class="h-12 mt-4rounded-md w-80" variant="secondary">
			{$t('adjustFontSize')}
		</Button>
	</Dialog.Trigger>
	<Dialog.Content class="">
		<Dialog.Header>
			<Dialog.Title class="text-center">{$t('fontSize')}</Dialog.Title>
		</Dialog.Header>
		<input
			class="w-full mt-8"
			type="range"
			min="0.5"
			max="1.7"
			step="0.1"
			bind:value={$settingsStore.fontZoom}
		/>
		<div class="relative text-base size-full">
			<div class="absolute py-4 sampleText" style="zoom: {$settingsStore.fontZoom};">
				<p>
					<b>1</b><span
						>起初，上帝創造天地。 <sup title="本節或譯「起初，上帝創造天地的時候，」"></sup></span
					><b>2</b><span
						>地是空虛混沌，深淵上面一片黑暗；上帝的靈 <sup title="「上帝的靈」或譯「上帝的風」。"
						></sup>
						運行在水面上。<sup
							title="「起初，上帝創造...水面上」或譯「起初，當上帝創造天地，地是空虛混沌，深淵的表面黑暗，上帝的靈運行在水面上的時候」。"
						></sup></span
					>
				</p>
			</div>
			<div class="invisible py-4 sampleText" style="zoom: 1.7;">
				<p>
					<b>1</b><span
						>起初，上帝創造天地。 <sup title="本節或譯「起初，上帝創造天地的時候，」"></sup></span
					><b>2</b><span
						>地是空虛混沌，深淵上面一片黑暗；上帝的靈 <sup title="「上帝的靈」或譯「上帝的風」。"
						></sup>
						運行在水面上。<sup
							title="「起初，上帝創造...水面上」或譯「起初，當上帝創造天地，地是空虛混沌，深淵的表面黑暗，上帝的靈運行在水面上的時候」。"
						></sup></span
					>
				</p>
			</div>
		</div>
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

<style lang="postcss">
	.sampleText {
		-webkit-text-size-adjust: none;
	}
	.sampleText :global(b) {
		color: #aaa;
		padding: 0 0.2em;
		font-weight: normal;
		cursor: default;
		font-size: 85%;
		vertical-align: text-top;
	}
</style>
