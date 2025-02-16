<script lang="ts">
	import { getContext } from 'svelte';
	import DataTableFacetedFilter from './data-table-faceted-filter.svelte';
	import { statuses } from './data';

	const filterValues = $state({ status: ['Pending'] });

	const value = getContext('viewCurrency') as () => string;
</script>

<h1>Dashboard</h1>
<p>{value()}</p>

<div>
	<DataTableFacetedFilter
		bind:filterValues={filterValues.status}
		title="Status"
		options={statuses}
		counts={{ Pending: 6, Expired: 10, 'On Hold': 20 }}
	/>
</div>
