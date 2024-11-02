import { localStore } from "./localStore.svelte";

export function firstVisitStore() {
    return localStore("firstVisit", true);
}