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
	import { chosenPresetStore, triggerConfirmModal } from './stores'
	import { get } from 'svelte/store';
	import { localStorageStore } from '@skeletonlabs/skeleton';
	import { LightSwitch } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';

	initializeStores();

	const presetMenu = {
		event: 'click',
		target: 'presetMenu',
		placement: 'bottom',
		closeQuery: '.popupMustClose',
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

	const confirmRemovePreset = {
		event: 'click',
		target: 'confirmRemovePreset',
		placement: 'left',
		closeQuery: '.popupMustClose',
		middleware: {
			shift: {
				padding: 8,
			},
			offset: 16,
		},
	};

	const presetInfoPopup = {
		event: "click",
		target: "presetInfoPopup",
		placement: "bottom",
		middleware: {
		shift: {
			padding: 8,
		},
		offset: 8,
		},
	};
	const algorithmInfoPopup = {
		event: "click",
		target: "algorithmInfoPopup",
		placement: "bottom",
		middleware: {
		shift: {
			padding: 8,
		},
		offset: 8,
		},
	};

	let presets = data.data

	$: chosenPreset = get(chosenPresetStore)

	onMount(async () => {
		try {
			chosenPresetStore.subscribe(value => {
				chosenPreset = value;
			});
		} catch (error) {
			console.log(error);
			toastStore.trigger({message: 'Error loading saved preset.', background: 'variant-filled-error',})
		}
	})
</script>

<Toast 
	position="br"
	max="1"
/>

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
		<AppBar slotDefault="place-self-center" slotTrail="place-content-end" background="header-bg" padding="px-8 py-4">
			<svelte:fragment slot="lead">
				<h1 class="text-3xl mx-auto text-white headerTitleClasses tracking-wide">
					ReAsset
				</h1>
			</svelte:fragment>
			<svelte:fragment slot="trail">
			<!--
				<LightSwitch bgLight="transparent" bgDark="transparent" fillDark="fill-surface-900" fillLight="fill-black" width="w-12"/>
			-->
			<button
              class="text-center text-black text-lg cursor-pointer inline-flex gap-1"
              use:popup={algorithmInfoPopup}
            >
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
					class="inline-flex h-5 w-5"
					viewBox="0 0 256 256"
					><path
					d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z"
					opacity="0.2"
					></path><path
					d="M144,176a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176Zm88-48A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128ZM124,96a12,12,0,1,0-12-12A12,12,0,0,0,124,96Z"
					></path></svg
				>
				How does the algorithm work?
            </button>
			<div
				class="bg-black text-white font-normal p-4 text-sm rounded-container-token max-w-96 normal-case -translate-x-4"
				data-popup="algorithmInfoPopup"
			>
				The algorithm adjusts asset values by:
				<ol class="list">
					<li>
					  <span class="!text-white">1.</span>
					  <span class="!text-white">Finding the difference between the desired and actual values of each asset.</span>
					</li>
					<li>
					  <span class="!text-white">2.</span>
					  <span class="!text-white">Splitting assets into two groups: those needing more funds (underweighted) and those with too much (overweighted).</span>
					</li>
					<li>
					  <span class="!text-white">3.</span>
					  <span class="!text-white">Ordering each group by how far they are from their target, from most to least.</span>
					</li>
					<li>
					  <span class="!text-white">4.</span>
					  <span class="!text-white">Going through these sorted groups to either add funds to the underweighted or remove from the overweighted, using available cash.</span>
					</li>
					<li>
					  <span class="!text-white">5.</span>
					  <span class="!text-white">Transferring funds directly between assets if one needs money and another has excess.</span>
					</li>
					<li>
					  <span class="!text-white">6.</span>
					  <span class="!text-white">The process is repeated until all assets are very close to their target.</span>
					</li>
				  </ol>
				<div class="arrow bg-black" />
		  </div>
			<button
              class="text-center text-black text-lg cursor-pointer inline-flex gap-1"
              use:popup={presetInfoPopup}
            >
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="currentColor"
					class="inline-flex h-5 w-5"
					viewBox="0 0 256 256"
					><path
					d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z"
					opacity="0.2"
					></path><path
					d="M144,176a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176Zm88-48A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128ZM124,96a12,12,0,1,0-12-12A12,12,0,0,0,124,96Z"
					></path></svg
				>
				What are presets?
            </button>
			<div
				class="bg-black text-white font-normal p-4 text-sm rounded-container-token max-w-72 normal-case -translate-x-4"
				data-popup="presetInfoPopup"
			>
				Presets represent common combinations of index funds with proportions based on market capitalisation. They are sourced on the fly from <a class="text-secondary-500 hover:underline" href="https://marketcaps.site/">https://marketcaps.site/</a>. By investing according to market capitalisation, you focus on each part of the economy, relative to its size. It's like placing a bet on the entire world's economy, rather than any company or part in particular.
				<div class="arrow bg-black" />
		  </div>
			<button use:popup={presetMenu} class="py-2 w-52 h-fit btn rounded-container-token bg-surface-400/10 dark:bg-surface-900/0.7 border-2 border-black hover:bg-surface-400/30 text-black flex flex-row flex-nowrap justify-between !mr-12">
				<span class="capitalize font-semibold">{chosenPreset ?? 'Choose preset'}</span>
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="w-5 h-5 inline" viewBox="0 0 256 256"><path d="M184.49,167.51a12,12,0,0,1,0,17l-48,48a12,12,0,0,1-17,0l-48-48a12,12,0,0,1,17-17L128,207l39.51-39.52A12,12,0,0,1,184.49,167.51Zm-96-79L128,49l39.51,39.52a12,12,0,0,0,17-17l-48-48a12,12,0,0,0-17,0l-48,48a12,12,0,0,0,17,17Z"></path></svg>
			</button>
			<div class="card shadow-sm w-52 py-4 -translate-x-4" data-popup="presetMenu">
				<button use:popup={confirmRemovePreset} disabled={$chosenPresetStore === 'Choose preset'} class="text-black bg-surface-hover-token w-full rounded-none text-left px-4 py-2 text-lg flex justify-start"> <!-- on:click={() => {$triggerConfirmModal = true}} -->
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="w-8 h-8 pr-2" viewBox="0 0 256 256"><path d="M224,56V200a8,8,0,0,1-8,8H68.53a8,8,0,0,1-6.86-3.88L16,128,61.67,51.88A8,8,0,0,1,68.53,48H216A8,8,0,0,1,224,56Z" opacity="0.2"></path><path d="M216,40H68.53a16.08,16.08,0,0,0-13.72,7.77L9.14,123.88a8,8,0,0,0,0,8.24l45.67,76.11A16.08,16.08,0,0,0,68.53,216H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM61.67,204.12,68.53,200h0ZM216,200H68.53l-43.2-72,43.2-72H216ZM106.34,146.34,124.69,128l-18.35-18.34a8,8,0,0,1,11.32-11.32L136,116.69l18.34-18.35a8,8,0,0,1,11.32,11.32L147.31,128l18.35,18.34a8,8,0,0,1-11.32,11.32L136,139.31l-18.34,18.35a8,8,0,0,1-11.32-11.32Z"></path></svg>
					Remove preset
				</button>
				<div class="card shadow-sm p-0" data-popup="confirmRemovePreset">
					<button on:click={() => {$chosenPresetStore = 'Choose preset'}} class="popupMustClose bg-black py-2 px-2">
						<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="w-6 h-6" viewBox="0 0 256 256"><path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"></path><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg>
					</button>
				</div>
				<hr class="!border-t-2 my-2 !border-surface-300-600-token !opacity-30">
				{#each Object.keys(presets) as key, i}
				<h2 class="font-semibold px-4">{#if key === 'nt'}Northern Trust (NT) {:else if key === 'msci'}MSCI{:else if key === 'actiam'}Actiam{/if}</h2>
					<ListBox rounded="rounded-none w-full" active="bg-surface-400/20">
						{#each Object.keys(presets[key]) as type}
							<ListBoxItem padding="px-4 py-2 popupMustClose" bind:group={$chosenPresetStore} name="medium"  value={
								(key === 'nt' ? 'NT' : key === 'msci' ? 'MSCI' : 'Actiam') + ": " + type
							}>{type}</ListBoxItem>
						{/each}
					</ListBox>
					{#if i !== Object.keys(presets).length - 1}
						<hr class="!border-t-2 my-2 !border-surface-300-600-token !opacity-30">
					{/if}
				{/each}
			</div>
				<a target="_blank" href="https://github.com/koenraijer/reasset" class="github-corner" aria-label="View source on GitHub"><svg width="80" height="80" viewBox="0 0 250 250" style="fill:#151513; color:#fff; position: absolute; top: 0; border: 0; right: 0;" aria-hidden="true"><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path><path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path></svg></a><style>.github-corner:hover .octo-arm{animation:octocat-wave 560ms ease-in-out}@keyframes octocat-wave{0%,100%{transform:rotate(0)}20%,60%{transform:rotate(-25deg)}40%,80%{transform:rotate(10deg)}}@media (max-width:500px){.github-corner:hover .octo-arm{animation:none}.github-corner .octo-arm{animation:octocat-wave 560ms ease-in-out}}</style>

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