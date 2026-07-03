<script lang="ts">
	import VotdCard from './votdCard.svelte';
	import { getVerseOfTheDay } from '$lib/votd/votd';
	import { onMount } from 'svelte';
	import ScheduleCard from './scheduleCard.svelte';

	let votd: {
		text: string | undefined;
		scroll: string;
		chapter: number;
		verse: number;
	} = $state({
		text: undefined,
		scroll: '',
		chapter: 0,
		verse: 0
	});

	onMount(async () => {
		votd = await getVerseOfTheDay();
		console.log('Votd loaded:', votd.text);
	});
</script>

<!-- Main Frame-->
<div class="flex flex-col items-center w-full h-full p-4 gap-4 overflow-auto">
	<VotdCard {votd} />
	<div class="flex flex-col flex-1 min-h-0 w-full max-w-sm">
		<ScheduleCard />
	</div>
</div>
