<script>
	import { goto } from '$app/navigation';
</script>

<h1 class="text-4xl">Bible Together</h1>
<p>Login to continue</p>

<button on:click={() => goto('login')} class="bg-gray-800"> Login </button>
<p />
<button on:click={() => goto('home')} class="bg-gray-800"> Go to home </button>
