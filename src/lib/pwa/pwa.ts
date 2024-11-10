export interface BeforeInstallPromptEvent extends Event {
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

interface PwaSvelte {
    supported: boolean, installable: boolean, event: {
        prompt: () => void,
        readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
    }
};

export async function installApp() {

    // @ts-expect-error Property 'pwaSvelte' will be declared in pwa.svelte
    const pwaSvelte = (window.pwaSvelte) as PwaSvelte

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
        } else if (outcome === 'dismissed') {
            console.log('😟 User dismissed the install prompt');
        }
    }
}