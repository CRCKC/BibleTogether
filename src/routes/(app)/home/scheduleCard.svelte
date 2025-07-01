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
		jumpToNextUnreadChapterInSchedule
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

			api.on('select', () => {
				current = api?.selectedScrollSnap() ?? todayIndex;
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
	class="w-full max-w-sm"
>
	<Carousel.Content>
		<!-- This is a hack to make the first item visible -->
		<Carousel.Item class="basis-1/3" />
		{#each carouselData as item, index}
			<Carousel.Item class="relative basis-1/3">
				<div
					class={cn(
						'transition-all duration-300 ease-in-out',
						current === index ? 'scale-100' : 'scale-90 brightness-[0.4]'
					)}
				>
					<!-- TODO: Show reading progress by filling up % of the box green -->
					<Card.Root
						class={cn('', {
							'bg-primary-foreground border-muted-foreground font-bold text-yellow-300':
								index === todayIndex
						})}
						onclick={() => {
							api?.scrollTo(index);
						}}
					>
						<Card.Content
							class={cn('flex flex-col items-center justify-center p-1 aspect-square', {})}
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
						</Card.Content>
					</Card.Root>
				</div>
			</Carousel.Item>
		{/each}
		<!-- This is a hack to make the last item visible -->
		<Carousel.Item class="basis-1/3" />
	</Carousel.Content>
	<!-- <Carousel.Previous />
	<Carousel.Next /> -->
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

<!-- <Carousel.Root
		setApi={(emblaApi) => (api = emblaApi as CarouselAPI)}
		class="w-full max-w-sm select-none "
		orientation="vertical"
		opts={{
			align: 'center',
			loop: false,
			startIndex: todayIndex,
			slidesToScroll: 1,
			containScroll: 'trimSnaps',
			dragFree: false,
			skipSnaps: true
		}}
	>
		<Carousel.Content class="-mt-1 h-[450px]">
			{#each carouselData as item, index}
				<Carousel.Item
					class={cn('py-1 basis-[25%]', {
						'font-bold text-yellow-300': index === todayIndex
					})}
				>
					<div
						class={cn(
							'transition-all duration-300 ease-in-out flex flex-row items-center',
							current === index ? 'scale-100' : 'scale-90 brightness-[0.4]'
						)}
					>
						<div class="w-8 mr-3 text-sm text-center text-nowrap">{item.month} {'月'}</div>
						<div class="w-full p-1">
							{#each schedule[item.year][item.month] as chap}
								<Button
									class="w-full my-1 bg-black h-14
									{current != index ? 'opacity-100 bg-gray-900' : ''}"
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
						</div>
						<div class="w-10 ml-3 text-sm text-center text-nowrap">{item.year - 2000} {'年'}</div>
					</div>
				</Carousel.Item>
			{/each}

		</Carousel.Content>
	</Carousel.Root> -->
