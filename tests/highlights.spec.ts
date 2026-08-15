import { expect, test } from '@playwright/test';
import {
	blockProductionFirebase,
	seedHighlightFixture,
	signInVerifiedUser
} from './support/highlights';

const chapter = '/bible/GEN/1';

test.beforeEach(async ({ page }) => {
	await blockProductionFirebase(page);
	await page.addInitScript(() => localStorage.setItem('firstVisit', 'false'));
	await page.goto('/login');
	await signInVerifiedUser(page);
	await seedHighlightFixture(page);
	await page.reload();
	await page.goto(chapter);
	await expect(page.locator('.bible')).toBeVisible({ timeout: 15_000 });
});

test('enhances verse markers with sequential, localized controls', async ({ page }) => {
	const markers = page.locator('.bible button[data-verse-marker="true"]');
	await expect(markers).toHaveCount(3);
	await expect(markers.nth(0)).toHaveAttribute('aria-label', /1/);
	await expect(markers.nth(0)).toHaveAttribute('tabindex', '0');
	await expect(markers.nth(0)).toHaveAttribute('aria-pressed', 'false');
	await expect(page.locator('.bible').locator('a button')).toHaveCount(0);
});

test('toggles by keyboard and preserves focus and text selection surface', async ({ page }) => {
	const marker = page.locator('.bible button[data-verse-id="GEN:1:1"]');
	await marker.focus();
	await page.keyboard.press('Space');
	await expect(marker).toHaveAttribute('aria-pressed', 'true');
	await expect(page.locator('[data-verse-id="GEN:1:1"].verse-highlighted')).toBeVisible();
	await expect(marker).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(marker).toHaveAttribute('aria-pressed', 'false');
});

test('opens the shared palette and applies preset and custom colors', async ({ page }) => {
	const marker = page.locator('.bible button[data-verse-id="GEN:1:1"]').first();
	await marker.click();
	const colorControl = page.locator(
		'.bible button[data-verse-color-control="true"][data-verse-color-id="GEN:1:1"]'
	);
	await expect(colorControl).toBeVisible();
	await colorControl.click();
	const palette = page.locator('.highlight-palette');
	await expect(palette).toBeVisible();
	await expect(palette.locator('.color-swatch')).toHaveCount(5);
	await palette.locator('.color-swatch').nth(1).click();
	await expect(page.locator('[data-verse-id="GEN:1:1"].verse-highlighted')).toHaveAttribute(
		'data-highlight-color',
		'#60a5fa'
	);
	await colorControl.evaluate((element) => {
		element.style.position = 'fixed';
		element.style.top = 'calc(100vh - 24px)';
	});
	await colorControl.dispatchEvent('click');
	await palette.locator('.palette-action').first().click();
	await expect(palette.locator('.hue-thumb')).toBeVisible();
	const paletteBox = await palette.boundingBox();
	const viewport = page.viewportSize();
	expect(paletteBox).not.toBeNull();
	expect(viewport).not.toBeNull();
	expect(paletteBox!.y + paletteBox!.height).toBeLessThanOrEqual(viewport!.height);
	await palette.locator('input[maxlength="7"]').fill('#12ABc0');
	await palette.locator('.save').click();
	await expect(page.locator('[data-verse-id="GEN:1:1"].verse-highlighted')).toHaveAttribute(
		'data-highlight-color',
		'#12abc0'
	);
	await colorControl.dispatchEvent('click');
	await expect(palette.locator('.saved-colors .color-swatch')).toHaveCount(1);
});

test('uses the selected default for newly created highlights', async ({ page }) => {
	await page.goto('/settings');
	const presetDefaults = page.locator('.highlight-preferences .preference-action');
	await expect(presetDefaults).toHaveCount(5);
	await presetDefaults.nth(1).click();
	await expect(presetDefaults.nth(1)).toHaveAttribute('aria-pressed', 'true');
	await page.goto(chapter);
	await expect(page.locator('.bible')).toHaveAttribute('aria-busy', 'false');
	const marker = page.locator('.bible button[data-verse-id="GEN:1:3"]').first();
	await marker.click();
	await expect(page.locator('[data-verse-id="GEN:1:3"].verse-highlighted')).toHaveAttribute(
		'data-highlight-color',
		'#60a5fa'
	);
});

test('keeps app pages above the bottom navigation', async ({ page }) => {
	for (const path of ['/settings', '/home']) {
		await page.goto(path);
		const content = page.locator('[data-app-content]');
		const navigation = page.locator('[data-bottom-navigation]');
		await expect(content).toBeVisible();
		await expect(navigation).toBeVisible();
		if (path === '/settings') {
			await page.locator('[data-highlight-preferences-trigger]').click();
			await expect(page.locator('.highlight-preferences')).toBeVisible();
		}
		await content.evaluate((element) => element.scrollTo(0, element.scrollHeight));
		const contentBox = await content.boundingBox();
		const navigationBox = await navigation.boundingBox();
		expect(contentBox).not.toBeNull();
		expect(navigationBox).not.toBeNull();
		expect(contentBox!.y + contentBox!.height).toBeLessThanOrEqual(navigationBox!.y);
	}
});

test('keeps the reading surface usable at mobile zoom', async ({ page }) => {
	await page.setViewportSize({ width: 375, height: 667 });
	for (const zoom of ['0.5', '1', '2']) {
		await page.evaluate(
			(value) =>
				localStorage.setItem(
					'settings',
					JSON.stringify({ autoCheck: false, fontZoom: Number(value) })
				),
			zoom
		);
		await page.reload();
		const marker = page.locator('.bible button[data-verse-marker="true"]').first();
		await expect(marker).toBeVisible();
		await expect(marker).toHaveCSS('min-width', '24px');
	}
});
