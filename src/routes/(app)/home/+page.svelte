<script lang="ts">
	import { session } from '$lib/session';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<!-- Think of a good homepage layout, the layout needs two main thing, a hello message, and the schedule of the current month, like which verse and scroll the user should be reading -->
<div class="flex flex-col items-center justify-center h-full p-6 text-center text-white">
	<h1 class="mb-4 text-4xl font-bold">Hello, {$session.user?.displayName}</h1>
	<p class="mb-3 text-xl">Welcome to the home page</p>
	<p class="text-xl">
		You should be reading <span class="font-bold text-yellow-300">{'A'}</span> today
	</p>
</div>
