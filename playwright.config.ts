import type { PlaywrightTestConfig } from '@playwright/test';

const port = Number(process.env.PLAYWRIGHT_PORT ?? 4000);

const config: PlaywrightTestConfig = {
	globalSetup: './tests/support/playwright-global.ts',
	webServer: {
		command: `bun run vbuild && bun run preview -- --port ${port}`,
		port,
		timeout: 120_000,
		env: {
			...process.env,
			PUBLIC_USE_FIREBASE_EMULATOR: 'true'
		}
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	testIgnore: /rules-tests/,
	use: {
		baseURL: `http://127.0.0.1:${port}`
	}
};

export default config;
