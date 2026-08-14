import { expect, test } from '@playwright/test';

test('unauthenticated changelog deep links follow the existing login redirect', async ({
	page
}) => {
	await page.addInitScript(() => localStorage.setItem('firstVisit', 'false'));
	await page.goto('/changelog');
	await expect(page).toHaveURL(/\/login\/?$/);
});
