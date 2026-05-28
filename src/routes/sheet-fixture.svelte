<script lang="ts">
	import {
		Sheet,
		SheetContent,
		SheetDescription,
		SheetFooter,
		SheetHeader,
		SheetTitle
	} from '$lib/components/ui/sheet/index.js';
</script>

<Sheet open>
	<SheetContent side="left">
		<SheetHeader>
			<SheetTitle>Sheet title</SheetTitle>
			<SheetDescription>Sheet description</SheetDescription>
		</SheetHeader>
		<div class="px-4">Sheet body</div>
		<SheetFooter>Sheet footer</SheetFooter>
	</SheetContent>
</Sheet>
