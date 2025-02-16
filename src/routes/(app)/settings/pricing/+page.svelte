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
	import Minus from 'lucide-svelte/icons/minus';
	import Plus from 'lucide-svelte/icons/plus';
	import Trash_2 from 'lucide-svelte/icons/trash-2';
	import { toast } from 'svelte-sonner';

	let customerTab = $state(false);
	const date = format(new Date(), 'dd MMM yyyy HH:mm');
	let pricingTier = $state({ name: `Tier ${date}`, default: true });
	type PricingTierDetails = {
		id: string;
		minQuantity: number;
		maxQuantity: number;
		minimumPrice: number | undefined;
		pricePer1000Stitches: number | undefined;
	};

	let pricingTierDetails = $state<PricingTierDetails[]>([
		{
			id: uuid(12),
			minQuantity: 1,
			maxQuantity: 1,
			pricePer1000Stitches: undefined,
			minimumPrice: undefined
		}
	]);

	type newTier = {
		minQuantity: number;
		maxQuantity: number | null;
		minimumPrice: number | undefined;
		pricePer1000Stitches: number | undefined;
	};

	let formPricingTierDetails = $state<newTier[]>([
		{
			minQuantity: 1,
			maxQuantity: 1,
			pricePer1000Stitches: undefined,
			minimumPrice: undefined
		}
	]);

	const removeId = (pricingTierDetails: PricingTierDetails[]) => {
		const filterResults = pricingTierDetails.map((tier) => {
			const { id, ...rest } = structuredClone({ ...$state.snapshot(tier) });
			return rest;
		}) as newTier[];

		const lastRow = filterResults.at(-1);
		if (!lastRow) throw new Error('Last row not found');

		lastRow.maxQuantity = null;

		formPricingTierDetails = filterResults;
	};

	const validatePricingTiers = () => {
		for (let i = 1; i < pricingTierDetails.length; i++) {
			const prevTier = pricingTierDetails[i - 1];
			const currentTier = pricingTierDetails[i];

			// Make minQuantity of previous tier to 1 if current tier is 1
			if (i === 1) {
				prevTier.minQuantity = 1;
			}

			// Check that the previous maxQuantity is > than its minQuantity
			if (prevTier.maxQuantity < prevTier.minQuantity) {
				prevTier.maxQuantity = prevTier.minQuantity;
			}

			// Make minQuantity of current tier is equal to previous tier maxQuantity + 1
			currentTier.minQuantity = prevTier.maxQuantity + 1;

			// Check that the current maxQuantity is > than its minQuantity
			if (currentTier.maxQuantity < currentTier.minQuantity) {
				currentTier.maxQuantity = currentTier.minQuantity;
			}
		}

		pricingTierDetails = pricingTierDetails;
		removeId(structuredClone($state.snapshot(pricingTierDetails)));
	};

	const addMaxNumber = (id: string, sign: 'minus' | 'plus') => {
		const tier = pricingTierDetails.find((tier) => tier.id === id);

		if (!tier) return;

		if (sign === 'plus') {
			tier.maxQuantity = (tier.maxQuantity ?? 1) + 1;
			validatePricingTiers();
			return;
		}
		if (sign === 'minus') {
			if (!tier.maxQuantity || tier.maxQuantity === tier.minQuantity) return;
			if (tier.maxQuantity > 1) tier.maxQuantity -= 1;
			validatePricingTiers();
			return;
		}
	};

	const mouseWheel = (
		e: WheelEvent & {
			currentTarget: EventTarget & HTMLInputElement;
		},
		id: string
	) => {
		const sign: 'minus' | 'plus' = e.deltaY > 0 ? 'minus' : 'plus';
		addMaxNumber(id, sign);
	};

	const deleteTier = (id: string) => {
		if (pricingTierDetails.length > 1) {
			const newPricingTierDetails = pricingTierDetails.filter((tier) => tier.id !== id);
			pricingTierDetails = newPricingTierDetails;
			validatePricingTiers();
			return;
		}

		pricingTierDetails = [
			{
				id: uuid(12),
				minQuantity: 1,
				maxQuantity: 1,
				pricePer1000Stitches: undefined,
				minimumPrice: undefined
			}
		];
		validatePricingTiers();
	};

	const addTier = () => {
		const last = pricingTierDetails.at(-1);

		if (!last?.maxQuantity) return;

		pricingTierDetails.push({
			id: uuid(12),
			minQuantity: last.maxQuantity + 1,
			maxQuantity: last.maxQuantity + 1,
			pricePer1000Stitches: undefined,
			minimumPrice: undefined
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

	const checkPricingTierDetails = (e: E) => {
		let errors = false;

		for (const tier of formPricingTierDetails) {
			const { minimumPrice, pricePer1000Stitches } = tier;
			if (!pricePer1000Stitches) {
				toast.error('Please enter all Price Per 1000 Stitches');
				errors = true;
				e.cancel();
				break;
			}
			if (!minimumPrice) {
				toast.error('Please enter all Minimum Prices');
				errors = true;
				e.cancel();
				break;
			}
		}

		return errors;
	};

	const handleSubmit = (e: E) => {
		let errors = false;
		if (!pricingTier.name) {
			toast.error('Please enter a pricing tier name');
			errors = true;
			e.cancel();
		}
		errors = checkPricingTierDetails(e);
		if (!errors) {
			e.submitter;
		}
		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'success') {
				toast.success('Order has been successfully created');
				pricingTier = { name: `Default ${date}`, default: true };
				pricingTierDetails = [
					{
						id: uuid(12),
						minQuantity: 1,
						maxQuantity: 1,
						pricePer1000Stitches: undefined,
						minimumPrice: undefined
					}
				];
				validatePricingTiers();
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
					<Button class="rounded" variant="outline" onclick={() => addTier()}>
						Add Pricing Tier
					</Button>
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
					<Table.Header>
						<Table.Row>
							<Table.Head class="text-center">Min Quantity</Table.Head>
							<Table.Head class="text-left">Max Quantity</Table.Head>
							<Table.Head class="text-left">Minimum Price</Table.Head>
							<Table.Head class="tex-left">Price Per 1000 Stitches</Table.Head>
							<Table.Head class="text-center">Delete</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each pricingTierDetails as tier (tier.id)}
							<Table.Row>
								<Table.Cell class="text-center font-medium">{tier.minQuantity}</Table.Cell>
								<Table.Cell class="block text-center">
									<div class="relative flex items-center">
										<button
											type="button"
											class="inline-flex size-5 items-center justify-center gap-x-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-800 shadow-xs hover:bg-gray-50 focus:bg-gray-50 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
											tabindex="-1"
											aria-label="Decrease"
											onclick={() => addMaxNumber(tier.id, 'minus')}
										>
											<Minus class="h-2.5 w-2.5 shrink-0" />
										</button>
										<input
											type="number"
											class="max-w-[4rem] shrink-0 border-0 bg-transparent text-center text-sm font-normal text-gray-900 focus:ring-0 focus:outline-hidden dark:text-white"
											bind:value={tier.maxQuantity}
											onchange={() => validatePricingTiers()}
											onclick={(e) => e.currentTarget.select()}
											onwheel={(e) => mouseWheel(e, tier.id)}
										/>
										<button
											type="button"
											class="inline-flex size-5 items-center justify-center gap-x-2 rounded-full border border-gray-200 bg-white text-sm font-medium text-gray-800 shadow-xs hover:bg-gray-50 focus:bg-gray-50 focus:outline-hidden disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800 dark:focus:bg-neutral-800"
											tabindex="-1"
											aria-label="Increase"
											onclick={() => addMaxNumber(tier.id, 'plus')}
										>
											<Plus class="h-2.5 w-2.5 shrink-0" />
										</button>
									</div>
								</Table.Cell>
								<Table.Cell class="items-center text-center">
									<Input
										type="number"
										class="w-40 rounded-none text-right"
										bind:value={tier.minimumPrice}
										onchange={() => validatePricingTiers()}
										onclick={(e) => e.currentTarget.select()}
									/>
								</Table.Cell>
								<Table.Cell class="items-center text-center">
									<Input
										type="number"
										class="w-40 rounded-none text-right"
										bind:value={tier.pricePer1000Stitches}
										onchange={() => validatePricingTiers()}
										onclick={(e) => e.currentTarget.select()}
									/>
								</Table.Cell>
								<Table.Cell class="text-center">
									<Button
										variant="outline"
										size="icon"
										class="rounded"
										onclick={() => deleteTier(tier.id)}
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
	<div class={`sticky w-80 flex-none rounded border p-2 ${customerTab ? 'hidden' : ''}`}>
		<Card.Root class="w-full rounded">
			<Card.Content class="m-0 p-2">
				<div class="flex flex-col space-y-1.5">
					<Label for="purchaseOrderNumber">Name</Label>
					<Input
						class="rounded text-right select-all"
						bind:value={pricingTier.name}
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
						<Switch name="default" id="default" bind:checked={pricingTier.default} />
					</div>
				</div>
				<div class="mt-2">
					<form class="w-full" action="?/create" method="POST" use:enhance={(e) => handleSubmit(e)}>
						<input
							type="text"
							name="pricingTier"
							value={JSON.stringify(pricingTier)}
							class="hidden"
						/>
						<input
							type="text"
							name="pricingTierDetails"
							value={JSON.stringify(formPricingTierDetails)}
							class="hidden"
						/>
						<Button type="submit" class="w-full rounded">Submit</Button>
					</form>
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
