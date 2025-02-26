<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { pwaInfo } from 'virtual:pwa-info';

	let webManifest = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

	import { useRegisterSW } from 'virtual:pwa-register/svelte';

	const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
		onRegisteredSW(swUrl, r) {
			r &&
				setInterval(async () => {
					if (r.installing || !navigator) return;

					if ('connection' in navigator && !navigator.onLine) return;

					const resp = await fetch(swUrl, {
						cache: 'no-store',
						headers: {
							cache: 'no-store',
							'cache-control': 'no-cache'
						}
					});

					if (resp?.status === 200) await r.update();
				}, 20000 /* 20s for testing purposes */);
		},
		onRegisterError(error) {
			console.log('SW registration error', error);
		}
	});

	const close = () => {
		offlineReady.set(false);
		needRefresh.set(false);
	};

	let toToast = $derived($offlineReady || $needRefresh);

	$effect(() => {
		if (toToast) {
			// toast('Update available', {
			// 	duration: 100000,
			// 	action: {
			// 		label: 'Refresh',
			// 		onClick: () => {
			// 			updateServiceWorker();
			// 			close();
			// 		}
			// 	}
			// });
			updateServiceWorker();
			close();
		}
	});
</script>

<svelte:head>
	{@html webManifest}

	<script>
		window.pwaSvelte = {};
		if ('BeforeInstallPromptEvent' in window) {
			console.log('⏳ BeforeInstallPromptEvent supported but not fired yet');
			window.pwaSvelte.supported = true;
		} else {
			console.log('❌ BeforeInstallPromptEvent NOT supported');
			window.pwaSvelte.supported = false;
		}
		window.pwaSvelte.installable = false;

		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			window.pwaSvelte.event = e;
			window.pwaSvelte.installable = true;
			console.log('✅ BeforeInstallPromptEvent fired', true);
		});

		window.addEventListener('appinstalled', (e) => {
			console.log('✅ AppInstalled fired', true);
		});
	</script>
</svelte:head>
