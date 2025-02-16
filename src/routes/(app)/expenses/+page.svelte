<script lang="ts">
	import { Button } from '$lib/components/ui/button/index';
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
