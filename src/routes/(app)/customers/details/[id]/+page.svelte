<script lang="ts">
	import DataTable from './data-table.svelte';
	import { columns } from './columns';

	let { data } = $props();

	let customerDetails = $state(data.customerDetails.at(0));
</script>

<div class="flex gap-2">
	<div class="grow rounded">
		<div class="grid grid-cols-1 grid-rows-9 gap-2.5">
			<div class="row-span-9">
				{#if customerDetails?.orders}
					<DataTable data={customerDetails.orders} {columns}></DataTable>
				{/if}
			</div>
		</div>
	</div>
	<div class="sticky w-80 flex-none rounded border p-2">
		{#if customerDetails}
			<div class="block rounded bg-neutral-50 text-left shadow-md dark:bg-neutral-700">
				<div class="border-b-2 border-neutral-100 px-3 py-2 dark:border-neutral-500">
					<h5 class="flex items-center justify-start text-neutral-500 dark:text-neutral-300">
						<span class="mr-2 text-green-600">
							{customerDetails?.fullName}
						</span>
						<span
							class="inline-block rounded-[0.27rem] bg-blue-100 px-[0.65em] pt-[0.35em] pb-[0.25em] text-center align-baseline text-[0.75em] leading-none font-bold whitespace-nowrap text-blue-700"
						>
							ID: {customerDetails.id}
						</span>
					</h5>
				</div>

				<div class="p-2 text-xs">
					{#if customerDetails.phone}
						<p>
							Phone: <span>{customerDetails.phone}</span>
						</p>
					{/if}
					{#if customerDetails.email}
						<p>
							Email: <span>{customerDetails.email}</span>
						</p>
					{/if}
					{#if customerDetails.address}
						<p>
							Email: <span>{customerDetails.address}</span>
						</p>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
