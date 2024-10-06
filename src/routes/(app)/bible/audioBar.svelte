<script lang="ts">
	export let duration: number;

	export let audioPlayer: HTMLAudioElement;
	export let currentTime: number;
	$: sliderValue = (currentTime / duration) * 100;
</script>

<div class="w-full">
	<input
		type="range"
		min="0"
		max="100"
		bind:value={sliderValue}
		on:input={(_) => {
			audioPlayer.currentTime = (sliderValue / 100) * duration;
		}}
		class="w-full"
	/>
</div>
