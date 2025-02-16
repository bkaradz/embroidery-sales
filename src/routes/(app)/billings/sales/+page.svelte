<script lang="ts">
	import DataTable from './data-table.svelte';
	import { getContext } from 'svelte';
	import { getColumn } from './columns';

	let { data } = $props();
	const viewCurrency = getContext('viewCurrency') as () => string;
</script>

<DataTable data={data.salesBook} columns={getColumn(viewCurrency, data.converter)}></DataTable>
