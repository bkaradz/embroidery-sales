<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index';
	import Ellipsis from 'lucide-svelte/icons/ellipsis';

	let { id }: { id: string } = $props();
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		{#snippet child({ props })}
			<button {...props} class="relative m-0 p-0 rounded">
				<span class="sr-only">Open menu</span>
				<Ellipsis class="size-4" />
			</button>
		{/snippet}
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="rounded" side="left" align="end" sideOffset={4}>
		<DropdownMenu.Group>
			<DropdownMenu.GroupHeading>Actions</DropdownMenu.GroupHeading>
			<DropdownMenu.Item class="rounded" onclick={() => navigator.clipboard.writeText(id)}>
				Copy payment ID
			</DropdownMenu.Item>
		</DropdownMenu.Group>
		<DropdownMenu.Separator />
		<DropdownMenu.Item class="rounded" onclick={() => goto(`/customers/view/${id}`)}>
			View customer
		</DropdownMenu.Item>
		<DropdownMenu.Item class="rounded" onclick={() => goto(`/customers/edit/${id}`)}>
			Edit Customer
		</DropdownMenu.Item>
    <DropdownMenu.Item class="rounded" onclick={() => goto(`/customers/details/${id}`)}>View order details</DropdownMenu.Item>
		<DropdownMenu.Item class="rounded" onclick={() => goto(`/customers/payments/${id}`)}>View payment details</DropdownMenu.Item>
		<DropdownMenu.Item class="rounded">
			<form class="w-full rounded-sm" action="?/delete" method="POST" use:enhance>
				<input type="hidden" name="id" value={id} />
				<button
					type="submit"
					class="rounded m-0 w-full justify-start p-0 text-left outline-hidden focus:border-none"
				>
					Delete Customer
				</button>
			</form>
		</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
