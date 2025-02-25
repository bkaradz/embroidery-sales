<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button/index';
	import * as Card from '$lib/components/ui/card/index';
	import { Input } from '$lib/components/ui/input/index';
	import { Label } from '$lib/components/ui/label/index';
	import * as Select from '$lib/components/ui/select/index';
	import { formatCurrency, fx } from '$lib/utility/convert-currencies.js';
	import { expensesCategories, transactionPaymentMethods } from '$lib/utility/lists.js';
	import Loader from 'lucide-svelte/icons/loader';
	import DoubleArrowRight from 'svelte-radix/DoubleArrowRight.svelte';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import { paymentStore } from '$lib/stores/payment-store';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index';
	import HandCoins from 'lucide-svelte/icons/hand-coins';
	import { getContext } from 'svelte';

	const viewCurrency = getContext('viewCurrency') as () => string;

	let currencyInput = $state<number>();
	let currencySelected = $state('USD');

	let { data } = $props();

	const expensesTypes = expensesCategories.map((category) => {
		return {
			value: category,
			label: category
		};
	});

	const paymentMethods = transactionPaymentMethods.map((category) => {
		return {
			value: category,
			label: category
		};
	});

	const selectedCode = $state({ code: 'USD' });

	const currenciesNames = $state(data.currenciesNames);

	let className: string | undefined | null = undefined;
	export { className as class };

	let isLoading = false;

	const { form, errors, enhance } = superForm(data.form, {
		onUpdated({ form }) {
			if (form.message) {
				// Display the message using a toast library
				if (form.message.status == 'success') {
					toast.success(form.message.text);
				}
				if (form.message.status == 'error') {
					toast.error(form.message.text);
				}
			}
		}
	});

	const currenciesInputChange = (e: Event) => {
		const value = (e.target as HTMLInputElement).value;
		const currency = $paymentStore.currencies.get(currencySelected);
		if (currency) {
			if (currencyInput) {
				paymentStore.addPayment(data.converter, currencySelected, Number(value));
			}
		}
		currencyInput = undefined;
	};

	const changeSelectedCurrency = (currency: string) => {
		const getCurrency = $paymentStore.currencies.get(currency);

		if (getCurrency && getCurrency.checked) {
			currencyInput = getCurrency.amount;
		} else {
			currencyInput = undefined;
		}
	};

	const removeCurrencyPaid = (currency: string) => {
		paymentStore.removePayment(data.converter, currency);
	};
</script>

<div class="flex place-content-center items-center justify-center rounded px-4">
	<Card.Root class="mx-auto max-w-sm min-w-96 rounded">
		<Card.Header>
			<Card.Title class="text-center text-2xl">Expenses</Card.Title>
			<Card.Description>Enter the details below to record Expenses</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/create" use:enhance>
				<div class="grid gap-4">
					<div class="grid gap-2">
						<Label class="text-xs" for="receipt">Receipt</Label>
						<Input
							id="receipt"
							name="receipt"
							placeholder="Receipt"
							type="type"
							autocapitalize="none"
							autocomplete="username"
							autocorrect="off"
							disabled={isLoading}
							bind:value={$form.receipt}
							class="rounded text-left select-all"
							onclick={(e) => e.currentTarget.select()}
						/>
						{#if $errors.receipt}
							<small class="text-red-500">{$errors.receipt}</small>
						{/if}
					</div>
					<div class="grid gap-2">
						<Label class="text-xs " for="category">Category</Label>
						<Select.Root type="single" name="category" bind:value={$form.category}>
							<Select.Trigger class="w-full rounded">
								{$form.category ? $form.category : 'Food'}
							</Select.Trigger>
							<Select.Content class="rounded">
								<Select.Group>
									{#each expensesTypes as type (type.value)}
										<Select.Item class="rounded" value={type.value} label={type.label}>
											{type.label}
										</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
						{#if $errors.category}
							<small class="text-red-500">{$errors.category}</small>
						{/if}
					</div>
					<div class="grid gap-2">
						<Label class="text-xs " for="category">Category</Label>
						<Select.Root type="single" name="category" bind:value={$form.category}>
							<Select.Trigger class="w-full rounded">
								{$form.category ? $form.category : 'Food'}
							</Select.Trigger>
							<Select.Content class="rounded">
								<Select.Group>
									{#each expensesTypes as type (type.value)}
										<Select.Item class="rounded" value={type.value} label={type.label}>
											{type.label}
										</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
						{#if $errors.category}
							<small class="text-red-500">{$errors.category}</small>
						{/if}
					</div>
					{#if $form.category === 'Other'}
						<div class="grid gap-2">
							<Label class="text-xs" for="description">Description</Label>
							<Input
								id="description"
								name="description"
								placeholder="Description"
								type="text"
								autocapitalize="none"
								autocomplete="username"
								autocorrect="off"
								disabled={isLoading}
								bind:value={$form.description}
								class="rounded text-left select-all"
								onclick={(e) => e.currentTarget.select()}
							/>
							{#if $errors.description}
								<small class="text-red-500">{$errors.description}</small>
							{/if}
						</div>
					{/if}
					<div class="grid gap-2">
						<Label class="text-xs " for="paymentMethod">Payment Method</Label>
						<Select.Root type="single" name="paymentMethod" bind:value={$form.paymentMethod}>
							<Select.Trigger class="w-full rounded">
								{$form.paymentMethod ? $form.paymentMethod : 'Cash'}
							</Select.Trigger>
							<Select.Content class="rounded">
								<Select.Group>
									{#each paymentMethods as type (type.value)}
										<Select.Item class="rounded" value={type.value} label={type.label}>
											{type.label}
										</Select.Item>
									{/each}
								</Select.Group>
							</Select.Content>
						</Select.Root>
						{#if $errors.paymentMethod}
							<small class="text-red-500">{$errors.paymentMethod}</small>
						{/if}
					</div>
					{#if $form.paymentMethod === 'Cash'}
						<div class="flex flex-col space-y-1.5">
							<Label for="name"
								>Paid Amount in {$paymentStore.currencies.get(currencySelected)?.label}</Label
							>
							<div class="flex w-full max-w-sm items-center space-x-2">
								<Input
									class="rounded text-right select-all"
									bind:value={currencyInput}
									onchange={(e) => currenciesInputChange(e)}
									onclick={(e) => e.currentTarget.select()}
									id="name"
									type="number"
								/>
								<DropdownMenu.Root>
									<DropdownMenu.Trigger class={buttonVariants({ variant: 'outline' })}>
										{#snippet child({ props })}
											<Button {...props} variant="outline" size="icon" class="w-12 rounded">
												<HandCoins />
											</Button>
										{/snippet}
									</DropdownMenu.Trigger>
									<DropdownMenu.Content class="rounded" side="left" align="start" sideOffset={4}>
										<DropdownMenu.Group>
											<DropdownMenu.GroupHeading>Currencies</DropdownMenu.GroupHeading>
											<DropdownMenu.Separator />
											<DropdownMenu.RadioGroup bind:value={currencySelected}>
												{#each [...$paymentStore.currencies] as currency (currency)}
													<DropdownMenu.RadioItem
														value={currency[0]}
														onclick={() => changeSelectedCurrency(currency[0])}
													>
														{currency[1].label}
													</DropdownMenu.RadioItem>
												{/each}
											</DropdownMenu.RadioGroup>
										</DropdownMenu.Group>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</div>
						</div>
						<div class="flex flex-col space-y-1.5">
							{#if $paymentStore.payments.currenciesSelected}
								<div class="flex flex-col">
									<div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
										<div class="inline-block min-w-full py-2 sm:px-1 lg:px-8">
											<div class="overflow-hidden">
												<table
													class="text-surface w-full text-center text-sm font-light dark:text-white"
												>
													<thead
														class="border-b border-neutral-200 font-medium dark:border-white/10"
													>
														<tr>
															<th scope="col" class="px-1 py-1 text-right">$</th>
															<th scope="col" class="px-1 py-1 text-right">Paid</th>
															<th scope="col" class="px-1 py-1 text-right">USD</th>
															<th scope="col" class="px-1 py-1 text-right">Del</th>
														</tr>
													</thead>
													<tbody>
														{#each [...$paymentStore.currencies] as currency (currency.at(0))}
															{#if currency[1].checked}
																<tr class="border-b border-neutral-200 dark:border-white/10">
																	<td
																		class="px-1 py-1 text-right font-medium whitespace-nowrap capitalize"
																	>
																		{currency.at(0)}
																	</td>
																	<td class="px-1 py-1 text-right whitespace-nowrap">
																		{fx.format(data.converter, currency[1].amount, currency[0])}
																	</td>
																	<td class="px-1 py-1 text-right whitespace-nowrap">
																		{formatCurrency(data.converter, currency[1].amount, {
																			from: currency[1].code,
																			to: viewCurrency()
																		})}
																	</td>
																	<td class="px-1 py-1 text-right whitespace-nowrap">
																		<button
																			class="rounded px-1.5 py-0.5 text-xs outline-1 outline-gray-400"
																			onclick={() => removeCurrencyPaid(currency[0])}
																		>
																			Del
																		</button>
																	</td>
																</tr>
															{/if}
														{/each}
														<tr class=" border-b border-neutral-200 dark:border-white/10">
															<td
																colspan="2"
																class="px-1 py-1 text-right font-medium whitespace-nowrap">Total</td
															>
															<td class="px-1 py-1 text-right whitespace-nowrap">
																{formatCurrency(data.converter, $paymentStore.payments.total, {
																	from: 'USD',
																	to: viewCurrency()
																})}
															</td>
															<td colspan="1" class="px-1 py-1 whitespace-nowrap"></td>
														</tr>
													</tbody>
												</table>
											</div>
										</div>
									</div>
								</div>
							{/if}
						</div>
					{/if}
					{#if $form.paymentMethod !== 'Cash'}
						<div class="grid gap-2">
							<Label class="text-xs " for="currency">Currency</Label>
							<Select.Root
								type="single"
								name="currency"
								bind:value={$form.currency}
								onValueChange={(v) => (selectedCode.code = v)}
							>
								<Select.Trigger class="w-full rounded">
									{$form.currency ? $form.currency : 'US Dollar'}
								</Select.Trigger>
								<Select.Content class="rounded">
									<Select.Group>
										{#each currenciesNames as type (type.value)}
											<Select.Item class="rounded" value={type.value} label={type.label}>
												{type.label}
											</Select.Item>
										{/each}
									</Select.Group>
								</Select.Content>
							</Select.Root>
							{#if $errors.currency}
								<small class="text-red-500">{$errors.currency}</small>
							{/if}
						</div>
					{/if}
					<div class="grid gap-2">
						<div class="flex justify-between">
							<Label class="text-xs" for="openingBalance">Amount</Label>
							<Label
								class="flex items-center justify-center text-xs text-green-500"
								for="openingBalance"
							>
								{fx.format(data.converter, $form.amount ?? 0, selectedCode.code)}
								<span class="px-2"><DoubleArrowRight /></span>
								{formatCurrency(data.converter, $form.amount ?? 0, {
									from: selectedCode.code,
									to: 'USD'
								})}
							</Label>
						</div>
						<Input
							id="amount"
							name="amount"
							placeholder="Amount"
							type="number"
							autocapitalize="none"
							autocomplete="username"
							autocorrect="off"
							disabled={isLoading}
							bind:value={$form.amount}
							onclick={(e) => e.currentTarget.select()}
							class="rounded text-right select-all"
						/>
						{#if $errors.amount}
							<small class="text-red-500">{$errors.amount}</small>
						{/if}
					</div>

					<Button type="submit" disabled={isLoading} class="rounded">
						{#if isLoading}
							<Loader class="mr-2 h-4 w-4 animate-spin" />
						{/if}
						Submit
					</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
