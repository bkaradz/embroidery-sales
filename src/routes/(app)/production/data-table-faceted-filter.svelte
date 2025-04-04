<script lang="ts">
	import PlusCircled from 'svelte-radix/PlusCircled.svelte';
	import Check from 'svelte-radix/Check.svelte';
	import type { Statuses } from './data.js';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { tick } from 'svelte';

	type Props = {
		filterValues: string[];
		title: string;
		options: Statuses;
		counts: { [index: string]: number };
	};
	let { filterValues = $bindable([]), title, options = [], counts = {} }: Props = $props();

	let open = $state(false);

	function handleSelect(currentValue: string) {
		if (Array.isArray(filterValues) && filterValues.includes(currentValue)) {
			filterValues = filterValues.filter((v) => v !== currentValue);
		} else {
			filterValues = [...(Array.isArray(filterValues) ? filterValues : []), currentValue];
		}
	}

	let triggerRef = $state<HTMLButtonElement>(null!);

	function closeAndFocusTrigger() {
		open = false;
		tick().then(() => {
			triggerRef.focus();
		});
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger bind:ref={triggerRef}>
		{#snippet child({ props })}
			<Button {...props} variant="outline" size="sm" class="h-8 rounded border-dashed">
				<PlusCircled class="mr-2 h-4 w-4" />
				{title}

				{#if filterValues.length > 0}
					<Separator orientation="vertical" class="mx-2 h-4" />
					<Badge variant="secondary" class="rounded-sm px-1 font-normal lg:hidden">
						{filterValues.length}
					</Badge>
					<div class="hidden space-x-1 lg:flex">
						{#if filterValues.length > 2}
							<Badge variant="secondary" class="rounded-sm px-1 font-normal">
								{filterValues.length} Selected
							</Badge>
						{:else}
							{#each filterValues as option}
								<Badge variant="secondary" class="rounded-sm px-1 font-normal">
									{option}
								</Badge>
							{/each}
						{/if}
					</div>
				{/if}
			</Button>
		{/snippet}
	</Popover.Trigger>

	<Popover.Content class="w-[200px] p-0" align="start" side="bottom">
		<Command.Root>
			<Command.Input class="rounded" placeholder={title} />
			<Command.List>
				<Command.Empty>No results found.</Command.Empty>
				<Command.Group>
					{#each options as option}
						{@const Icon = option.icon}
						<Command.Item
							value={option.value}
							onSelect={() => {
								handleSelect(option.value);
								closeAndFocusTrigger();
							}}
						>
							<div
								class={cn(
									'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
									filterValues.includes(option.value)
										? 'bg-primary text-primary-foreground'
										: 'opacity-50 [&_svg]:invisible'
								)}
							>
								<Check className={cn('h-4 w-4')} />
							</div>
							<Icon class="text-muted-foreground mr-2 h-4 w-4" />
							<span>
								{option.label}
							</span>
							{#if counts[option.value]}
								<span class="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
									{counts[option.value]}
								</span>
							{/if}
						</Command.Item>
					{/each}
				</Command.Group>
				{#if filterValues.length > 0}
					<Command.Separator />
					<Command.Item
						class="justify-center text-center"
						onSelect={() => {
							filterValues = [];
						}}
					>
						Clear filters
					</Command.Item>
				{/if}
			</Command.List>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
