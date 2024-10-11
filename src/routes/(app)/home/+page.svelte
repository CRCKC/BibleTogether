<script lang="ts">
	import { session } from '$lib/session';
	import type { PageData } from './$types';
	import bibleSchedule from '$lib/data/bibleSchedule.json';

	const schedule = bibleSchedule as {
		[key: number]: {
			[key: number]: Array<{ scroll: string; verse: string }>;
		};
	};

	export let data: PageData;

	// Get Today's year and month
	const today = new Date();
	const year = today.getFullYear();
	const month = today.getMonth() + 1;

	let user: any;
	let name: string;

	$: if (user && user.displayName) {
		name = user.displayName;
	} else {
		name = 'Unknown User';
	}

	$: try {
		if ($session.user) {
			user = $session.user;
		}
	} catch (error) {
		// For some reason it thorws an error even when I use if($session.user) to check if its undefined
		user = undefined;
	}
</script>

<!-- Think of a good homepage layout, the layout needs two main thing, a hello message, and the schedule of the current month, like which verse and scroll the user should be reading -->
<div class="flex flex-col items-center justify-center h-full p-6 text-center text-white">
	<h1 class="mb-4 text-4xl font-bold">Hello, {name}</h1>
	<p class="mb-3 text-xl">Welcome to the home page</p>
	<p class="mb-3 text-xl">Today is {year}/{month}</p>
	<p class="text-xl">
		You should be reading <span class="font-bold text-yellow-300"
			>{schedule[year][month][0].scroll}</span
		> today
	</p>
</div>
