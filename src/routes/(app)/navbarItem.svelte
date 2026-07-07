<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';

	interface Props {
		title?: string;
		icon: any;
		activeIcon: any;
		path: string;
	}

	let { title = 'PlaceHolder', icon, activeIcon, path }: Props = $props();

	let targetLocation = $derived(`${base}/${path}`);
	let isActive = $derived($page.url.pathname.startsWith(targetLocation));

	const SvelteComponent = $derived(isActive ? activeIcon : icon);
</script>

<a
	href={targetLocation}
	class="mt-2 mb-2 text-xs text-center text-gray-400 transition-all"
	class:active={isActive}
	aria-current={isActive ? 'page' : undefined}
>
	<div class="flex items-center justify-center mb-1 text-2xl">
		<SvelteComponent />
	</div>
	{title}
</a>

<style lang="postcss">
	@reference "tailwindcss";
	.active {
		@apply text-white;
	}
</style>
