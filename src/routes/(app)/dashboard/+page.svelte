<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
	<div class="grid auto-rows-min gap-4 md:grid-cols-3">
		<div class="bg-muted/50 aspect-video rounded-xl"></div>
		<div class="bg-muted/50 aspect-video rounded-xl"></div>
		<div class="bg-muted/50 aspect-video rounded-xl"></div>
	</div>
	<div class="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min">
		Lorem ipsum dolor sit amet consectetur adipisicing elit. Magnam culpa amet, reiciendis quos at
		aperiam inventore ab. Ipsum architecto dolore beatae voluptate consequuntur excepturi aliquam.
		Assumenda molestias earum ab corporis.
	</div>
</div>
