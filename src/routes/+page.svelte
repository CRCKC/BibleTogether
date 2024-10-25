<script type="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		goto('signup');
	});
</script>

<!-- <h1 class="text-4xl">Bible Together</h1>
<p>Login to continue</p>

<button onclick={() => goto('login')} class="bg-gray-800"> Login </button>
<p />
<button onclick={() => goto('home')} class="bg-gray-800"> Go to home </button> -->
