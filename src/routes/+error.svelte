<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
</script>

<!-- Create a better error page with beautiful tailwindcss -->
<div class="flex flex-col items-center justify-center h-full">
	<div class="flex flex-col items-center justify-center">
		<div class="text-2xl font-bold">Error</div>
		<div class="text-xl">{page.status}: {page.error?.message}</div>
	</div>
	<a href="{base}/home" class="p-2 mt-8 text-white bg-blue-500 rounded-md"
		>Click to go back to home</a
	>
</div>
