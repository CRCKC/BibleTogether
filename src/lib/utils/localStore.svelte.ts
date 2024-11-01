import { browser } from '$app/environment';

export class LocalStore<T> {
    value = $state<T>() as T;
    key = '';

    constructor(key: string, value: T) {
        this.key = key;

        if (browser) {
            const item = localStorage.getItem(key);
            this.value = item ? this.deserialize(item) : value;
        } else {
            this.value = value;
        }

        $effect(() => {
            localStorage.setItem(this.key, this.serialize(this.value));
        });
    }

    serialize(value: T): string {
        return JSON.stringify(value);
    }

    deserialize(item: string): T {
        return JSON.parse(item);
    }
}

export function localStore<T>(key: string, value: T) {
    return new LocalStore(key, value);
}
