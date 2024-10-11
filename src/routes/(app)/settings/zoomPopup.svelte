<script lang="ts">
	import { settingsStore } from '$lib/userSettings';

	export let visible: boolean;
</script>

{#if visible}
	<button
		class="fixed top-0 left-0 z-50 bg-black bg-opacity-50 h-dvh w-dvw"
		on:click={() => (visible = false)}
	>
		<div class="flex items-center justify-center h-full">
			<button
				class="flex flex-col items-center justify-center w-full p-4 m-8 bg-gray-800 rounded-md cursor-auto max-w-7xl"
				on:click|stopPropagation
			>
				<div class="flex flex-col items-center justify-center">
					<div class="flex flex-col items-center justify-center w-80">
						<div class="text-2xl font-bold">Font Size</div>
						<input
							class="w-full mt-8"
							type="range"
							min="0.5"
							max="2.1"
							step="0.1"
							bind:value={$settingsStore.fontZoom}
						/>
					</div>
				</div>
				<div class="relative size-full">
					<div class="absolute py-4 sampleText" style="zoom: {$settingsStore.fontZoom};">
						<p>
							<b>1</b><span
								>起初，上帝創造天地。 <sup title="本節或譯「起初，上帝創造天地的時候，」"
								></sup></span
							><b>2</b><span
								>地是空虛混沌，深淵上面一片黑暗；上帝的靈 <sup
									title="「上帝的靈」或譯「上帝的風」。"
								></sup>
								運行在水面上。<sup
									title="「起初，上帝創造...水面上」或譯「起初，當上帝創造天地，地是空虛混沌，深淵的表面黑暗，上帝的靈運行在水面上的時候」。"
								></sup></span
							><b>3</b><span>上帝說：「要有光」，就有了光。</span><b>4</b><span
								>上帝看光是好的，於是上帝就把光和暗分開。</span
							><b>5</b><span>上帝稱光為「晝」，稱暗為「夜」。有晚上，有早晨，這是第一日。</span>
						</p>
					</div>
					<div class="invisible py-4 sampleText" style="zoom: 2;">
						<p>
							<b>1</b><span
								>起初，上帝創造天地。 <sup title="本節或譯「起初，上帝創造天地的時候，」"
								></sup></span
							><b>2</b><span
								>地是空虛混沌，深淵上面一片黑暗；上帝的靈 <sup
									title="「上帝的靈」或譯「上帝的風」。"
								></sup>
								運行在水面上。<sup
									title="「起初，上帝創造...水面上」或譯「起初，當上帝創造天地，地是空虛混沌，深淵的表面黑暗，上帝的靈運行在水面上的時候」。"
								></sup></span
							><b>3</b><span>上帝說：「要有光」，就有了光。</span><b>4</b><span
								>上帝看光是好的，於是上帝就把光和暗分開。</span
							><b>5</b><span>上帝稱光為「晝」，稱暗為「夜」。有晚上，有早晨，這是第一日。</span>
						</p>
					</div>
				</div>

				<button
					class="flex items-center justify-center h-12 mt-4 text-white bg-blue-500 rounded-md w-80"
					on:click={() => {
						visible = false;
					}}
				>
					Close
				</button>
			</button>
		</div>
	</button>
{/if}

<style>
	.sampleText {
		font:
			15px / 1.231 'Microsoft YaHei',
			tahoma,
			arial,
			'Hiragino Sans GB',
			\5b8b\4f53,
			sans-serif;
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
