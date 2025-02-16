<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index';
	import Ellipsis from 'lucide-svelte/icons/ellipsis';
	import * as Dialog from '$lib/components/ui/dialog/index';
	import Button from '$lib/components/ui/button/button.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';

	let { id }: { id: string } = $props();

	let openDialog = $state(false);
	let cancellationReason = $state(undefined);

	const closeDialog = () => {
		if (!cancellationReason) return;
		openDialog = false;
	};
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<button {...props} class="relative m-0 rounded p-0">
				<span class="sr-only">Open menu</span>
				<Ellipsis class="size-4" />
			</button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="rounded" side="left" align="end" sideOffset={4}>
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>
			<DropdownMenu.Item class="rounded" onclick={() => navigator.clipboard.writeText(id)}>
				Copy ID
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item class="rounded" onclick={() => goto(`/reports/orders/quotation/${id}`)}>
			Print Quotation
		</DropdownMenu.Item>
		<DropdownMenu.Item class="rounded" onclick={() => goto(`/reports/orders/sales/${id}`)}>
			Print Sales Order
		</DropdownMenu.Item>
		<DropdownMenu.Item class="rounded" onclick={() => goto(`/reports/orders/invoice/${id}`)}>
			Print Invoice
		</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item class="rounded">
			<form class="w-full rounded-sm" action="?/sales" method="POST" use:enhance>
				<input type="hidden" name="id" value={id} />
				<button
					type="submit"
					class="m-0 w-full justify-start rounded p-0 text-left outline-hidden focus:border-none"
				>
					Create Sales Order
				</button>
			</form>
		</DropdownMenu.Item>
		<DropdownMenu.Item class="rounded">
			<form class="w-full rounded-sm" action="?/invoice" method="POST" use:enhance>
				<input type="hidden" name="id" value={id} />
				<button
					type="submit"
					class="m-0 w-full justify-start rounded p-0 text-left outline-hidden focus:border-none"
				>
					Create Invoice
				</button>
			</form>
		</DropdownMenu.Item>
		<DropdownMenu.Separator />
		<DropdownMenu.Item class="rounded" onclick={() => (openDialog = true)}>
			Cancel Order
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>

<Dialog.Root bind:open={openDialog}>
	<Dialog.Content class="">
		<Dialog.Header>
			<Dialog.Title>Cancel Order</Dialog.Title>
		</Dialog.Header>
		<form method="POST" action="?/delete" use:enhance>
			<input type="hidden" name="id" value={id} />
			<div class="grid gap-4">
				<div class="grid gap-2">
					<Label class="text-xs text-gray-500" for="cancellationReason">
						Reason for cancellation
					</Label>
					<Input
						class="rounded"
						id="cancellationReason"
						type="text"
						name="cancellationReason"
						placeholder="Reason for cancellation"
						bind:value={cancellationReason}
						required
						onclick={(e) => e.currentTarget.select()}
					/>
				</div>
				<Button type="submit" class="w-full rounded" onclick={() => closeDialog()}>Submit</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
