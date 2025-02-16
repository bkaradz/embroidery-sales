<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index';
	import Bell from 'lucide-svelte/icons/bell';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import LogOut from 'lucide-svelte/icons/log-out';
	import * as Avatars from './avatar/index';
	import Button from './button/button.svelte';
	import * as DropdownMenu from './dropdown-menu/index';

	let {
		user
	}: {
		user: {
			name: string;
			email: string;
			avatar: string;
		};
	} = $props();
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						{...props}
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground rounded"
					>
						<Avatars.Root class="h-8 w-8 rounded">
							<!-- <Avatar class="size-8 h-8 w-8" /> -->
							<Avatars.Image src={user.avatar} alt={user.name} />
							<Avatars.Fallback class="rounded">CN</Avatars.Fallback>
						</Avatars.Root>
						<div class="grid flex-1 text-left text-sm leading-tight">
							<span class="truncate font-semibold">{user.name}</span>
							<span class="truncate text-xs">{user.email}</span>
						</div>
						<ChevronsUpDown class="ml-auto size-4" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded"
				side="right"
				align="end"
				sideOffset={4}
			>
				<DropdownMenu.Group>
					<DropdownMenu.Item class="rounded">
						<Bell />
						Notifications
					</DropdownMenu.Item>
				</DropdownMenu.Group>
				<DropdownMenu.Separator />
				<DropdownMenu.Item class="m-0 rounded">
					<LogOut />
					<form class="w-full rounded" action="/logout" method="post">
						<Button
							type="submit"
							variant="ghost"
							class="m-0 w-full justify-start rounded p-0 focus-visible:ring-0"
						>
							Log out
						</Button>
					</form>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
