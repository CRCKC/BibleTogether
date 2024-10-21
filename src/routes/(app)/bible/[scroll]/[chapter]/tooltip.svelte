<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';

	export let text: string;
</script>

<Popover.Root>
	<Popover.Trigger>
		<span class="text-base material-symbols-outlined"> info </span>
	</Popover.Trigger>
	<Popover.Content class="w-80">
		{text}
	</Popover.Content>
</Popover.Root>
