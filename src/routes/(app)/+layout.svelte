<script lang="ts">
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';
	import { base } from '$app/paths';
	import Item from './navbarItem.svelte';
	import classNames from 'classnames';
	// export let data: LayoutData;

	$: isBible = $page.url.pathname.startsWith(`${base}/bible`);
</script>

<slot />

<nav
	class={classNames('w-full bottom-0 absolute border-t-2 border-gray-600 bg-black transition-all')}
>
	<div
		class={classNames({
			hidden: !isBible
		})}
	>
		<b>Hello</b>
	</div>
	<nav class="grid grid-flow-col">
		<Item title="Home" path="home" icon="home" />
		<Item title="Bible" path="bible" icon="book_2" />
	</nav>
</nav>
