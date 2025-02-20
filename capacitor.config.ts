import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.crckc.bibletogether',
	appName: '禮中齊讀經',
	webDir: 'build',
	android: {},
	plugins: {
		FirebaseAuthentication: {
			skipNativeAuth: false,
			providers: ['google.com']
		}
	}
};

export default config;
