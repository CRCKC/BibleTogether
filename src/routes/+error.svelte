<script lang="ts">
	import { page } from '$app/stores';
</script>

<h1>{$page.status}: {$page.error?.message} LOL</h1>
<button class="h-8 bg-gray-500 text-black">Click to go back to home</button>
