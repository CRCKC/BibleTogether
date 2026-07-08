<script lang="ts">
	import VotdCard from './votdCard.svelte';
	import { getVerseOfTheDay } from '$lib/votd/votd';
	import { onMount } from 'svelte';
	import ScheduleCard from './scheduleCard.svelte';
	import { fade } from 'svelte/transition';

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

	let votdError = $state<string | null>(null);

	async function fetchVotd() {
		votdError = null;
		try {
			votd = await getVerseOfTheDay();
		} catch (e) {
			votdError = e instanceof Error ? e.message : 'Failed to load verse of the day';
		}
	}

	onMount(fetchVotd);
</script>

<!-- Main Frame-->
<div class="flex flex-col items-center w-full h-full p-4 gap-4 overflow-auto" transition:fade={{ duration: 200 }}>
	<VotdCard {votd} error={votdError} onRetry={fetchVotd} />
	<div class="flex flex-col flex-1 min-h-0 w-full max-w-sm">
		<ScheduleCard />
	</div>
</div>
