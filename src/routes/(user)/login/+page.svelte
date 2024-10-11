<script lang="ts">
	// import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { login } from '$lib/firebase/auth';
	import GoogleSigninButton from '../googleSigninButton.svelte';
	import OrWithSeperator from '../orWithSeperator.svelte';

	// export let data: PageData;

	let username = '';
	let password = '';
	let usernameField: HTMLInputElement;
	let passwordField: HTMLInputElement;
	let loggingIn = false;

	onMount(() => {
		usernameField.focus();
	});

	function submitLogin() {
		loggingIn = true;
		login(username.trim(), password.trim()).then((success) => {
			if (success) {
				goto(`${base}/home`);
				console.log('Login successful');
			} else {
				console.log('Login failed');
			}
			loggingIn = false;
		});
	}

	function handleKeydownUsername(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			passwordField.focus();
		}
	}
	function handleKeydownPassword(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			submitLogin();
		}
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
				bind:this={usernameField}
				on:keydown={handleKeydownUsername}
				class="h-12 p-2 border-2 border-gray-200 rounded-md w-80"
			/>
			<input
				type="password"
				placeholder="Password"
				bind:value={password}
				bind:this={passwordField}
				on:keydown={handleKeydownPassword}
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
			<OrWithSeperator />

			<div class="h-12 my-4 w-80">
				<GoogleSigninButton text={'Login with Google'} />
			</div>
		</div>
		<a href="{base}/signup" class="mt-4 text-blue-500">Don't have an account? Sign up</a>
	</div>
</div>
