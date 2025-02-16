<script lang="ts">
	import { getContext } from 'svelte';
	import { getColumn } from './columns';
	import DataTable from './data-table.svelte';

	let { data } = $props();
	const viewCurrency = getContext('viewCurrency') as () => string;
</script>

<DataTable data={data.viewOrders} columns={getColumn(viewCurrency, data.converter)}></DataTable>
