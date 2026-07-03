import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { readFileSync } from 'fs';
import Icons from 'unplugin-icons/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		Icons({
			compiler: 'svelte',
			autoInstall: true
		}),
		SvelteKitPWA({
			kit: {
				spa: true
			},

			srcDir: './src',
			mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
			strategies: 'injectManifest',
			filename: 'sw.ts',
			scope: '/',
			base: '/',
			selfDestroying: process.env.SELF_DESTROYING_SW === 'true',

			manifest: {
				name: '禮中齊讀經',
				short_name: '禮中齊讀經',
				icons: [
					{
						src: '/favicon/web-app-manifest-192x192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/favicon/web-app-manifest-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any'
					}
				],
				screenshots: [],
				start_url: '/',
				scope: '/',
				theme_color: '#000000',
				background_color: '#000000',
				description: '禮中齊讀經',
				display: 'standalone',
				prefer_related_applications: false,
				related_applications: [
					{
						platform: 'webapp',
						url: 'https://bible.crckc.org.hk/favicon/site.webmanifest'
					},
					{
						platform: 'play',
						url: 'https://play.google.com/store/apps/details?id=com.crckc.bibletogether'
					}
				]
			},
			injectManifest: {
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2,json}']
			},
			workbox: {
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2,json}']
			},
			devOptions: {
				enabled: false,
				suppressWarnings: process.env.SUPPRESS_WARNING === 'true',
				type: 'module',
				navigateFallback: '/'
			}

			// if you have shared info in svelte config file put in a separate module and use it also here
			// kit: {
			// 	includeVersionFile: true
			// }
		})
	],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	server: {
		https: {
			key: process.env.NODE_ENV === 'production' ? undefined : readFileSync('.cert/key.pem'),
			cert: process.env.NODE_ENV === 'production' ? undefined : readFileSync('.cert/cert.pem')
		},
		proxy: {}
	},
	preview: {
		port: 4000
	},
	define: {
		'process.env.NODE_ENV': '"production"'
		// 'process.env.NODE_ENV': process.env.NODE_ENV === 'production' ? '"production"' : '"development"'
	}
});
