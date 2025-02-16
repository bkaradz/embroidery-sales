<script lang="ts">
	import * as Card from '$lib/components/ui/card/index';
	import { Input } from '$lib/components/ui/input/index';
	import { Label } from '$lib/components/ui/label/index';
	import * as Select from '$lib/components/ui/select/index';
	import { Switch } from '$lib/components/ui/switch/index';
	import { Textarea } from '$lib/components/ui/textarea/index';
	import { productCategories } from '$lib/utility/configList.js';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';

	let { data } = $props();

	const productTypes = productCategories
		.map((category) => {
			return {
				value: category,
				label: category
			};
		})
		.filter((category) => category.value !== 'Embroidery');

	// let value = $state('Threads');

	// const triggerContent = $derived(productTypes.find((f) => f.value === value)?.label ?? 'Threads');

	let className: string | undefined | null = undefined;
	export { className as class };

	let isLoading = true;

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

<div class="flex items-center justify-center">
	<Card.Root class="mx-auto max-w-sm min-w-96 rounded">
		<Card.Header>
			<Card.Title class="text-center text-2xl">View a Product</Card.Title>
			<Card.Description>View the details of the Product</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/create" use:enhance>
				<Input type="hidden" name="id" bind:value={$form.id} />
				<Input type="hidden" name="userId" bind:value={$form.userId} />
				<Input type="hidden" name="isDeleted" bind:value={$form.isDeleted} />
				<div class="grid gap-4">
					<div class="grid gap-2">
						<Label class="text-xs " for="name">Name</Label>
						<Input
							class="rounded"
							id="name"
							name="name"
							placeholder="Name"
							type="text"
							autocapitalize="none"
							autocomplete="username"
							autocorrect="off"
							disabled={isLoading}
							bind:value={$form.name}
						/>
						{#if $errors.name}
							<small class="text-red-500">{$errors.name}</small>
						{/if}
					</div>
					<div class="grid gap-1">
						<Label class="text-xs " for="description">Description</Label>
						<Textarea
							class="rounded"
							id="description"
							name="description"
							placeholder="Description"
							autocapitalize="none"
							autocomplete="username"
							disabled={isLoading}
							bind:value={$form.description}
						/>
						{#if $errors.description}
							<small class="text-red-500">{$errors.description}</small>
						{/if}
					</div>
					<div class="grid gap-2">
						<div class="space-y-0.5">
							<Label class="text-xs " for="isEmbroidery">Embroidery</Label>
							<p>Is it an Embroidery product</p>
						</div>
						<Switch
							disabled={isLoading}
							name="isEmbroidery"
							id="isEmbroidery"
							bind:checked={$form.isEmbroidery}
						/>
						{#if $errors.isEmbroidery}
							<small class="text-red-500">{$errors.isEmbroidery}</small>
						{/if}
					</div>
					{#if $form.isEmbroidery}
						<Input type="hidden" name="productCategory" value="Embroidery" />
						<div class="grid gap-1">
							<Label class="text-xs " for="stitches">Stitches</Label>
							<Input
								id="stitches"
								name="stitches"
								placeholder="1000"
								type="number"
								autocapitalize="none"
								autocomplete="username"
								autocorrect="off"
								disabled={isLoading}
								bind:value={$form.stitches}
								class="rounded text-right select-all"
							/>
							{#if $errors.stitches}
								<small class="text-red-500">{$errors.stitches}</small>
							{/if}
						</div>
					{:else}
						<div class="grid gap-1">
							<Label class="text-xs " for="productCategory">Product Category</Label>
							<Select.Root
								disabled={isLoading}
								type="single"
								name="productCategory"
								bind:value={$form.productCategory}
							>
								<Select.Trigger class="w-[180px] rounded">
									{$form.productCategory ? $form.productCategory : 'Threads'}
								</Select.Trigger>
								<Select.Content class="rounded">
									<Select.Group>
										{#each productTypes as type (type.value)}
											<Select.Item class="rounded" value={type.value} label={type.label}>
												{type.label}
											</Select.Item>
										{/each}
									</Select.Group>
								</Select.Content>
							</Select.Root>
							{#if $errors.productCategory}
								<small class="text-red-500">{$errors.productCategory}</small>
							{/if}
						</div>
						<div class="grid gap-1">
							<Label class="text-xs " for="basePrice">Unit Price</Label>
							<Input
								id="basePrice"
								name="basePrice"
								placeholder="Unit Price"
								type="number"
								autocapitalize="none"
								autocomplete="username"
								autocorrect="off"
								disabled={isLoading}
								bind:value={$form.basePrice}
								class="rounded text-right select-all"
							/>
							{#if $errors.basePrice}
								<small class="text-red-500">{$errors.basePrice}</small>
							{/if}
						</div>
						<div class="grid gap-1">
							<Label class="text-xs " for="stockQuantity">Stock Quantity</Label>
							<Input
								id="stockQuantity"
								name="stockQuantity"
								placeholder="Stock Quantity"
								type="number"
								autocapitalize="none"
								autocomplete="username"
								autocorrect="off"
								disabled={$form.productCategory === 'Services' || isLoading}
								bind:value={$form.stockQuantity}
								class="rounded text-right select-all"
							/>
							{#if $errors.stockQuantity}
								<small class="text-red-500">{$errors.stockQuantity}</small>
							{/if}
						</div>
					{/if}
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
