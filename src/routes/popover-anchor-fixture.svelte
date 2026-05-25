<script lang="ts">
	import {
		Popover,
		PopoverAnchor,
		PopoverContent
	} from '$lib/components/ui/popover/index.js';
</script>

<div style="padding: 40px;">
	<Popover open>
		<PopoverAnchor
			aria-label="custom anchor"
			style="display: block; width: 96px; height: 24px; margin-left: 123px;"
		>
			Anchor
		</PopoverAnchor>
		<PopoverContent align="start" sideOffset={0} class="w-24 p-0">
			Anchored content
		</PopoverContent>
	</Popover>
</div>
