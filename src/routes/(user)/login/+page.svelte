<script lang="ts">
	// import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { base } from '$app/paths';
	import { onMount } from 'svelte';
	import { login } from '$lib/firebase/auth';
	import GoogleSigninButton from '../googleSigninButton.svelte';
	import OrWithSeperator from '../orWithSeperator.svelte';
	import { t } from 'svelte-i18n';
	import { Input } from '$lib/components/ui/input/index.js';

	// export let data: PageData;

	let username = $state('');
	let password = $state('');
	let usernameField: HTMLInputElement = $state();
	let passwordField: HTMLInputElement = $state();
	let loggingIn = $state(false);

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
		<h1 class="text-4xl font-bold">{$t('login')}</h1>
		<p class="text-gray-400">{$t('loginWelcome')}</p>
	</div>
	<div class="flex flex-col items-center justify-center mt-8">
		<div class="flex flex-col items-center justify-center">
			<Input
				type="email"
				placeholder={$t('username')}
				bind:value={username}
				bind:ref={usernameField}
				on:keydown={handleKeydownUsername}
				class="h-12 p-2 w-80"
			/>
			<Input
				type="password"
				placeholder={$t('password')}
				bind:value={password}
				bind:ref={passwordField}
				on:keydown={handleKeydownPassword}
				class="h-12 p-2 mt-4 w-80"
			/>
			<button
				type="submit"
				class="flex items-center justify-center h-12 mt-4 text-white bg-blue-500 rounded-md w-80"
				onclick={submitLogin}
			>
				{#if loggingIn}
					<div class="w-8 h-8 border-b-2 border-white rounded-full animate-spin"></div>
				{:else}
					{$t('login')}
				{/if}
			</button>
			<OrWithSeperator />

			<div class="h-12 my-4 w-80">
				<GoogleSigninButton text={$t('googleLogin')} />
			</div>
		</div>
		<a href="{base}/signup" class="mt-4 text-blue-500">{$t('gotoSignup')}</a>
	</div>
</div>
