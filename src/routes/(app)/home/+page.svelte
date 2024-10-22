<script lang="ts">
	import { session } from '$lib/session';
	// import type { PageData } from './$types';
	import bibleSchedule from '$lib/data/bibleSchedule.json';
  
	import { onMount } from 'svelte';
  //   import { BookOpen } from 'lucide-svelte';
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Carousel from "$lib/components/ui/carousel/index.js";
  import Button from '$lib/components/ui/button/button.svelte';
	import type { CarouselAPI } from '$lib/components/ui/carousel/context';
	import { cn } from '$lib/utils';
	import { bibleChinese } from '$lib/bible';
  // export let data: PageData;

  // Get Today's year and month
	const today = new Date();
	const year = today.getFullYear();
	const month = today.getMonth() + 1;
  const todayIndex = (year - 2024)*12 + month - 1;

  let api: CarouselAPI;

  let current = todayIndex;

  $: if (api) {
    current = api.selectedScrollSnap();
 
    api.on("select", () => {
      current = api.selectedScrollSnap();
    });
  }

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
  const carouselData: Array<{year:number, month:number}> = [];
  for (let year = 2024; year <= 2027; year++) {
    for (let month = 1; month <= 12; month++) {
      carouselData.push({
        year,
        month,
      });
    }
  }

	// let user: any;
	// let name: string;

	// $: if (user && user.displayName) {
	// 	name = user.displayName;
	// } else {
	// 	name = 'Unknown User';
	// }

	// $: try {
	// 	if ($session.user) {
	// 		user = $session.user;
	// 	}
	// } catch (error) {
	// 	// For some reason it thorws an error even when I use if($session.user) to check if its undefined
	// 	user = undefined;
	// }
</script>

<!-- Think of a good homepage layout, the layout needs two main thing, a hello message, and the schedule of the current month, like which verse and scroll the user should be reading -->
<!-- <div class="flex flex-col items-center justify-center h-full p-6 text-center text-white">
	<h1 class="mb-4 text-4xl font-bold">Hello, {name}</h1>
	<p class="mb-3 text-xl">Today is {year}/{month}</p>
	<p class="text-xl">
		You should be reading <span class="font-bold text-yellow-300"
			>{schedule[year][month][0].scroll}</span
		> today
	</p>
</div> -->

<div class="flex flex-col items-center justify-center h-full p-6">
  <Card.Root class="w-full max-w-md">
    <Card.Header>
      <Card.Title class="text-center">
        <Button variant="outline" class="text-2xl text-center p-6" on:click={()=>api.scrollTo(todayIndex)}>
          Today is {year} / {month}
        </Button>
      </Card.Title>
    </Card.Header>
    <Card.Content>
      <Carousel.Root
        bind:api
        class="w-full max-w-xs mx-auto"
        orientation="vertical"
        opts={{
          align: 'center',
          loop: false,
          startIndex: todayIndex,
          slidesToScroll: 1,
        }}
      >
        <Carousel.Content class="-mt-1 h-[400px]"> 
          <!-- This is a hack to make the first item visible -->
          <Carousel.Item class="py-1 basis-1/3"/>
          {#each carouselData as item, index}
            <Carousel.Item class="py-1 basis-1/3">
              <div class="p-1">
                <Card.Root class={cn(
                  'transition-all duration-300 ease-in-out',
                  current === index ? 'scale-100 opacity-100 shadow-none' : 'scale-95 opacity-50 shadow-md'
                )}>
                  <Card.Content class="flex flex-col items-center justify-center p-6">
                    {#each schedule[item.year][item.month] as chap}
                    <span class="text-xl font-semibold">{bibleChinese[chap.scroll]}</span>
                    <span class="text-center mt-2">{chap.start} - {chap.end}</span>
                    {/each}
                  </Card.Content>
                </Card.Root>
              </div>
            </Carousel.Item>
          {/each}
          <!-- This is a hack to make the last item visible -->
          <Carousel.Item class="py-1 basis-1/3"/> 
        </Carousel.Content>
        <div class="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background to-transparent pointer-events-none" />
        <div class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </Carousel.Root>

      <div class="flex justify-between mt-4">
        <Button
          variant="outline"
          on:click={handlePrevious}
          disabled={current === 0}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          on:click={handleNext}
          disabled={current === carouselData.length - 1}
        >
          Next
        </Button>
      </div>
    </Card.Content>
    <Card.Footer class="flex justify-center">
      <Button class="w-full max-w-xs" size="lg">
        <!-- <BookOpen class="mr-2 h-5 w-5" />  -->
		Read Current Chapter
      </Button>
    </Card.Footer>
  </Card.Root>
</div>

