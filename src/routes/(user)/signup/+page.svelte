<script lang="ts">
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { signup } from '$lib/backend';
	import { createUserWithEmail } from '$lib/firebase/auth';
	import type { PageData } from './$types';

	// export let data: PageData;

	let username = '';
	let password = '';
	let confirmPassword = '';
	let signingUp = false;

	function validateSignup() {
		if (password !== confirmPassword) {
			console.log('Passwords do not match');
			return false;
		}
		if (password.length < 6) {
			console.log('Password must be at least 6 characters long');
			return false;
		}
		// If password does not contain both Upper and Lower case letters
		if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
			console.log('Password must contain both upper and lower case letters');
			return false;
		}
		// If Username is not a valid email
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) {
			console.log('Username must be a valid email');
			return false;
		}
		return true;
	}

	async function submitSignup() {
		signingUp = true;
		if (!validateSignup()) {
			signingUp = false;
			return;
		}
		console.log('Signing up');
		// signup(username, password).then((success) => {
		// 	if (success) {
		// 		console.log('Signup successful');
		// 		goto(`${base}/home`);
		// 	} else {
		// 		console.log('Signup failed');
		// 	}
		// 	signingUp = false;
		// });
		await createUserWithEmail(username, password);
		signingUp = false;
	}
</script>

<!-- Signup Screen UI -->
<div class="flex flex-col items-center justify-center h-dvh">
	<div class="flex flex-col items-center justify-center">
		<h1 class="text-4xl font-bold">Sign Up</h1>
		<p class="text-gray-400">Create an account to get started.</p>
	</div>
	<div class="flex flex-col items-center justify-center mt-8">
		<form class="flex flex-col items-center justify-center text-black">
			<input
				type="text"
				placeholder="Username"
				class="h-12 p-2 border-2 border-gray-200 rounded-md w-80"
				bind:value={username}
			/>
			<input
				type="password"
				placeholder="Password"
				class="h-12 p-2 mt-4 border-2 border-gray-200 rounded-md w-80"
				bind:value={password}
			/>
			<input
				type="password"
				placeholder="Confirm Password"
				class="h-12 p-2 mt-4 border-2 border-gray-200 rounded-md w-80"
				bind:value={confirmPassword}
			/>
			<button
				type="submit"
				class="flex items-center justify-center h-12 mt-4 text-white bg-blue-500 rounded-md w-80"
				disabled={signingUp}
				on:click={submitSignup}
			>
				{#if signingUp}
					<div class="w-8 h-8 border-b-2 border-white rounded-full animate-spin"></div>
				{:else}
					Sign Up
				{/if}
			</button>
		</form>
		<a href="{base}/login" class="mt-4 text-blue-500">Already have an account? Login</a>
	</div>
</div>

<style lang="postcss">
	/* .active {
		@apply text-white;
	} */
</style>
