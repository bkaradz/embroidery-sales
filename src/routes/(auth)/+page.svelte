<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Card from '$lib/components/ui/card/index';
	import { superForm } from 'sveltekit-superforms';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	const { errors, enhance } = superForm(data.form, {
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
	<Card.Root class="mx-auto max-w-sm">
		<Card.Header>
			<Card.Title class="text-center text-2xl">Login</Card.Title>
			<Card.Description>Enter your username below to login to your account</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/login" use:enhance>
				<div class="grid gap-4">
					<div class="grid gap-2">
						<Label class="text-xs" for="username">Username</Label>
						<Input
							class="rounded"
							id="username"
							type="username"
							name="username"
							placeholder="Username"
							required
						/>
						{#if $errors.username}
							<small class="text-red-500">{$errors.username}</small>
						{/if}
					</div>
					<div class="grid gap-2">
						<div class="flex items-center">
							<Label class="text-xs" for="password">Password</Label>
						</div>
						<Input class="rounded" id="password" type="password" name="password" required />
						{#if $errors.password}
							<small class="text-red-500">{$errors.password}</small>
						{/if}
					</div>
					<Button type="submit" class="w-full rounded">Submit</Button>
				</div>
			</form>
			<div class="mt-4 text-center text-sm">
				Don't have an account?
				<a href="/register" class="underline"> Sign up </a>
			</div>
		</Card.Content>
	</Card.Root>
</div>
