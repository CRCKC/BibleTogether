import {
    init, register,
    // getLocaleFromNavigator
} from 'svelte-i18n';

/**
 * Initialize i18n, please wrap this function inside a await block to ensure the i18n is fully initialized before using any translation

 */
export default function initLocale() {

    register('en', () => import('$lib/locales/en.json'));
    register('zh', () => import('$lib/locales/zh.json'));

    return init({
        fallbackLocale: 'en',
        // initialLocale: getLocaleFromNavigator(),
        initialLocale: 'zh',
    });
}
