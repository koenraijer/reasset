<script>
	import { popup } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { localStorageStore } from '@skeletonlabs/skeleton';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { clipboard } from '@skeletonlabs/skeleton';
	import { fade, slide } from 'svelte/transition';
	import { Accordion, AccordionItem } from '@skeletonlabs/skeleton';

	let showThumbsUp = false;

	function handleCopyButtonClick() {
		showThumbsUp = true;
		setTimeout(() => {
		showThumbsUp = false;
		}, 1500);
	}

    const toastStore = getToastStore();
    let fundsStore = localStorageStore('funds', []); // initialize with an empty array
    let funds = get(fundsStore); // read the initial value from the store
    let loading = true;

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
        }
    });

	// update the store whenever the 'funds' variable changes
	$: fundsStore.set(funds);

	/*
		funds = [
	  { id: 1, name: 'A', amount: 250, desired_perc: 25 },
	  { id: 2, name: 'B', amount: 500, desired_perc: 25 },
	  { id: 3, name: 'C', amount: 500, desired_perc: 50 }
	];
	*/

	let generated = false; 
	let toAdd = 250;
	$: portfolioSum = funds.reduce((total, fund) => total + Number(fund.amount), 0) + toAdd;

	let advice = [];
	$: adviceString = advice.join(' ').replace(/<\/?[^>]+(>|$)/g, "");

	function addFund() {
		const newFund = { id: funds.length + 1, name: '', amount: '', desired_perc: '' };
		funds = [...funds, newFund];
	}
	
	function removeFund(id) { 
		funds = funds.filter(fund => fund.id !== id);
	}
	
	function generate() {
		advice = [];
		// Check if all of the "desired_perc" add up to 100%
		const totalPercentage = funds.reduce((total, fund) => total + Number(fund.desired_perc), 0);
		if (totalPercentage !== 100) {
			toastStore.trigger({message: 'The desired percentages do not add up to 100%.', 	background: 'variant-filled-error',})
			return;
		}

		// Check if the total portfolio value is greater than the cash outflow.
		if (toAdd >= portfolioSum) {
			toastStore.trigger({message: 'The cash outflow is greater than the total portfolio value.', background: 'variant-filled-error',})
			return;
		}

		// Check if any fields are empty
		const emptyFieldFund = funds.find(fund => !fund.id || !fund.name || !fund.amount || !fund.desired_perc);
		if (emptyFieldFund) {
			const emptyFields = Object.entries(emptyFieldFund).filter(([key, value]) => !value).map(([key]) => key);
			toastStore.trigger({message: `The following fields are missing: ${emptyFields.join(', ')}`, background: 'variant-filled-error',})
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
			toAddFunds.forEach(fund => {
				if (remainingCashInflow > 0.01) {
				const addAmount = Math.min(fund.difference, remainingCashInflow);
				fund.amount += addAmount;
				remainingCashInflow -= addAmount;
				fund.difference = fund.desiredAmount - fund.amount;
				advice.push(`Add <span class="font-semibold p-1 bg-success-500 text-white rounded-lg">${addAmount.toFixed(2)}</span> to ${fund.name}.`);				}
			});

			toRemoveFunds.forEach(fund => {
				if (remainingCashInflow < -0.01) {
					const removeAmount = Math.min(-fund.difference, -remainingCashInflow);
					fund.amount -= removeAmount;
					remainingCashInflow += removeAmount;
					fund.difference = fund.desiredAmount - fund.amount;
					advice.push(`Remove <span class="font-semibold p-1 text-white rounded-lg bg-warning-500">${removeAmount.toFixed(2)}</span> from ${fund.name}.`);
				}
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
				advice.push(`Transfer <span class="font-semibold p-1 bg-neutral-500 rounded-lg text-white">${transferAmount.toFixed(2)}</span> from ${fundToRemoveFrom.name} to ${fundToAddTo.name}.`);				}
			}

			generated = true;
		}
		}

		function focusInput(id) {
			document.getElementById(id).focus();
		}

		$: totalPercentage = funds.reduce((total, fund) => total + fund.desired_perc, 0);

</script>
  <div class="container h-full mx-auto flex flex-col flex-nowrap justify-center py-10 items-center">
	<!-- Responsive Container (recommended) -->
	{#if loading}
		<div class="flex justify-center items-center">
			<div class="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-secondary-500 shadow-black shadow-sm"></div>
		</div>
	{:else}
	<div class="table-container">
		<!-- Native Table Element -->
		<table class="table table-interactive rounded-container-token border-2 border-surface-900 dark:border-surface-400 !shadow-xl">
			<thead class="rounded-container-token">
				<tr class="bg-surface-900 dark:bg-surface-600 text-white">
					<th class="text-center">Assets</th>
					<th class="text-center">Current Value</th>
					<th class="text-center transition-colors duration-300 rounded-container-token">Target allocation (%)</th>
					<th class="text-center">
						<button on:click={addFund} class="bg-secondary-active-token">
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
							<button use:popup={{ event: 'click', target: `removePopup-${i+1}`, placement: 'bottom', closeQuery: '#will-close' }} class="py-2 h-fit shadow-lg">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
									<path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" />
								</svg>
							</button>
							<div class="card p-4 z-1 bg-surface-100-800-token border-2 border-surface-500-400-token" data-popup="removePopup-{i+1}">
							  <span class="text-base font-semibold pb-2 mb-2">Are you sure?</span>
							  <button id="will-close" on:click={() => removeFund(fund.id)} class="ml-1 w-full mt-2">Delete</button>
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
				<tr class="bg-surface-900 dark:bg-surface-600 text-white" >
					<th colspan="1">New Portfolio Total</th>
					<td class="text-center relative cursor-default">
						{portfolioSum}</td>
					<td colspan="2" class="">
						<div class="w-full flex items-center">
							<button class="w-fit mx-auto text-xl font-semibold bg-tertiary-active-token" on:click={generate}>Generate</button>
						</div>
					</td>
				</tr>
				<tr>
					<td colspan="4" >
						<details class="w-full" bind:open={generated}>
							<summary style="display: none;"></summary>
							<div class="transition-all duration-300" transition:slide={{ duration: 300 }}>
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
								<div class="flex items-center gap-x-2 pt-4">
									<button class="btn variant-filled" on:click={handleCopyButtonClick} use:clipboard={adviceString}>
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 mr-1">
											<path fill-rule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0 1 18 9.375v9.375a3 3 0 0 0 3-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 0 0-.673-.05A3 3 0 0 0 15 1.5h-1.5a3 3 0 0 0-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6ZM13.5 3A1.5 1.5 0 0 0 12 4.5h4.5A1.5 1.5 0 0 0 15 3h-1.5Z" clip-rule="evenodd" />
											<path fill-rule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V9.375ZM6 12a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V12Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM6 15a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V15Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM6 18a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V18Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
										</svg>
										Copy
									</button>
									{#if showThumbsUp}
										<span class="text-xl bg-surface-200 rounded-full p-1" out:fade={{ duration: 250 }}>&#x1F44D;</span>
									{/if}
								</div>
							</div>
						</details>
					</td>
				</tr>
			</tfoot>
		</table>
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
	</div>
	{/if}
  </div>

  <!--
	Add to the generate function:

- Calculate the sum of the portfolio.
- Calculate the perc of the portfolio that should be in each fund based on desired_perc
- Calculate differences between actual amounts and desired amounts.
- Store them (as fundChanges)
- Now take the toAdd amount, and split it according to the desired_perc.
- Add the split amounts to the stored fundChanges
- Present the resulting fundChanges in "advice" and show how you arrived there.
  -->