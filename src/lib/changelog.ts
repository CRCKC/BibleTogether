import { browser } from '$app/environment';
import packageJson from '../../package.json';

export type ChangelogLocale = 'en' | 'zh';

export interface ChangelogCopy {
	title: string;
	items: readonly string[];
}

export interface ChangelogEntry {
	version: string;
	date: string;
	en: ChangelogCopy;
	zh: ChangelogCopy;
}

export interface VersionStorage {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
}

export const currentVersion = packageJson.version;
export const changelogStorageKey = 'bibletogether:last-seen-changelog-version';

export const changelogEntries: readonly ChangelogEntry[] = [
	{
		version: '0.0.2',
		date: '2026-08-14',
		en: {
			title: "What's new",
			items: [
				'Read what changed in each app update.',
				'Reopen the full release history from Settings.'
			]
		},
		zh: {
			title: '更新內容',
			items: ['查看每次更新的內容。', '從設定重新查看完整更新記錄。']
		}
	}
];

export function getChangelogCopy(entry: ChangelogEntry, locale: string): ChangelogCopy {
	return locale === 'zh' ? entry.zh : entry.en;
}

export function shouldShowChangelogNotice(
	lastSeenVersion: string | null,
	version = currentVersion
): boolean {
	return Boolean(lastSeenVersion && lastSeenVersion !== version);
}

export function readLastSeenVersion(
	storage: VersionStorage | null = browser ? localStorage : null
): string | null {
	if (!storage) return null;

	try {
		const value = storage.getItem(changelogStorageKey);
		return value && value.trim() ? value : null;
	} catch {
		return null;
	}
}

export function markLastSeenVersion(
	version: string,
	storage: VersionStorage | null = browser ? localStorage : null
): boolean {
	if (!storage || !version.trim()) return false;

	try {
		storage.setItem(changelogStorageKey, version);
		return true;
	} catch {
		return false;
	}
}
