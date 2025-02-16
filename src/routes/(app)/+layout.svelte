<script lang="ts">
	import AppSidebar from '$lib/components/ui/app-sidebar.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Select from '$lib/components/ui/select/index';
	import { setContext } from 'svelte';
	import Moon from 'lucide-svelte/icons/moon';
	import Sun from 'lucide-svelte/icons/sun';
	import { toggleMode } from 'mode-watcher';
	import Button from '$lib/components/ui/button/button.svelte';

	let { data, children } = $props();

	const currenciesNames = $state(data.currenciesNames);

	let viewCurrency = $state('USD');

	const triggerContent = $derived(
		currenciesNames.find((f) => f.value === viewCurrency)?.label ?? 'Select a currency'
	);

	setContext('viewCurrency', () => viewCurrency);
</script>

<Sidebar.Provider>
	<AppSidebar data={data.userData} />
	<Sidebar.Inset class="rounded">
		<header
			class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
		>
			<div class="flex w-full justify-between">
				<div class="flex items-center gap-2 px-2">
					<Sidebar.Trigger class="rouunded -ml-1" />
					<Separator orientation="vertical" class="mr-2 h-4" />
					<Breadcrumb.Root>
						<Breadcrumb.List>
							<Breadcrumb.Item class="hidden md:block">
								<Breadcrumb.Link href="#">Building Your Application</Breadcrumb.Link>
							</Breadcrumb.Item>
							<Breadcrumb.Separator class="hidden md:block" />
							<Breadcrumb.Item>
								<Breadcrumb.Page>Data Fetching</Breadcrumb.Page>
							</Breadcrumb.Item>
						</Breadcrumb.List>
					</Breadcrumb.Root>
				</div>
				<div class="flex gap-2 pr-4">
					<Select.Root type="single" name="status" bind:value={viewCurrency}>
						<Select.Trigger class="w-[180px] rounded">
							{triggerContent}
						</Select.Trigger>
						<Select.Content class="rounded">
							<Select.Group>
								<Select.GroupHeading>View Currency</Select.GroupHeading>
								{#each currenciesNames as state (state.value)}
									<Select.Item class="rounded" value={state.value} label={state.label} />
								{/each}
							</Select.Group>
						</Select.Content>
					</Select.Root>

					<Button
						class="bg-sidebar-secondary text-sidebar-secondary-foreground rounded"
						onclick={toggleMode}
						variant="outline"
						size="icon"
					>
						<Sun
							class="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"
						/>
						<Moon
							class="absolute h-[1.2rem] w-[1.2rem]  scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"
						/>
						<span class="sr-only">Toggle theme</span>
					</Button>
				</div>
			</div>
		</header>
		<div class="flex flex-1 flex-col pr-2">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
