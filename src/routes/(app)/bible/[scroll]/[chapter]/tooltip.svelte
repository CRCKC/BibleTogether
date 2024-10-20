<script lang="ts">
	import { onMount } from 'svelte';

	export let text: string;

	onMount(() => {
		console.log('Tooltip Mounted');
	});
</script>

<div class="tooltip">
	{text}
</div>

<style>
	.tooltip {
		position: absolute;
		background-color: red;
		color: #fff;
		padding: 5px;
		border-radius: 5px;
		z-index: 1000;
	}
</style>
