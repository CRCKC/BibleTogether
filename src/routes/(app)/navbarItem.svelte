<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';

	export let title: string = 'PlaceHolder';
	export let icon: any;
	export let activeIcon: any;
	export let path: string;

	const targetLocation = `${base}/${path}`;
	$: isActive = $page.url.pathname.startsWith(targetLocation);
</script>

<a
	href={targetLocation}
	class="mt-2 mb-2 text-xs text-center text-gray-400 transition-all"
	class:active={isActive}
>
	<div class="flex items-center justify-center mb-1 text-2xl">
		<svelte:component this={isActive ? activeIcon : icon} />
	</div>
	{title}
</a>

<style lang="postcss">
	.active {
		@apply text-white;
	}
</style>
