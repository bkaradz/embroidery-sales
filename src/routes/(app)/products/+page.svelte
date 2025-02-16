<script lang="ts">
	import { getColumn } from './columns';
	import DataTable from './data-table.svelte';
	import { getContext } from 'svelte';

	let { data } = $props();
	const viewCurrency = getContext('viewCurrency') as () => string;
</script>

<DataTable data={data.products} columns={getColumn(viewCurrency, data.converter)}></DataTable>
