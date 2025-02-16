<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import ArrowUpDown from 'lucide-svelte/icons/arrow-up-down';
	import { Button } from '$lib/components/ui/button/index';

	let {name, variant = 'ghost', ...restProps }: ComponentProps<typeof Button> = $props();
</script>

<Button {variant} {...restProps} class="p-0 m-0 rounded px-1 h-6">
	{name}
	<ArrowUpDown class="size-0" />
</Button>
