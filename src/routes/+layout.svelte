<script lang="ts">
	interface Window {
		installApp: () => void;
	}
	import type { LayoutData } from './$types';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { base } from '$app/paths';
	import { session } from '$lib/session.svelte';
	import '../app.css';
	import { getGoogleRedirectResult } from '$lib/firebase/auth';
	import '../i18n';
	import { ModeWatcher, setMode } from 'mode-watcher';
	import initLocale from '../i18n';
	import { firstVisitStore } from '$lib/utils/firstVisit.svelte';
	import type { PWAInstallElement } from '@khmyznikov/pwa-install';
	import '@khmyznikov/pwa-install';

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet<[any]>;
	}

	let { data, children }: Props = $props();

	let loadingResult = $state(true);

	let firstVisit = firstVisitStore();

	let pwaInstallRef: PWAInstallElement;

	function handlePWAInstall() {
		if (pwaInstallRef) {
			if (!pwaInstallRef.isUnderStandaloneMode) {
				pwaInstallRef.showDialog(true);
			}
		}
	}
	handlePWAInstall();

	onMount(async () => {
		setMode('dark'); // TODO Default to dark mode first, maybe add light mode in the future

		if (firstVisit.value == true) {
			firstVisit.value = false;
			console.log('First Visit');
			await goto(base + '/signup');
		} else {
			console.log('Logging In');
			await autoLogin();
		}

		loadingResult = false;
	});

	async function autoLogin() {
		await getGoogleRedirectResult();

		const user: any = await data.getAuthUser?.();

		const loggedIn = !!user && user?.emailVerified;
		session.update((cur: any) => {
			return {
				...cur,
				user,
				loggedIn,
				loading: false
			};
		});
		// console.log('Session', $session);
		if (loggedIn) {
			if (!data.requireLogin) await goto(base + '/home');
		} else {
			await goto(base + '/login');
		}
	}
</script>

<svelte:head>
	<script>
		let deferredPrompt;

		if ('BeforeInstallPromptEvent' in window) {
			console.log('⏳ BeforeInstallPromptEvent supported but not fired yet');
		} else {
			console.log('❌ BeforeInstallPromptEvent NOT supported');
		}
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			installButtonVisible = true;
			console.log('✅ BeforeInstallPromptEvent fired', true);
		});
		window.addEventListener('appinstalled', (e) => {
			console.log('✅ AppInstalled fired', true);
		});

		localStorage.setItem('storedEvent', JSON.stringify({ type: 'click', target: 'button' }));

		// Later, recreating and dispatching the event
		window.reDispatch = function recreateAndDispatch() {
			let storedEvent = JSON.parse(localStorage.getItem('storedEvent'));
			let recreatedEvent = new Event(storedEvent.type);
			recreatedEvent.target = document.querySelector(storedEvent.target);
			window.dispatchEvent(recreatedEvent);
		};

		window.installApp = async function installApp() {
			console.log('installApp button clicked');
			console.log('deferredPrompt', deferredPrompt);
			if (deferredPrompt) {
				deferredPrompt.prompt();
				console.log('🆗 Installation Dialog opened');
				// Find out whether the user confirmed the installation or not
				const { outcome } = await deferredPrompt.userChoice;
				// The deferredPrompt can only be used once.
				deferredPrompt = null;
				// Act on the user's choice
				if (outcome === 'accepted') {
					console.log('😀 User accepted the install prompt.', true);
				} else if (outcome === 'dismissed') {
					console.log('😟 User dismissed the install prompt');
				}
				// Hide the install button
				// installButtonVisible = false;
			}
		};
	</script>
</svelte:head>

<ModeWatcher defaultMode={'dark'} track={false} />
<button
	class="flex items-center justify-center h-12 mt-4 text-white bg-blue-500 rounded-md w-80"
	onclick={() => {
		if (pwaInstallRef) {
			console.log(pwaInstallRef?.isInstallAvailable);
			console.log(pwaInstallRef?.isUnderStandaloneMode);
			pwaInstallRef.showDialog(true);
			// pwaInstallRef.install();
		}
		(window as unknown as Window).installApp();
	}}
>
	Install bro
</button>

<div class="background">
	{#await initLocale()}
		<div class="flex items-center justify-center h-dvh">
			<div class="w-16 h-16 border-b-2 border-white rounded-full animate-spin"></div>
		</div>
	{:then _}
		{#if loadingResult}
			<div class="flex items-center justify-center h-dvh">
				<div class="w-16 h-16 border-b-2 border-white rounded-full animate-spin"></div>
			</div>
		{:else}
			{@render children?.({ class: 'overflow-hidden' })}
		{/if}
	{/await}
</div>

<pwa-install bind:this={pwaInstallRef} manifest-url="/favicon/site.webmanifest"></pwa-install>

<style lang="less">
	.background {
		background-image: url('$lib/assets/icons/icon.svg');
		background-repeat: no-repeat;
		background-position: center;
		background-blend-mode: darken;
		background-size: 50% 50%;
		background-color: rgba(0, 0, 0, 0.7); /* Adjust the alpha value to control the darkness */
	}
</style>
