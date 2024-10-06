<script lang="ts">
	import { audioStore } from '$lib/bible';
	import { onMount, onDestroy } from 'svelte';
	import type { Unsubscriber } from 'svelte/store';

	let progress = 0;

	let unsubscriber: Unsubscriber;

	function audioStoreSubscriptionEvent(value: HTMLAudioElement) {
		if (value) {
			progress = (value.currentTime / value.duration) * 100;
		}
	}
	onMount(() => {
		unsubscriber = audioStore.subscribe((value) => {
			console.log(value);
			value?.removeEventListener('timeupdate', () => audioStoreSubscriptionEvent(value));
			value?.addEventListener('timeupdate', () => audioStoreSubscriptionEvent(value));
		});
	});

	onDestroy(() => {
		unsubscriber();
	});
</script>

<div class="audio-seek-bar">
	<input type="range" min="0" max="100" bind:value={progress} class="seek-bar" />
</div>

<style>
	.audio-seek-bar {
		width: 100%;
		display: flex;
		align-items: center;
	}
	.seek-bar {
		width: 100%;
	}
</style>
