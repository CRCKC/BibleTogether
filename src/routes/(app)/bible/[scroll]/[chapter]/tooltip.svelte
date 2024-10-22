<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { settingsStore } from '$lib/userSettings';

	import Info from '~icons/material-symbols/info';
	export let text: string;
</script>

<!-- TODO Try to make this button inline with the text -->
<Popover.Root>
	<Popover.Trigger class="inline-block">
		<span class="text-sm text-blue-300"> <Info /> </span>
	</Popover.Trigger>
	<Popover.Content class={`bg-gray-700 w-[20rem*${$settingsStore.fontZoom}] max-w-[80%]`}>
		<div style="zoom: {$settingsStore.fontZoom};">
			{text}
		</div>
		<Popover.Arrow />
	</Popover.Content>
</Popover.Root>

<!-- display: inline; margin: 0 0.125em; padding: 0; vertical-align: baseline; -->
