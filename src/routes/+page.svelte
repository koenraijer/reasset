<script>
	import { popup } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { localStorageStore } from '@skeletonlabs/skeleton';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { clipboard } from '@skeletonlabs/skeleton';
	import { fade, slide } from 'svelte/transition';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';
	import { chosenPresetStore, fundsStore } from './stores'
	export let data
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { Confetti } from "svelte-confetti"
 
	import ToggleConfetti from '$lib/components/ToggleConfetti.svelte'

	let funds = [];
	let fundAdded = false
    let loading = true;

	/*
		funds = [
			{ id: 1, name: 'A', amount: 250, desired_perc: 25 },
			{ id: 2, name: 'B', amount: 500, desired_perc: 25 },
			{ id: 3, name: 'C', amount: 500, desired_perc: 50 }
		];
	*/

	function changePreset(newPreset) {
		fundAdded = false; // set fundAdded to false
		chosenPreset = newPreset; // update the chosenPreset
	}

	onMount(async () => {
        try {
            // subscribe to the store to update the 'funds' variable whenever the store changes
            fundsStore.subscribe(value => {
                funds = value;
                loading = false;
            });
        } catch (error) {
            console.log(error);
            toastStore.trigger({message: 'Error loading saved funds.', background: 'variant-filled-error',})
			generated = false;
        }
		try {
			chosenPresetStore.subscribe(value => {
				changePreset(value);
				confirmed = false;
			});
		} catch (error) {
			console.log(error);
			toastStore.trigger({message: 'Error loading saved preset.', background: 'variant-filled-error',})
			generated = false;
		}
    });

	/* ------------------- MODAL ------------------- */
	const modalStore = getModalStore();
	const modal = {
		type: 'confirm',
		modalClasses: 'p-8 text-base border-2 border-black',
		// Data
		title: 'Are you sure you wish to remove the preset?',
		body: 'Removing the preset will delete all configured funds. This action cannot be undone.',
		// TRUE if confirm pressed, FALSE if cancel pressed
		response: (r) => {
			if (r) {
				fundsStore.set([]); // update the store
				confirmed = true;
				generated = false
			}
		}
	};
	let confirmed = true; // TRUE if confirm pressed, FALSE if cancel pressed

	/* ------------------- PRESET ------------------- */
	let chosenPreset;

	$: {
		if (chosenPreset && !fundAdded) {
			if (chosenPreset === 'Choose preset' && !confirmed) {
				modalStore.trigger(modal);
			}
			const [key, type] = chosenPreset.split(': ').map(str => str.trim());
			if (data.data[key.toLowerCase()] && data.data[key.toLowerCase()][type]) {
				fundsStore.set(data.data[key.toLowerCase()][type]);
			}
			fundAdded = false;
			console.log(funds);
		}		
	}
	
	/* ------------------- COPY BUTTON ------------------- */
	let showThumbsUp = false;

	function handleCopyButtonClick() {
		showThumbsUp = true;
		setTimeout(() => {
		showThumbsUp = false;
		}, 1500);
	}

	/* ------------------- FUNDS AND REBALANCING ------------------- */
    const toastStore = getToastStore();

	let generated = false; 
	let toAdd = 250;
	$: portfolioSum = funds.reduce((total, fund) => total + Number(fund.amount), 0) + toAdd;

	let advice = [];
	$: adviceString = advice.join(' ').replace(/<\/?[^>]+(>|$)/g, "");

	function addFund() {
		const newFund = { id: get(fundsStore).length + 1, name: '', amount: 0, desired_perc: 0 };
		fundsStore.update(funds => [...funds, newFund]); // update the store
		fundAdded = true;
		console.log("FUND ADDED", funds);
	}

	function removeFund(id) { 
		fundsStore.update(funds => funds.filter(fund => fund.id !== id)); // update the store
	}

	function generate() {
		advice = [];
		// Check if all of the "desired_perc" add up to 100%
		const totalPercentage = funds.reduce((total, fund) => total + Number(fund.desired_perc), 0);
		if (totalPercentage !== 100) {
			toastStore.trigger({message: 'The desired percentages do not add up to 100%.', 	background: 'variant-filled-error',})
			generated = false;
			return;
		}

		// Check if the total portfolio value is greater than the cash outflow.
		if (toAdd > portfolioSum) {
			toastStore.trigger({message: 'The cash outflow is greater than the total portfolio value.', background: 'variant-filled-error',})
			generated = false;
			return;
		}

		// Check if any fields are empty
		const emptyFieldFund = funds.find(fund => 
			!fund.id || 
			!fund.name || 
			(fund.amount === null || fund.amount === undefined || fund.amount === '') || 
			!fund.desired_perc
		);
		if (emptyFieldFund) {
			console.log(emptyFieldFund);
			const emptyFields = Object.entries(emptyFieldFund).filter(([key, value]) => !value).map(([key]) => key);
			toastStore.trigger({message: `The following fields are missing: ${emptyFields.join(', ')}`, background: 'variant-filled-error',})
			generated = false;
			return;
		}
		
		// 1. Calculate desired value per fund including new cash flow and calculate diff. between current and desired values.
		const fundChanges = funds.map(fund => {
			const desiredAmount = (portfolioSum * fund.desired_perc) / 100;
			const difference = desiredAmount - fund.amount;
			return { ...fund, desiredAmount, difference };
		});

		// 2. Split funds into two arrays: one for funds where you need to add, and one for funds where you need to remove.
		let toAddFunds = fundChanges.filter(fund => fund.difference > 0);
		let toRemoveFunds = fundChanges.filter(fund => fund.difference < 0);

		// 4. For funds where you need to add, sort them in descending order of difference. Start adding from the fund with the highest difference. This minimizes the number of transactions.
		toAddFunds.sort((a, b) => b.difference - a.difference);

		// 5. For funds where you need to remove, sort them in ascending order of difference. Start removing from the fund with the lowest difference. This also minimizes the number of transactions.
		toRemoveFunds.sort((a, b) => a.difference - b.difference);

		// 6. Keep track of the remaining cash inflow. When adding to a fund, subtract the added amount from the remaining cash inflow. When removing from a fund, add the removed amount to the remaining cash inflow.
		let remainingCashInflow = toAdd;

		// 8. Repeat steps 5-7 until the remaining cash inflow is zero or close enough.
		while (toAddFunds.some(fund => fund.difference > 0.01) || toRemoveFunds.some(fund => fund.difference < -0.01)) {
			"Iterating"
			toAddFunds.forEach(fund => {
				if (remainingCashInflow > 0.01) {
					const addAmount = Math.min(fund.difference, remainingCashInflow);
					fund.amount += addAmount;
					remainingCashInflow -= addAmount;
					// fund.difference = fund.desiredAmount - fund.amount;
					advice.push(`Add <span class="py-1 px-2 font-semibold bg-success-backdrop-token text-black rounded-lg border-2 border-black">${addAmount.toFixed(2)}</span> to ${fund.name}.`);				
				}
				fund.difference = fund.desiredAmount - fund.amount;
			});

			toRemoveFunds.forEach(fund => {
				if (remainingCashInflow < -0.01) {
					const removeAmount = Math.min(-fund.difference, -remainingCashInflow);
					fund.amount -= removeAmount;
					remainingCashInflow += removeAmount;
					// fund.difference = fund.desiredAmount - fund.amount;
					advice.push(`Remove <span class="py-1 px-2 font-semibold rounded-lg bg-warning-backdrop-token border-2 border-black">${removeAmount.toFixed(2)}</span> from ${fund.name}.`);
				}
				fund.difference = fund.desiredAmount - fund.amount;
			});

			if (Math.abs(remainingCashInflow) <= 0.01) {
				const fundToRemoveFrom = toRemoveFunds.find(fund => fund.difference < -0.01);
				const fundToAddTo = toAddFunds.find(fund => fund.difference > 0.01);
				if (fundToRemoveFrom && fundToAddTo) {
				const transferAmount = Math.min(-fundToRemoveFrom.difference, fundToAddTo.difference);
				fundToRemoveFrom.amount -= transferAmount;
				fundToAddTo.amount += transferAmount;
				fundToRemoveFrom.difference = fundToRemoveFrom.desiredAmount - fundToRemoveFrom.amount;
				fundToAddTo.difference = fundToAddTo.desiredAmount - fundToAddTo.amount;
				advice.push(`Transfer <span class="px-2 py-1 font-semibold bg-surface-backdrop-token rounded-lg text-white border-2 border-black">${transferAmount.toFixed(2)}</span> from ${fundToRemoveFrom.name} to ${fundToAddTo.name}.`);				}
			}

			generated = true;
		}
		}

		function focusInput(id) {
			document.getElementById(id).focus();
		}		
		
		/* ------------------- DISCO ------------------- */

		import { onDestroy } from 'svelte';

		let colors = ['!shadow-tertiary-700', '!shadow-secondary-700', '!shadow-primary-700'];
		let currentColorIndex = 0;
		let currentColor = colors[currentColorIndex];
		let intervalId;

		$: {
			// Clear any existing interval
			if (intervalId) {
				clearInterval(intervalId);
				intervalId = null;
			}

			if (generated) {
				// Start color changing
				intervalId = setInterval(() => {
					currentColorIndex = (currentColorIndex + 1) % colors.length;
					currentColor = colors[currentColorIndex];
					console.log(currentColor);
				}, 1000);
			}
		}

		// Cleanup interval when component is destroyed
		onDestroy(() => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		});

		/* ------------------- KEYBOARD SHORTCUTS ------------------- */
		onMount(() => {
		const handleKeyDown = (event) => {
			// Check if the pressed key is 'Enter' and the meta key (Command on Mac) is held down
			if (event.key === 'Enter' && event.metaKey) {
				console.log('Command + Enter pressed');
				buttonElement.click();
				// generate();
			}
		};

		// Add the event listener
		window.addEventListener('keydown', handleKeyDown);

		// Remove the event listener when the component is destroyed
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
		});

		let buttonElement;
</script>

  <div class="container h-full mx-auto flex flex-col flex-nowrap py-24 justify-start">
	<div class="text-center" id="hero">
		<h1 class="titleClasses font-extrabold mb-6" class:title-on-generate={generated}>
			ReAsset
		</h1> <!-- class:boujee-text={generated}-->
		<h2 class="subtitleClasses" class:subtitle-on-generate={generated}>
			Rebalance your portfolio, minimise transaction costs.
		</h2>
	</div>
	<!-- Responsive Container (recommended) -->
	{#if loading}
		<div class="flex justify-center items-center">
			<div class="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-secondary-500 shadow-black shadow-sm"></div>
		</div>
	{:else}
	<div class="table-container w-full !shadow-2xl {currentColor}">
		<!-- Native Table Element -->
		<table class="table table-interactive rounded-container-token border-2 border-surface-900 dark:border-surface-400 w-full !shadow-2xl">
			<thead class="rounded-container-token">
				<tr class="bg-surface-900 dark:bg-surface-600 text-white">
					<th class="text-center">Assets</th>
					<th class="text-center">Current Value</th>
					<th class="text-center transition-colors duration-300">Target allocation (%)</th>
					<th class="text-center">
						<button on:click={addFund} class="variant-filled-secondary"> <!--{chosenPreset !== "Choose preset" ? "bg-surface-500/50 text-gray-400 hover:bg-none cursor-not-allowed" : "variant-filled-secondary"}-->
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 mr-1">
								<path d="M6 3a3 3 0 0 0-3 3v2.25a3 3 0 0 0 3 3h2.25a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6ZM15.75 3a3 3 0 0 0-3 3v2.25a3 3 0 0 0 3 3H18a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3h-2.25ZM6 12.75a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h2.25a3 3 0 0 0 3-3v-2.25a3 3 0 0 0-3-3H6ZM17.625 13.5a.75.75 0 0 0-1.5 0v2.625H13.5a.75.75 0 0 0 0 1.5h2.625v2.625a.75.75 0 0 0 1.5 0v-2.625h2.625a.75.75 0 0 0 0-1.5h-2.625V13.5Z" />
							</svg>
							Add fund</button>
					</th>
				</tr>
			</thead>
			<tbody class="rounded-container-token">
				{#each funds as fund, i}
					<tr id="fund-{i+1}">
						<td on:click={() => focusInput(`name-${i}`)} class="cursor-text">
							<label class="">
								<input id={`name-${i}`} class="" bind:value={fund.name} type="text" placeholder="Fund name" />
							</label>
						</td>
						<td on:click={() => focusInput(`amount-${i}`)} class="cursor-text">
							<label>
								<input id={`amount-${i}`} bind:value={fund.amount} type="number" placeholder="Amount" class="relative after:" />
							</label>
						</td>
						<td on:click={() => focusInput(`desired_perc-${i}`)} class="cursor-text">
							<label>
								<input id={`desired_perc-${i}`} bind:value={fund.desired_perc} type="number" placeholder="Desired %" 
								 />
							</label>
						</td>
						<td class="text-center cursor-default">
							<button use:popup={{ event: 'click', target: `removePopup-${i+1}`, placement: 'bottom', closeQuery: '#will-close' }} class="py-2 h-fit btn rounded-container-token px-2 text-black hover:bg-surface-hover-token outline-none border-2 border-surface-400-500-token">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
									<path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" />
								</svg>
							</button>
							<div class="card p-4 z-1 bg-surface-100-800-token border-2 border-surface-400-500-token" data-popup="removePopup-{i+1}">
							  <span class="text-base font-semibold pb-2 mb-2">Are you sure?</span>
							  <button id="will-close" on:click={() => removeFund(fund.id)} class="ml-1 w-full mt-2 btn variant-filled rounded-container-token">Delete</button>
						  	</div>
						</td>
					</tr>
				{/each}
					<tr>
						<th colspan="1" class="cursor-default">New capital</th>
						<td on:click={() => focusInput(`to_add`)} class="cursor-text">
							<input id="to_add" bind:value={toAdd} class="w-ful text-center" placeholder="Portfolio amount" type="number" />
						</td>
						<td on:click={() => focusInput(`to_add`)} class="cursor-not-allowed"></td>
						<td on:click={() => focusInput(`to_add`)} class="cursor-not-allowed"></td>
					</tr>
			</tbody>
			<tfoot>
				<tr class="bg-surface-900 dark:bg-surface-600 text-white rounded-container-token" >
					<th colspan="1">New Portfolio Total</th>
					<td class="text-center relative cursor-default">
						{portfolioSum}</td>
					<td colspan="2" class="">
						<div class="w-full flex items-center">
							<ToggleConfetti>
								<button slot="label" class="w-fit mx-auto text-xl font-semibold bg-tertiary-active-token pr-4" 
									on:click={generate}
									bind:this={buttonElement}
								>
									Generate
									<span class="flex flex-row flex-nowrap pl-2 pr-0 mr-0 text-tertiary-700">
										<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="w-5 h-5" viewBox="0 0 256 256"><path d="M180,140H164V116h16a40,40,0,1,0-40-40V92H116V76a40,40,0,1,0-40,40H92v24H76a40,40,0,1,0,40,40V164h24v16a40,40,0,1,0,40-40ZM164,76a16,16,0,1,1,16,16H164ZM60,76a16,16,0,0,1,32,0V92H76A16,16,0,0,1,60,76ZM92,180a16,16,0,1,1-16-16H92Zm24-64h24v24H116Zm64,80a16,16,0,0,1-16-16V164h16a16,16,0,0,1,0,32Z"></path></svg>
										<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="w-5 h-5" viewBox="0 0 256 256"><path d="M71.51,144.49a12,12,0,0,1,0-17l24-24a12,12,0,0,1,17,17L109,124h55V104a12,12,0,0,1,24,0v32a12,12,0,0,1-12,12H109l3.52,3.51a12,12,0,0,1-17,17ZM236,56V200a20,20,0,0,1-20,20H40a20,20,0,0,1-20-20V56A20,20,0,0,1,40,36H216A20,20,0,0,1,236,56Zm-24,4H44V196H212Z"></path></svg>
									</span>
								</button>							
								<Confetti y={[-2, 2]} x={[-2, 2]} noGravity duration=750 amount=200/>
							</ToggleConfetti>
						</div>
					</td>
				</tr>
				{#if generated}
				<tr class="rounded-bl-container-token rounded-br-container-token">
					<td colspan="4" >
						<details class="w-full" bind:open={generated}>
							<summary style="display: none;"></summary>
							<div class="transition-all duration-150" transition:slide={{ duration: 300 }}>
								<span class="font-bold pb-4">Follow these steps to rebalance your portfolio:
								</span>
								<ol class="list pt-4">
									{#each advice as item, i}
											<li>
												<span id="numberSpan">{i+1}</span>
												<span class="flex-auto">{@html item}</span>
											</li>
											<!-- ... -->
									{/each}
								</ol>
								<div class="flex flex-row flex-nowrap gap-x-4">
									<div class="flex items-center gap-x-2 pt-4">
										<button class="btn variant-filled rounded-container-token border-2 border-black" on:click={handleCopyButtonClick} use:clipboard={adviceString}>
											<div class="relative w-6 h-6 mr-1">
												{#if !showThumbsUp}
													<svg xmlns="http://www.w3.org/2000/svg" in:fade={{ duration: 75 }} width="32" height="32" fill="currentColor" class="w-6 h-6 mr-1" viewBox="0 0 256 256"><path d="M216,40V168H168V88H88V40Z" opacity="0.2"></path><path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path></svg>
												{:else}
													<svg xmlns="http://www.w3.org/2000/svg" out:fade={{ duration: 75 }} width="32" height="32" fill="currentColor" class="text-xl absolute -top-1 left-0 pr-1 pt-1" viewBox="0 0 256 256"><path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"></path><path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg>
												{/if}
											</div>
											Copy
										</button>
									</div>
									<button class="btn border-2 border-black rounded-container-token mt-4 text-black hover:bg-primary-hover-token" on:click={() => generated = false}>
										<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="w-5 h-5 mr-1" viewBox="0 0 256 256"><path d="M20,128A76.08,76.08,0,0,1,96,52h99l-3.52-3.51a12,12,0,1,1,17-17l24,24a12,12,0,0,1,0,17l-24,24a12,12,0,0,1-17-17L195,76H96a52.06,52.06,0,0,0-52,52,12,12,0,0,1-24,0Zm204-12a12,12,0,0,0-12,12,52.06,52.06,0,0,1-52,52H61l3.52-3.51a12,12,0,1,0-17-17l-24,24a12,12,0,0,0,0,17l24,24a12,12,0,1,0,17-17L61,204h99a76.08,76.08,0,0,0,76-76A12,12,0,0,0,224,116Z"></path></svg>
										Restart
									</button>
								</div>
							</div>
						</details>
					</td>
				</tr>
				{/if}
			</tfoot>
		</table>
		<!--
			<div class="bg-surface-50-900-token !text-surface-900-50-token w-full pt-10">
			<h2 class="mb-2 text-xl font-bold w-full text-center">FAQ</h2>
			<Accordion autocollapse>
				<AccordionItem open class="">
					<svelte:fragment slot="lead"></svelte:fragment>
					<svelte:fragment slot="summary">WTF is this?</svelte:fragment>
					<svelte:fragment slot="content">This is a web application designed to help you rebalance assets in your investment portfolio based on target allocations, or desired proportions, set by you. It does so in a way that ensures the <strong>minimum amount of transactions</strong>, saving you both time and money (transaction costs).</svelte:fragment>
				</AccordionItem>
				<AccordionItem class="">
					<svelte:fragment slot="lead"></svelte:fragment>
					<svelte:fragment slot="summary">How do I use it?</svelte:fragment>
					<svelte:fragment slot="content">You can start by adding your current investments and their values. Then, set your target allocation for each investment. If you have new cash flow, enter the amount and the app will suggest how to distribute it to achieve your target allocation.</svelte:fragment>
				</AccordionItem>
				<AccordionItem class="">
					<svelte:fragment slot="lead"></svelte:fragment>
					<svelte:fragment slot="summary">How do I obtain Target Allocations?</svelte:fragment>
					<svelte:fragment slot="content">For example, say you set weights to the different assets according to market capitalisation. You would find the latest relative weights from a website such as <a href="https://marketcaps.site/" target="_blank" class="hover:underline text-secondary-500">https://marketcaps.site/</a> and then use those weights as your <strong>target allocation</strong> in this tool.</svelte:fragment>
				</AccordionItem>
			</Accordion>
		</div>
		-->
	</div>
	{/if}
  </div>

  <!--
	Write me sveltekit code that alternates three variables in a certain rhythm, as though they are notes, or a discolamp that can form a rhythm. The colors are: !shadow-tertiary-700 !shadow-secondary-700 and !shadow-primary-700. You must allow me to alternate these colors in a certain proportion to each other easily. 
  -->