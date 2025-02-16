<script lang="ts" generics="TData, TValue">
	import Button from '$lib/components/ui/button/button.svelte';
	import { createSvelteTable, FlexRender } from '$lib/components/ui/data-table/index';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index';
	import Input from '$lib/components/ui/input/input.svelte';
	import * as Select from '$lib/components/ui/select/index';
	import * as Table from '$lib/components/ui/table/index';
	import type { GetViewOrdersResult } from '$lib/server/routes/orders';
	import type {
		ColumnDef,
		ColumnFiltersState,
		PaginationState,
		RowSelectionState,
		SortingState,
		VisibilityState
	} from '@tanstack/table-core';
	import {
		getCoreRowModel,
		getFilteredRowModel,
		getPaginationRowModel,
		getSortedRowModel
	} from '@tanstack/table-core';
	import ChevronLeft from 'svelte-radix/ChevronLeft.svelte';
	import ChevronRight from 'svelte-radix/ChevronRight.svelte';
	import Cross2 from 'svelte-radix/Cross2.svelte';
	import DoubleArrowLeft from 'svelte-radix/DoubleArrowLeft.svelte';
	import DoubleArrowRight from 'svelte-radix/DoubleArrowRight.svelte';
	import DataTableFacetedFilter from './data-table-faceted-filter.svelte';
	import { statuses } from './data';

	type DataTableProps<TData, TValue> = {
		columns: ColumnDef<TData, TValue>[];
		data: TData[];
	};

	let { data, columns }: DataTableProps<GetViewOrdersResult[0], GetViewOrdersResult[0]> = $props();

	let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
	let sorting = $state<SortingState>([]);
	let columnFilters = $state<ColumnFiltersState>([]);
	let columnVisibility = $state<VisibilityState>({});
	let rowSelection = $state<RowSelectionState>({});

	const table = createSvelteTable({
		get data() {
			return data;
		},
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		onPaginationChange: (updater) => {
			if (typeof updater === 'function') {
				pagination = updater(pagination);
			} else {
				pagination = updater;
			}
		},
		onSortingChange: (updater) => {
			if (typeof updater === 'function') {
				sorting = updater(sorting);
			} else {
				sorting = updater;
			}
		},
		onColumnFiltersChange: (updater) => {
			if (typeof updater === 'function') {
				columnFilters = updater(columnFilters);
			} else {
				columnFilters = updater;
			}
		},
		onColumnVisibilityChange: (updater) => {
			if (typeof updater === 'function') {
				columnVisibility = updater(columnVisibility);
			} else {
				columnVisibility = updater;
			}
		},
		onRowSelectionChange: (updater) => {
			if (typeof updater === 'function') {
				rowSelection = updater(rowSelection);
			} else {
				rowSelection = updater;
			}
		},
		state: {
			get pagination() {
				return pagination;
			},
			get sorting() {
				return sorting;
			},
			get columnFilters() {
				return columnFilters;
			},
			get columnVisibility() {
				return columnVisibility;
			},
			get rowSelection() {
				return rowSelection;
			}
		}
	});

	type TableType = typeof table;

	const changeValue = (v: string, table: TableType) => {
		table.setPageSize(Number(v));
	};

	const pageSizesList = [
		{ value: '5', label: '5' },
		{ value: '10', label: '10' },
		{ value: '20', label: '20' },
		{ value: '30', label: '30' },
		{ value: '40', label: '40' },
		{ value: '50', label: '50' }
	];

	let value = $state('10');

	const triggerContent = $derived(pageSizesList.find((f) => f.value === value)?.label ?? '10');

	// const { pluginStates } = table.getColumn('status');
	// const {
	// 	filterValue
	// }: {
	// 	filterValue: Writable<string>;
	// } = pluginStates.filter;

	// const {
	// 	filterValues
	// }: {
	// 	filterValues: Writable<{
	// 		status: string[];
	// 		priority: string[];
	// 	}>;
	// } = pluginStates.colFilter;

	// let showReset = $state(Object.values({ ...$filterValues, $filterValue }).some((v) => v.length > 0));

	// const counts = data.reduce<{
	// 	status: { [index: string]: number };
	// 	priority: { [index: string]: number };
	// }>(
	// 	(acc, { status, priority }) => {
	// 		acc.status[status] = (acc.status[status] || 0) + 1;
	// 		acc.priority[priority] = (acc.priority[priority] || 0) + 1;
	// 		return acc;
	// 	},
	// 	{
	// 		status: {},
	// 		priority: {},
	// 	}
	// );

	// <DataTableFacetedFilter
	// 			bind:filterValues={$filterValues.status}
	// 			title="Status"
	// 			options={statuses}
	// 			counts={counts.status}
	// 		/>
</script>

<div>
	<div class="flex items-center pb-3">
		<div class="flex flex-1 items-center space-x-2">
			<Input
				placeholder="Filter names..."
				value={(table.getColumn('fullName')?.getFilterValue() as string) ?? ''}
				onchange={(e) => {
					table.getColumn('fullName')?.setFilterValue(e.currentTarget.value);
				}}
				oninput={(e) => {
					table.getColumn('fullName')?.setFilterValue(e.currentTarget.value);
				}}
				class="max-w-sm rounded"
			/>
			<Input
				type="number"
				class="w-40 rounded text-right select-all"
				placeholder="Filter ID..."
				value={(table.getColumn('orderId')?.getFilterValue() as string) ?? ''}
				onchange={(e) => {
					table.getColumn('orderId')?.setFilterValue(e.currentTarget.value);
				}}
				oninput={(e) => {
					table.getColumn('orderId')?.setFilterValue(e.currentTarget.value);
				}}
			/>
			<DataTableFacetedFilter
				filterValues={['Pending']}
				title="Status"
				options={statuses}
				counts={{ Pending: 6, Expired: 10, 'On Hold': 20 }}
			/>
			{#if true}
				<Button
					onclick={() => {
						table.resetColumnFilters();
						// $filterValue = '';
						// $filterValues.status = [];
						// $filterValues.priority = [];
					}}
					variant="ghost"
					class="h-8 rounded px-2 lg:px-3"
				>
					Reset
					<Cross2 class="ml-2 h-4 w-4" />
				</Button>
			{/if}
		</div>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline" class="ml-auto rounded">Columns</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="rounded" side="left" align="start" sideOffset={4}>
				{#each table.getAllColumns().filter((col) => col.getCanHide()) as column (column.id)}
					<DropdownMenu.CheckboxItem
						class="capitalize"
						bind:checked={() => column.getIsVisible(), (v) => column.toggleVisibility(!!v)}
					>
						{column.id}
					</DropdownMenu.CheckboxItem>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div class="rounded border">
		<Table.Root>
			<Table.Header>
				{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
					<Table.Row>
						{#each headerGroup.headers as header (header.id)}
							<Table.Head>
								{#if !header.isPlaceholder}
									<FlexRender
										content={header.column.columnDef.header}
										context={header.getContext()}
									/>
								{/if}
							</Table.Head>
						{/each}
					</Table.Row>
				{/each}
			</Table.Header>
			<Table.Body>
				{#each table.getRowModel().rows as row (row.id)}
					<Table.Row data-state={row.getIsSelected() && 'selected'}>
						{#each row.getVisibleCells() as cell (cell.id)}
							<Table.Cell>
								<FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
							</Table.Cell>
						{/each}
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={columns.length} class="h-24 text-center">No results.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<div class="mt-2 flex items-center justify-between px-2">
		<div class="text-muted-foreground flex-1 text-sm">
			{table.getFilteredSelectedRowModel().rows.length} of{' '}
			{table.getFilteredRowModel().rows.length} row(s) selected.
		</div>
		<div class="flex items-center space-x-6 lg:space-x-8">
			<div class="flex items-center space-x-2">
				<p class="text-sm font-medium">Rows per page</p>
				<Select.Root type="single" bind:value onValueChange={(v) => changeValue(v, table)}>
					<Select.Trigger class="h-8 w-[70px] rounded">
						{triggerContent}
					</Select.Trigger>
					<Select.Content class="rounded">
						{#each pageSizesList as pageSize (pageSize.value)}
							<Select.Item class="rounded" value={pageSize.value} label={pageSize.label}
								>{pageSize.value}</Select.Item
							>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			<div class="flex w-auto items-center justify-center text-sm font-medium">
				Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
			</div>
			<div class="flex items-center space-x-2">
				<Button
					variant="outline"
					class="hidden h-8 w-8 rounded p-0 lg:flex"
					onclick={() => table.firstPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<span class="sr-only">Go to first page</span>
					<DoubleArrowLeft size={'15'} />
				</Button>
				<Button
					variant="outline"
					class="h-8 w-8 rounded p-0"
					onclick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<span class="sr-only">Go to previous page</span>
					<ChevronLeft size={'15'} />
				</Button>
				<Button
					variant="outline"
					class="h-8 w-8 rounded p-0"
					onclick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					<span class="sr-only">Go to next page</span>
					<ChevronRight size={'15'} />
				</Button>
				<Button
					variant="outline"
					class="hidden h-8 w-8 rounded p-0 lg:flex"
					onclick={() => table.lastPage()}
					disabled={!table.getCanNextPage()}
				>
					<span class="sr-only">Go to last page</span>
					<DoubleArrowRight size={'15'} />
				</Button>
			</div>
		</div>
	</div>
</div>
