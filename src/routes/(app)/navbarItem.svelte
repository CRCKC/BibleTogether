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
	class="text-center mb-2 mt-2 text-xs text-gray-400 transition-all"
	class:active={isActive}
>
	<div class="flex justify-center items-center mb-1 text-lg">
			{@html isActive ? activeIcon : icon}
	</div>
	{title}
</a>

<style lang="postcss">
	.active {
		@apply text-white;
	}
</style>
