<script lang="ts">
	import { page } from '$app/state';
	const { data } = $props();
</script>

<h1>{page.status}: {page.error?.message}</h1>
<p>Test error</p>
