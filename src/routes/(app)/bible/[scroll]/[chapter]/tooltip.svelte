<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { settingsStore } from '$lib/userSettings';

	import Info from '~icons/material-symbols/info';
	interface Props {
		text: string;
		boundary: HTMLElement; // Optional boundary element id
	}

	let { text, boundary }: Props = $props();
	// Find the element with the id="bible-scroll-area"
</script>

<!-- TODO Try to make this button inline with the text -->
<!-- update: it now kinda looks like its inline using relative and top-0.5 -->
<span class="bible-tooltip">
	<Popover.Root>
		<Popover.Trigger class="relative top-0.5">
			<span class="text-sm text-blue-300"> <Info class="text-justify" /> </span>
		</Popover.Trigger>
		<Popover.Content
			class={`bg-gray-700 z-10`}
			avoidCollisions={true}
			collisionBoundary={boundary}
			hideWhenDetached
		>
			<Popover.Arrow class="text-gray-700" />
			<div style="zoom: {$settingsStore.fontZoom};">
				{text}
			</div>
		</Popover.Content>
	</Popover.Root>
</span>
<!-- display: inline; margin: 0 0.125em; padding: 0; vertical-align: baseline; -->
