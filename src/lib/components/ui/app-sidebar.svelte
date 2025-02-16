<script lang="ts">
	import NavMain from '$lib/components/ui/nav-main.svelte';
	import NavUser from '$lib/components/ui/nav-user.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import Gem from 'lucide-svelte/icons/gem';
	import { navData } from '../../utility/nav-data';
	import type { GetUserById } from '$lib/server/routes/auth';

	let {
		data,
		ref = $bindable(null),
		collapsible = 'icon',
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { data: GetUserById } = $props();
</script>

<Sidebar.Root bind:ref variant="floating" {collapsible} {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg" class="rounded">
					{#snippet child({ props })}
						<a data-sveltekit-preload-data="hover" href="##" {...props}>
							<div
								class="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded"
							>
								<Gem class="size-4" />
							</div>
							<div class="grid flex-1 text-left text-sm leading-tight">
								<span class="truncate font-semibold">Lilian</span>
								<span class="truncate text-xs">Enterprise</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={navData.navMain} />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser user={{ name: data.fullName, email: data.username, avatar: '' }} />
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
