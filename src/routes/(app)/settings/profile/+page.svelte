<script lang="ts">
	import { fetchUserData, updateUserProfile, type UserData } from '$lib/firebase/firestore';
	import { firebaseAuth } from '$lib/firebase/firebase';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Select from '$lib/components/ui/select';
	import Button from '$lib/components/ui/button/button.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { t } from 'svelte-i18n';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import ArrowBack from '~icons/material-symbols/arrow-back';

	let userData = $state<UserData>();
	let initialUserData = $state<UserData>();

	let edited = $derived(
		userData?.displayName !== initialUserData?.displayName ||
			userData?.fellowshipGroup !== initialUserData?.fellowshipGroup
	);

	fetchUserData().then((d) => {
		userData = d;
		initialUserData = d;
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!userData?.displayName) {
			// if (!userData?.displayName || !userData.fellowshipGroup) {
			// This should not happen
			throw new Error('Please fill out all fields');
		}

		const uid = firebaseAuth.currentUser?.uid;
		if (!uid) {
			// This should not happen
			throw new Error('User not logged in, but this should not happen');
		}

		const result = await updateUserProfile(uid, userData);
		if (result) {
			toast.success($t('profile_page_submit_success'));
			initialUserData = userData;
		} else {
			toast.error($t('profile_page_submit_error'));
		}
	}

	function goBack() {
		goto('/settings');
	}
</script>

<main class="max-w-xl p-4 mx-auto">
	<button onclick={goBack} class="inline mr-2 text-lg"><ArrowBack /></button>
	<h1 class="inline text-2xl font-bold">{$t('profile_page_edit')}</h1>
	{#if userData}
		<form class="mt-4" onsubmit={handleSubmit}>
			<div class="mb-4">
				<label for="name" class="block mb-1">{$t('profile_page_displayName')}</label>
				<Input
					id="name"
					type="text"
					bind:value={userData.displayName}
					placeholder={$t('profile_page_displayName_placeholder')}
				/>
			</div>
			<!-- <div class="mb-4">
				<Label class="block mb-1">Gender</Label>
				<Select.Root type="single" bind:value={userData.fellowshipGroup as string}>
					<Select.Trigger id="gender"
						>{$t(`profile_select_gender_${userData.fellowshipGroup}`)}</Select.Trigger
					>
					<Select.Content>
						<Select.Item value="male">Male</Select.Item>
						<Select.Item value="female">Female</Select.Item>
						<Select.Item value="other">Other</Select.Item>
					</Select.Content>
				</Select.Root>
			</div> -->
			<Button type="submit" disabled={!edited}>{$t('profile_page_submit')}</Button>
		</form>
	{/if}
</main>
