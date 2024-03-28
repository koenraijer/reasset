import { localStorageStore } from '@skeletonlabs/skeleton';

export let chosenPresetStore = localStorageStore('chosenPreset', "Choose preset"); // Store the chosen preset

export let fundsStore = localStorageStore('funds', []); // initialize with an empty array

export let triggerConfirmModal = localStorageStore('triggerConfirmModal', false); // initialize with false