<script lang="ts">
  import DataTable from "./data-table.svelte";
  import { columns } from "./columns";
 
  let { data } = $props();
</script>
 
<DataTable data={data?.salesBook} {columns}></DataTable>