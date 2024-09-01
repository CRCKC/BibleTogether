<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<!-- Login Screen UI -->
<div class="flex flex-col items-center justify-center h-dvh">
	<div class="flex flex-col items-center justify-center">
		<h1 class="text-4xl font-bold">Login</h1>
		<p class="text-gray-400">Welcome back! Please login to your account.</p>
	</div>
	<div class="flex flex-col items-center justify-center mt-8">
		<form class="flex flex-col items-center justify-center text-black">
			<input
				type="text"
				placeholder="Username"
				class="w-80 h-12 border-2 border-gray-200 rounded-md p-2"
			/>
			<input
				type="password"
				placeholder="Password"
				class="w-80 h-12 border-2 border-gray-200 rounded-md p-2 mt-4"
			/>
			<button type="submit" class="w-80 h-12 bg-blue-500 text-white rounded-md mt-4">
				Login
			</button>
		</form>
		<a href="/user/signup" class="text-blue-500 mt-4">Don't have an account? Sign up</a>
	</div>
</div>
