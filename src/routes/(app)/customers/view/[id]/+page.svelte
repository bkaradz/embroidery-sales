<script lang="ts">
	import * as Card from '$lib/components/ui/card/index';
	import { Input } from '$lib/components/ui/input/index';
	import { Label } from '$lib/components/ui/label/index';
	import { Switch } from '$lib/components/ui/switch/index';
	import { Textarea } from '$lib/components/ui/textarea/index';
	import { toast } from 'svelte-sonner';
	import { superForm } from 'sveltekit-superforms';

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
</script>

<div class="flex items-center justify-center">
	<Card.Root class="mx-auto min-w-96 max-w-sm ">
		<Card.Header>
			<Card.Title class="text-center text-2xl">View a Customer</Card.Title>
			<Card.Description>View Customer details</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/view" use:enhance>
				<Input type="hidden" name="id" bind:value={$form.id} />
				<Input type="hidden" name="userId" bind:value={$form.userId} />
				<Input type="hidden" name="isDeleted" bind:value={$form.isDeleted} />
				<div class="grid gap-4">
					<div class="grid gap-2">
						<Label class="text-xs " for="fullName">Full Name</Label>
						<Input
              class="rounded"
							id="fullName"
							name="fullName"
							placeholder="Full Name"
							type="text"
							autocapitalize="none"
							autocomplete="username"
							autocorrect="off"
							disabled={isLoading}
							bind:value={$form.fullName}
						/>
						{#if $errors.fullName}
							<small class="text-red-500">{$errors.fullName}</small>
						{/if}
					</div>
					<div class="grid gap-2">
						<div class="space-y-0.5">
							<Label class="text-xs " for="isCorporate">Corporate</Label>
							<p>Flip switch if the customer is a Corporate.</p>
						</div>
						<Switch name="isCorporate" id="isCorporate" bind:checked={$form.isCorporate} />
						{#if $errors.isCorporate}
							<small class="text-red-500">{$errors.isCorporate}</small>
						{/if}
					</div>
					{#if $form.isCorporate}
						<div class="grid gap-1">
							<Label class="Paid Amount text-xs" for="tin">TIN</Label>
							<Input
                class="rounded"
								id="tin"
								name="tin"
								placeholder="TIN"
								type="text"
								autocapitalize="none"
								autocomplete="username"
								autocorrect="off"
								disabled={isLoading}
								bind:value={$form.tin}
							/>
							{#if $errors.tin}
								<small class="text-red-500">{$errors.tin}</small>
							{/if}
						</div>
					{/if}
					<div class="grid gap-1">
						<Label class="text-xs " for="phone">Phone Number</Label>
						<Input
              class="rounded"
							id="phone"
							name="phone"
							placeholder="Phone Number"
							type="text"
							autocapitalize="none"
							autocomplete="username"
							autocorrect="off"
							disabled={isLoading}
							bind:value={$form.phone}
						/>
						{#if $errors.phone}
							<small class="text-red-500">{$errors.phone}</small>
						{/if}
					</div>
					<div class="grid gap-1">
						<Label class="text-xs " for="email">Email</Label>
						<Input
              class="rounded"
							id="email"
							name="email"
							placeholder="Email"
							type="email"
							autocapitalize="none"
							autocomplete="username"
							autocorrect="off"
							disabled={isLoading}
							bind:value={$form.email}
						/>
						{#if $errors.email}
							<small class="text-red-500">{$errors.email}</small>
						{/if}
					</div>
					<div class="grid gap-1">
						<Label class="text-xs " for="address">Address</Label>
						<Textarea
              class="rounded"
							id="address"
							name="address"
							placeholder="Address"
							autocapitalize="none"
							autocomplete="username"
							disabled={isLoading}
							bind:value={$form.address}
						/>
						{#if $errors.address}
							<small class="text-red-500">{$errors.address}</small>
						{/if}
					</div>
					<div class="grid gap-1">
						<Label class="text-xs " for="notes">Notes</Label>
						<Textarea
              class="rounded"
							id="notes"
							name="notes"
							placeholder="Notes"
							autocapitalize="none"
							autocomplete="username"
							disabled={isLoading}
							bind:value={$form.notes}
						/>
						{#if $errors.notes}
							<small class="text-red-500">{$errors.notes}</small>
						{/if}
					</div>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
