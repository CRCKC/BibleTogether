<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { toast } from 'svelte-sonner';

	import { defaults, superForm, superValidate } from 'sveltekit-superforms';
	import { zod, zodClient } from 'sveltekit-superforms/adapters';
	import { FeedbackFormSchema, FeedbackFormTypes } from './feedbackForm';
	import { t } from 'svelte-i18n';

	const form = superForm(defaults(zod(FeedbackFormSchema)), {
		validators: zodClient(FeedbackFormSchema),
		SPA: true,
		onSubmit: async () => {
			const form = await superValidate(zod(FeedbackFormSchema));
			console.log(form);
		},
		onUpdated: ({ form: f }) => {
			if (f.valid) {
				toast.success(`You submitted ${JSON.stringify(f.data, null, 2)}`);
			} else {
				toast.error('Please fix the errors in the form.');
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<!-- center the div -->
<div class="flex justify-center w-full">
	<form use:enhance method="POST" class="w-full max-w-lg p-8">
		<Form.Field {form} name="title">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{$t('feedback_title')}</Form.Label>
					<Input {...props} bind:value={$formData.title} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="type">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{$t('feedback_type')}</Form.Label>
					<Select.Root type="single" bind:value={$formData.type} name={props.name}>
						<Select.Trigger {...props}>
							{$t(`feedback_type-${$formData.type}`) ?? 'Select a verified email to display'}
						</Select.Trigger>
						<Select.Content>
							{#each FeedbackFormTypes as type}
								<Select.Item value={type} label={$t(`feedback_type-${type}`)} />
							{/each}
						</Select.Content>
					</Select.Root>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Field {form} name="description">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>{$t('feedback_description')}</Form.Label>
					<Textarea
						{...props}
						placeholder={$t('feedback_description_d')}
						class="h-40 resize-none"
						bind:value={$formData.description}
					/>
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Form.Button class="w-full">{$t('feedback_submit')}</Form.Button>
	</form>
</div>
