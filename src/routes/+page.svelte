<script>
	import { popup } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { localStorageStore } from '@skeletonlabs/skeleton';
	import { getToastStore } from '@skeletonlabs/skeleton';

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
	let adviceString = '';
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
		console.log('Total Percentage:', totalPercentage);
		if (totalPercentage !== 100) {
			toastStore.trigger({message: 'The desired percentages do not add up to 100%.', 	background: 'variant-filled-error',})
			return;
		}

		// 1. Calculate new total portfolio value.
		advice.push('Portfolio Sum:', portfolioSum);

		// 2. Calculate desired value per fund including new cash flow and calculate diff. between current and desired values.
		const fundChanges = funds.map(fund => {
			const desiredAmount = (portfolioSum * fund.desired_perc) / 100;
			const difference = desiredAmount - fund.amount;
			advice.push('Fund:', fund.name, 'Desired Amount:', desiredAmount, 'Difference:', difference);
			return { ...fund, desiredAmount, difference };
		});

		// 3. Split funds into two arrays: one for funds where you need to add, and one for funds where you need to remove.
		let toAddFunds = fundChanges.filter(fund => fund.difference > 0);
		let toRemoveFunds = fundChanges.filter(fund => fund.difference < 0);

		// 4. For funds where you need to add, sort them in descending order of difference. Start adding from the fund with the highest difference. This minimizes the number of transactions.
		toAddFunds.sort((a, b) => b.difference - a.difference);

		// 5. For funds where you need to remove, sort them in ascending order of difference. Start removing from the fund with the lowest difference. This also minimizes the number of transactions.
		toRemoveFunds.sort((a, b) => a.difference - b.difference);

		console.log('To Add Funds:', toAddFunds);
		console.log('To Remove Funds:', toRemoveFunds);

		// 6. Keep track of the remaining cash inflow. When adding to a fund, subtract the added amount from the remaining cash inflow. When removing from a fund, add the removed amount to the remaining cash inflow.
		let remainingCashInflow = toAdd;
		console.log('Initial Remaining Cash Inflow:', remainingCashInflow);

		// 8. Repeat steps 5-7 until the remaining cash inflow is zero or close enough.
		while (toAddFunds.some(fund => fund.difference > 0.01) || toRemoveFunds.some(fund => fund.difference < -0.01)) {
			toAddFunds.forEach(fund => {
				if (remainingCashInflow > 0.01) {
				const addAmount = Math.min(fund.difference, remainingCashInflow);
				fund.amount += addAmount;
				remainingCashInflow -= addAmount;
				fund.difference = fund.desiredAmount - fund.amount;
				advice.push('Add:', addAmount, 'to', fund.name, '. Remaining Cash Inflow:', remainingCashInflow);
				}
			});

			toRemoveFunds.forEach(fund => {
				if (remainingCashInflow > 0.01) {
				const removeAmount = Math.min(-fund.difference, remainingCashInflow);
				fund.amount -= removeAmount;
				remainingCashInflow += removeAmount;
				fund.difference = fund.desiredAmount - fund.amount;
				advice.push('Remove:', removeAmount, 'from', fund.name, '. Remaining Cash Inflow:', remainingCashInflow);
				}
			});

			if (remainingCashInflow <= 0.01) {
				const fundToRemoveFrom = toRemoveFunds.find(fund => fund.difference < -0.01);
				const fundToAddTo = toAddFunds.find(fund => fund.difference > 0.01);
				if (fundToRemoveFrom && fundToAddTo) {
				const transferAmount = Math.min(-fundToRemoveFrom.difference, fundToAddTo.difference);
				fundToRemoveFrom.amount -= transferAmount;
				fundToAddTo.amount += transferAmount;
				fundToRemoveFrom.difference = fundToRemoveFrom.desiredAmount - fundToRemoveFrom.amount;
				fundToAddTo.difference = fundToAddTo.desiredAmount - fundToAddTo.amount;
				advice.push('Transfer:', transferAmount, 'from', fundToRemoveFrom.name, 'to', fundToAddTo.name);
				}
			}

			console.log('Remaining Cash Inflow:', remainingCashInflow);
			console.log('To Add Funds:', toAddFunds);
			console.log('To Remove Funds:', toRemoveFunds);

			generated = true;
			adviceString = advice.join('\n\n');
		}
		}

		function focusInput(id) {
			document.getElementById(id).focus();
		}

		$: totalPercentage = funds.reduce((total, fund) => total + fund.desired_perc, 0);

</script>
  <div class="container h-full mx-auto flex justify-center pb-40 items-center">
	<!-- Responsive Container (recommended) -->
	{#if loading}
		<div class="flex justify-center items-center">
			<div class="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-secondary-500 shadow-black shadow-sm"></div>
		</div>
	{:else}
	<div class="table-container">
		<!-- Native Table Element -->
		<table class="table table-hover">
			<thead>
				<tr class="text-lg">
					<th class="text-center">Funds</th>
					<th class="text-center">Amount</th>
					<th class="text-center transition-colors duration-300 rounded-lg" class:bg-warning-700={totalPercentage !== 100}>Target percentage</th>
					<th class="text-center">
						<button on:click={addFund}>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
								<path d="M6 3a3 3 0 0 0-3 3v2.25a3 3 0 0 0 3 3h2.25a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6ZM15.75 3a3 3 0 0 0-3 3v2.25a3 3 0 0 0 3 3H18a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3h-2.25ZM6 12.75a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h2.25a3 3 0 0 0 3-3v-2.25a3 3 0 0 0-3-3H6ZM17.625 13.5a.75.75 0 0 0-1.5 0v2.625H13.5a.75.75 0 0 0 0 1.5h2.625v2.625a.75.75 0 0 0 1.5 0v-2.625h2.625a.75.75 0 0 0 0-1.5h-2.625V13.5Z" />
							</svg>
							Add fund</button>
					</th>
				</tr>
			</thead>
			<tbody>
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
						<td class="text-center">
							<button use:popup={{ event: 'click', target: `removePopup-${i+1}`, placement: 'bottom' }} class="py-2 h-fit">
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
									<path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" />
								</svg>
							</button>
							<div class="card p-4 variant-filled-secondary" data-popup="removePopup-{i+1}">
							  <span class="text-base">Are you sure?</span>
							  <button on:click={() => removeFund(fund.id)} class="ml-1">Remove</button>
							  <div class="arrow bg-secondary-500" />
						  	</div>
						</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<th colspan="1">New cash flow</th>
					<td on:click={() => focusInput(`to_add`)} class="cursor-text">
						<input id="to_add" bind:value={toAdd} class="w-ful text-center" placeholder="Portfolio amount" type="number" />
					</td>
				</tr>
				<tr>
					<th colspan="1">New portfolio total</th>
					<td class="text-center relative before:block before:absolute before:top-0 before:h-[0.125rem] before:rounded-full before:w-1/3 before:left-1/2 before:-translate-x-1/2 before:bg-surface-900-50-token">
						{portfolioSum}</td>
					<td>
						<button on:click={generate}>Generate</button>
					</td>
				</tr>
				{#if generated}
					<tr>
						<td colspan="4">
							{adviceString}
						</td>
					</tr>
				{/if}
			</tfoot>
		</table>
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