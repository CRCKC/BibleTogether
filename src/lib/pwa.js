/**
 * @type {Event | null}
 */
let deferredPrompt;
let installButtonVisible = false;

export function initPwa() {
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
}


async function installApp() {
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
}