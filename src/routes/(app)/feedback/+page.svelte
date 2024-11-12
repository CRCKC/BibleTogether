<script lang="ts">
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { toast } from 'svelte-sonner';

	import { defaults, superForm, superValidate } from 'sveltekit-superforms';
	import { zod, zodClient } from 'sveltekit-superforms/adapters';
	import { z } from 'zod';
	import { t } from 'svelte-i18n';

	export const FeedbackFormSchema = z.object({
		title: z.string().min(2).max(50),
		description: z.string().min(2).max(500),
		type: z.enum(['bug', 'feature', 'other'])
	});

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
							<Select.Item value="bug" label={$t('feedback_type-bug')} />
							<Select.Item value="feature" label={$t('feedback_type-feature')} />
							<Select.Item value="other" label={$t('feedback_type-other')} />
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
