<script lang="ts">
	import { firebaseAuth, firebaseFirestore } from '$lib/firebase/firebase';
	import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
	import type { PageData } from './$types';
	import { bibleIndex, bibleList, bibleChinese } from '$lib/bible/constants';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import type { UserData } from '$lib/firebase/firestore';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';

	let { data }: { data: PageData } = $props();
	let selectedScroll: string = $state('ROM');
	let loading = $state(false);
	let results: Array<{
		userId: string;
		displayName: string | null;
		fellowshipGroup: string | null;
		chapterProgress: boolean[];
		completionPercentage: number;
	}> = $state([]);

	async function queryAllUsers() {
		loading = true;
		try {
			// Get starting index for the selected scroll
			const startingIndex = bibleIndex[selectedScroll];
			const totalChapters = bibleList[selectedScroll] + 1;

			// Query all users in the bibleProgress collection
			const coll = collection(firebaseFirestore, 'bibleProgress');
			const querySnapshot = await getDocs(coll);

			// Process progress data
			const userProgress = querySnapshot.docs.map((doc) => ({
				userId: doc.id,
				progress: doc.data()
			}));

			// Batch get user data
			const userDataPromises = userProgress.map(async ({ userId }) => {
				const userDoc = await getDoc(doc(firebaseFirestore, 'userData', userId));
				return { userId, userData: userDoc.data() as UserData | undefined };
			});
			const userData = await Promise.all(userDataPromises);
			const userDataMap = new Map(userData.map(({ userId, userData }) => [userId, userData]));

			// Combine and process results
			results = userProgress.map(({ userId, progress }) => {
				const userData = userDataMap.get(userId);
				const chapterProgress = Array.from({ length: totalChapters }, (_, i) =>
					Boolean(progress[(startingIndex + i).toString()])
				);
				const completedChapters = chapterProgress.filter(Boolean).length;

				return {
					userId,
					displayName: userData?.displayName || 'Anonymous',
					fellowshipGroup: userData?.fellowshipGroup || 'None',
					chapterProgress,
					completionPercentage: (completedChapters / totalChapters) * 100
				};
			});
			console.log('Results:', results);

			// Sort by completion percentage descending
			results.sort((a, b) => b.completionPercentage - a.completionPercentage);
		} catch (error) {
			console.error('Error querying users:', error);
			results = [];
		} finally {
			loading = false;
		}
	}
</script>

<div class="p-4 space-y-4">
	<div class="flex items-center gap-4">
		<Select.Root type="single" bind:value={selectedScroll}>
			<Select.Trigger class="w-48">{selectedScroll}</Select.Trigger>
			<Select.Content>
				{#each Object.entries(bibleChinese) as [key, name]}
					<Select.Item value={key}>{name}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>

		<Button onclick={queryAllUsers} disabled={loading}>
			{loading ? 'Querying...' : 'Query Progress'}
		</Button>
	</div>

	{#if results.length > 0}
		<ScrollArea class="border rounded-md">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>User</TableHead>
						<TableHead>Fellowship</TableHead>
						<TableHead>Chapters</TableHead>
						<TableHead>Completion</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each results as { displayName, fellowshipGroup, chapterProgress, completionPercentage }}
						<TableRow>
							<TableCell>{displayName}</TableCell>
							<TableCell>{fellowshipGroup}</TableCell>
							<TableCell>
								<div class="flex gap-1">
									{#each chapterProgress as completed, i}
										<div
											class="w-2 h-2 rounded-full"
											class:bg-green-500={completed}
											class:bg-gray-200={!completed}
											title={completed ? 'Completed' : 'Not completed'}
										/>
									{/each}
								</div>
							</TableCell>
							<TableCell>{completionPercentage.toFixed(1)}%</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</ScrollArea>
	{:else if !loading}
		<div class="p-4 text-center text-gray-500">
			No results to display. Select a scroll and click Query Progress to begin.
		</div>
	{/if}
</div>
