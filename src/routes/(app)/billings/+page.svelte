<script lang="ts">
	import { browser } from '$app/environment';
	import { enhance } from '$app/forms';
	import { goto, invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index';
	import * as Card from '$lib/components/ui/card/index';
	import * as Command from '$lib/components/ui/command/index';
	import * as Dialog from '$lib/components/ui/dialog/index';
	import { Input } from '$lib/components/ui/input/index';
	import { Label } from '$lib/components/ui/label/index';
	import * as Popover from '$lib/components/ui/popover/index';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';
	import * as Select from '$lib/components/ui/select/index';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import * as Table from '$lib/components/ui/table/index';
	import { cartItems } from '$lib/stores/billingStore';
	import { calculateCart } from '$lib/utility/calculateCart';
	import { status } from '$lib/utility/configList';
	import { formatCurrency } from '$lib/utility/convertCurrencies';
	import type { CartItem } from '$lib/utility/schemas';
	import { cn } from '$lib/utils';
	import type { ActionResult } from '@sveltejs/kit';
	import { error } from '@sveltejs/kit';
	import Check from 'lucide-svelte/icons/check';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import Minus from 'lucide-svelte/icons/minus';
	import Plus from 'lucide-svelte/icons/plus';
	import Trash_2 from 'lucide-svelte/icons/trash-2';
	import { getContext, onMount, tick } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { getColumn } from './columns';
	import DataTable from './data-table.svelte';

	const viewCurrency = getContext('viewCurrency') as () => string;

	let { data } = $props();

	onMount(() => {
		goto('/billings');
	});

	let tiersValue = $state('1');

	let purchaseOrderNumber = $state<number>();

	const newPriceTires = data.aggPricingTiers.map((tiers) => {
		if (tiers.default) {
			tiersValue = tiers.id.toString();
		}
		return {
			value: tiers.id.toString(),
			label: `${tiers.name} (${tiers.id})`
		};
	});

	const tiersTriggerContent = $derived(
		newPriceTires.find((f) => Number(f.value) === Number(tiersValue))?.label ??
			'Select a pricing tier'
	);

	let cartProducts = $state<CartItem[]>([]);

	let cart = $derived.by(() => {
		const newSelection = data.aggPricingTiers.find((tier) => tier.id === Number(tiersValue));
		if (!newSelection) error(404, { message: `newSelection is needed` });
		return calculateCart(newSelection.pricingTierDetails, cartProducts);
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

	let openDialog = $state(false);

	const closeDialog = () => {
		cartProducts = $cartItems;
		openDialog = false;
	};

	const removeProduct = (id: number) => {
		cartItems.deleteProduct(id);
		cartProducts = $cartItems;
	};

	const calculateQuantity = (id: number, sign: 'minus' | 'plus') => {
		cartItems.calculateQuantity(id, sign);
		cartProducts = $cartItems;
	};
	const changeQuantity = (e: Event, id: number) => {
		const quantity = (e.target as HTMLInputElement).value;
		cartItems.changeQuantity(+quantity, id);
		cartProducts = $cartItems;
	};

	let orderStatus = $state('Sales Order');

	const triggerContent = $derived(
		status.find((f) => f.value === orderStatus)?.label ?? 'Select a status'
	);

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
		if (!customerId) {
			toast.error('Please select a customer');
			errors = true;
			e.cancel();
		}
		if (cartProducts.length < 1) {
			toast.error('Please add products');
			errors = true;
			e.cancel();
		}
		if (!errors) {
			e.submitter;
		}
		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'success') {
				toast.success('Order has been successfully created');
				customerId = undefined;
				cartItems.reset();
				cartProducts = $cartItems;
				await invalidateAll();
			}
		};
	};

	let customerTab = $state(false);

	const searchParams = (customerId: number) => {
		if (!customerId) return;
		if (browser) {
			goto(`?customer=${customerId.toString()}`, { keepFocus: true });
		}
	};

	type Event2 = WheelEvent & { currentTarget: EventTarget & HTMLInputElement };

	const mouseWheel = (e: Event2, id: number) => {
		const sign: 'minus' | 'plus' = e.deltaY > 0 ? 'minus' : 'plus';
		calculateQuantity(id, sign);
	};
</script>

<div class="flex gap-2">
	<div class="grow rounded">
		<div class="grid grid-cols-1 grid-rows-9 gap-2.5">
			<div class="h-14 place-content-center rounded border px-2">
				<div class="flex items-center justify-between">
					<Button class="rounded" variant="outline" onclick={() => (openDialog = true)}>
						Add Products
					</Button>

					<Select.Root type="single" name="tiers" bind:value={tiersValue}>
						<Select.Trigger class="w-[250px] rounded">
							{tiersTriggerContent}
						</Select.Trigger>
						<Select.Content class="rounded">
							<Select.Group>
								<Select.GroupHeading>Pricing Tiers</Select.GroupHeading>
								{#each newPriceTires as tier (tier.value)}
									<Select.Item class="rounded" value={tier.value} label={tier.label} />
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>

					<Select.Root type="single" name="status" bind:value={orderStatus}>
						<Select.Trigger class="w-[180px] rounded">
							{triggerContent}
						</Select.Trigger>
						<Select.Content class="rounded">
							<Select.Group>
								<Select.GroupHeading>Status</Select.GroupHeading>
								{#each status as state (state.value)}
									<Select.Item class="rounded" value={state.value} label={state.label} />
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>

					<Button
						class="rounded"
						variant="outline"
						size="icon"
						onclick={() => (customerTab = !customerTab)}
					>
						{#if customerTab}
							<ChevronLeft />
						{:else}
							<ChevronRight />
						{/if}
					</Button>
				</div>
			</div>
			<div class="row-span-8 rounded border">
				<Table.Root>
					<Table.Caption>A list of your recent invoices.</Table.Caption>
					<Table.Header>
						<Table.Row>
							<Table.Head class="">ID</Table.Head>
							<Table.Head>Name</Table.Head>
							<Table.Head>Stitches</Table.Head>
							<Table.Head class="text-right">Unit Price</Table.Head>
							<Table.Head class="text-right">Quantity</Table.Head>
							<Table.Head class="text-right">Total</Table.Head>
							<Table.Head class="text-right">Delete</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each cart.items as item (item?.id)}
							<Table.Row>
								<Table.Cell class="font-medium">{item?.id}</Table.Cell>
								<Table.Cell class="line-clamp-1 block overflow-hidden text-ellipsis"
									>{item?.name}</Table.Cell
								>
								<Table.Cell>{item?.stitches}</Table.Cell>
								<Table.Cell class="text-right">
									{formatCurrency(data.converter, item.unitPrice, { to: viewCurrency() })}
								</Table.Cell>
								<Table.Cell class="block text-right">
									<div class="relative flex items-center">
										<button
											type="button"
											class="inline-flex size-5 items-center justify-center gap-x-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-800 shadow-xs hover:bg-gray-50 focus:bg-gray-50 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
											tabindex="-1"
											aria-label="Decrease"
											onclick={() => calculateQuantity(item.id, 'minus')}
										>
											<Minus class="h-2.5 w-2.5 shrink-0" />
										</button>
										<input
											type="number"
											class="max-w-[4rem] shrink-0 border-0 bg-transparent text-center text-sm font-normal text-gray-900 focus:ring-0 focus:outline-hidden dark:text-white"
											value={item.quantity}
											onchange={(e) => changeQuantity(e, item.id)}
											onwheel={(e) => mouseWheel(e, item.id)}
										/>
										<button
											type="button"
											class="inline-flex size-5 items-center justify-center gap-x-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-800 shadow-xs hover:bg-gray-50 focus:bg-gray-50 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
											tabindex="-1"
											aria-label="Increase"
											onclick={() => calculateQuantity(item.id, 'plus')}
										>
											<Plus class="h-2.5 w-2.5 shrink-0" />
										</button>
									</div>
								</Table.Cell>
								<Table.Cell class="text-right">
									{formatCurrency(data.converter, item.total, { to: viewCurrency() })}
								</Table.Cell>
								<Table.Cell class="text-right">
									<Button
										variant="outline"
										size="icon"
										class="rounded "
										onclick={() => removeProduct(item.id)}
									>
										<Trash_2 />
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
					<Table.Footer>
						<Table.Row>
							<Table.Cell colspan={5}>Total</Table.Cell>
							<Table.Cell class="text-right">
								{formatCurrency(data.converter, cart.subtotal, { to: viewCurrency() })}
							</Table.Cell>
							<Table.Cell class="text-right"></Table.Cell>
						</Table.Row>
					</Table.Footer>
				</Table.Root>
			</div>
		</div>
	</div>
	<div class={`sticky w-80 flex-none rounded border p-2 ${customerTab ? 'hidden' : ''}`}>
		<div>
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
						<Command.Input class="rounded" placeholder="Search customer..." />
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
											class={cn('mr-2 size-4', customerId !== customer.value && 'text-transparent')}
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
		{#if data.selectedCustomer}
			<Card.Root class="mt-2 w-full rounded">
				<Card.Content class="m-0 p-2">
					<div>
						<h5 class="flex items-center justify-start">
							<span class="mr-2">
								{data.selectedCustomer.fullName}
							</span>
							<span
								class="inline-block rounded-[0.27rem] bg-blue-100 px-[0.65em] pt-[0.35em] pb-[0.25em] text-center align-baseline text-[0.75em] leading-none font-bold whitespace-nowrap text-blue-700"
							>
								ID: {data.selectedCustomer.id}
							</span>
						</h5>
						{#if data.credits}
							<div class="my-3">
								<div class=" dark:border-neutral-500">
									<h5 class="flex items-center justify-start">
										<span class="mr-2 text-green-600"> Credit: </span>
										<span class="rounded bg-blue-100 px-2 text-blue-700">
											{formatCurrency(data.converter, data.credits.creditTotal, {
												to: viewCurrency()
											})}
										</span>
									</h5>
								</div>
							</div>
						{/if}
					</div>

					<Separator />

					<div class="pt-2">
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
						{#if data.selectedCustomer.address}
							<p>
								Address: <span>{data.selectedCustomer.address}</span>
							</p>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		{/if}

		<Card.Root class="mt-3 w-full rounded">
			<Card.Content class="m-0 p-2">
				<div class="flex flex-col space-y-1.5">
					<Label for="purchaseOrderNumber">Purchase Order Number</Label>
					<Input
						class="rounded text-right select-all"
						bind:value={purchaseOrderNumber}
						name="purchaseOrderNumber"
						id="purchaseOrderNumber"
						type="text"
					/>
				</div>
				<div class="mt-2">
					<form class="w-full" action="?/create" method="POST" use:enhance={(e) => handleSubmit(e)}>
						<input
							type="text"
							name="purchaseOrderNumber"
							value={purchaseOrderNumber}
							class="hidden"
						/>
						<input type="text" name="orderStatus" value={orderStatus} class="hidden" />
						<input type="text" name="customerId" value={data.selectedCustomer?.id} class="hidden" />
						<input type="text" name="pricingTierId" value={tiersValue} class="hidden" />
						<input
							type="text"
							name="items"
							value={JSON.stringify(cart.submitValues)}
							class="hidden"
						/>
						<Button type="submit" class="w-full rounded">Submit</Button>
					</form>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>

{#await data.products then products}
	<Dialog.Root bind:open={openDialog}>
		<Dialog.Content class="max-h-full max-w-[1200px]">
			<Dialog.Header>
				<Dialog.Title>Add Products</Dialog.Title>
				<Dialog.Description>
					Search and Select the products you want to add. Click <span class="text-blue-700"
						>Done</span
					> when you're done.
				</Dialog.Description>
			</Dialog.Header>
			<ScrollArea class="w-full rounded-md border">
				<DataTable data={products} columns={getColumn()}></DataTable>
			</ScrollArea>
			<Dialog.Footer>
				<Button onclick={() => closeDialog()} class="rounded">Done</Button>
			</Dialog.Footer>
		</Dialog.Content>
	</Dialog.Root>
{/await}
