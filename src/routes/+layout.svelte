<script>
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	export let data;
	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
	import { popup } from '@skeletonlabs/skeleton';
	import { ListBox, ListBoxItem } from '@skeletonlabs/skeleton';
	import { Toast, Modal, initializeStores } from '@skeletonlabs/skeleton';
	import { chosenPresetStore } from './stores'
	import { get } from 'svelte/store';
	import { localStorageStore } from '@skeletonlabs/skeleton';
	import { LightSwitch } from '@skeletonlabs/skeleton';

	initializeStores();

	const presetMenu = {
		event: 'click',
		target: 'presetMenu',
		placement: 'bottom',
		closeQuery: '.listbox-item',
		middleware: {
			shift: {
				padding: 8,
			},
			offset: 8,
			/*
			size: {
				apply({ rects, elements }) {
					Object.assign(elements.floating.style, {
						width: `${rects.reference.width}px`,
					});
				},
			},
			*/
		},
	};

	let presets = data.data

	$: chosenPreset = get(chosenPresetStore)
	$: chosenPresetStore.set(chosenPreset);

</script>

<Toast />
<Modal 
	width="w-full max-w-md"
	padding="p-8"
	rounded="rounded-container-token"
	shadow="shadow-md"
	buttonNeutral="bg-gray-400 text-black rounded-container-token"
	buttonPositive="bg-primary-500 text-white rounded-container-token"
	buttonTextCancel="No, go back"
	buttonTextConfirm="Yes, I'm sure"
/>

<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar slotDefault="place-self-center" slotTrail="place-content-end" background="header-bg" padding="px-8 py-4" shadow="shadow-sm">
			<svelte:fragment slot="lead">
				<h1 class="text-3xl mx-auto text-white">
					<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" fill="currentColor" class="inline w-12 h-12 px-2" viewBox="0 0 256 256"><path d="M216.49,136.49l-80,80a12,12,0,1,1-17-17l80-80a12,12,0,1,1,17,17Zm-16-105a12,12,0,0,0-17,0l-152,152a12,12,0,0,0,17,17l152-152A12,12,0,0,0,200.49,31.51Z"></path></svg>
					ReAsset
				</h1>
			</svelte:fragment>
			<svelte:fragment slot="trail">
			<!--
				<LightSwitch bgLight="transparent" bgDark="transparent" fillDark="fill-surface-900" fillLight="fill-black" width="w-12"/>
			-->
			<button use:popup={presetMenu} class="py-2 w-52 h-fit btn rounded-container-token bg-surface-400/10 dark:bg-surface-900/0.7 border-2 border-black hover:bg-surface-400/30 text-black flex flex-row flex-nowrap justify-between">
				<span class="capitalize font-semibold">{chosenPreset ?? 'Choose preset'}</span>
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="w-5 h-5 inline" viewBox="0 0 256 256"><path d="M184.49,167.51a12,12,0,0,1,0,17l-48,48a12,12,0,0,1-17,0l-48-48a12,12,0,0,1,17-17L128,207l39.51-39.52A12,12,0,0,1,184.49,167.51Zm-96-79L128,49l39.51,39.52a12,12,0,0,0,17-17l-48-48a12,12,0,0,0-17,0l-48,48a12,12,0,0,0,17,17Z"></path></svg>
			</button>
			<div class="card shadow-sm w-52 py-4 -translate-x-4" data-popup="presetMenu">
				<ListBox rounded="rounded-none w-full" active="bg-surface-400/20">
						<ListBoxItem bind:group={chosenPreset} name="medium"  value="Choose preset">
							<span class="flex place-items-center gap-x-2">
								<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="w-6 h-6 inline-flex place-self-center" viewBox="0 0 256 256"><path d="M224,56V200a8,8,0,0,1-8,8H68.53a8,8,0,0,1-6.86-3.88L16,128,61.67,51.88A8,8,0,0,1,68.53,48H216A8,8,0,0,1,224,56Z" opacity="0.2"></path><path d="M216,40H68.53a16.08,16.08,0,0,0-13.72,7.77L9.14,123.88a8,8,0,0,0,0,8.24l45.67,76.11A16.08,16.08,0,0,0,68.53,216H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM61.67,204.12,68.53,200h0ZM216,200H68.53l-43.2-72,43.2-72H216ZM106.34,146.34,124.69,128l-18.35-18.34a8,8,0,0,1,11.32-11.32L136,116.69l18.34-18.35a8,8,0,0,1,11.32,11.32L147.31,128l18.35,18.34a8,8,0,0,1-11.32,11.32L136,139.31l-18.34,18.35a8,8,0,0,1-11.32-11.32Z"></path></svg>
								Remove preset
							</span>
						</ListBoxItem>
				</ListBox>
				<hr class="!border-t-2 my-2 !border-surface-300-600-token !opacity-30">
				{#each Object.keys(presets) as key, i}
				<h2 class="font-semibold px-4">{#if key === 'nt'}Northern Trust (NT) {:else if key === 'msci'}MSCI{:else if key === 'actiam'}Actiam{/if}</h2>
					<ListBox rounded="rounded-none w-full" active="bg-surface-400/20">
						{#each Object.keys(presets[key]) as type}
							<ListBoxItem bind:group={chosenPreset} name="medium"  value={
								(key === 'nt' ? 'NT' : key === 'msci' ? 'MSCI' : 'Actiam') + ": " + type
							}>{type}</ListBoxItem>
						{/each}
					</ListBox>
					{#if i !== Object.keys(presets).length - 1}
						<hr class="!border-t-2 my-2 !border-surface-300-600-token !opacity-30">
					{/if}
				{/each}
			</div>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot/>
</AppShell>

<!--
<style>
	[data-popup] {
		/* Display */
		display: none;
		/* Position */
		position: absolute;
		top: 0;
		right: 0;
		/* Transitions */
		transition-property: opacity;
		transition-timing-function: cubic-bezier(.4,0,.2,1);
		transition-duration: .075s
	}
</style>
-->