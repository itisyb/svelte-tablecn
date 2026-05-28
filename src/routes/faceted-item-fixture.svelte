<script lang="ts">
	import {
		Faceted,
		FacetedGroup,
		FacetedItem,
		FacetedList,
		type FacetedValue
	} from '$lib/components/ui/faceted/index.js';
	import { Command } from '$lib/components/ui/command/index.js';

	let value = $state<FacetedValue | undefined>();
	let customValue = $state('none');

	function handleValueChange(nextValue: FacetedValue | undefined) {
		value = nextValue;
	}
</script>

<Faceted value={value} onValueChange={handleValueChange}>
	<Command>
		<FacetedList>
			<FacetedGroup>
				<FacetedItem value="engineering" onSelect={(selectedValue) => (customValue = selectedValue)}>
					Engineering
				</FacetedItem>
				<FacetedItem value="marketing">Marketing</FacetedItem>
			</FacetedGroup>
		</FacetedList>
	</Command>
</Faceted>

<output aria-label="custom faceted value">{customValue}</output>
<output aria-label="faceted value">{typeof value === 'string' ? value : 'none'}</output>
