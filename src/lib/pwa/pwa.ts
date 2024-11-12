import { toast } from 'svelte-sonner';

interface BeforeInstallPromptEvent extends Event {
	/**
	 * Returns an array of DOMString items containing the platforms on which the event was dispatched.
	 * This is provided for user agents that want to present a choice of versions to the user such as,
	 * for example, "web" or "play" which would allow the user to chose between a web version or
	 * an Android version.
	 */
	readonly platforms: Array<string>;

	/**
	 * Returns a Promise that resolves to a DOMString containing either "accepted" or "dismissed".
	 */
	readonly userChoice: Promise<{
		outcome: 'accepted' | 'dismissed';
		platform: string;
	}>;

	/**
	 * Allows a developer to show the install prompt at a time of their own choosing.
	 * This method returns a Promise.
	 */
	prompt(): Promise<void>;
}

interface PwaSvelte {
	supported: boolean;
	installable: boolean;
	event: BeforeInstallPromptEvent;
}

export async function installApp() {
	// @ts-expect-error Property 'pwaSvelte' will be declared in pwa.svelte
	const pwaSvelte = window.pwaSvelte as PwaSvelte;

	console.log('installApp button clicked');
	console.log('deferredPrompt', pwaSvelte);
	if (pwaSvelte.installable) {
		pwaSvelte.event.prompt();
		console.log('🆗 Installation Dialog opened');
		// Find out whether the user confirmed the installation or not
		const { outcome } = await pwaSvelte.event.userChoice;
		// The deferredPrompt can only be used once.

		// Act on the user's choice
		if (outcome === 'accepted') {
			console.log('😀 User accepted the install prompt.', true);
			return true;
		} else if (outcome === 'dismissed') {
			console.log('😟 User dismissed the install prompt');
			return false;
		}
	}
}

export function isPwaSupported() {
	// @ts-expect-error Property 'pwaSvelte' will be declared in pwa.svelte
	const pwaSvelte = window.pwaSvelte as PwaSvelte;

	return pwaSvelte.supported;
}

export function isPwaInstallable() {
	// @ts-expect-error Property 'pwaSvelte' will be declared in pwa.svelte
	const pwaSvelte = window.pwaSvelte as PwaSvelte;

	return pwaSvelte.installable;
}

function getPWADisplayMode() {
	if (document.referrer.startsWith('android-app://'))
		return 'twa';
	if (window.matchMedia('(display-mode: browser)').matches)
		return 'browser';
	// @ts-expect-error standalone is defined when the app is installed on ios
	if (window.matchMedia('(display-mode: standalone)').matches || navigator.standalone)
		return 'standalone';
	if (window.matchMedia('(display-mode: minimal-ui)').matches)
		return 'minimal-ui';
	if (window.matchMedia('(display-mode: fullscreen)').matches)
		return 'fullscreen';
	if (window.matchMedia('(display-mode: window-controls-overlay)').matches)
		return 'window-controls-overlay';

	return 'unknown';
}

async function checkIfInstalled() {
	// @ts-expect-error Property getInstalledRelatedApps will be found in navigator in some browsers
	const relatedApps = await navigator.getInstalledRelatedApps() ?? null;
	if (relatedApps != null) {
		const isInstalled = relatedApps.some((app: { platform: string; url: string; }) =>
			app.platform === 'webapp' && app.url === window.location.origin
		);
		console.log('relatedApps', relatedApps);

		return isInstalled;
	}
	return false;
}


export async function promptInstall() {
	console.log('promptInstall ', isPwaSupported());
	if (getPWADisplayMode() == 'standalone') {
		console.log('Already Standalaone');
		return;
	}
	if (await checkIfInstalled()) {
		console.log('Already Installed');
		return;
	}
	if (isPwaSupported())
		toast.info('安裝成應用程式？', {
			action: {
				label: '確認',
				onClick: async () => {
					if (isPwaInstallable()) {
						if (await installApp()) {
							promptSuccess();
						} else {
							promptRetry();
						}
					} else {
						promptError();
					}
				}
			},
			// description: 'i strongly recommend you to install this app',
			description: '強烈建議安裝此網站為應用程式',
			position: 'top-center',
			dismissable: true,

			duration: 60000,
			important: true
		});
}

function promptRetry() {
	toast.error('安裝失敗', {
		action: {
			label: '重試',
			onClick: async () => {
				if (isPwaInstallable()) {
					if (await installApp()) {
						promptSuccess();
					} else {
						promptRetry();
					}
				} else {
					promptError();
				}
			}
		},
		position: 'top-center',
		dismissable: true,
		duration: 10000,

	});
}

function promptSuccess() {
	toast.success('安裝成功', {
		position: 'top-center',
		dismissable: true,
		duration: 10000,

	});
}

function promptError() {
	toast.error('安裝失敗，請重新載入頁面', {
		position: 'top-center',
		dismissable: true,
		duration: 10000
	});
}
