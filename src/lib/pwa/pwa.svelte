<script lang="ts">
	import { pwaInfo } from 'virtual:pwa-info';

	let webManifest = $derived(pwaInfo ? pwaInfo.webManifest.linkTag : '');
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
