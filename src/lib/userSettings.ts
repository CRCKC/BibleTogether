import { persisted } from "svelte-persisted-store";

interface Settings {
    autoComplete: boolean
}

export const settingsStore = persisted<Settings>(
    'settings',
    {
        autoComplete: false,
    },
    {
        syncTabs: true,
    }
);