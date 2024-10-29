import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { readFileSync } from 'fs';
import Icons from 'unplugin-icons/vite'
// import basicSsl from '@vitejs/plugin-basic-ssl'
import mkcert from'vite-plugin-mkcert'

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
			// key: readFileSync('./.certs/dev.pem'),
			// cert: readFileSync('./.certs/cert.pem'),
		},
		proxy: {},
	},
	preview: {
		port: 4000,
	},
});
