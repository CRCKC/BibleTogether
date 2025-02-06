import { persisted } from 'svelte-persisted-store';

interface Settings {
	autoCheck: boolean;
	fontZoom: number;
}

export const settingsStore = persisted<Settings>(
	'settings',
	{
		autoCheck: false,
		fontZoom: 1
	},
	{
		syncTabs: true
	}
);
