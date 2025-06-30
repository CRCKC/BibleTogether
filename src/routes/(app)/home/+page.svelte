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
<div class="flex flex-col items-center justify-start w-full h-full p-6">
	<VotdCard {votd} />
	<div class="pt-8"></div>
	<ScheduleCard />
</div>
