<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Card from '$lib/components/ui/card/index';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';

	const schema = z.object({
		file: z.instanceof(File, { message: 'Please upload a file.' })
	});

	const { data } = $props();

	const { form, enhance, errors } = superForm(data.form, {
		validators: zodClient(schema),
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

<div class="flex h-screen w-full place-content-center items-center justify-center rounded px-4">
	<Card.Root class="">
		<Card.Header>
			<Card.Title class="text-center text-2xl">Upload Products</Card.Title>
			<Card.Description>Select a csv file with embroidery products data</Card.Description>
		</Card.Header>
		<Card.Content>
			<form class="" method="POST" enctype="multipart/form-data" use:enhance>
				<div class="flex w-full max-w-sm items-center space-x-2">
					<Input
						class="rounded"
						id="file"
						name="file"
						accept=".csv"
						type="file"
						oninput={(e) => ($form.file = e.currentTarget.files?.item(0) as File)}
					/>
					<Button type="submit" class="rounded">Submit</Button>
				</div>
				{#if $errors.file}
					<small class="text-red-500">{$errors.file}</small>
				{/if}
			</form>
		</Card.Content>
	</Card.Root>
</div>
