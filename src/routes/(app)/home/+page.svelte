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
</script>

<div class="flex flex-col items-center justify-center w-full h-full p-6">
	{#await getVerseOfTheDay() then data}
		{data.text}
	{/await}
</div>
