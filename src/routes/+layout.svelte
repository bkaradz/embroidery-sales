<script lang="ts">
	import { page } from '$app/state';
	import { ModeWatcher } from 'mode-watcher';
	import { getFlash } from 'sveltekit-flash-message';
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner/index';
	import { toast } from 'svelte-sonner';

	let { children } = $props();
	const flash = getFlash(page);

	$effect(() => {
		if ($flash) {
			if ($flash.type == 'success') {
				toast.success($flash.message);
			}
			if ($flash.type == 'error') {
				toast.error($flash.message);
			}
		}

		// Clear the flash message to avoid double-toasting.
		$flash = undefined;
	});
</script>

<Toaster position="top-right" richColors expand={true} closeButton />
<ModeWatcher />
{@render children()}
