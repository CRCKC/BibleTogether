<script lang="ts">
	import { base } from '$app/paths';
	import { signup } from '$lib/firebase/auth';
	import { onMount } from 'svelte';
	import GoogleSigninButton from '../googleSigninButton.svelte';
	import OrWithSeperator from '../orWithSeperator.svelte';
	// import type { PageData } from './$types';
	import { Input } from '$lib/components/ui/input/index.js';
	import { t } from 'svelte-i18n';

	// export let data: PageData;

	let username = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let signingUp = $state(false);
	let usernameField: HTMLInputElement | null = $state(null);

	onMount(() => {
		usernameField?.focus();
	});

	function validateSignup() {
		username = username.trim();
		password = password.trim();
		confirmPassword = confirmPassword.trim();

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
		signup(username, password).then((success) => {});

		signingUp = false;
	}
</script>

<!-- Signup Screen UI -->
<div class="flex flex-col items-center justify-center h-dvh">
	<div class="flex flex-col items-center justify-center">
		<h1 class="text-4xl font-bold">{$t('signup')}</h1>
		<p class="text-gray-400">{$t('signupWelcome')}</p>
	</div>
	<div class="flex flex-col items-center justify-center mt-8">
		<form class="flex flex-col items-center justify-center">
			<Input
				type="text"
				placeholder={$t('username')}
				class="h-12 p-2 w-80"
				bind:value={username}
				bind:ref={usernameField}
			/>
			<Input
				type="password"
				placeholder={$t('password')}
				class="h-12 p-2 mt-4 w-80"
				bind:value={password}
			/>
			<Input
				type="password"
				placeholder={$t('confirmPassword')}
				class="h-12 p-2 mt-4 w-80"
				bind:value={confirmPassword}
			/>
			<button
				type="submit"
				class="flex items-center justify-center h-12 mt-4 text-white bg-blue-500 rounded-md w-80"
				disabled={signingUp}
				onclick={submitSignup}
			>
				{#if signingUp}
					<div class="w-8 h-8 border-b-2 border-white rounded-full animate-spin"></div>
				{:else}
					{$t('signup')}
				{/if}
			</button>
			<OrWithSeperator />
			<div class="h-12 my-4 w-80">
				<GoogleSigninButton text={$t('googleSignup')} />
			</div>
		</form>
		<a href="{base}/login" class="mt-4 text-blue-500">{$t('gotoLogin')}</a>
	</div>
</div>

<style lang="postcss">
	/* .active {
		@apply text-white;
	} */
</style>
