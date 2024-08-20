<script lang="ts">
	import { page } from '$app/stores';

	export let title: string = 'PlaceHolder';
	export let icon: string;
	// export let iconInactive: string;
	export let path: string;

	const targetLocation = `/app/${path}`;
	$: isActive = $page.route.id == targetLocation;
</script>

<a
	href={targetLocation}
	class="text-center mb-2 mt-2 text-xs text-gray-400"
	class:active={isActive}
>
	<div class="flex justify-center items-center">
		<span class={`material-symbols-outlined mb-1`} class:fillIcon={isActive}>
			{icon}
		</span>
	</div>
	{title}
</a>

<style lang="postcss">
	.material-symbols-outlined {
		font-variation-settings:
			'FILL' 0,
			'wght' 400,
			'GRAD' 0,
			'opsz' 24;
	}
	.active {
		@apply text-white;
	}
	.fillIcon {
		font-variation-settings: 'FILL' 1;
		/* 'wght' 400,
			'GRAD' 0,
			'opsz' 24; */
	}
</style>
