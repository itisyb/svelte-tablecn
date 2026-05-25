<script lang="ts">
	import {
		Drawer,
		DrawerClose,
		DrawerContent,
		DrawerDescription,
		DrawerFooter,
		DrawerHeader,
		DrawerTitle,
		DrawerTrigger
	} from '$lib/components/ui/drawer';
</script>

<Drawer direction="bottom">
	<DrawerTrigger>Open drawer</DrawerTrigger>
	<DrawerContent>
		<DrawerHeader>
			<DrawerTitle>Task drawer</DrawerTitle>
			<DrawerDescription>Review the selected task.</DrawerDescription>
		</DrawerHeader>
		<div class="px-4 py-2">Drawer body</div>
		<DrawerFooter>
			<DrawerClose>Close drawer</DrawerClose>
		</DrawerFooter>
	</DrawerContent>
</Drawer>
