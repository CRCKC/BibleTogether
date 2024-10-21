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
			key: process.env.NODE_ENV === 'production' ? undefined : readFileSync('certs/localhost-key.pem'),
			cert: process.env.NODE_ENV === 'production' ? undefined : readFileSync('certs/localhost.pem'),
			// key: readFileSync('certs/localhost-key.pem'),
			// cert: readFileSync('certs/localhost.pem'),
		},
		proxy: {},
	},
	preview: {
		port: 4000,
	},
});
