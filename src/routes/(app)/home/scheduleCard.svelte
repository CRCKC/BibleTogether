<script lang="ts">
	// import type { PageData } from './$types';
	import * as Carousel from '$lib/components/ui/carousel';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { CarouselAPI } from '$lib/components/ui/carousel/context';
	import { cn } from '$lib/utils';
	import { bibleChinese } from '$lib/bible/constants';
	import { t } from 'svelte-i18n';
	import {
		jumpToChapterWithProgress,
		jumpToNextUnreadChapterInSchedule,
		getMonthlyProgress
	} from '$lib/bible/progress';
	import * as Card from '$lib/components/ui/card';

	import bibleSchedule from '$lib/bible/schedule.json';
	import * as ScrollArea from '$lib/components/ui/scroll-area';

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

	let api = $state<CarouselAPI>();

	let current = $state(todayIndex);

	$effect(() => {
		if (api) {
			current = api.selectedScrollSnap();

			const snapl = api.scrollSnapList().length;
			api.on('scroll', () => {
				const scrollp = api?.scrollProgress() ?? 0;
				const nearestSnap = Math.round(scrollp * (snapl - 1));
				current = nearestSnap;
			});
		}
	});

	const handlePrevious = () => {
		api?.scrollPrev();
	};

	const handleNext = () => {
		api?.scrollNext();
	};

	// CarouselArray will be an array of objects, each object will have a year and month, we will start from 1/2024
	// to 12/2027 as the end
	const carouselData: Array<{ year: number; month: number }> = [];
	for (let year = 2024; year <= 2027; year++) {
		for (let month = 1; month <= 12; month++) {
			carouselData.push({
				year,
				month
			});
		}
	}
</script>

<Button
	class="w-full max-w-sm my-4 text-lg font-semibold h-14"
	variant="outline"
	size="icon"
	onclick={async () => {
		if (current !== todayIndex) {
			api?.scrollTo(todayIndex);
			await new Promise((resolve) => {
				setTimeout(resolve, 500); // Wait for the scroll to finish
			});
		}
		jumpToNextUnreadChapterInSchedule(year, month);
	}}
>
	{$t('chapterToday')}
</Button>

<Carousel.Root
	setApi={(emblaApi) => (api = emblaApi as CarouselAPI)}
	opts={{
		align: 'center',
		loop: false,
		startIndex: todayIndex,
		slidesToScroll: 1,
		containScroll: 'trimSnaps',
		dragFree: false,
		skipSnaps: true
	}}
	class="w-full max-w-sm overflow-x-clip"
>
	<Carousel.Content class="overflow-y-visible">
		<!-- This is a hack to make the first item visible -->
		<Carousel.Item class="basis-1/3" />
		{#each carouselData as item, index}
			{@const itemProgress = getMonthlyProgress(item.year, item.month)}
			<Carousel.Item class="relative basis-1/3">
				<div
					class={cn(
						'transition-all duration-300 ease-in-out',
						current === index ? 'scale-100' : 'scale-90 brightness-[0.4]'
					)}
				>
					<Card.Root
						class={cn('relative overflow-hidden transition-all', {
							'bg-primary-foreground border-yellow-300 font-bold text-yellow-300 ':
								index === todayIndex,
							'border-green-500': itemProgress == 100,
							'active:scale-110 active:opacity-60': current === index
						})}
						onclick={() => {
							api?.scrollTo(index);
						}}
					>
						<!-- Progress background -->
						<div
							class={cn(
								'absolute bottom-0 left-0 right-0 transition-all duration-500 bg-green-500/20',
								{
									'bg-green-500/40': itemProgress == 100
								}
							)}
							style="height: {itemProgress}%"
						></div>

						<Card.Content
							class={cn('relative flex flex-col items-center justify-center p-1 aspect-square', {})}
						>
							<div class="text-3xl font-semibold">{item.month}{'月'}</div>
							<div
								class={cn('text-base font-semibold text-gray-500', {
									'bg-primary-foreground font-bold text-yellow-300': index === todayIndex
								})}
							>
								{item.year - 2000}
								{'年'}
							</div>
							<!-- Progress percentage text -->
							<div class="mt-1 text-xs opacity-75">
								{itemProgress}%
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			</Carousel.Item>
		{/each}
		<!-- This is a hack to make the last item visible -->
		<Carousel.Item class="basis-1/3" />
	</Carousel.Content>
</Carousel.Root>

<ScrollArea.Root class="w-full max-w-sm max-h-[9rem] mt-4" type="auto">
	{#each schedule[carouselData[current].year][carouselData[current].month] as chap}
		<Button
			class="w-full my-1 bg-black h-14 "
			variant="outline"
			size="lg"
			onclick={() => jumpToChapterWithProgress(chap.scroll)}
		>
			<div class="flex items-center justify-center">
				<span class="text-lg font-semibold">{bibleChinese[chap.scroll]}</span>
				<span class="ml-2 opacity-85">{chap.start}-{chap.end}</span>
			</div>
		</Button>
	{/each}
</ScrollArea.Root>
