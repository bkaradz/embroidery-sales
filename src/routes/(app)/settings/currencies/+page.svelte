<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Switch from '$lib/components/ui/switch/switch.svelte';
	import * as Table from '$lib/components/ui/table/index';
	import { uuid } from '$lib/utility/uuid';
	import type { ActionResult } from '@sveltejs/kit';
	import { format } from 'date-fns';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Trash_2 from 'lucide-svelte/icons/trash-2';
	import { toast } from 'svelte-sonner';

	let currenciesTab = $state(false);
	const date = format(new Date(), 'dd MMM yyyy HH:mm');
	let currencies = $state({
		name: `Rates ${date}`,
		isDeleted: false,
		default: true
	});

	type CurrenciesDetails = {
		id: string;
		code: string;
		name: string;
		symbol: string;
		exchangeRate: number | undefined;
	}[];

	let currenciesDetails = $state<CurrenciesDetails>([
		{ id: uuid(12), code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: undefined },
		{ id: uuid(12), code: 'ZAR', name: 'Rand', symbol: 'R', exchangeRate: undefined },
		{ id: uuid(12), code: 'BWP', name: 'Pula', symbol: 'P', exchangeRate: undefined },
		{ id: uuid(12), code: 'ZWG', name: 'ZiG', symbol: 'ZiG', exchangeRate: undefined }
	]);

	let formCurrenciesDetails = $state<
		{
			code: string;
			name: string;
			symbol: string;
			exchangeRate: number | undefined;
		}[]
	>([
		{ code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: undefined },
		{ code: 'ZAR', name: 'Rand', symbol: 'R', exchangeRate: undefined },
		{ code: 'BWP', name: 'Pula', symbol: 'P', exchangeRate: undefined },
		{ code: 'ZWG', name: 'ZiG', symbol: 'ZiG', exchangeRate: undefined }
	]);

	const removeId = (currenciesDetails: CurrenciesDetails) => {
		const filterResults = currenciesDetails.map((currency) => {
			const { id, ...rest } = structuredClone({ ...$state.snapshot(currency) });
			return rest;
		});

		formCurrenciesDetails = filterResults;
	};

	const deleteCurrency = (id: string) => {
		currenciesDetails = currenciesDetails.filter((currency) => currency.id !== id);
	};

	const addCurrency = () => {
		currenciesDetails.push({
			id: uuid(12),
			code: '',
			name: '',
			symbol: '',
			exchangeRate: undefined
		});
	};

	type E = {
		action: URL;
		formData: FormData;
		formElement: HTMLFormElement;
		controller: AbortController;
		submitter: HTMLElement | null;
		cancel(): void;
	};

	const checkCurrenciesDetails = (e: E) => {
		let errors = false;

		for (const currency of formCurrenciesDetails) {
			const { code, exchangeRate, name, symbol } = currency;
			if (!code) {
				toast.error('Please enter all codes');
				errors = true;
				e.cancel();
				break;
			}
			if (!name) {
				toast.error('Please enter all names');
				errors = true;
				e.cancel();
				break;
			}
			if (!symbol) {
				toast.error('Please enter all symbols');
				errors = true;
				e.cancel();
				break;
			}
			if (!exchangeRate) {
				toast.error('Please enter all exchange rates');
				errors = true;
				e.cancel();
				break;
			}
		}

		return errors;
	};

	const handleSubmit = (e: E) => {
		let errors = false;
		if (!currencies.name) {
			toast.error('Please enter a currencies name');
			errors = true;
			e.cancel();
		}
		if (!formCurrenciesDetails) {
			toast.error('Please enter currencies they are required');
			errors = true;
			e.cancel();
		}
		errors = checkCurrenciesDetails(e);
		if (!errors) {
			e.submitter;
		}
		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'success') {
				toast.success('Currencies has been successfully created');
				currencies = {
					name: `Rates ${date}`,
					isDeleted: false,
					default: true
				};
				currenciesDetails = [
					{ id: uuid(12), code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: undefined },
					{ id: uuid(12), code: 'ZAR', name: 'Rand', symbol: 'R', exchangeRate: undefined },
					{ id: uuid(12), code: 'BWP', name: 'Pula', symbol: 'P', exchangeRate: undefined },
					{ id: uuid(12), code: 'ZWG', name: 'ZiG', symbol: 'ZiG', exchangeRate: undefined }
				];
				removeId($state.snapshot(currenciesDetails));
				await invalidateAll();
			}
		};
	};
</script>

<div class="flex gap-2">
	<div class="grow rounded">
		<div class="grid grid-cols-1 grid-rows-9 gap-2.5">
			<div class="h-14 place-content-center rounded border px-2">
				<div class="flex items-center justify-between">
					<Button class="rounded" variant="outline" onclick={() => addCurrency()}
						>Add Currency</Button
					>
					<Button
						class="rounded"
						variant="outline"
						size="icon"
						onclick={() => (currenciesTab = !currenciesTab)}
					>
						{#if currenciesTab}
							<ChevronLeft />
						{:else}
							<ChevronRight />
						{/if}
					</Button>
				</div>
			</div>
			<div class="row-span-8 rounded border">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="text-center">Code</Table.Head>
							<Table.Head class="text-left">Name</Table.Head>
							<Table.Head class="text-left">Symbol</Table.Head>
							<Table.Head class="tex-left">Exchange Rate</Table.Head>
							<Table.Head class="text-center">Delete</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each currenciesDetails as currency (currency.id)}
							<Table.Row>
								<Table.Cell class="items-center text-center">
									<Input
										type="text"
										class="w-40 rounded-none"
										bind:value={currency.code}
										onchange={() => removeId($state.snapshot(currenciesDetails))}
										onclick={(e) => e.currentTarget.select()}
									/>
								</Table.Cell>
								<Table.Cell class="items-center text-center">
									<Input
										type="text"
										class="w-40 rounded-none"
										bind:value={currency.name}
										onchange={() => removeId($state.snapshot(currenciesDetails))}
										onclick={(e) => e.currentTarget.select()}
									/>
								</Table.Cell>
								<Table.Cell class="items-center text-center">
									<Input
										type="text"
										class="w-40 rounded-none"
										bind:value={currency.symbol}
										onchange={() => removeId($state.snapshot(currenciesDetails))}
										onclick={(e) => e.currentTarget.select()}
									/>
								</Table.Cell>
								<Table.Cell class="items-center text-center">
									<Input
										type="number"
										class="w-40 rounded-none text-right"
										bind:value={currency.exchangeRate}
										onchange={() => removeId($state.snapshot(currenciesDetails))}
										onclick={(e) => e.currentTarget.select()}
									/>
								</Table.Cell>
								<Table.Cell class="text-center">
									<Button
										variant="outline"
										size="icon"
										class="rounded"
										onclick={() => {
											deleteCurrency(currency.id);
											removeId($state.snapshot(currenciesDetails));
										}}
									>
										<Trash_2 />
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
					<Table.Footer>
						<Table.Row>
							<Table.Cell colspan={5}>Footer</Table.Cell>
						</Table.Row>
					</Table.Footer>
				</Table.Root>
			</div>
		</div>
	</div>
	<div class={`sticky w-80 flex-none rounded border p-2 ${currenciesTab ? 'hidden' : ''}`}>
		<Card.Root class="w-full rounded">
			<Card.Content class="m-0 p-2">
				<div class="flex flex-col space-y-1.5">
					<Label for="purchaseOrderNumber">Name</Label>
					<Input
						class="rounded text-right select-all"
						bind:value={currencies.name}
						name="purchaseOrderNumber"
						id="purchaseOrderNumber"
						type="text"
						onclick={(e) => e.currentTarget.select()}
					/>
				</div>
				<div class="flex flex-col space-y-1.5">
					<div class="grid gap-2">
						<div class="space-y-0.5">
							<Label class="text-xs " for="default">Default tier</Label>
							<p>Is it a default pricing tier</p>
						</div>
						<Switch name="default" id="default" bind:checked={currencies.default} />
					</div>
				</div>
				<div class="mt-2">
					<form class="w-full" action="?/create" method="POST" use:enhance={(e) => handleSubmit(e)}>
						<input
							type="text"
							name="currencies"
							value={JSON.stringify(currencies)}
							class="hidden"
						/>
						<input
							type="text"
							name="currenciesDetails"
							value={JSON.stringify(formCurrenciesDetails)}
							class="hidden"
						/>
						<Button type="submit" class="w-full rounded">Submit</Button>
					</form>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
