<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Loader from 'lucide-svelte/icons/loader';
	import Label from '$lib/components/ui/label/label.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { superForm } from 'sveltekit-superforms';
	import * as Card from '$lib/components/ui/card/index';
	import { toast } from 'svelte-sonner';

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

<div class="flex h-screen w-full place-content-center items-center justify-center px-4">
	<Card.Root class="mx-auto max-w-sm rounded">
		<Card.Header>
			<Card.Title class="text-center text-2xl">Create an account</Card.Title>
			<Card.Description>Enter your username below to create your account</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/register" use:enhance>
				<div class="grid gap-4">
					<div class="grid gap-2">
						<Label class="text-xs" for="fullName">Full Name</Label>
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
							required
							onclick={(e) => e.currentTarget.select()}
						/>
						{#if $errors.fullName}
							<small class="text-red-500">{$errors.fullName}</small>
						{/if}
					</div>
					<div class="grid gap-1">
						<Label class="text-xs" for="username">Username</Label>
						<Input
							class="rounded"
							id="username"
							name="username"
							placeholder="username"
							type="text"
							autocapitalize="none"
							autocomplete="username"
							autocorrect="off"
							disabled={isLoading}
							bind:value={$form.username}
							required
							onclick={(e) => e.currentTarget.select()}
						/>
						{#if $errors.username}
							<small class="text-red-500">{$errors.username}</small>
						{/if}
					</div>
					<div class="grid gap-1">
						<Label class="text-xs" for="password">Password</Label>
						<Input
							class="rounded"
							id="password"
							name="password"
							placeholder="Password"
							type="password"
							autocapitalize="none"
							autocomplete="username"
							autocorrect="off"
							disabled={isLoading}
							bind:value={$form.password}
							required
							onclick={(e) => e.currentTarget.select()}
						/>
						{#if $errors.password}
							<small class="text-red-500">{$errors.password}</small>
						{/if}
					</div>
					<div class="grid gap-1">
						<Label class="text-xs" for="confirmPassword">Confirm Password</Label>
						<Input
							class="rounded"
							id="confirmPassword"
							name="confirmPassword"
							placeholder="confirmPassword"
							type="password"
							autocapitalize="none"
							autocomplete="username"
							autocorrect="off"
							disabled={isLoading}
							bind:value={$form.confirmPassword}
							required
							onclick={(e) => e.currentTarget.select()}
						/>
						{#if $errors.confirmPassword}
							<small class="text-red-500">{$errors.confirmPassword}</small>
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
			<div class="mt-4 text-center text-sm">
				Already have an account?
				<a href="/" class="underline"> Login </a>
			</div>
		</Card.Content>
	</Card.Root>
</div>
