import { describe, expect, it } from 'vitest';
import packageJson from '../../package.json';
import {
	changelogEntries,
	changelogStorageKey,
	currentVersion,
	getChangelogCopy,
	markLastSeenVersion,
	readLastSeenVersion,
	shouldShowChangelogNotice,
	type VersionStorage
} from './changelog';

function createStorage(initial?: string): VersionStorage {
	let value = initial ?? null;
	return {
		getItem: () => value,
		setItem: (_key, nextValue) => {
			value = nextValue;
		}
	};
}

describe('changelog', () => {
	it('keeps the newest release aligned with the package version', () => {
		expect(currentVersion).toBe(packageJson.version);
		expect(changelogEntries[0]?.version).toBe(currentVersion);
		expect(new Set(changelogEntries.map((entry) => entry.version)).size).toBe(
			changelogEntries.length
		);
	});

	it('selects the requested locale and falls back to English', () => {
		const entry = changelogEntries[0];
		expect(entry).toBeDefined();
		if (!entry) return;

		expect(getChangelogCopy(entry, 'zh')).toEqual(entry.zh);
		expect(getChangelogCopy(entry, 'en')).toEqual(entry.en);
		expect(getChangelogCopy(entry, 'fr')).toEqual(entry.en);
	});

	it('shows a notice only for an existing different version', () => {
		expect(shouldShowChangelogNotice(null, currentVersion)).toBe(false);
		expect(shouldShowChangelogNotice(currentVersion, currentVersion)).toBe(false);
		expect(shouldShowChangelogNotice('0.0.1', currentVersion)).toBe(true);
	});

	it('reads and writes a non-empty version marker', () => {
		const storage = createStorage();
		expect(readLastSeenVersion(storage)).toBeNull();
		expect(markLastSeenVersion(currentVersion, storage)).toBe(true);
		expect(readLastSeenVersion(storage)).toBe(currentVersion);
		expect(storage.getItem(changelogStorageKey)).toBe(currentVersion);
	});

	it('ignores empty markers and storage failures', () => {
		expect(readLastSeenVersion(createStorage('  '))).toBeNull();
		expect(markLastSeenVersion('', createStorage())).toBe(false);

		const unavailable: VersionStorage = {
			getItem: () => {
				throw new Error('storage unavailable');
			},
			setItem: () => {
				throw new Error('storage unavailable');
			}
		};
		expect(readLastSeenVersion(unavailable)).toBeNull();
		expect(markLastSeenVersion(currentVersion, unavailable)).toBe(false);
	});
});
