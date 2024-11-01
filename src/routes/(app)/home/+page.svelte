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
	// export let data: PageData;

	// Get Today's year and month
	const today = new Date();
	const year = today.getFullYear();
	const month = today.getMonth() + 1;
	const todayIndex = (year - 2024) * 12 + month - 1;

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

	const schedule = bibleSchedule as {
		[year: number]: {
			[month: number]: Array<{
				scroll: string;
				start: number;
				end: number;
			}>;
		};
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

<div class="flex flex-col items-center justify-center w-full h-full p-6">
	<Button
		variant="secondary"
		class="p-6 mb-4 text-2xl text-center rounded-full"
		onclick={() => api?.scrollTo(todayIndex)}
	>
		{$t('currentMonth', { values: { month, year } })}
	</Button>
	<Carousel.Root
		setApi={(emblaApi) => (api = emblaApi)}
		class="w-full max-w-xs select-none "
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
			<!-- This is a hack to make the first item visible -->
			<Carousel.Item class="py-1 basis-1/3" />
			{#each carouselData as item, index}
				<Carousel.Item
					class={cn('py-1 basis-1/3', {
						'font-bold text-yellow-300': index === todayIndex
					})}
				>
					<div
						class={cn(
							'transition-all duration-300 ease-in-out flex flex-row items-center',
							current === index
								? 'scale-100 opacity-100 shadow-none'
								: 'scale-95 opacity-50 shadow-md'
						)}
					>
						<div class="w-8 mr-3 text-center">{item.month}</div>
						<div class="w-full p-1">
							{#each schedule[item.year][item.month] as chap}
								<Button
									class="w-full my-1 h-14"
									variant="outline"
									disabled={current != index}
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
						<div class="w-8 ml-3 text-center">{item.year - 2000}</div>
					</div>
				</Carousel.Item>
			{/each}
			<!-- This is a hack to make the last item visible -->
			<Carousel.Item class="py-1 basis-1/3" />
		</Carousel.Content>
		<div
			class="absolute top-0 left-0 right-0 h-20 pointer-events-none bg-gradient-to-b from-background to-transparent"
		></div>
		<div
			class="absolute bottom-0 left-0 right-0 h-20 pointer-events-none bg-gradient-to-t from-background to-transparent"
		></div>
	</Carousel.Root>

	<!-- <div class="flex justify-between mt-4">
        <Button
          class="rounded-full"
          variant="outline"
          size="icon"
          onclick={handlePrevious}
          disabled={current === 0}
        >
          <ArrowLeft class='text-xl' />
        </Button>
        <Button
          class="rounded-full"
          variant="outline"
          size="icon"
          onclick={handleNext}
          disabled={current === carouselData.length - 1}
        >
          <ArrowRight class='text-xl'/>
        </Button> -->
	<!-- </div> -->
</div>
