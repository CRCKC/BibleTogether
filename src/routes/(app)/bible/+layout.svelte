<script lang="ts">
	import type { LayoutData } from './$types';

	export let data: LayoutData;
</script>

<div class="overflow-y-scroll h-[calc(100vh-4rem)]">
	<slot />
</div>

<style lang="postcss">
</style>
