<script lang="ts">
	import { Checkbox as CheckboxPrimitive, type WithoutChildrenOrChild } from 'bits-ui';
	import Check from 'lucide-svelte/icons/check';
	import Minus from 'lucide-svelte/icons/minus';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		checked = $bindable(false),
		class: className,
		...restProps
	}: WithoutChildrenOrChild<CheckboxPrimitive.RootProps> = $props();
</script>

<CheckboxPrimitive.Root
	bind:ref
	class={cn(
		'border-primary ring-offset-background focus-visible:ring-ring data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground peer box-content size-4 shrink-0 rounded-sm border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50',
		className
	)}
	bind:checked
	{...restProps}
>
	{#snippet children({ checked })}
		<div class="flex items-center justify-center text-current size-4">
			{#if checked === null}
				<Minus class="size-4" />
			{:else}
				<Check strokeWidth={4} class={cn('size-4', !checked && 'text-transparent')} />
			{/if}
		</div>
	{/snippet}
</CheckboxPrimitive.Root>
