<script lang="ts">
	import { browser } from '$app/environment';
	import PdfViewer from '$lib/components/ui/pdf-viewer.svelte';
	import { downloadInvoice } from '$lib/templates/invoice';
	import { getContext } from 'svelte';

	const viewCurrency = getContext('viewCurrency') as () => string;

	const { data } = $props();

	const invoice = $state(downloadInvoice);

	const format = $state({ converter: data.converter, opt: { to: viewCurrency() } });

	const columns = [
		{ title: 'Description', dataKey: 'productName' },
		{ title: 'Category', dataKey: 'productCategory' },
		{ title: 'Quantity', dataKey: 'quantity' },
		{ title: 'Price', dataKey: 'unitPrice' },
		{ title: 'Amount', dataKey: 'total' }
	];

	const reportTitle = 'Quotation';
</script>

{#if browser}
	<PdfViewer
		base64Data={invoice(format, data.orderDetails, columns, reportTitle)}
		downloadReport={invoice(format, data.orderDetails, columns, reportTitle, true)}
	/>
{/if}
