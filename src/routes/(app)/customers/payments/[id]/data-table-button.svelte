<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import ArrowUpDown from 'lucide-svelte/icons/arrow-up-down';
	import { Button } from '$lib/components/ui/button/index';

	let {name, variant = 'ghost', ...restProps }: ComponentProps<typeof Button> = $props();
</script>

<Button {variant} {...restProps} class="p-0 m-0 px-1 h-6 rounded">
	{name}
	<ArrowUpDown class="size-0" />
</Button>
