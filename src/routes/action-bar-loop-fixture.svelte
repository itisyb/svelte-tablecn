<script lang="ts">
	import {
		ActionBar,
		ActionBarGroup,
		ActionBarItem
	} from '$lib/components/ui/action-bar/index.js';
</script>

<ActionBar open loop={false}>
	<ActionBarGroup>
		<ActionBarItem>First</ActionBarItem>
		<ActionBarItem>Second</ActionBarItem>
	</ActionBarGroup>
</ActionBar>
