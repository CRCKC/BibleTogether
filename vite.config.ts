import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { readFileSync } from 'fs';
import Icons from 'unplugin-icons/vite'

export default defineConfig({
	plugins: [
		sveltekit(),
		Icons({
			compiler: 'svelte',
			autoInstall: true,
		}),
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		https: {
			key: process.env.NODE_ENV === 'production' ? undefined : readFileSync('.cert/key.pem'),
			cert: process.env.NODE_ENV === 'production' ? undefined : readFileSync('.cert/cert.pem'),
			// key: readFileSync('.cert/key.pem'),
			// cert: readFileSync('.cert/cert.pem'),
		},
		proxy: {},
	},
	preview: {
		port: 4000,
	}
});
