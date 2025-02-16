<script lang="ts">
	import { Button } from '$lib/components/ui/button/index';
	import Loader from 'lucide-svelte/icons/loader';
	import { Label } from '$lib/components/ui/label/index';
	import { Input } from '$lib/components/ui/input/index';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';
	import * as Card from '$lib/components/ui/card/index';
	import type { CurrencyCode } from '$lib/utility/lists.js';
	import { formatCurrency, fx } from '$lib/utility/convert-currencies.js';
	import Big from 'big.js';
	import { getContext } from 'svelte';
	import DoubleArrowRight from 'svelte-radix/DoubleArrowRight.svelte';

	const viewCurrency = getContext('viewCurrency') as () => string;

	let { data } = $props();

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

	let openingBalanceTotal = $state(Big(0));

	let currenciesData: { code: CurrencyCode; amount: number }[] = $state([]);

	const currencyChange = (e: Event, code: CurrencyCode) => {
		openingBalanceTotal = Big(0);
		const value = (e.target as HTMLInputElement).value;

		const filteredCurrencies = currenciesData.filter((currency) => currency.code !== code);

		filteredCurrencies.push({ code, amount: +value });
		filteredCurrencies.forEach((value) => {
			const totalUSD = fx.convert(data.converter, value.amount, { from: value.code, to: 'USD' });
			openingBalanceTotal = Big(openingBalanceTotal).plus(totalUSD);
		});
		currenciesData = filteredCurrencies;
	};
</script>

<div class="flex h-screen w-full place-content-center items-center justify-center rounded px-4">
	<Card.Root class="mx-auto max-w-sm min-w-96 rounded">
		<Card.Header>
			<Card.Title class="text-center text-2xl">Cash Register</Card.Title>
			<Card.Description>Enter the details below to create a Customer</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/create" use:enhance>
				<div class="grid gap-4">
					<div class="grid gap-2">
						<Label class="text-xs" for="usd">US Dollars</Label>
						<Input
							id="usd"
							name="usd"
							placeholder="US Dollars"
							type="number"
							autocapitalize="none"
							autocomplete="username"
							autocorrect="off"
							disabled={isLoading}
							onchange={(e) => currencyChange(e, 'USD')}
							onclick={(e) => e.currentTarget.select()}
							bind:value={$form.usd}
							class="rounded text-right select-all"
						/>
						{#if $errors.usd}
							<small class="text-red-500">{$errors.usd}</small>
						{/if}
					</div>
					<div class="grid gap-2">
						<Label class="text-xs" for="rand">Rand</Label>
						<Input
							id="rand"
							name="rand"
							placeholder="Rand"
							type="number"
							autocapitalize="none"
							autocomplete="username"
							autocorrect="off"
							disabled={isLoading}
							onchange={(e) => currencyChange(e, 'ZAR')}
							onclick={(e) => e.currentTarget.select()}
							bind:value={$form.rand}
							class="rounded text-right select-all"
						/>
						{#if $errors.rand}
							<small class="text-red-500">{$errors.rand}</small>
						{/if}
					</div>
					<div class="grid gap-2">
						<Label class="text-xs" for="pula">Pula</Label>
						<Input
							id="pula"
							name="pula"
							placeholder="Pula"
							type="number"
							autocapitalize="none"
							autocomplete="username"
							autocorrect="off"
							disabled={isLoading}
							onchange={(e) => currencyChange(e, 'BWP')}
							onclick={(e) => e.currentTarget.select()}
							bind:value={$form.pula}
							class="rounded text-right select-all"
						/>
						{#if $errors.pula}
							<small class="text-red-500">{$errors.pula}</small>
						{/if}
					</div>
					<div class="grid gap-2">
						<Label class="text-xs" for="zig">Zig</Label>
						<Input
							id="zig"
							name="zig"
							placeholder="Zig"
							type="number"
							autocapitalize="none"
							autocomplete="username"
							autocorrect="off"
							disabled={isLoading}
							onchange={(e) => currencyChange(e, 'ZWG')}
							onclick={(e) => e.currentTarget.select()}
							bind:value={$form.zig}
							class="rounded text-right select-all"
						/>
						{#if $errors.zig}
							<small class="text-red-500">{$errors.zig}</small>
						{/if}
					</div>
					<div class="grid gap-2">
						<div class="flex justify-between">
							<Label class="text-xs" for="openingBalance">Opening Balance</Label>
							<Label
								class="flex items-center justify-center text-xs text-green-500"
								for="openingBalance"
							>
								{fx.format(data.converter, openingBalanceTotal, 'USD')}
								<span class="px-2"><DoubleArrowRight /></span>
								{formatCurrency(data.converter, openingBalanceTotal, {
									to: viewCurrency()
								})}
							</Label>
						</div>
						<Input
							id="openingBalance"
							name="openingBalance"
							placeholder="Opening Balance"
							type="number"
							autocapitalize="none"
							autocomplete="username"
							autocorrect="off"
							disabled={isLoading}
							bind:value={$form.openingBalance}
							onclick={(e) => e.currentTarget.select()}
							class="rounded text-right select-all"
						/>
						{#if $errors.openingBalance}
							<small class="text-red-500">{$errors.openingBalance}</small>
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
