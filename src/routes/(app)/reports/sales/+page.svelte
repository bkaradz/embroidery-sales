<script lang="ts">
	import { browser } from '$app/environment';
	import PdfViewer from '$lib/components/ui/pdf-viewer.svelte';
	import { downloadReport } from '$lib/templates/report.js';
	import { formatCurrency } from '$lib/utility/convert-currencies.js';
	import Big from 'big.js';
	import { formatDate } from 'date-fns';
	import { getContext } from 'svelte';

	const viewCurrency = getContext('viewCurrency') as () => string;

	let { data } = $props();

	const columns = [
		{ title: 'Date', dataKey: 'orderDate' },
		{ title: 'Customer', dataKey: 'customerName' },
		{ title: 'Product', dataKey: 'productName' },
		{ title: 'Stitches', dataKey: 'stitches' },
		{ title: 'Qty', dataKey: 'quantity' },
		{ title: 'Price', dataKey: 'unitPrice' },
		{ title: 'Total', dataKey: 'total' },
		{ title: 'Order Total', dataKey: 'orderTotal' },
		{ title: 'Total Paid', dataKey: 'totalPaid' },
		{ title: 'Balance', dataKey: 'balanceRemaining' },
		{ title: 'Payment', dataKey: 'paymentStatus' }
	];

	const processedData = $derived.by(() => {
		return data.sales.map((item) => {
			const { orders, products, quantity, stitches, unitPrice } = item;
			const { totalAmount, totalPaid, customers, orderDate, paymentStatus } = orders;
			const { name } = products;
			const { fullName } = customers;

			const newUnitPrice = formatCurrency(data.converter, unitPrice, {
				to: viewCurrency()
			});
			const newTotal = formatCurrency(data.converter, Big(unitPrice).mul(quantity), {
				to: viewCurrency()
			});
			const newOrderTotal = formatCurrency(data.converter, totalAmount, {
				to: viewCurrency()
			});
			const newTotalPaid = formatCurrency(data.converter, totalPaid, {
				to: viewCurrency()
			});
			const balanceRemaining = formatCurrency(
				data.converter,
				Big(unitPrice).mul(quantity).minus(totalPaid),
				{
					to: viewCurrency()
				}
			);
			return {
				customerName: fullName,
				productName: name,
				orderDate: formatDate(new Date(orderDate), 'dd/MM/yyyy'),
				paymentStatus,
				stitches,
				quantity,
				unitPrice: newUnitPrice,
				total: newTotal,
				orderTotal: newOrderTotal,
				totalPaid: newTotalPaid,
				balanceRemaining
			};
		});
	});

	const reportTitle = 'Sales Report';
</script>

{#if browser}
	<PdfViewer
		base64Data={downloadReport(columns, processedData, reportTitle, 'landscape')}
		downloadReport={downloadReport(columns, processedData, reportTitle, 'landscape', true)}
	/>
{/if}
