<script lang="ts">
	import { page } from '$app/stores';
	import { base } from '$app/paths';
</script>

<h1>{$page.status}: {$page.error?.message} LOL</h1>
<a href={`/`} class="h-8 text-black bg-gray-500">Click to go back to home</a>
