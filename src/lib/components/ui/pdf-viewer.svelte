<script lang="ts">
	import { browser } from '$app/environment';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Download from 'lucide-svelte/icons/download';
	import * as PDFJS from 'pdfjs-dist';
	import { onMount } from 'svelte';
	import Button from './button/button.svelte';

	let totalPage = $state(0);
	let pageNum = $state(1);
	let scale = $state(1.33);
	const { base64Data, downloadReport } = $props();

	PDFJS.GlobalWorkerOptions.workerSrc = new URL(
		'pdfjs-dist/build/pdf.worker.mjs',
		import.meta.url
	).toString();

	let canvas: HTMLCanvasElement | null = $state(null);

	onMount(async () => {
		console.log('canvas before:', canvas);
		if (canvas) {
			console.log('canvas after:', canvas);
			await loadPDF(canvas, base64Data.split(',')[1]); // Remove data URL prefix
		}
	});

	async function loadPDF(node: HTMLCanvasElement, base64Data: string) {
		if (!node) return;

		try {
			// Decode the Base64 string to a Uint8Array
			const decodedPdf = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

			const loadingTask = PDFJS.getDocument({ data: decodedPdf }); // Use {data: ...} for Base64
			const pdfDoc = await loadingTask.promise;
			totalPage = pdfDoc.numPages;
			if (pageNum > totalPage) pageNum = totalPage;
			if (pageNum < 1) pageNum = 1;
			const page = await pdfDoc.getPage(pageNum);
			// const scale = 1;
			const viewport = page.getViewport({ scale });
			const context = node.getContext('2d');

			if (!context) {
				throw new Error('Canvas context not found');
			}

			node.height = viewport.height;
			node.width = viewport.width;

			const renderContext = {
				canvasContext: context,
				viewport
			};

			await page.render(renderContext).promise;
		} catch (error) {
			console.error('Error loading PDF:', error);
			// Handle the error, e.g., display an error message.
		}
	}
	//
	const changePage = async (sign: 'plus' | 'minus') => {
		if (sign === 'minus') {
			if (pageNum > 1) {
				pageNum = pageNum - 1;
			}
		} else {
			if (pageNum < totalPage) {
				pageNum = pageNum + 1;
			}
		}
		if (canvas) {
			await loadPDF(canvas, base64Data.split(',')[1]); // Remove data URL prefix
		}
	};

	// type Event = WheelEvent & { currentTarget: EventTarget & HTMLCanvasElement };

	// const mouseWheel = (e: Event) => {
	// 	const sign: 'minus' | 'plus' = e.deltaY > 0 ? 'minus' : 'plus';
	// 	changePage(sign);
	// };
	// onwheel={(e) => mouseWheel(e)}
</script>

<div class="relative self-center">
	<canvas bind:this={canvas} oncontextmenu={(e) => e.preventDefault()}> </canvas>
	{#if browser}
		<div class="fixed top-40 z-40 m-10 grid grid-cols-3 gap-2">
			<Button
				class="bg-sidebar-primary text-sidebar-primary-foreground"
				size="icon"
				onclick={() => downloadReport()}
			>
				<Download />
			</Button>
			<Button
				class="bg-sidebar-primary text-sidebar-primary-foreground"
				size="icon"
				disabled={pageNum === 1}
				onclick={() => changePage('minus')}
			>
				<ChevronLeft />
			</Button>
			<Button
				class="bg-sidebar-primary text-sidebar-primary-foreground"
				size="icon"
				disabled={pageNum === totalPage}
				onclick={() => changePage('plus')}
			>
				<ChevronRight />
			</Button>
		</div>
	{/if}
</div>
