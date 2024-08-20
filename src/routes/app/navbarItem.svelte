<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	export let title: string = 'PlaceHolder';
	export let icon: string;
	// export let iconInactive: string;
	export let path: string;
	export let isActive: boolean = false;
</script>

<button class="text-center mb-2 mt-2 text-xs" on:click={() => goto(`/app/${path}`)}>
	<div class="flex justify-center items-center">
		<span class={`material-symbols-outlined${isActive ? ' a' : ''} mb-1`}>
			{icon}
		</span>
	</div>
	{title}
</button>

<style>
	.material-symbols-outlined {
		font-variation-settings:
			'FILL' 0,
			'wght' 400,
			'GRAD' 0,
			'opsz' 24;
	}
	.a {
		font-variation-settings: 'FILL' 1;
		/* 'wght' 400,
			'GRAD' 0,
			'opsz' 24; */
	}
</style>
