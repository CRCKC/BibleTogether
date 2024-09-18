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
				class="h-12 p-2 border-2 border-gray-200 rounded-md w-80"
			/>
			<input
				type="password"
				placeholder="Password"
				class="h-12 p-2 mt-4 border-2 border-gray-200 rounded-md w-80"
			/>
			<button type="submit" class="h-12 mt-4 text-white bg-blue-500 rounded-md w-80">
				Login
			</button>
		</form>
		<a href="signup" class="mt-4 text-blue-500">Don't have an account? Sign up</a>
	</div>
</div>
