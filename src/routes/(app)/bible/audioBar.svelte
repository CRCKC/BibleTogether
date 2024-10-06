<script lang="ts">
	export let duration: number;

	export let audioPlayer: HTMLAudioElement;
	export let currentTime: number;
	$: sliderValue = (currentTime / duration) * 100;

	function formatTime(time: number) {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}
</script>

<div class="w-full">
	<div class="flex flex-row">
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
		<div class="pl-2 text-nowrap">{formatTime(currentTime)} / {formatTime(duration)}</div>
	</div>
</div>
