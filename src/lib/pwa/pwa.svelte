<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { pwaInfo } from 'virtual:pwa-info';

	let webManifest = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');

	import { useRegisterSW } from 'virtual:pwa-register/svelte';

	const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
		// ponytail: useRegisterSW handles update detection via visibilitychange + native SW lifecycle.
		// Custom polling was the refresh-loop root cause.
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
			toast('更新可用', {
				duration: 6000000,
				action: {
					label: '重新載入',
					onClick: () => {
						updateServiceWorker();
						close();
					}
				},
				position: 'top-center',
				dismissable: true
			});
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
