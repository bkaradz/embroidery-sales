<script lang="ts">
	import * as Card from '$lib/components/ui/card/index';
	import { Button } from '$lib/components/ui/button/index';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { toast } from 'svelte-sonner';

	const { data } = $props();
</script>

<Card.Root class="h-[89cqh] w-full rounded-md">
	<Card.Header>
		<Card.Title class="text-center text-2xl">View Reports</Card.Title>
		<Card.Description>Click the report to view</Card.Description>
	</Card.Header>
	<Separator />
	<Card.Content>
		<Button href="/reports/customers" class="m-2 rounded">Customers Reports</Button>
		<Button href="/reports/orders" class="m-2 rounded">Orders Reports</Button>
		<Button href="/reports/sales" class="m-2 rounded">Sales Book</Button>
		<Button class="m-2 rounded">Daily Production</Button>
		<Button class="m-2 rounded">Daily Sales</Button>
		<Button class="m-2 rounded">Monthly Sales</Button>
		<Button class="m-2 rounded">Quotation</Button>
		<Button class="m-2 rounded">Customers Reports</Button>
		<Button class="m-2 rounded">Customers Reports</Button>
		<Button class="m-2 rounded">Customers Reports</Button>
		<Button class="m-2 rounded">Customers Reports</Button>
		<Button class="m-2 rounded">Customers Reports</Button>
		<Button class="m-2 rounded" onclick={() => toast('My first toast')}>Toast</Button>
		<Button class="m-2 rounded" onclick={() => toast.success('My first toast')}>
			Toast success
		</Button>
		<Button class="m-2 rounded" onclick={() => toast.error('My first toast')}>Toast error</Button>
	</Card.Content>
</Card.Root>
