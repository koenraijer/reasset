<script>
	import '../app.postcss';
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';

	// Floating UI for Popups
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
	import { Toast, initializeStores } from '@skeletonlabs/skeleton';

	initializeStores();
	import { LightSwitch } from '@skeletonlabs/skeleton';
</script>

<Toast />

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
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<!-- Page Route Content -->
	<slot />
</AppShell>

<AppBar>
	<svelte:fragment slot="lead">(icon)</svelte:fragment>
	(title)
	<svelte:fragment slot="trail">(actions)</svelte:fragment>
</AppBar>