<script lang="ts">
	// import type { PageData } from './$types';
	import bibleSchedule from '$lib/bible/schedule.json';
	import * as Carousel from '$lib/components/ui/carousel/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { CarouselAPI } from '$lib/components/ui/carousel/context';
	import { cn } from '$lib/utils';
	import { bibleChinese } from '$lib/bible/constants';
	import { t } from 'svelte-i18n';
	import { jumpToChapterWithProgress } from '$lib/bible/progress';
	// import ArrowLeft from '~icons/material-symbols/arrow-left';
	// import ArrowRight from '~icons/material-symbols/arrow-right';
	import ArrowRight from 'lucide-svelte/icons/chevron-down';
	import ArrowLeft from 'lucide-svelte/icons/chevron-up';
	import { getVerseOfTheDay } from '$lib/votd/votd';
	import * as Card from '$lib/components/ui/card';
	import { onMount } from 'svelte';
	// export let data: PageData;

	// Get Today's year and month
	const today = new Date();
	const year = today.getFullYear();
	const month = today.getMonth() + 1;
	const todayIndex = (year - 2024) * 12 + month - 1;

	const schedule = bibleSchedule as {
		[year: number]: {
			[month: number]: Array<{
				scroll: string;
				start: number;
				end: number;
			}>;
		};
	};

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
	});
</script>

<!-- Main Frame-->
<div class="flex flex-col items-center justify-center w-full h-full p-6">
	<!-- Verse of the day Card -->
	<Card.Root class="w-full max-w-2xl">
		<Card.Header>
			<Card.Title>{$t('verse_of_the_day')}</Card.Title>
			<Card.Description
				>{`${bibleChinese[votd.scroll]} ${votd.chapter}:${votd.verse}`}</Card.Description
			>
		</Card.Header>
		<Card.Content class="flex flex-col items-center justify-center">
			<div class="text-lg text-center">
				{votd.text}
			</div>
		</Card.Content>
		<Card.Footer class="flex items-center justify-between"></Card.Footer>
	</Card.Root>
</div>
