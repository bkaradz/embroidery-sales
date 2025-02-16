<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { Button, buttonVariants } from '$lib/components/ui/button/index';
	import * as Card from '$lib/components/ui/card/index';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as Command from '$lib/components/ui/command/index';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index';
	import { Input } from '$lib/components/ui/input/index';
	import { Label } from '$lib/components/ui/label/index';
	import * as Popover from '$lib/components/ui/popover/index';
	import * as Select from '$lib/components/ui/select/index';
	import * as Table from '$lib/components/ui/table/index';
	import type { Orders } from '$lib/server/db/schema/schema';
	import { paymentStore } from '$lib/stores/paymentStore';
	import { bankList, mobilePaymentList, paymentList } from '$lib/utility/configList.js';
	import { formatCurrency, fx } from '$lib/utility/convertCurrencies.js';
	import type { TransactionPaymentMethodsUnion } from '$lib/utility/lists.js';
	import { cn } from '$lib/utils';
	import type { ActionResult } from '@sveltejs/kit';
	import Big from 'big.js';
	import { format } from 'date-fns';
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import HandCoins from 'lucide-svelte/icons/hand-coins';
	import { onMount, tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { getContext } from 'svelte';

	const viewCurrency = getContext('viewCurrency') as () => string;

	let paymentMethod = $state<TransactionPaymentMethodsUnion>('Cash');
	let currencyInput = $state<number>();
	let referenceNumber = $state<string>();
	let bankMobileCardPaidAmount = $state<number>();
	let bank = $state('bancABC');
	let mobile = $state('ecoCash');

	const selectedPaymentMethod = $derived(
		paymentList.find((f) => f.value === paymentMethod)?.label ?? 'Select payment method'
	);

	const selectedBank = $derived(bankList.find((f) => f.value === bank)?.label ?? 'Select bank');

	const selectedMobilePayment = $derived(
		mobilePaymentList.find((f) => f.value === mobile)?.label ?? 'Select mobile payment'
	);

	let { data } = $props();

	let currencySelected = $state('USD');

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

	onMount(() => {
		paymentStore.initRates(data.currenciesMap);
		goto('/payments');
	});

	let customerComboboxOpen = $state(false);
	let customerId: number | undefined = $state(undefined);

	let triggerRef = $state<HTMLButtonElement>(null!);

	const selectedValue = $derived(data.customers.find((f) => f.value === customerId)?.label);

	function closeAndFocusTrigger() {
		customerComboboxOpen = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}

	let selectedOrders = $state<Orders[]>([]);
	let selectedOrdersIds = $state<number[]>([]);

	let calculateOrders = $derived.by(() => {
		let selectedItems = selectedOrders.length;
		let sumSelectedTotalAmount = Big(0);
		let sumSelectedTotalPaid = Big(0);
		let sumSelectedBalanceRemaining = Big(0);
		if (selectedItems > 0) {
			selectedOrders.forEach((item) => {
				sumSelectedTotalAmount = sumSelectedTotalAmount.plus(item.totalAmount);
				sumSelectedTotalPaid = sumSelectedTotalPaid.plus(item.totalPaid);
				sumSelectedBalanceRemaining = sumSelectedBalanceRemaining.plus(
					Big(item.totalAmount).minus(item.totalPaid)
				);
			});
		}
		return {
			selectedItems,
			sumSelectedTotalAmount,
			sumSelectedTotalPaid,
			sumSelectedBalanceRemaining
		};
	});

	const amountPaidTotals = $derived.by(() => {
		const ordersTotal = Number(calculateOrders.sumSelectedBalanceRemaining.toFixed(2));
		const { creditTotal, creditsIds } = data.credits;

		if (paymentMethod === 'Cash') {
			const amountPaid = Number($paymentStore.payments.total.plus(creditTotal).toFixed(2));
			const change = Number(Big(amountPaid).minus(ordersTotal).toFixed(2));
			const cashData = JSON.stringify($paymentStore.payments.paidCurrencies);
			return {
				totals: { paymentMethod, ordersTotal, amountPaid, change, cashData },
				credits: { creditTotal, creditsIds }
			};
		}
		if (paymentMethod === 'Bank') {
			const amountPaid = Number(
				Big(bankMobileCardPaidAmount ?? 0)
					.plus(creditTotal)
					.toFixed(2)
			);
			const change = Number(Big(amountPaid).minus(ordersTotal));
			return {
				totals: {
					paymentMethod,
					ordersTotal,
					amountPaid,
					change,
					referenceNumber,
					bankMobileCardPaidAmount,
					bank
				},
				credits: { creditTotal, creditsIds }
			};
		}
		if (paymentMethod === 'Mobile') {
			const amountPaid = Number(
				Big(bankMobileCardPaidAmount ?? 0)
					.plus(creditTotal)
					.toFixed(2)
			);
			const change = Number(Big(amountPaid).minus(ordersTotal));
			return {
				totals: {
					paymentMethod,
					ordersTotal,
					amountPaid,
					change,
					referenceNumber,
					bankMobileCardPaidAmount,
					mobile
				},
				credits: { creditTotal, creditsIds }
			};
		}
		if (paymentMethod === 'Card') {
			const amountPaid = Number(
				Big(bankMobileCardPaidAmount ?? 0)
					.plus(creditTotal)
					.toFixed(2)
			);
			const change = Number(Big(amountPaid).minus(ordersTotal));
			return {
				totals: {
					paymentMethod,
					ordersTotal,
					amountPaid,
					change,
					referenceNumber,
					bankMobileCardPaidAmount
				},
				credits: { creditTotal, creditsIds }
			};
		}
	});

	function addOrder(id: number) {
		const addOrder = data.orders.find((order) => order.id === id);
		if (addOrder) {
			selectedOrders.push(addOrder);
			selectedOrdersIds.push(id);
		}
	}

	function removeOrder(id: number) {
		const removeOrder = selectedOrders.filter((order) => order.id !== id);
		const removeOrderId = selectedOrdersIds.filter((orderId) => orderId !== id);
		selectedOrders = removeOrder;
		selectedOrdersIds = removeOrderId;
	}

	const removeCurrencyPaid = (currency: string) => {
		paymentStore.removePayment(data.converter, currency);
	};

	type E = {
		action: URL;
		formData: FormData;
		formElement: HTMLFormElement;
		controller: AbortController;
		submitter: HTMLElement | null;
		cancel(): void;
	};

	const handleSubmit = (e: E) => {
		let errors = false;
		if (data.todaysCashRegister.length === 0) {
			toast.error(`Please create today's cash register!`);
			errors = true;
			return e.cancel();
		}
		if (!customerId) {
			toast.error('Please select a customer');
			errors = true;
			return e.cancel();
		}
		if (!amountPaidTotals?.credits.creditTotal) {
			if (paymentMethod === 'Cash') {
				// Check if they is selected data
				if ($paymentStore.payments.currenciesSelected === 0) {
					toast.error('Please enter the cash amounts paid');
					errors = true;
					return e.cancel();
				}
			}
			if (paymentMethod === 'Bank') {
				if (!bank) {
					toast.error('Please select the bank');
					errors = true;
					e.cancel();
				}
				if (!bankMobileCardPaidAmount) {
					toast.error('Please enter the paid amount');
					errors = true;
					e.cancel();
				}
				if (!referenceNumber) {
					toast.error('Please enter the reference number');
					errors = true;
					e.cancel();
				}
			}
			if (paymentMethod === 'Mobile') {
				if (!mobile) {
					toast.error('Please select the mobile payment method');
					errors = true;
					e.cancel();
				}
				if (!bankMobileCardPaidAmount) {
					toast.error('Please enter the paid amount');
					errors = true;
					e.cancel();
				}
				if (!referenceNumber) {
					toast.error('Please enter the reference number');
					errors = true;
					e.cancel();
				}
			}
			if (paymentMethod === 'Card') {
				if (!bankMobileCardPaidAmount) {
					toast.error('Please enter the paid amount');
					errors = true;
					e.cancel();
				}
				if (!referenceNumber) {
					toast.error('Please enter the reference number');
					errors = true;
					e.cancel();
				}
			}
		}
		if (amountPaidTotals?.credits.creditTotal) {
			if (
				Big(amountPaidTotals?.totals.ordersTotal).lte(0) &&
				Big(bankMobileCardPaidAmount ?? 0).lte(0) &&
				$paymentStore.payments.total.lte(0)
			) {
				toast.error('Please enter amount or select orders');
				errors = true;
				e.cancel();
			}
			if (selectedOrdersIds.length > 0) {
				const ordersTotal = amountPaidTotals.totals.ordersTotal;
				const totalSubmitted = Big(bankMobileCardPaidAmount ?? 0).plus(
					amountPaidTotals.credits.creditTotal
				);
				const totalCashSubmitted = $paymentStore.payments.total.plus(
					amountPaidTotals.credits.creditTotal
				);
				if (paymentMethod === 'Cash') {
					// Check if they is selected data
					if (totalCashSubmitted.lt(ordersTotal)) {
						toast.error('The cash amounts totals should be equal or more than orders total');
						errors = true;
						return e.cancel();
					}
				}
				if (paymentMethod === 'Bank') {
					if (!bank) {
						toast.error('Please select the bank');
						errors = true;
						e.cancel();
					}
					if (totalSubmitted.lt(ordersTotal)) {
						toast.error('The paid amount totals should be equal or more than orders total');
						errors = true;
						e.cancel();
					}
					if (!referenceNumber) {
						toast.error('Please enter the reference number');
						errors = true;
						e.cancel();
					}
				}
				if (paymentMethod === 'Mobile') {
					if (!mobile) {
						toast.error('Please select the mobile payment method');
						errors = true;
						e.cancel();
					}
					if (totalSubmitted.lt(ordersTotal)) {
						toast.error('The paid amount totals should be equal or more than orders total');
						errors = true;
						e.cancel();
					}
					if (!referenceNumber) {
						toast.error('Please enter the reference number');
						errors = true;
						e.cancel();
					}
				}
				if (paymentMethod === 'Card') {
					if (totalSubmitted.lt(ordersTotal)) {
						toast.error('The paid amount totals should be equal or more than orders total');
						errors = true;
						e.cancel();
					}
					if (!referenceNumber) {
						toast.error('Please enter the reference number');
						errors = true;
						e.cancel();
					}
				}
			}
		}

		if (!errors) {
			e.submitter;
		}
		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'success') {
				toast.success('Payment has been successfully created');
				selectedOrders = [];
				selectedOrdersIds = [];
				customerId = undefined;
				paymentMethod = 'Cash';
				bank = '';
				referenceNumber = '';
				bankMobileCardPaidAmount = undefined;
				paymentStore.reset(data.currenciesMap);
				goto('/payments');
			}
		};
	};

	const searchParams = (customerId: number) => {
		if (!customerId) return;
		if (browser) {
			goto(`?customer=${customerId.toString()}`, { keepFocus: true });
		}
	};
</script>

<div class="flex gap-2">
	<!-- Main -->
	<div class="grow rounded">
		<div class="grid grid-cols-1 grid-rows-9 gap-2.5">
			<div class=" h-14 place-content-center rounded border px-2">
				<div class="flex items-center justify-between">
					<div class="w-64">
						<Popover.Root bind:open={customerComboboxOpen}>
							<Popover.Trigger bind:ref={triggerRef}>
								{#snippet child({ props })}
									<Button
										variant="outline"
										class="w-full justify-between rounded"
										{...props}
										role="combobox"
										aria-expanded={customerComboboxOpen}
									>
										{selectedValue || 'Select a customer...'}
										<ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
									</Button>
								{/snippet}
							</Popover.Trigger>
							<Popover.Content class="w-full p-0">
								<Command.Root>
									<Command.Input class="rounded" name="customer" placeholder="Search customer..." />
									<Command.List>
										<Command.Empty>No customer found.</Command.Empty>
										<Command.Group>
											{#each data.customers as customer}
												<Command.Item
													value={customer.value.toString()}
													onSelect={() => {
														customerId = customer.value;
														searchParams(customer.value);
														closeAndFocusTrigger();
													}}
												>
													<Check
														class={cn(
															'mr-2 size-4',
															customerId !== customer.value && 'text-transparent'
														)}
													/>
													{customer.label}
												</Command.Item>
											{/each}
										</Command.Group>
									</Command.List>
								</Command.Root>
							</Popover.Content>
						</Popover.Root>
					</div>
				</div>
			</div>
			<div class=" row-span-8 rounded border">
				<Table.Root>
					<Table.Caption>A list of your recent invoices.</Table.Caption>
					<Table.Header>
						<Table.Row>
							<Table.Head class="">#</Table.Head>
							<Table.Head class="">ID</Table.Head>
							<Table.Head>Order Date</Table.Head>
							<Table.Head class="text-right">Total Amount</Table.Head>
							<Table.Head class="text-right">Total Paid</Table.Head>
							<Table.Head class="text-right">Balance</Table.Head>
							<Table.Head class="text-right">Status</Table.Head>
							<Table.Head class="text-right">Payment Status</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#if data.orders.length > 0}
							{#each data.orders as order (order?.id)}
								<Table.Row>
									<Table.Cell class="font-medium">
										<Checkbox
											onCheckedChange={(v) => {
												if (v) {
													addOrder(order.id);
												} else {
													removeOrder(order.id);
												}
											}}
										/>
									</Table.Cell>
									<Table.Cell class="font-medium">{order?.id}</Table.Cell>
									<Table.Cell class="">
										{format(new Date(order.orderDate), 'yyyy-MM-dd HH:mm:ss')}
									</Table.Cell>
									<Table.Cell class="text-right">
										{formatCurrency(data.converter, order.totalAmount ?? 0, { to: viewCurrency() })}
									</Table.Cell>
									<Table.Cell class="text-right">
										{formatCurrency(data.converter, order.totalPaid ?? 0, { to: viewCurrency() })}
									</Table.Cell>
									<Table.Cell class="text-right">
										{formatCurrency(data.converter, Big(order.totalAmount).minus(order.totalPaid), {
											to: viewCurrency()
										})}
									</Table.Cell>
									<Table.Cell>{order?.status}</Table.Cell>
									<Table.Cell>{order?.paymentStatus}</Table.Cell>
								</Table.Row>
							{/each}
						{:else}
							<Table.Row>
								<Table.Cell colspan={8} class="h-24 text-center">No results.</Table.Cell>
							</Table.Row>
						{/if}
					</Table.Body>
					<Table.Footer>
						<Table.Row>
							<Table.Cell colspan={3}>
								{calculateOrders.selectedItems} Orders Selected Totals
							</Table.Cell>
							<Table.Cell class="text-right">
								{formatCurrency(data.converter, calculateOrders.sumSelectedTotalAmount, {
									to: viewCurrency()
								})}
							</Table.Cell>
							<Table.Cell class="text-right">
								{formatCurrency(data.converter, calculateOrders.sumSelectedTotalPaid, {
									to: viewCurrency()
								})}
							</Table.Cell>
							<Table.Cell class="text-right">
								{formatCurrency(data.converter, calculateOrders.sumSelectedBalanceRemaining, {
									to: viewCurrency()
								})}
							</Table.Cell>
							<Table.Cell colspan={2}></Table.Cell>
						</Table.Row>
					</Table.Footer>
				</Table.Root>
			</div>
		</div>
	</div>
	<!-- Sidebar -->
	<div class="sticky w-80 flex-none rounded border p-2">
		{#if data.selectedCustomer}
			<Card.Root class="mb-2 rounded">
				<div class="block rounded">
					<div class="border-b px-3 py-2">
						<h5 class="flex items-center justify-start">
							<span class="mr-2 text-green-600">
								{data.selectedCustomer.fullName}
							</span>
							<span
								class="inline-block rounded-[0.27rem] bg-blue-100 px-[0.65em] pt-[0.35em] pb-[0.25em] text-center align-baseline text-[0.75em] leading-none font-bold whitespace-nowrap text-blue-700"
							>
								ID: {data.selectedCustomer.id}
							</span>
						</h5>
					</div>

					<div class="border-b p-2 text-xs">
						{#if data.selectedCustomer.phone}
							<p>
								Phone: <span>{data.selectedCustomer.phone}</span>
							</p>
						{/if}
						{#if data.selectedCustomer.email}
							<p>
								Email: <span>{data.selectedCustomer.email}</span>
							</p>
						{/if}
					</div>
					{#if data.credits}
						<div class="block rounded">
							<div class="px-3 py-2">
								<h5 class="flex items-center justify-start">
									<span class="mr-2 text-green-600"> Credit: </span>
									<span class="rounded bg-blue-100 px-2 text-blue-700">
										<!-- {data.credits.creditTotal.toFixed(2)} -->
										{formatCurrency(data.converter, data.credits.creditTotal, {
											to: viewCurrency()
										})}
									</span>
								</h5>
							</div>
						</div>
					{/if}
				</div>
			</Card.Root>
		{/if}
		<Card.Root class="rounded">
			<Card.Header class="m-2 p-0">
				<Card.Title>Paid Amount</Card.Title>
				<Card.Description>Enter the amount paid.</Card.Description>
			</Card.Header>
			<Card.Content class="m-2 p-0">
				<div class="grid w-full items-center gap-4">
					<div class="flex flex-col space-y-1.5">
						<Label for="paymentMethod">Payment Method</Label>
						<Select.Root type="single" bind:value={paymentMethod}>
							<Select.Trigger id="paymentMethod" class="rounded">
								{selectedPaymentMethod}
							</Select.Trigger>
							<Select.Content class="rounded">
								{#each paymentList as { value, label }}
									<Select.Item class="rounded" {value} {label} />
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
					{#if paymentMethod === 'Cash'}
						<div class="flex flex-col space-y-1.5">
							<Label for="name"
								>Paid Amount in {$paymentStore.currencies.get(currencySelected)?.label}</Label
							>
							<div class="flex w-full max-w-sm items-center space-x-2">
								<Input
									class="rounded text-right select-all"
									bind:value={currencyInput}
									onchange={(e) => currenciesInputChange(e)}
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
					{#if paymentMethod === 'Bank'}
						<div class="flex flex-col space-y-1.5">
							<Label for="bank">Select Bank</Label>
							<Select.Root type="single" bind:value={bank}>
								<Select.Trigger id="bank" class="rounded">
									{selectedBank}
								</Select.Trigger>
								<Select.Content class="rounded">
									{#each bankList as { value, label }}
										<Select.Item class="rounded" {value} {label} />
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<div class="flex flex-col space-y-1.5">
							<Label for="bankMobileCardPaidAmount">Paid Amount</Label>
							<Input
								class="rounded text-right select-all"
								bind:value={bankMobileCardPaidAmount}
								name="bankMobileCardPaidAmount"
								id="bankMobileCardPaidAmount"
								type="number"
							/>
						</div>
						<div class="flex flex-col space-y-1.5">
							<Label for="referenceNumber">Enter Ref Number</Label>
							<Input
								class="rounded text-right select-all"
								bind:value={referenceNumber}
								name="referenceNumber"
								id="referenceNumber"
								type="text"
								required
							/>
						</div>
					{/if}
					{#if paymentMethod === 'Mobile'}
						<div class="flex flex-col space-y-1.5">
							<Label for="mobile">Select Mobile Payment</Label>
							<Select.Root type="single" bind:value={mobile}>
								<Select.Trigger id="mobile" class="rounded">
									{selectedMobilePayment}
								</Select.Trigger>
								<Select.Content class="rounded">
									{#each mobilePaymentList as { value, label }}
										<Select.Item class="rounded" {value} {label} />
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<div class="flex flex-col space-y-1.5">
							<Label for="bankMobileCardPaidAmount">Paid Amount</Label>
							<Input
								class="rounded text-right select-all"
								bind:value={bankMobileCardPaidAmount}
								name="bankMobileCardPaidAmount"
								id="bankMobileCardPaidAmount"
								type="number"
							/>
						</div>
						<div class="flex flex-col space-y-1.5">
							<Label for="referenceNumber">Enter Ref Number</Label>
							<Input
								class="rounded text-right select-all"
								bind:value={referenceNumber}
								name="referenceNumber"
								id="referenceNumber"
								type="text"
								required
							/>
						</div>
					{/if}

					{#if paymentMethod === 'Card'}
						<div class="flex flex-col space-y-1.5">
							<Label for="bankMobileCardPaidAmount">Paid Amount</Label>
							<Input
								class="rounded text-right select-all"
								bind:value={bankMobileCardPaidAmount}
								name="bankMobileCardPaidAmount"
								id="bankMobileCardPaidAmount"
								type="number"
							/>
						</div>
						<div class="flex flex-col space-y-1.5">
							<Label for="referenceNumber">Enter Ref Number</Label>
							<Input
								class="rounded text-right select-all"
								bind:value={referenceNumber}
								name="referenceNumber"
								id="referenceNumber"
								type="text"
							/>
						</div>
					{/if}
					{#if customerId}
						<div class="flex flex-col space-y-1.5">
							<div class="flex flex-col">
								<div class="overflow-x-auto sm:-mx-6 lg:-mx-8">
									<div class="inline-block min-w-full py-2 sm:px-1 lg:px-8">
										<div class="overflow-hidden">
											<table
												class="text-surface w-full text-center text-sm font-light dark:text-white"
											>
												<thead
													class=" border-b border-neutral-200 font-medium dark:border-white/10"
												>
													<tr>
														<th scope="col" class="px-1 py-1 text-right">#</th>
														<th scope="col" class="px-1 py-1 text-right">Amounts</th>
													</tr>
												</thead>
												<tbody>
													{#if 1}
														<tr class="border-b border-neutral-200 dark:border-white/10">
															<td
																class="px-1 py-1 text-right font-medium whitespace-nowrap capitalize"
															>
																Amount Paid
															</td>
															<td class="px-1 py-1 text-right whitespace-nowrap">
																{formatCurrency(
																	data.converter,
																	amountPaidTotals?.totals.amountPaid ?? 0,
																	{ to: viewCurrency() }
																)}
															</td>
														</tr>
													{/if}

													<tr class=" border-b border-neutral-200 dark:border-white/10">
														<td
															colspan="1"
															class="px-1 py-1 text-right font-medium whitespace-nowrap"
														>
															Orders Total
														</td>
														<td class="px-1 py-1 text-right whitespace-nowrap">
															{formatCurrency(
																data.converter,
																amountPaidTotals?.totals.ordersTotal ?? 0,
																{ to: viewCurrency() }
															)}
														</td>
													</tr>
													<tr class=" border-b border-neutral-200 dark:border-white/10">
														<td
															colspan="1"
															class="px-1 py-1 text-right font-medium whitespace-nowrap"
														>
															Change
														</td>
														<td class="px-1 py-1 text-right whitespace-nowrap">
															{formatCurrency(
																data.converter,
																amountPaidTotals?.totals.change ?? 0,
																{ to: viewCurrency() }
															)}
														</td>
													</tr>
												</tbody>
											</table>
										</div>
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</Card.Content>
			<Card.Footer class="m-2 flex justify-between p-0">
				<form action="?/create" method="POST" class="w-full" use:enhance={(e) => handleSubmit(e)}>
					<input type="number" name="customerId" value={data.selectedCustomer?.id} class="hidden" />
					<input
						type="text"
						name="creditsIds"
						value={JSON.stringify(amountPaidTotals?.credits.creditsIds)}
						class="hidden"
					/>
					<input
						type="text"
						name="amountPaidData"
						value={JSON.stringify(amountPaidTotals?.totals)}
						class="hidden"
					/>
					<input
						type="text"
						name="ordersPaidIds"
						value={JSON.stringify(selectedOrdersIds)}
						class="hidden"
					/>
					<Button type="submit" class="w-full rounded">submit</Button>
				</form>
			</Card.Footer>
		</Card.Root>
	</div>
</div>
