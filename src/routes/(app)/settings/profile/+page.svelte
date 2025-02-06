<script lang="ts">
	import { updateUserProfile } from '$lib/firebase/firestore';
	import { firebaseAuth } from '$lib/firebase/firebase';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Select from '$lib/components/ui/select';
	import Button from '$lib/components/ui/button/button.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { t } from 'svelte-i18n';
	import { toast } from 'svelte-sonner';

	let name = '';
	let gender = '';

	async function handleSubmit(e: Event) {
		e.preventDefault();

		if (!name || !gender) {
			toast.error('Please fill out all fields');
			return;
		}

		const uid = firebaseAuth.currentUser?.uid;
		if (!uid) {
			toast.error('User not logged in');
			return;
		}

		const data = { name, gender };
		const result = await updateUserProfile(uid, data);
		if (result) {
			toast.success('Profile updated successfully');
		} else {
			toast.error('Failed to update profile. Please try again.');
		}
	}
</script>

<main class="p-4">
	<h1 class="mb-4 text-2xl font-bold">Edit Profile</h1>
	<form on:submit={handleSubmit}>
		<div class="mb-4">
			<label for="name" class="block mb-1">Name</label>
			<Input id="name" type="text" bind:value={name} placeholder="Enter your name" />
		</div>
		<div class="mb-4">
			<Label class="block mb-1">Gender</Label>
			<Select.Root type="single" bind:value={gender}>
				<Select.Trigger id="gender">{$t(`profile_select_gender_${gender}`)}</Select.Trigger>

				<Select.Content>
					<Select.Item value="male">Male</Select.Item>
					<Select.Item value="female">Female</Select.Item>
					<Select.Item value="other">Other</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
		<Button type="submit">Update Profile</Button>
	</form>
</main>

<style>
	main {
		max-width: 600px;
		margin: 0 auto;
	}
</style>
