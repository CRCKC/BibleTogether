<script lang="ts">
	import type { PageData } from './$types';
	import { login } from '$lib/backend';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';

	// export let data: PageData;

	let username = '';
	let password = '';
	let loggingIn = false;

	function submitLogin() {
		loggingIn = true;
		login(username, password).then((success) => {
			if (success) {
				console.log('Login successful');
				goto(`${base}/home`);
			} else {
				console.log('Login failed');
			}
			loggingIn = false;
		});
	}
</script>

<!-- Login Screen UI -->
<div class="flex flex-col items-center justify-center h-dvh">
	<div class="flex flex-col items-center justify-center">
		<h1 class="text-4xl font-bold">Login</h1>
		<p class="text-gray-400">Welcome back! Please login to your account.</p>
	</div>
	<div class="flex flex-col items-center justify-center mt-8">
		<div class="flex flex-col items-center justify-center text-black">
			<input
				type="text"
				placeholder="Username"
				bind:value={username}
				class="h-12 p-2 border-2 border-gray-200 rounded-md w-80"
			/>
			<input
				type="password"
				placeholder="Password"
				bind:value={password}
				class="h-12 p-2 mt-4 border-2 border-gray-200 rounded-md w-80"
			/>
			<button
				type="submit"
				class="flex items-center justify-center h-12 mt-4 text-white bg-blue-500 rounded-md w-80"
				on:click={submitLogin}
			>
				{#if loggingIn}
					<div class="w-8 h-8 border-b-2 border-white rounded-full animate-spin"></div>
				{:else}
					Login
				{/if}
			</button>
		</div>
		<a href="{base}/signup" class="mt-4 text-blue-500">Don't have an account? Sign up</a>
	</div>
</div>
