<script lang="ts">
	import { browser } from '$app/environment';
	import PdfViewer from '$lib/components/ui/pdf-viewer.svelte';
	import { downloadReport } from '$lib/templates/report';

	let { data } = $props();

	const columns = [
		{ title: 'ID', dataKey: 'id' },
		{ title: 'Full Name', dataKey: 'fullName' },
		{ title: 'Email', dataKey: 'email' }
	];

	const reportTitle = 'Customer Report';
</script>

{#if browser}
	<PdfViewer
		base64Data={downloadReport(columns, data.customers, reportTitle, 'portrait')}
		downloadReport={downloadReport(columns, data.customers, reportTitle, 'portrait', true)}
	/>
{/if}
