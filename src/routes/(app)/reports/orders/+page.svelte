<script lang="ts">
	import { browser } from '$app/environment';
	import PdfViewer from '$lib/components/ui/pdf-viewer.svelte';
	import { downloadReport } from '$lib/templates/report.js';
	import { formatCurrency } from '$lib/utility/convertCurrencies.js';
	import Big from 'big.js';
	import { formatDate } from 'date-fns';
	import { getContext } from 'svelte';

	const viewCurrency = getContext('viewCurrency') as () => string;

	let { data } = $props();

	const columns = [
		{ title: 'ID', dataKey: 'id' },
		{ title: 'Date', dataKey: 'orderDate' },
		{ title: 'Customer', dataKey: 'fullName' },
		{ title: 'Order Total', dataKey: 'totalAmount' },
		{ title: 'Total Paid', dataKey: 'totalPaid' },
		{ title: 'Balance', dataKey: 'balanceRemaining' },
		{ title: 'Order Status', dataKey: 'orderStatus' },
		{ title: 'Status', dataKey: 'status' },
		{ title: 'Payment', dataKey: 'paymentStatus' }
	];

	const processedData = $derived.by(() => {
		return data.orders.map((order) => {
			const {
				id,
				orderDate,
				customers,
				totalAmount,
				totalPaid,
				orderStatus,
				status,
				paymentStatus
			} = order;
			const newTotalAmount = formatCurrency(data.converter, totalAmount, {
				to: viewCurrency()
			});
			const newTotalPaid = formatCurrency(data.converter, totalPaid, {
				to: viewCurrency()
			});
			const newBalanceRemaining = formatCurrency(
				data.converter,
				Big(totalAmount).minus(totalPaid),
				{
					to: viewCurrency()
				}
			);
			return {
				fullName: customers.fullName,
				id,
				orderStatus,
				status,
				paymentStatus,
				totalAmount: newTotalAmount,
				totalPaid: newTotalPaid,
				balanceRemaining: newBalanceRemaining,
				orderDate: formatDate(new Date(orderDate), 'dd/MM/yyyy')
			};
		});
	});

	const reportTitle = 'Orders Report';
</script>

{#if browser}
	<PdfViewer
		base64Data={downloadReport(columns, processedData, reportTitle, 'landscape')}
		downloadReport={downloadReport(columns, processedData, reportTitle, 'landscape', true)}
	/>
{/if}
