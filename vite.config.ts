import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { readFileSync } from 'fs';


export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		https: {
			key: process.env.NODE_ENV === 'production' ? undefined : readFileSync('certs/key.pem'),
			cert: process.env.NODE_ENV === 'production' ? undefined : readFileSync('certs/cert.pem'),
		},
		proxy: {
			'/__/auth': {
				target: 'https://bibletogether.firebaseapp.com',
				changeOrigin: true,
			},
			'/BibleTogether/__/auth': {
				target: 'https://bibletogether.firebaseapp.com',
				changeOrigin: true,
			},
		},
	},
});
