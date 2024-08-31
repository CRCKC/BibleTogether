<script>
	import { goto } from '$app/navigation';
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<h1 class="text-3xl font-bold underline">Hello world!</h1>

<button on:click={() => goto('home')} class="bg-gray-800"> Go to home </button>

<style lang="postcss">
	:global(html) {
		/* background-color: theme(colors.black);
		color: theme(colors.white); */
		zoom: 150%;
	}
</style>
