<script lang="ts">
	import type { PageData } from './$types';
	import { login } from '$lib/backend';

	export let data: PageData;

	let username = '';
	let password = '';

	function test() {
		var myHeaders = new Headers();
		myHeaders.append('Content-Type', 'application/json');

		var raw = JSON.stringify({
			username: 'Ericsson',
			password: 'admin'
		});

		fetch(
			'https://script.google.com/macros/s/AKfycbygTngNfc5fjdmbuGJ9l5wsBTDAR3oA6s1HSJ9ikRpr7aZj9d_N2OSXSCHCs1Nt7YHJ/exec?action=login',
			{
				method: 'POST',
				body: raw,
				redirect: 'follow'
			}
		)
			.then((response) => response.text())
			.then((result) => console.log('The result is: ', result))
			.catch((error) => console.log('error', error));
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
				class="h-12 mt-4 text-white bg-blue-500 rounded-md w-80"
				on:click={() => login(username, password)}
			>
				Login
			</button>
		</div>
		<a href="signup" class="mt-4 text-blue-500">Don't have an account? Sign up</a>
	</div>
</div>
