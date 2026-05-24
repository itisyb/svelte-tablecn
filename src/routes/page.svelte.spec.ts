import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { toast } from 'svelte-sonner';
import Page from './+page.svelte';
import ActionBarLoopFixture from './action-bar-loop-fixture.svelte';
import DataGridAutoFocusFixture from './data-grid-auto-focus-fixture.svelte';
import DataGridCheckboxCellFixture from './data-grid-checkbox-cell-fixture.svelte';
import DataGridCustomCellFixture from './data-grid-custom-cell-fixture.svelte';
import DataGridContextMenuFixture from './data-grid-context-menu-fixture.svelte';
import DataGridContextMenuSelectionFixture from './data-grid-context-menu-selection-fixture.svelte';
import DataGridCtrlShiftEdgeFixture from './data-grid-ctrl-shift-edge-fixture.svelte';
import DataGridDateCellSyncFixture from './data-grid-date-cell-sync-fixture.svelte';
import DataGridDataUpdateFixture from './data-grid-data-update-fixture.svelte';
import DataGridDefaultFeaturesFixture from './data-grid-default-features-fixture.svelte';
import DataGridEditingMetaFixture from './data-grid-editing-meta-fixture.svelte';
import DataGridFilterDatePlaceholderFixture from './data-grid-filter-date-placeholder-fixture.svelte';
import DataGridFilterDateRangeFixture from './data-grid-filter-date-range-fixture.svelte';
import DataGridFilterMenuFixture from './data-grid-filter-menu-fixture.svelte';
import DataGridFilterSelectPlaceholderFixture from './data-grid-filter-select-placeholder-fixture.svelte';
import DataGridFileCellLocalFixture from './data-grid-file-cell-local-fixture.svelte';
import DataGridFileCellSyncFixture from './data-grid-file-cell-sync-fixture.svelte';
import DataGridFocusoutFixture from './data-grid-focusout-fixture.svelte';
import DataGridKeyboardShortcutsDefaultFixture from './data-grid-keyboard-shortcuts-default-fixture.svelte';
import DataGridKeyboardShortcutsEnabledFixture from './data-grid-keyboard-shortcuts-enabled-fixture.svelte';
import DataGridLongTextCellSyncFixture from './data-grid-long-text-cell-sync-fixture.svelte';
import DataGridMenuFixture from './data-grid-menu-fixture.svelte';
import DataGridMultiSelectCellFixture from './data-grid-multi-select-cell-fixture.svelte';
import DataGridNumberCellSyncFixture from './data-grid-number-cell-sync-fixture.svelte';
import DataGridOutsideSelectionFixture from './data-grid-outside-selection-fixture.svelte';
import DataGridPasteDelayedRowsFixture from './data-grid-paste-delayed-rows-fixture.svelte';
import DataGridPasteDisabledFixture from './data-grid-paste-disabled-fixture.svelte';
import DataGridPasteDialogClosedFixture from './data-grid-paste-dialog-closed-fixture.svelte';
import DataGridPasteDialogFixture from './data-grid-paste-dialog-fixture.svelte';
import DataGridPasteFitExistingFixture from './data-grid-paste-fit-existing-fixture.svelte';
import DataGridPasteOrderFixture from './data-grid-paste-order-fixture.svelte';
import DataGridPasteWithoutFocusFixture from './data-grid-paste-without-focus-fixture.svelte';
import DataGridReadonlyKeyboardFixture from './data-grid-readonly-keyboard-fixture.svelte';
import DataGridReadonlyRowSelectFixture from './data-grid-readonly-row-select-fixture.svelte';
import DataGridRowAddSelectionFixture from './data-grid-row-add-selection-fixture.svelte';
import DataGridRowHeightMenuClassFixture from './data-grid-row-height-menu-class-fixture.svelte';
import DataGridRowHeightMenuFixture from './data-grid-row-height-menu-fixture.svelte';
import DataGridSelectCellSyncFixture from './data-grid-select-cell-sync-fixture.svelte';
import DataGridSearchStateFixture from './data-grid-search-state-fixture.svelte';
import DataGridShortcutsWithoutFocusFixture from './data-grid-shortcuts-without-focus-fixture.svelte';
import DataGridShortTextCellSyncFixture from './data-grid-short-text-cell-sync-fixture.svelte';
import DataGridSortMenuFixture from './data-grid-sort-menu-fixture.svelte';
import DataGridUrlCellSyncFixture from './data-grid-url-cell-sync-fixture.svelte';
import DataGridViewMenuFixture from './data-grid-view-menu-fixture.svelte';
import DataGridViewMenuSearchFixture from './data-grid-view-menu-search-fixture.svelte';
import DebouncedCallbackFixture from './debounced-callback-fixture.svelte';
import buttonSource from '$lib/components/ui/button/button.svelte?raw';
import checkboxSource from '$lib/components/ui/checkbox/checkbox.svelte?raw';
import commandInputSource from '$lib/components/ui/command/command-input.svelte?raw';
import dataGridColumnHeaderSource from '$lib/components/data-grid/data-grid-column-header.svelte?raw';
import dataGridFilterMenuSource from '$lib/components/data-grid/data-grid-filter-menu.svelte?raw';
import dataGridSearchSource from '$lib/components/data-grid/data-grid-search.svelte?raw';
import dataGridSortMenuSource from '$lib/components/data-grid/data-grid-sort-menu.svelte?raw';
import dataTableFacetedFilterSource from '$lib/components/data-table/data-table-faceted-filter.svelte?raw';
import dataTableFilterListSource from '$lib/components/data-table/data-table-filter-list.svelte?raw';
import dataTableFilterMenuSource from '$lib/components/data-table/data-table-filter-menu.svelte?raw';
import dataTableRangeFilterSource from '$lib/components/data-table/data-table-range-filter.svelte?raw';
import dataTableSliderFilterSource from '$lib/components/data-table/data-table-slider-filter.svelte?raw';
import dataTableSortListSource from '$lib/components/data-table/data-table-sort-list.svelte?raw';
import dataTableViewOptionsSource from '$lib/components/data-table/data-table-view-options.svelte?raw';
import dialogContentSource from '$lib/components/ui/dialog/dialog-content.svelte?raw';
import dropdownMenuGroupHeadingSource from '$lib/components/ui/dropdown-menu/dropdown-menu-group-heading.svelte?raw';
import dropdownMenuLabelSource from '$lib/components/ui/dropdown-menu/dropdown-menu-label.svelte?raw';
import inputSource from '$lib/components/ui/input/input.svelte?raw';
import separatorSource from '$lib/components/ui/separator/separator.svelte?raw';
import sliderSource from '$lib/components/ui/slider/slider.svelte?raw';
import tableCellSource from '$lib/components/ui/table/table-cell.svelte?raw';
import tableHeadSource from '$lib/components/ui/table/table-head.svelte?raw';
import tooltipProviderSource from '$lib/components/ui/tooltip/tooltip-provider.svelte?raw';

async function waitFor<T>(callback: () => T | undefined | null, timeout = 5_000): Promise<T> {
	const startedAt = Date.now();

	while (Date.now() - startedAt < timeout) {
		const result = callback();
		if (result) return result;
		await new Promise((resolve) => setTimeout(resolve, 50));
	}

	throw new Error('Timed out waiting for condition');
}

describe('/+page.svelte', () => {
	it('should render h1', async () => {
		await render(Page);

		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toHaveTextContent('svelte-tablecn');
	});

	it('should render data grid after switching to grid demo', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		const grid = page.getByRole('grid', { name: 'Data grid' });
		await expect.element(grid).toBeInTheDocument();
	});

	it('should cancel pending debounced callbacks on unmount like the original hook', async () => {
		await render(DebouncedCallbackFixture);

		await page.getByRole('button', { name: 'Schedule debounced callback' }).click();
		await page.getByRole('button', { name: 'Unmount debounced child' }).click();
		await new Promise((resolve) => setTimeout(resolve, 80));

		await expect.element(page.getByLabelText('debounced calls')).toHaveTextContent('0');
	});

	it('should only autofocus object targets with a column id like the original grid', async () => {
		await render(DataGridAutoFocusFixture);

		await expect.element(page.getByLabelText('default focused cell')).toHaveTextContent('0:name');
		await expect.element(page.getByLabelText('target focused cell')).toHaveTextContent('1:score');
		await new Promise((resolve) => setTimeout(resolve, 50));
		await expect.element(page.getByLabelText('row-only focused cell')).toHaveTextContent('none');
	});

	it('should use transform-based virtual row layout by default', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		const row = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-row"][data-index="0"]')
		);
		const body = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-body"]')
		);

		const rowStyles = getComputedStyle(row);
		const bodyStyles = getComputedStyle(body);

		expect(row.style.transform).toContain('translateY');
		expect(rowStyles.contentVisibility).toBe('auto');
		expect(bodyStyles.contain).toBe('strict');
	});

	it('should align select cell editor like the original grid', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		const grid = await waitFor(() => document.querySelector<HTMLElement>('[data-slot="grid"]'));
		await waitFor(() => document.querySelector('[data-slot="grid-row"][data-index="0"]'));
		grid.scrollLeft = 1190;
		await new Promise((resolve) => setTimeout(resolve, 100));

		const departmentCell = await waitFor(() => {
			const row = document.querySelector('[data-slot="grid-row"][data-index="0"]');
			return row?.querySelectorAll<HTMLElement>('[data-slot="grid-cell"]').item(7);
		});
		const wrapper = await waitFor(() =>
			departmentCell.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"]')
		);

		wrapper.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));

		const trigger = await waitFor(() =>
			departmentCell.querySelector<HTMLElement>('[data-slot="select-trigger"]')
		);
		const content = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-grid-cell-editor][data-slot="select-content"]')
		);
		const { wrapperRect, triggerRect, contentRect } = await waitFor(() => {
			const wrapperRect = wrapper.getBoundingClientRect();
			const triggerRect = trigger.getBoundingClientRect();
			const contentRect = content.getBoundingClientRect();
			const isPlaced =
				contentRect.width > 0 &&
				contentRect.height > 0 &&
				getComputedStyle(content).transform === 'none';

			return isPlaced ? { wrapperRect, triggerRect, contentRect } : null;
		});

		expect(triggerRect.top).toBeGreaterThanOrEqual(wrapperRect.top);
		expect(Math.abs(Math.round(triggerRect.height) - 32)).toBeLessThanOrEqual(1);
		expect(Math.round(contentRect.left)).toBe(Math.round(wrapperRect.left));
		expect(contentRect.top).toBeGreaterThanOrEqual(wrapperRect.top);
		expect(contentRect.top).toBeLessThanOrEqual(wrapperRect.bottom + 8);

		const contentStyle = getComputedStyle(content);
		expect(Math.round(Number.parseFloat(contentStyle.width))).toBe(Math.round(wrapperRect.width));

		expect(content.className).toContain('min-w-[calc(var(--bits-select-anchor-width)_+_16px)]');
		expect(content.className).not.toContain('rounded-[2px]');
		expect(trigger.className).not.toContain('data-[size=sm]:h-full');
		expect(trigger.className).toContain('!w-full');
		expect(trigger.getAttribute('style') ?? '').toContain('width: calc(100% - 16px)');
		const firstItem = await waitFor(() =>
			content.querySelector<HTMLElement>('[data-slot="select-item"]')
		);
		expect(firstItem.className).not.toContain('rounded-[2px]');

		let bubbledToGrid = false;
		const onGridKeyDown = () => {
			bubbledToGrid = true;
		};
		grid.addEventListener('keydown', onGridKeyDown);

		const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
		trigger.dispatchEvent(tabEvent);
		grid.removeEventListener('keydown', onGridKeyDown);

		expect(tabEvent.defaultPrevented).toBe(true);
		expect(bubbledToGrid).toBe(false);
		await waitFor(() => document.querySelector<HTMLElement>('[data-slot="select-content"]') === null);
	});

	it('should suppress native text selection while drag-selecting cells', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		const firstCell = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"]')
		);

		firstCell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));

		await waitFor(() => document.body.style.userSelect === 'none');

		const selectStartEvent = new Event('selectstart', { bubbles: true, cancelable: true });
		const contextMenuEvent = new Event('contextmenu', { bubbles: true, cancelable: true });

		expect(document.dispatchEvent(selectStartEvent)).toBe(false);
		expect(selectStartEvent.defaultPrevented).toBe(true);
		expect(document.dispatchEvent(contextMenuEvent)).toBe(false);
		expect(contextMenuEvent.defaultPrevented).toBe(true);

		firstCell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));

		await waitFor(() => document.body.style.userSelect === '');
	});

	it('should render select-all header hitbox without extra padding wrapper', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		await expect.element(page.getByLabelText('Select all')).toBeInTheDocument();

		const hitbox = await waitFor(() => {
			const element = document.querySelector<HTMLElement>('[aria-label="Select all"]');
			return element?.parentElement;
		});

		expect(hitbox.className).toContain('group relative -my-1.5');
		expect(hitbox.className).not.toContain('size-full');
		expect(hitbox.className).not.toContain('px-3 py-1.5');
	});

	it('should toggle select-all from the padded hitbox', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		const hitbox = await waitFor(() => {
			const element = document.querySelector<HTMLElement>('[aria-label="Select all"]');
			return element?.parentElement;
		});
		const firstRow = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-row"][data-index="0"]')
		);
		const label = await waitFor(() => hitbox.querySelector<HTMLLabelElement>('label'));

		label.click();

		const selectedCell = await waitFor(() =>
			firstRow.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"][data-selected]')
		);
		expect(selectedCell).toBeTruthy();
	});

	it('should pad read-only row markers like the original grid', async () => {
		await render(DataGridReadonlyRowSelectFixture);

		const firstRow = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-row"][data-index="0"]')
		);
		const selectCell = firstRow.querySelectorAll<HTMLElement>('[data-slot="grid-cell"]').item(0);
		const wrapper = selectCell.firstElementChild as HTMLElement | null;
		const marker = wrapper?.querySelector<HTMLElement>('[data-slot="row-select-readonly"]');

		expect(wrapper?.className).toContain('size-full px-3 py-1.5');
		expect(wrapper?.className).toContain('bg-primary/10');
		expect(marker?.className).toContain('ps-1');
		expect(marker?.textContent?.trim()).toBe('1');
	});

	it('should not intercept delete keys in read-only mode like the original grid', async () => {
		await render(DataGridReadonlyKeyboardFixture);

		const grid = await waitFor(() => document.querySelector<HTMLElement>('[data-slot="grid"]'));
		const firstCell = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"]')
		);

		firstCell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		firstCell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		firstCell.click();
		await waitFor(() => firstCell.hasAttribute('data-focused'));

		const allowed = grid.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true })
		);

		expect(allowed).toBe(true);
		await expect.element(page.getByLabelText('first name')).toHaveTextContent('Ada');
	});

	it('should sync checkbox cell when the external value changes', async () => {
		await render(DataGridCheckboxCellFixture);

		const checkbox = page.getByRole('checkbox');
		await expect.element(checkbox).not.toBeChecked();

		await checkbox.click();
		await expect.element(checkbox).toBeChecked();

		await checkbox.click();
		await expect.element(checkbox).not.toBeChecked();

		await page.getByRole('button', { name: 'External check' }).click();
		await expect.element(checkbox).toBeChecked();
	});

	it('should sync multi-select editor when the external value changes', async () => {
		await render(DataGridMultiSelectCellFixture);

		function getEditorBadgeTexts() {
			const editor = document.querySelector<HTMLElement>('[data-grid-cell-editor]');
			if (!editor) return null;

			return Array.from(editor.querySelectorAll<HTMLElement>('[data-slot="badge"]')).map(
				(element) => element.textContent?.trim() ?? ''
			);
		}

		await waitFor(() => {
			const badgeTexts = getEditorBadgeTexts();
			return badgeTexts?.length === 1 && badgeTexts[0] === 'React' ? badgeTexts : null;
		});

		const vueItem = await waitFor(() =>
			Array.from(document.querySelectorAll<HTMLElement>('[data-slot="command-item"]')).find(
				(element) => element.textContent?.includes('Vue')
			)
		);

		vueItem.click();

		const syncedBadgeTexts = await waitFor(() => {
			const badgeTexts = getEditorBadgeTexts();
			return badgeTexts?.length === 1 && badgeTexts[0] === 'Svelte' ? badgeTexts : null;
		});

		expect(syncedBadgeTexts).toEqual(['Svelte']);
	});

	it('should sync long text editor when the external value changes', async () => {
		await render(DataGridLongTextCellSyncFixture);

		const textarea = await waitFor(() => document.querySelector<HTMLTextAreaElement>('textarea'));
		await expect.element(page.getByRole('button', { name: 'External note' })).toBeInTheDocument();

		textarea.value = 'Local note';
		textarea.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
		await waitFor(() => textarea.value === 'Local note');

		await page.getByRole('button', { name: 'External note' }).click();
		await waitFor(() => textarea.value === 'External note');

		expect(textarea.value).toBe('External note');
	});

	it('should sync number editor when the external value changes', async () => {
		await render(DataGridNumberCellSyncFixture);

		const input = page.getByRole('spinbutton');
		await expect.element(input).toHaveValue(10);

		await input.fill('99');
		await expect.element(input).toHaveValue(99);

		await page.getByRole('button', { name: 'External score' }).click();
		await expect.element(input).toHaveValue(42);
	});

	it('should focus number editor without selecting the value', async () => {
		const selectSpy = vi.spyOn(HTMLInputElement.prototype, 'select');

		try {
			await render(DataGridNumberCellSyncFixture);

			const input = await waitFor(() => document.querySelector<HTMLInputElement>('input[type="number"]'));
			await waitFor(() => document.activeElement === input);

			expect(selectSpy).not.toHaveBeenCalled();
		} finally {
			selectSpy.mockRestore();
		}
	});

	it('should sync short text editor when the external value changes', async () => {
		await render(DataGridShortTextCellSyncFixture);

		const textbox = page.getByRole('textbox');
		await expect.element(textbox).toHaveTextContent('Original name');

		const element = textbox.element() as HTMLElement;
		element.textContent = 'Local name';
		element.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
		await expect.element(textbox).toHaveTextContent('Local name');

		await page.getByRole('button', { name: 'External name' }).click();
		await expect.element(textbox).toHaveTextContent('External name');
	});

	it('should commit short text from the current editable DOM value', async () => {
		await render(DataGridShortTextCellSyncFixture);

		const textbox = page.getByRole('textbox');
		const element = textbox.element() as HTMLElement;
		element.textContent = 'Committed name';
		element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

		await expect.element(page.getByLabelText('saved name')).toHaveTextContent('Committed name');
	});

	it('should sync URL editor when the external value changes', async () => {
		await render(DataGridUrlCellSyncFixture);

		const textbox = page.getByRole('textbox');
		await expect.element(textbox).toHaveTextContent('https://original.example');

		const element = textbox.element() as HTMLElement;
		element.textContent = 'https://local.example';
		element.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true }));
		await expect.element(textbox).toHaveTextContent('https://local.example');

		await page.getByRole('button', { name: 'External URL' }).click();
		await expect.element(textbox).toHaveTextContent('https://external.example');
	});

	it('should commit URL from the current editable DOM value', async () => {
		await render(DataGridUrlCellSyncFixture);

		const textbox = page.getByRole('textbox');
		const element = textbox.element() as HTMLElement;
		element.textContent = 'https://committed.example';
		element.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

		await expect
			.element(page.getByLabelText('saved url'))
			.toHaveTextContent('https://committed.example');
	});

	it('should sync select editor when the external value changes', async () => {
		await render(DataGridSelectCellSyncFixture);

		const trigger = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="select-trigger"]')
		);
		await waitFor(() => trigger.textContent?.includes('Engineering'));

		await page.getByRole('option', { name: 'Marketing' }).click();
		await waitFor(() => trigger.textContent?.includes('Sales'));

		expect(trigger.textContent).toContain('Sales');
	});

	it('should clear file cell errors when the external value changes', async () => {
		await render(DataGridFileCellSyncFixture);

		const input = await waitFor(() => document.querySelector<HTMLInputElement>('input[type="file"]'));
		const dropzone = page.getByRole('region', { name: 'File upload' });
		const dropzoneElement = await waitFor(() =>
			document.querySelector<HTMLElement>('[role="region"][aria-labelledby]')
		);
		const dataTransfer = new DataTransfer();
		dataTransfer.items.add(new File(['too large'], 'large.txt', { type: 'text/plain' }));
		input.files = dataTransfer.files;
		input.dispatchEvent(new Event('change', { bubbles: true }));

		expect(input.getAttribute('aria-labelledby')).toBe(dropzoneElement.getAttribute('aria-labelledby'));
		expect(input.getAttribute('aria-describedby')).toBe(
			dropzoneElement.getAttribute('aria-describedby')
		);

		await waitFor(() => dropzoneElement.hasAttribute('data-invalid'));

		await page.getByRole('button', { name: 'Replace files' }).click();

		await waitFor(() => !dropzoneElement.isConnected || !dropzoneElement.hasAttribute('data-invalid'));
		await expect.element(dropzone).not.toBeInTheDocument();
		await expect.element(page.getByLabelText('file names')).toHaveTextContent('server.txt');
	});

	it('should commit local file selection without an artificial upload delay', async () => {
		await render(DataGridFileCellLocalFixture);

		const input = await waitFor(() => document.querySelector<HTMLInputElement>('input[type="file"]'));
		const dataTransfer = new DataTransfer();
		dataTransfer.items.add(new File(['ok'], 'local.txt', { type: 'text/plain' }));
		input.files = dataTransfer.files;
		input.dispatchEvent(new Event('change', { bubbles: true }));

		const committed = await waitFor(
			() =>
				document.querySelector<HTMLElement>('[aria-label="file count"]')?.textContent === '1' &&
				document.querySelector<HTMLElement>('[aria-label="first file"]')?.textContent === 'local.txt',
			300
		);
		expect(committed).toBe(true);
	});

	it('should revoke local file URLs when the file cell unmounts like the original grid', async () => {
		const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:local-preview');
		const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

		try {
			await render(DataGridFileCellLocalFixture);

			const input = await waitFor(() =>
				document.querySelector<HTMLInputElement>('input[type="file"]')
			);
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(new File(['ok'], 'local.txt', { type: 'text/plain' }));
			input.files = dataTransfer.files;
			input.dispatchEvent(new Event('change', { bubbles: true }));

			await waitFor(() => createObjectURL.mock.calls.length > 0);
			await page.getByRole('button', { name: 'Unmount file cell' }).click();

			const revoked = await waitFor(() =>
				revokeObjectURL.mock.calls.some(([url]) => url === 'blob:local-preview')
			);
			expect(revoked).toBe(true);
		} finally {
			createObjectURL.mockRestore();
			revokeObjectURL.mockRestore();
		}
	});

	it('should sync date editor and display Date values like the original grid', async () => {
		await render(DataGridDateCellSyncFixture);

		const cellContent = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-cell-content"]')
		);
		await waitFor(() => cellContent.textContent?.includes('1/1/2024'));

		const dayTwo = await waitFor(() =>
			Array.from(document.querySelectorAll<HTMLElement>('[data-calendar-day]')).find(
				(element) => element.textContent?.trim() === '2'
			)
		);
		dayTwo.click();
		await waitFor(() => cellContent.textContent?.includes('1/2/2024'));

		await page.getByRole('button', { name: 'External date' }).click();
		await waitFor(() => cellContent.textContent?.includes('1/3/2024'));

		expect(cellContent.textContent).toContain('1/3/2024');
	});

	it('should keep the first typed character when opening long text editor', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		await waitFor(() => document.querySelector('[data-slot="grid-row"][data-index="0"]'));

		const notesCell = await waitFor(() => {
			const row = document.querySelector('[data-slot="grid-row"][data-index="0"]');
			return row?.querySelectorAll<HTMLElement>('[data-slot="grid-cell"]').item(5);
		});
		const wrapper = await waitFor(() =>
			notesCell.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"]')
		);
		const initialText = wrapper.textContent ?? '';

		wrapper.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		wrapper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		wrapper.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		await waitFor(() => wrapper.dataset.focused !== undefined);
		wrapper.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', bubbles: true, cancelable: true }));

		const textarea = await waitFor(() => document.querySelector<HTMLTextAreaElement>('textarea'));
		await waitFor(() => textarea.value === `${initialText}z`);

		expect(textarea.value).toBe(`${initialText}z`);
	});

	it('should select the pasted range after clipboard paste', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		const grid = await waitFor(() => document.querySelector<HTMLElement>('[data-slot="grid"]'));
		await waitFor(() => document.querySelector('[data-slot="grid-row"][data-index="0"]'));

		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: {
				readText: async () => 'Pasted Name\t44'
			}
		});

		const row = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-row"][data-index="0"]')
		);
		const nameCell = row.querySelectorAll<HTMLElement>('[data-slot="grid-cell"]').item(1);
		const ageCell = row.querySelectorAll<HTMLElement>('[data-slot="grid-cell"]').item(2);
		const nameWrapper = await waitFor(() =>
			nameCell.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"]')
		);

		nameWrapper.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		nameWrapper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		nameWrapper.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		grid.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'v', ctrlKey: true, bubbles: true, cancelable: true })
		);

		await waitFor(() => nameWrapper.textContent?.trim() === 'Pasted Name');
		const ageWrapper = await waitFor(() =>
			ageCell.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"][data-selected]')
		);

		expect(ageWrapper.textContent?.trim()).toBe('44');
	});

	it('should await onPaste before applying pasted data', async () => {
		await render(DataGridPasteOrderFixture);

		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: {
				readText: async () => 'Grace'
			}
		});

		const nameWrapper = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"]')
		);

		nameWrapper.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		nameWrapper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		nameWrapper.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		await page.getByRole('button', { name: 'Paste from clipboard' }).click();

		await expect.element(page.getByLabelText('first name')).toHaveTextContent('Grace');
		await expect
			.element(page.getByLabelText('paste events'))
			.toHaveTextContent('paste-start,paste-end,change');
	});

	it('should close and reset the paste expansion dialog when cancelled', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		const grid = await waitFor(() => document.querySelector<HTMLElement>('[data-slot="grid"]'));
		await waitFor(() => document.querySelector('[data-slot="grid-row"][data-index="0"]'));

		const oversizedPaste = Array.from({ length: 205 }, (_, index) => `Person ${index}`).join('\n');
		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: {
				readText: async () => oversizedPaste
			}
		});

		const row = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-row"][data-index="0"]')
		);
		const nameCell = row.querySelectorAll<HTMLElement>('[data-slot="grid-cell"]').item(1);
		const nameWrapper = await waitFor(() =>
			nameCell.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"]')
		);

		nameWrapper.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		nameWrapper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		nameWrapper.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		grid.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'v', ctrlKey: true, bubbles: true, cancelable: true })
		);

		const dialog = await waitFor(() => document.querySelector<HTMLElement>('[role="dialog"]'));
		expect(dialog.textContent).toContain('5');

		await page.getByRole('button', { name: 'Cancel' }).click();
		await waitFor(() => document.querySelector<HTMLElement>('[role="dialog"]') === null);
	});

	it('should continue paste expansion through onCellsPaste', async () => {
		await render(DataGridPasteDialogFixture);

		await page.getByRole('button', { name: 'Continue' }).click();

		await expect.element(page.getByLabelText('paste mode')).toHaveTextContent('expand');
	});

	it('should not render the paste expansion dialog while closed like the original grid', async () => {
		await render(DataGridPasteDialogClosedFixture);

		expect(document.querySelector('[role="dialog"]')).toBeNull();
		expect(document.querySelector('[data-grid-popover]')).toBeNull();
	});

	it('should ignore paste when no cell is focused', async () => {
		await render(DataGridPasteWithoutFocusFixture);

		Object.defineProperty(navigator, 'clipboard', {
			value: {
				readText: async () => 'Grace'
			},
			configurable: true
		});

		await page.getByRole('button', { name: 'Paste without focus' }).click();

		await expect.element(page.getByLabelText('first name')).toHaveTextContent('Ada');
	});

	it('should report clipboard paste failures like the original grid', async () => {
		toast.dismiss();
		await render(DataGridPasteOrderFixture);

		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: {
				readText: async () => {
					throw new Error('Clipboard denied');
				}
			}
		});

		const nameWrapper = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"]')
		);
		nameWrapper.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		nameWrapper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		nameWrapper.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		await page.getByRole('button', { name: 'Paste from clipboard' }).click();

		const errorToast = await waitFor(() =>
			toast
				.getActiveToasts()
				.find((activeToast) => activeToast.type === 'error' && activeToast.title === 'Clipboard denied')
		);
		expect(errorToast).toBeTruthy();
		toast.dismiss(errorToast.id);
	});

	it('should not intercept clipboard paste when paste is disabled', async () => {
		await render(DataGridPasteDisabledFixture);

		let readCount = 0;
		Object.defineProperty(navigator, 'clipboard', {
			value: {
				readText: async () => {
					readCount++;
					return 'Grace';
				}
			},
			configurable: true
		});

		const grid = await waitFor(() => document.querySelector<HTMLElement>('[data-slot="grid"]'));
		const firstCell = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"]')
		);

		firstCell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		firstCell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		firstCell.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
		await waitFor(() => firstCell.dataset.focused !== undefined);

		const pasteEvent = new KeyboardEvent('keydown', {
			key: 'v',
			ctrlKey: true,
			bubbles: true,
			cancelable: true
		});
		grid.dispatchEvent(pasteEvent);

		expect(pasteEvent.defaultPrevented).toBe(false);
		expect(readCount).toBe(0);
		await expect.element(page.getByLabelText('first name')).toHaveTextContent('Ada');
	});

	it('should keep search disabled and allow direct meta paste by default like the original grid', async () => {
		await render(DataGridDefaultFeaturesFixture);

		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: {
				readText: async () => 'Grace'
			}
		});

		const grid = await waitFor(() => document.querySelector<HTMLElement>('[data-slot="grid"]'));
		const nameWrapper = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"]')
		);

		nameWrapper.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		nameWrapper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		nameWrapper.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		grid.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true, cancelable: true })
		);
		await page.getByRole('button', { name: 'Paste from clipboard' }).click();

		await expect.element(page.getByLabelText('search enabled')).toHaveTextContent('no');
		await expect.element(page.getByLabelText('read only default')).toHaveTextContent('undefined');
		await expect.element(page.getByLabelText('first name')).toHaveTextContent('Grace');
		expect(document.querySelector('[data-slot="grid-search"]')).toBeNull();
	});

	it('should ignore grid shortcuts when no cell is focused', async () => {
		await render(DataGridShortcutsWithoutFocusFixture);

		await page.getByRole('button', { name: 'Dispatch select all' }).click();

		await expect.element(page.getByLabelText('selected cells')).toHaveTextContent('0');
	});

	it('should keep selected cell styling while focused like the original grid', async () => {
		await render(DataGridCtrlShiftEdgeFixture);

		const grid = await waitFor(() => document.querySelector<HTMLElement>('[data-slot="grid"]'));
		const row = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-row"][data-index="0"]')
		);
		const focusedCell = await waitFor(() =>
			row.querySelectorAll<HTMLElement>('[data-slot="grid-cell-wrapper"]').item(2)
		);

		focusedCell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		focusedCell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		focusedCell.click();

		await waitFor(() => focusedCell.hasAttribute('data-focused'));

		grid.dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'ArrowLeft',
				ctrlKey: true,
				shiftKey: true,
				bubbles: true,
				cancelable: true
			})
		);

		await expect.element(page.getByLabelText('selected cells')).toHaveTextContent('3');
		expect(focusedCell.hasAttribute('data-selected')).toBe(true);
		expect(focusedCell.className).toContain('bg-primary/10');
	});

	it('should keep selected cell state while editing like the original grid', async () => {
		await render(DataGridCtrlShiftEdgeFixture);

		const grid = await waitFor(() => document.querySelector<HTMLElement>('[data-slot="grid"]'));
		const row = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-row"][data-index="0"]')
		);
		const focusedCell = await waitFor(() =>
			row.querySelectorAll<HTMLElement>('[data-slot="grid-cell-wrapper"]').item(2)
		);

		focusedCell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		focusedCell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		focusedCell.click();
		await waitFor(() => focusedCell.hasAttribute('data-focused'));

		grid.dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'ArrowLeft',
				ctrlKey: true,
				shiftKey: true,
				bubbles: true,
				cancelable: true
			})
		);

		await expect.element(page.getByLabelText('selected cells')).toHaveTextContent('3');
		expect(focusedCell.hasAttribute('data-selected')).toBe(true);
		expect(focusedCell.className).toContain('bg-primary/10');

		focusedCell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));
		await waitFor(() => focusedCell.hasAttribute('data-editing'));
		await waitFor(() => focusedCell.querySelector<HTMLElement>('[contenteditable="true"]'));

		expect(focusedCell.hasAttribute('data-selected')).toBe(true);
		expect(focusedCell.className).not.toContain('bg-primary/10');
	});

	it('should clear selection before blurring the focused cell on Escape', async () => {
		await render(DataGridCtrlShiftEdgeFixture);

		const grid = await waitFor(() => document.querySelector<HTMLElement>('[data-slot="grid"]'));
		const row = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-row"][data-index="0"]')
		);
		const focusedCell = await waitFor(() =>
			row.querySelectorAll<HTMLElement>('[data-slot="grid-cell-wrapper"]').item(2)
		);

		focusedCell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		focusedCell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		focusedCell.click();
		await waitFor(() => focusedCell.hasAttribute('data-focused'));

		grid.dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'ArrowLeft',
				ctrlKey: true,
				shiftKey: true,
				bubbles: true,
				cancelable: true
			})
		);

		await expect.element(page.getByLabelText('selected cells')).toHaveTextContent('3');

		grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));

		await expect.element(page.getByLabelText('selected cells')).toHaveTextContent('0');
		expect(focusedCell.hasAttribute('data-focused')).toBe(true);

		grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));

		await waitFor(() => !focusedCell.hasAttribute('data-focused'));
	});

	it('should not run grid select-all while a cell editor is active', async () => {
		await render(DataGridCtrlShiftEdgeFixture);

		const row = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-row"][data-index="0"]')
		);
		const firstCell = await waitFor(() =>
			row.querySelectorAll<HTMLElement>('[data-slot="grid-cell-wrapper"]').item(0)
		);

		firstCell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		firstCell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		firstCell.click();
		await waitFor(() => firstCell.hasAttribute('data-focused'));
		firstCell.dispatchEvent(new MouseEvent('dblclick', { bubbles: true, cancelable: true }));

		const editor = await waitFor(() => firstCell.querySelector<HTMLElement>('[contenteditable="true"]'));
		editor.dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'a',
				ctrlKey: true,
				bubbles: true,
				cancelable: true
			})
		);

		await expect.element(page.getByLabelText('selected cells')).toHaveTextContent('0');
	});

	it('should clear row selection after adding a row like the original grid', async () => {
		await render(DataGridRowAddSelectionFixture);

		await page.getByLabelText('Select row').click();
		await expect.element(page.getByLabelText('selected rows')).toHaveTextContent('1');

		await page.getByRole('button', { name: 'Add row' }).click();

		await expect.element(page.getByLabelText('row count')).toHaveTextContent('2');
		await expect.element(page.getByLabelText('selected rows')).toHaveTextContent('0');
	});

	it('should not log or add rows when row add fails like the original grid', async () => {
		const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

		try {
			await render(DataGridRowAddSelectionFixture);

			await page.getByLabelText('Select row').click();
			await expect.element(page.getByLabelText('selected rows')).toHaveTextContent('1');

			await page.getByRole('button', { name: 'Fail row add' }).click();

			await expect.element(page.getByLabelText('row count')).toHaveTextContent('1');
			expect(consoleError).not.toHaveBeenCalled();
		} finally {
			consoleError.mockRestore();
		}
	});

	it('should extend selection to the row edge with Ctrl+Shift+ArrowLeft', async () => {
		await render(DataGridCtrlShiftEdgeFixture);

		const grid = await waitFor(() => document.querySelector<HTMLElement>('[data-slot="grid"]'));
		const row = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-row"][data-index="0"]')
		);
		const lastCell = await waitFor(() =>
			row.querySelectorAll<HTMLElement>('[data-slot="grid-cell-wrapper"]').item(2)
		);

		lastCell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		lastCell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		lastCell.click();
		await waitFor(() => lastCell.hasAttribute('data-focused'));

		grid.dispatchEvent(
			new KeyboardEvent('keydown', {
				key: 'ArrowLeft',
				ctrlKey: true,
				shiftKey: true,
				bubbles: true,
				cancelable: true
			})
		);

		await expect.element(page.getByLabelText('selected cells')).toHaveTextContent('3');
	});

	it('should paste only fitting rows from the paste expansion dialog', async () => {
		await render(DataGridPasteFitExistingFixture);

		Object.defineProperty(navigator, 'clipboard', {
			value: {
				readText: async () => 'Grace\nLinus'
			},
			configurable: true
		});

		const firstCell = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"]')
		);
		firstCell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		firstCell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		firstCell.click();
		await waitFor(() => firstCell.hasAttribute('data-focused'));

		await page.getByRole('button', { name: 'Paste from clipboard' }).click();
		await expect.element(page.getByRole('heading', { name: 'Do you want to add more rows?' })).toBeInTheDocument();

		const keepCurrentRows = await waitFor(() =>
			Array.from(document.querySelectorAll<HTMLInputElement>('input[name="expand-option"]')).find(
				(input) => input.value === 'no-expand'
			)
		);
		keepCurrentRows.click();
		await page.getByRole('button', { name: 'Continue' }).click();

		await waitFor(() => document.querySelector('[data-slot="dialog-content"]') === null);
		await expect.element(page.getByLabelText('row count')).toHaveTextContent('1');
		await expect.element(page.getByLabelText('first name')).toHaveTextContent('Grace');
	});

	it('should wait for delayed rows before pasting expanded clipboard data', async () => {
		await render(DataGridPasteDelayedRowsFixture);

		Object.defineProperty(navigator, 'clipboard', {
			value: {
				readText: async () => 'Grace\nLinus'
			},
			configurable: true
		});

		const firstCell = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"]')
		);
		firstCell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		firstCell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		firstCell.click();
		await waitFor(() => firstCell.hasAttribute('data-focused'));

		await page.getByRole('button', { name: 'Paste from clipboard' }).click();
		await expect
			.element(page.getByRole('heading', { name: 'Do you want to add more rows?' }))
			.toBeInTheDocument();

		await page.getByRole('button', { name: 'Continue' }).click();

		await expect.element(page.getByLabelText('row count')).toHaveTextContent('2');
		await expect.element(page.getByLabelText('first name')).toHaveTextContent('Grace');
		await expect.element(page.getByLabelText('second name')).toHaveTextContent('Linus');
	});

	it('should clear selected cells when clicking outside the grid', async () => {
		await render(DataGridOutsideSelectionFixture);

		Object.defineProperty(navigator, 'clipboard', {
			configurable: true,
			value: {
				readText: async () => 'Grace\t44'
			}
		});

		const grid = await waitFor(() => document.querySelector<HTMLElement>('[data-slot="grid"]'));
		const firstCell = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"]')
		);

		firstCell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		firstCell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		firstCell.click();
		await waitFor(() => firstCell.hasAttribute('data-focused'));

		await page.getByRole('button', { name: 'Paste from clipboard' }).click();
		await expect.element(page.getByLabelText('selected cells')).toHaveTextContent('2');
		await expect.element(page.getByLabelText('first name')).toHaveTextContent('Grace');
		await expect.element(page.getByLabelText('first age')).toHaveTextContent('44');

		expect(document.activeElement === grid || grid.contains(document.activeElement)).toBe(true);
		const outsideTarget = await waitFor(() =>
			Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(
				(button) => button.textContent?.trim() === 'Outside target'
			)
		);
		const outsideTargetRect = outsideTarget.getBoundingClientRect();
		outsideTarget.dispatchEvent(
			new MouseEvent('mousedown', {
				bubbles: true,
				cancelable: true,
				button: 0,
				clientX: outsideTargetRect.left + outsideTargetRect.width / 2,
				clientY: outsideTargetRect.top + outsideTargetRect.height / 2
			})
		);

		await expect.element(page.getByLabelText('selected cells')).toHaveTextContent('0');
	});

	it('should restore focused cell when focus leaves without an outside click like the original grid', async () => {
		await render(DataGridFocusoutFixture);

		const firstCell = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"]')
		);
		const outsideTarget = page.getByRole('button', { name: 'Outside focus target' });

		firstCell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		firstCell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		firstCell.click();
		await waitFor(() => firstCell.hasAttribute('data-focused'));
		firstCell.focus();
		await waitFor(() => document.activeElement === firstCell);
		await new Promise((resolve) => setTimeout(resolve, 350));

		await outsideTarget.element().focus();
		await waitFor(() => document.activeElement === firstCell);
		expect(firstCell.hasAttribute('data-focused')).toBe(true);
	});

	it('should render custom data grid cell renderers directly', async () => {
		await render(DataGridCustomCellFixture);

		const cell = await waitFor(() => document.querySelector<HTMLElement>('[data-slot="grid-cell"]'));

		expect(cell.textContent?.trim()).toBe('Custom Ada');
		expect(cell.querySelector('[data-slot="grid-cell-wrapper"]')).toBeNull();
	});

	it('should disable the data grid row height menu', async () => {
		await render(DataGridRowHeightMenuFixture);

		const trigger = await waitFor(() =>
			document.querySelector<HTMLButtonElement>('[data-slot="select-trigger"]')
		);

		expect(trigger.disabled).toBe(true);
	});

	it('should apply row height menu class to select content', async () => {
		await render(DataGridRowHeightMenuClassFixture);

		const trigger = await waitFor(() =>
			document.querySelector<HTMLButtonElement>('[data-slot="select-trigger"]')
		);
		trigger.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true }));
		trigger.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, cancelable: true }));
		trigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		const content = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="select-content"]')
		);

		expect(trigger.className).not.toContain('row-height-content-fixture');
		expect(content.className).toContain('row-height-content-fixture');
	});

	it('should render hide column as a plain menu item', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		await page.getByRole('button', { name: 'Name', exact: true }).click();

		const hideItem = await waitFor(() =>
			Array.from(
				document.querySelectorAll<HTMLElement>(
					'[data-slot="dropdown-menu-item"], [data-slot="dropdown-menu-checkbox-item"]'
				)
			).find((element) => element.textContent?.includes('Hide column'))
		);

		expect(hideItem.dataset.slot).toBe('dropdown-menu-item');
		expect(hideItem.dataset.slot).not.toBe('dropdown-menu-checkbox-item');

		const icon = hideItem.querySelector('svg');
		expect(icon?.getAttribute('class')).not.toContain('me-2');
	});

	it('should preserve column selection after pinning like the original grid', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		await waitFor(() => document.querySelector('[data-slot="grid-row"][data-index="0"]'));
		await page.getByRole('button', { name: 'Name', exact: true }).click();

		const selection = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="action-bar-selection"]')
		);
		expect(selection.textContent).toContain('200 cells selected');

		const pinItem = await waitFor(() =>
			Array.from(document.querySelectorAll<HTMLElement>('[data-slot="dropdown-menu-item"]')).find(
				(element) => element.textContent?.includes('Pin to left')
			)
		);
		pinItem.click();

		const persistedSelection = await waitFor(() => {
			const currentSelection = document.querySelector<HTMLElement>(
				'[data-slot="action-bar-selection"]'
			);
			return currentSelection?.textContent?.includes('200 cells selected')
				? currentSelection
				: null;
		});
		expect(persistedSelection).toBeTruthy();
	});

	it('should open column header menus as non-modal like the original grid', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		await waitFor(() => document.querySelector('[data-slot="grid-row"][data-index="0"]'));
		await page.getByRole('button', { name: 'Name', exact: true }).click();

		await waitFor(() => document.querySelector('[data-slot="dropdown-menu-content"]'));

		expect(getComputedStyle(document.body).pointerEvents).not.toBe('none');
		expect(document.querySelector('[data-slot="grid"]')?.hasAttribute('inert')).toBe(false);
	});

	it('should keep column header trigger visuals minimal like the original grid', () => {
		expect(dataGridColumnHeaderSource).not.toContain('aria-label="Filtered"');
		expect(dataGridColumnHeaderSource).not.toContain("from '@lucide/svelte/icons/arrow-up'");
		expect(dataGridColumnHeaderSource).not.toContain("from '@lucide/svelte/icons/arrow-down'");
	});

	it('should keep input styling aligned with the original ui input', () => {
		expect(inputSource).toContain('data-slot="input"');
		expect(inputSource).toContain('min-w-0');
		expect(inputSource).toContain('shadow-xs');
		expect(inputSource).toContain('selection:bg-primary');
		expect(inputSource).toContain('focus-visible:ring-[3px]');
		expect(inputSource).toContain('aria-invalid:border-destructive');
	});

	it('should keep separator slot naming aligned with the original ui separator', () => {
		expect(separatorSource).toContain('"data-slot": dataSlot = "separator-root"');
	});

	it('should keep checkbox slots and state styling aligned with the original ui checkbox', () => {
		expect(checkboxSource).toContain('data-slot="checkbox"');
		expect(checkboxSource).toContain('data-slot="checkbox-indicator"');
		expect(checkboxSource).toContain('aria-invalid:border-destructive');
		expect(checkboxSource).toContain('dark:bg-input/30');
		expect(checkboxSource).toContain('dark:data-[state=checked]:bg-primary');
	});

	it('should keep dialog close marker and state styling aligned with the original ui dialog', () => {
		expect(dialogContentSource).toContain('data-slot="dialog-close"');
		expect(dialogContentSource).toContain('data-[state=open]:bg-accent');
		expect(dialogContentSource).toContain('data-[state=open]:text-muted-foreground');
	});

	it('should keep button shadows aligned with the original ui button', () => {
		expect(buttonSource).toContain('default: "bg-primary text-primary-foreground hover:bg-primary/90"');
		expect(buttonSource).toContain('"bg-destructive hover:bg-destructive/90');
		expect(buttonSource).toContain('secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80"');
		expect(buttonSource).toContain('"bg-background shadow-xs hover:bg-accent');
	});

	it('should keep dropdown menu label weight aligned with the original ui menu', () => {
		expect(dropdownMenuLabelSource).toContain('font-medium');
		expect(dropdownMenuLabelSource).not.toContain('font-semibold');
		expect(dropdownMenuGroupHeadingSource).toContain('font-medium');
		expect(dropdownMenuGroupHeadingSource).not.toContain('font-semibold');
	});

	it('should keep command input padding aligned with the original ui command', () => {
		expect(commandInputSource).toContain('border-b px-3');
		expect(commandInputSource).not.toContain('pe-8 ps-3');
	});

	it('should keep table checkbox alignment aligned with the original ui table', () => {
		expect(tableHeadSource).toContain('[&>[role=checkbox]]:translate-y-[2px]');
		expect(tableCellSource).toContain('[&>[role=checkbox]]:translate-y-[2px]');
	});

	it('should keep slider thumb background aligned with the original ui slider', () => {
		expect(sliderSource).toContain('bg-background');
		expect(sliderSource).not.toContain('bg-white');
	});

	it('should keep tooltip provider delay aligned with the original ui tooltip', () => {
		expect(tooltipProviderSource).toContain('delayDuration = 0');
	});

	it('should keep data table view option class passthrough aligned with the original table', () => {
		expect(dataTableViewOptionsSource).toContain("class=\"ml-auto hidden h-8 font-normal lg:flex\"");
		expect(dataTableViewOptionsSource).toContain("class={cn('w-44 p-0', className)}");
		expect(dataTableViewOptionsSource).not.toContain(
			"class={cn('ml-auto hidden h-8 font-normal lg:flex', className)}"
		);
	});

	it('should keep data table faceted clear control aligned with the original table', () => {
		expect(dataTableFacetedFilterSource).toContain('role="button"');
		expect(dataTableFacetedFilterSource).toContain('tabindex={0}');
		expect(dataTableFacetedFilterSource).not.toContain('type="button"');
	});

	it('should keep data table filter chip segment borders aligned with the original table', () => {
		expect(dataTableFilterMenuSource).toContain('rounded-l-md border border-r-0');
		expect(dataTableFilterMenuSource).toContain('rounded-none border-r-0 px-2.5 lowercase');
		expect(dataTableFilterMenuSource).toContain(
			'rounded-none bg-transparent px-1.5 py-0.5 [&_svg]:hidden'
		);
		expect(dataTableFilterMenuSource).not.toContain(
			'rounded-none border-l-0 px-2.5 lowercase'
		);
		expect(dataTableFilterMenuSource).not.toContain(
			'h-8 rounded-none border-l-0 px-2.5 data-size:h-8 [&_svg]:hidden'
		);
	});

	it('should keep data table filter list value column bounded like the original table', () => {
		expect(dataTableFilterListSource).toContain('min-w-36 max-w-60 flex-1');
		expect(dataTableFilterListSource).not.toContain(
			"variant === 'range' ? 'min-w-52' : 'min-w-36'"
		);
	});

	it('should keep data table slider filter popover sizing aligned with the original table', () => {
		expect(dataTableSliderFilterSource).toContain('flex w-auto flex-col gap-4');
		expect(dataTableSliderFilterSource).toContain('flex items-center gap-4');
		expect(dataTableSliderFilterSource).not.toContain('min-w-72');
		expect(dataTableSliderFilterSource).not.toContain('flex items-center gap-3');
	});

	it('should keep data table range filters in the original two-input shape by default', () => {
		expect(dataTableRangeFilterSource).toContain('showSlider = false');
		expect(dataTableRangeFilterSource).toContain('sr-only shrink-0 text-muted-foreground');
		expect(dataTableRangeFilterSource).not.toContain('showSlider = true');
		expect(dataTableRangeFilterSource).not.toContain(
			'shrink-0 text-muted-foreground text-xs">to'
		);
	});

	it('should keep data table sort field options plain like the original table', () => {
		expect(dataTableSortListSource).not.toContain("from '@lucide/svelte/icons/check'");
		expect(dataTableSortListSource).not.toContain("column.id === sort.id ? 'opacity-100'");
	});

	it('should rove action bar focus with arrow keys like the original grid', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		await waitFor(() => document.querySelector('[data-slot="grid-row"][data-index="0"]'));
		await page.getByRole('button', { name: 'Name', exact: true }).click();

		const group = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="action-bar-group"]')
		);

		group.focus();

		const items = await waitFor(() => {
			const currentItems = Array.from(
				document.querySelectorAll<HTMLElement>('[data-action-bar-item]')
			);
			return currentItems.length >= 3 ? currentItems : null;
		});

		await waitFor(() => document.activeElement === items[0]);
		expect(document.activeElement?.textContent).toContain('Status');

		const rightEvent = new KeyboardEvent('keydown', {
			key: 'ArrowRight',
			bubbles: true,
			cancelable: true
		});
		document.activeElement?.dispatchEvent(rightEvent);
		expect(rightEvent.defaultPrevented).toBe(true);

		await waitFor(() => document.activeElement === items[1]);
		expect(document.activeElement?.textContent).toContain('Department');

		document.activeElement?.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true })
		);
		await waitFor(() => document.activeElement === items[2]);
		expect(document.activeElement?.textContent).toContain('Delete');

		document.activeElement?.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
		);
		await waitFor(() => document.activeElement === items[0]);
	});

	it('should stop action bar arrow focus at the edge when loop is false like the original component', async () => {
		await render(ActionBarLoopFixture);

		const group = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="action-bar-group"]')
		);
		const items = await waitFor(() => {
			const currentItems = Array.from(
				document.querySelectorAll<HTMLElement>('[data-action-bar-item]')
			);
			return currentItems.length === 2 ? currentItems : null;
		});

		group.focus();
		await waitFor(() => document.activeElement === items[0]);

		document.activeElement?.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true })
		);
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(document.activeElement).toBe(items[0]);

		document.activeElement?.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true })
		);
		await waitFor(() => document.activeElement === items[1]);

		document.activeElement?.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
		);
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(document.activeElement).toBe(items[1]);
	});

	it('should remove the action bar group tab stop while shift-tabbing out like the original component', async () => {
		await render(ActionBarLoopFixture);

		const group = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="action-bar-group"]')
		);
		const firstItem = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-action-bar-item]')
		);

		group.focus();
		await waitFor(() => document.activeElement === firstItem);

		firstItem.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true })
		);

		await waitFor(() => group.tabIndex === -1);
		expect(group.tabIndex).toBe(-1);

		firstItem.blur();
		await waitFor(() => group.tabIndex === 0);
		expect(group.tabIndex).toBe(0);
	});

	it('should render context delete rows as destructive menu item', async () => {
		await render(DataGridContextMenuFixture);

		const deleteRowsItem = await waitFor(() =>
			Array.from(document.querySelectorAll<HTMLElement>('[data-slot="dropdown-menu-item"]')).find(
				(element) => element.textContent?.includes('Delete rows')
			)
		);

		expect(deleteRowsItem.dataset.variant).toBe('destructive');
		expect(deleteRowsItem.className).toContain('data-[variant=destructive]:text-destructive');

		const icon = deleteRowsItem.querySelector('svg');
		expect(icon?.getAttribute('class')).not.toContain('mr-2');
	});

	it('should not render context menu trigger when closed', async () => {
		await render(DataGridContextMenuFixture, { open: false });

		expect(document.querySelector('[data-slot="dropdown-menu-trigger"]')).toBeNull();
		expect(document.querySelector('[data-slot="dropdown-menu-content"]')).toBeNull();
	});

	it('should stop cell context menu events after selecting the target cell', async () => {
		await render(DataGridContextMenuSelectionFixture);

		await page.getByRole('button', { name: 'Open first cell context menu' }).click();

		await expect.element(page.getByLabelText('context menu prevented')).toHaveTextContent('yes');
		await expect.element(page.getByLabelText('context menu stopped')).toHaveTextContent('yes');
		await expect.element(page.getByLabelText('context menu open')).toHaveTextContent('open');
		await expect.element(page.getByLabelText('selected cells')).toHaveTextContent('1');
		await expect.element(page.getByLabelText('focused cell')).toHaveTextContent('0:name');
	});

	it('should ignore right-click cell clicks like the original grid', async () => {
		await render(DataGridContextMenuSelectionFixture);

		await page.getByRole('button', { name: 'Right click first cell via meta' }).click();

		await expect.element(page.getByLabelText('cell click prevented')).toHaveTextContent('no');
		await expect.element(page.getByLabelText('selected cells')).toHaveTextContent('0');
		await expect.element(page.getByLabelText('focused cell')).toHaveTextContent('none');
	});

	it('should disable the data grid view menu', async () => {
		await render(DataGridViewMenuFixture);

		const trigger = await waitFor(() => page.getByRole('combobox', { name: 'Toggle columns' }));

		await expect.element(trigger).toBeDisabled();
	});

	it('should search data grid view menu columns by visible label', async () => {
		await render(DataGridViewMenuSearchFixture);

		await page.getByRole('combobox', { name: 'Toggle columns' }).click();
		await page.getByPlaceholder('Search columns...').fill('Full Name');

		await expect.element(page.getByRole('option', { name: /Full Name/ })).toBeVisible();
		await expect.element(page.getByRole('option', { name: /Team/ })).not.toBeInTheDocument();
	});

	it('should disable the data grid filter and sort menus', async () => {
		await render(DataGridMenuFixture);

		await expect.element(page.getByRole('button', { name: 'Filter' })).toBeDisabled();
		await expect.element(page.getByRole('button', { name: 'Sort' })).toBeDisabled();
	});

	it('should remove sort item with delete shortcut', async () => {
		await render(DataGridSortMenuFixture);

		await page.getByRole('button', { name: 'Sort 1' }).click();

		const sortItem = await waitFor(() => document.querySelector<HTMLElement>('[role="listitem"]'));
		sortItem.focus();
		sortItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));

		await waitFor(() => document.querySelector('[role="listitem"]') === null);
		await expect.element(page.getByRole('heading', { name: 'No sorting applied' })).toBeInTheDocument();
	});

	it('should keep sort item when delete is pressed with the direction selector open', async () => {
		await render(DataGridSortMenuFixture);

		await page.getByRole('button', { name: 'Sort 1' }).click();

		const sortItem = await waitFor(() => document.querySelector<HTMLElement>('[role="listitem"]'));
		const trigger = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="select-trigger"]')
		);
		trigger.focus();
		trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		await waitFor(() => document.querySelector<HTMLElement>('[data-slot="select-content"]'));

		sortItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));

		await waitFor(() => document.querySelectorAll('[role="listitem"]').length === 1);
		await expect.element(page.getByRole('heading', { name: 'Sort by' })).toBeInTheDocument();
	});

	it('should wire sort item controls like the original menu', async () => {
		await render(DataGridSortMenuFixture);

		await page.getByRole('button', { name: 'Sort 1' }).click();

		const content = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="popover-content"]')
		);
		const labelId = content.getAttribute('aria-labelledby');
		const descriptionId = content.getAttribute('aria-describedby');

		expect(labelId).toBeTruthy();
		expect(descriptionId).toBeTruthy();
		expect(document.getElementById(labelId!)?.textContent).toContain('Sort by');
		expect(document.getElementById(descriptionId!)?.textContent).toContain(
			'Modify sorting to organize your rows.'
		);

		const sortItem = await waitFor(() => document.querySelector<HTMLElement>('[role="listitem"]'));
		const fieldTrigger = await waitFor(() => page.getByRole('button', { name: 'Name' }).element());
		const directionTrigger = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="select-trigger"]')
		);
		const deleteTrigger = await waitFor(() => {
			const buttons = sortItem.querySelectorAll<HTMLButtonElement>('button');
			return buttons.item(2);
		});
		const fieldListboxId = fieldTrigger.getAttribute('aria-controls');
		const directionListboxId = directionTrigger.getAttribute('aria-controls');

		expect(sortItem.id).toBeTruthy();
		expect(fieldTrigger.id).toBeTruthy();
		expect(fieldListboxId).toBe(`${sortItem.id}-field-listbox`);
		expect(directionListboxId).toBe(`${sortItem.id}-direction-listbox`);
		expect(deleteTrigger.getAttribute('aria-controls')).toBe(sortItem.id);

		expect(dataGridSortMenuSource).toContain('aria-labelledby={labelId}');
		expect(dataGridSortMenuSource).toContain('aria-describedby={descriptionId}');
		expect(dataGridSortMenuSource).toContain('aria-controls={fieldListboxId}');
		expect(dataGridSortMenuSource).toContain('aria-controls={directionListboxId}');
		expect(dataGridSortMenuSource).toContain('aria-controls={sortItemId}');
	});

	it('should remove filter item with delete shortcut', async () => {
		await render(DataGridFilterMenuFixture);

		await page.getByRole('button', { name: 'Filter 1' }).click();

		const filterItem = await waitFor(() => document.querySelector<HTMLElement>('[role="listitem"]'));
		filterItem.focus();
		filterItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));

		await waitFor(() => document.querySelector('[role="listitem"]') === null);
		await expect.element(page.getByRole('heading', { name: 'No filters applied' })).toBeInTheDocument();
	});

	it('should align filter item controls like the original menu', async () => {
		await render(DataGridFilterMenuFixture);

		await page.getByRole('button', { name: 'Filter 1' }).click();

		const content = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="popover-content"]')
		);
		const labelId = content.getAttribute('aria-labelledby');
		const descriptionId = content.getAttribute('aria-describedby');
		const filterItem = await waitFor(() => document.querySelector<HTMLElement>('[role="listitem"]'));
		const valueInput = await waitFor(() =>
			filterItem.querySelector<HTMLInputElement>('input[placeholder="Value"]')
		);
		const fieldTrigger = await waitFor(() => page.getByRole('button', { name: 'Name' }).element());
		const operatorTrigger = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="select-trigger"]')
		);
		const deleteTrigger = await waitFor(() => {
			const buttons = filterItem.querySelectorAll<HTMLButtonElement>('button');
			return buttons.item(2);
		});
		const fieldListboxId = fieldTrigger.getAttribute('aria-controls');
		const operatorListboxId = operatorTrigger.getAttribute('aria-controls');

		expect(labelId).toBeTruthy();
		expect(descriptionId).toBeTruthy();
		expect(document.getElementById(labelId!)?.textContent).toContain('Filter by');
		expect(document.getElementById(descriptionId!)?.textContent).toContain(
			'Modify filters to narrow down your data.'
		);
		expect(filterItem.id).toBeTruthy();
		expect(fieldTrigger.id).toBeTruthy();
		expect(valueInput.id).toBe(`${filterItem.id}-input`);
		expect(fieldListboxId).toBe(`${filterItem.id}-field-listbox`);
		expect(operatorListboxId).toBe(`${filterItem.id}-operator-listbox`);
		expect(deleteTrigger.getAttribute('aria-controls')).toBe(filterItem.id);
		expect(valueInput.parentElement?.className).toContain('max-w-60');

		expect(dataGridFilterMenuSource).toContain('aria-labelledby={labelId}');
		expect(dataGridFilterMenuSource).toContain('aria-describedby={descriptionId}');
		expect(dataGridFilterMenuSource).toContain('aria-controls={fieldListboxId}');
		expect(dataGridFilterMenuSource).toContain('aria-controls={operatorListboxId}');
		expect(dataGridFilterMenuSource).toContain('aria-controls={valueListboxId}');
		expect(dataGridFilterMenuSource).toContain('id={valueInputId}');
		expect(dataGridFilterMenuSource).toContain('id={valueListboxId}');
		expect(dataGridFilterMenuSource).toContain('aria-controls={filterItemId}');
		expect(dataGridFilterMenuSource).toContain('const FILTER_DEBOUNCE_MS = 300');
		expect(dataGridFilterMenuSource).toContain('FILTER_DEBOUNCE_MS');
		expect(dataGridFilterMenuSource).not.toContain(',\n\t\t250\n\t)');
		expect(dataGridFilterMenuSource).toContain('ms-auto');
		expect(dataGridFilterMenuSource).not.toContain('ml-auto');
		expect(dataGridFilterMenuSource).toContain('{#if option.count}');
		expect(dataGridFilterMenuSource).not.toContain('option.count !== undefined');
		expect(dataGridFilterMenuSource).toContain('setFieldSelectorOpen(filter.id, false)');
		expect(dataGridFilterMenuSource).toContain('selectedOptionsWithIcons');
		expect(dataGridFilterMenuSource).toContain('selectedOption.icon');
		expect(dataGridFilterMenuSource).not.toContain('Select values');
		expect(dataGridFilterMenuSource).not.toContain('Select value');
		expect(dataGridFilterMenuSource).toContain('Pick a date');
		expect(dataGridFilterMenuSource).not.toContain('Select date');
		expect(dataGridFilterMenuSource).toContain('formatDate(calendarDateToISO(calendarValue)');
		expect(dataGridFilterMenuSource).toContain('DataGridRangeCalendar');
		expect(dataGridFilterMenuSource).toContain('Pick a range');
		expect(dataGridFilterMenuSource).toContain('captionLayout="dropdown"');
	});

	it('should use the original date placeholder for date filters', async () => {
		await render(DataGridFilterDatePlaceholderFixture);

		await page.getByRole('button', { name: 'Filter 1' }).click();

		const filterItem = await waitFor(() => document.querySelector<HTMLElement>('[role="listitem"]'));
		await expect
			.element(page.getByRole('button', { name: 'Pick a date', exact: true }))
			.toBeInTheDocument();
		const dateTrigger = await waitFor(() =>
			page.getByRole('button', { name: 'Pick a date', exact: true }).element()
		);
		const listboxId = dateTrigger.getAttribute('aria-controls');

		expect(dateTrigger.id).toBe(`${filterItem.id}-input`);
		expect(listboxId).toBe(`${filterItem.id}-input-listbox`);
		expect(filterItem.textContent).toContain('Pick a date');
		expect(filterItem.textContent).not.toContain('Select date');
	});

	it('should use one original-style range picker for date between filters', async () => {
		await render(DataGridFilterDateRangeFixture);

		await page.getByRole('button', { name: 'Filter 1' }).click();

		const filterItem = await waitFor(() => document.querySelector<HTMLElement>('[role="listitem"]'));
		await expect
			.element(page.getByRole('button', { name: 'Pick a range', exact: true }))
			.toBeInTheDocument();
		const rangeTrigger = await waitFor(() =>
			page.getByRole('button', { name: 'Pick a range', exact: true }).element()
		);
		const listboxId = rangeTrigger.getAttribute('aria-controls');

		expect(rangeTrigger.id).toBe(`${filterItem.id}-input`);
		expect(listboxId).toBe(`${filterItem.id}-input-listbox`);
		expect(filterItem.textContent).toContain('Pick a range');
		const buttonLabels = Array.from(filterItem.querySelectorAll('button')).map((button) =>
			button.textContent?.trim()
		);
		expect(buttonLabels).toContain('Pick a range');
		expect(buttonLabels).not.toContain('Start');
		expect(buttonLabels).not.toContain('End');
	});

	it('should use the original value placeholder for select filters', async () => {
		await render(DataGridFilterSelectPlaceholderFixture);

		await page.getByRole('button', { name: 'Filter 1' }).click();

		const filterItem = await waitFor(() => document.querySelector<HTMLElement>('[role="listitem"]'));
		await expect
			.element(page.getByRole('button', { name: 'Value', exact: true }))
			.toBeInTheDocument();
		const valueTrigger = await waitFor(() =>
			page.getByRole('button', { name: 'Value', exact: true }).element()
		);
		const listboxId = valueTrigger.getAttribute('aria-controls');

		expect(valueTrigger.id).toBe(`${filterItem.id}-input`);
		expect(listboxId).toBe(`${filterItem.id}-input-listbox`);
		expect(filterItem.textContent).toContain('Value');
		expect(filterItem.textContent).not.toContain('Select value');
		expect(filterItem.textContent).not.toContain('Select values');
	});

	it('should keep filter item when delete is pressed with the operator selector open', async () => {
		await render(DataGridFilterMenuFixture);

		await page.getByRole('button', { name: 'Filter 1' }).click();

		const filterItem = await waitFor(() => document.querySelector<HTMLElement>('[role="listitem"]'));
		const trigger = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="select-trigger"]')
		);
		trigger.focus();
		trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
		await waitFor(() => document.querySelector<HTMLElement>('[data-slot="select-content"]'));

		filterItem.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));

		await waitFor(() => document.querySelectorAll('[role="listitem"]').length === 1);
		await expect.element(page.getByRole('heading', { name: 'Filter by' })).toBeInTheDocument();
	});

	it('should reset search state when toggled closed from the keyboard shortcut', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		const grid = await waitFor(() => document.querySelector<HTMLElement>('[data-slot="grid"]'));

		grid.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true, cancelable: true })
		);

		const input = await waitFor(() =>
			document.querySelector<HTMLInputElement>('[data-slot="grid-search"] input')
		);
		input.value = 'Engineering';
		input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));

		await waitFor(() => input.value === 'Engineering');

		input.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true, cancelable: true })
		);
		await waitFor(() => document.querySelector<HTMLElement>('[data-slot="grid-search"]') === null);

		grid.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'f', ctrlKey: true, bubbles: true, cancelable: true })
		);

		const reopenedInput = await waitFor(() =>
			document.querySelector<HTMLInputElement>('[data-slot="grid-search"] input')
		);
		expect(reopenedInput.value).toBe('');
		expect(document.querySelector<HTMLElement>('[data-slot="grid-search"]')?.textContent).toContain(
			'Type to search'
		);
	});

	it('should use the shared debounce hook for grid search like the original component', () => {
		expect(dataGridSearchSource).toContain('useDebouncedCallback');
		expect(dataGridSearchSource).toContain('SEARCH_DEBOUNCE_MS = 150');
		expect(dataGridSearchSource).not.toContain('debounceTimer');
	});

	it('should use the shared input primitive for grid search like the original component', () => {
		expect(dataGridSearchSource).toContain("import { Input } from '$lib/components/ui/input/index.js'");
		expect(dataGridSearchSource).toContain('class="h-8 w-64"');
		expect(dataGridSearchSource).not.toContain('shadow-sm');
		expect(dataGridSearchSource).not.toContain('focus-visible:ring-1');
	});

	it('should expose the original initial search match index', async () => {
		await render(DataGridSearchStateFixture);

		await expect.element(page.getByLabelText('initial match index')).toHaveTextContent('-1');
	});

	it('should expose original search result helpers', async () => {
		await render(DataGridSearchStateFixture);

		await page.getByRole('button', { name: 'Search Ada' }).click();

		await expect.element(page.getByLabelText('active search match')).toHaveTextContent('0:name');
		await expect.element(page.getByLabelText('search matches by row')).toHaveTextContent('row0-name');
	});

	it('should search visible non-navigable columns like the original grid', async () => {
		await render(DataGridSearchStateFixture);

		await page.getByRole('button', { name: 'Search Review' }).click();

		await expect.element(page.getByLabelText('active search match')).toHaveTextContent('0:actions');
		await expect.element(page.getByLabelText('action search match')).toHaveTextContent('row0-actions');
	});

	it('should focus direct meta editing starts before navigating on stop', async () => {
		await render(DataGridEditingMetaFixture);

		await page.getByRole('button', { name: 'Start second name edit' }).click();

		await expect.element(page.getByLabelText('meta focused cell', { exact: true })).toHaveTextContent('1:name');
		await expect.element(page.getByLabelText('meta editing cell', { exact: true })).toHaveTextContent('1:name');
		await expect.element(page.getByLabelText('hook focused cell', { exact: true })).toHaveTextContent('1:name');
		await expect.element(page.getByLabelText('hook editing cell', { exact: true })).toHaveTextContent('1:name');
		await expect.element(page.getByLabelText('hook table meta focused cell')).toHaveTextContent('1:name');
		await expect.element(page.getByLabelText('hook table meta editing cell')).toHaveTextContent('1:name');
	});

	it('should navigate from the direct meta editing cell on stop', async () => {
		await render(DataGridEditingMetaFixture);

		await page.getByRole('button', { name: 'Start second name and stop right' }).click();

		await expect.element(page.getByLabelText('meta editing cell', { exact: true })).toHaveTextContent('none');
		await waitFor(() => page.getByLabelText('meta focused cell', { exact: true }).element().textContent?.trim() === '1:score');
	});

	it('should focus direct meta cell clicks without selecting like the original grid', async () => {
		await render(DataGridEditingMetaFixture);

		await page.getByRole('button', { name: 'Click first name once' }).click();

		await expect.element(page.getByLabelText('meta focused cell', { exact: true })).toHaveTextContent('0:name');
		await expect.element(page.getByLabelText('meta editing cell', { exact: true })).toHaveTextContent('none');
		await expect.element(page.getByLabelText('selected cells')).toHaveTextContent('0');
	});

	it('should edit repeated direct meta cell clicks like the original grid', async () => {
		await render(DataGridEditingMetaFixture);

		await page.getByRole('button', { name: 'Click first name twice' }).click();

		await expect.element(page.getByLabelText('meta focused cell', { exact: true })).toHaveTextContent('0:name');
		await expect.element(page.getByLabelText('meta editing cell', { exact: true })).toHaveTextContent('0:name');
		await expect.element(page.getByLabelText('hook focused cell', { exact: true })).toHaveTextContent('0:name');
		await expect.element(page.getByLabelText('hook editing cell', { exact: true })).toHaveTextContent('0:name');
	});

	it('should preserve direct meta Shift+Click ranges like the original grid', async () => {
		await render(DataGridEditingMetaFixture);

		await page.getByRole('button', { name: 'Shift click score range' }).click();

		await expect.element(page.getByLabelText('shift click prevented')).toHaveTextContent('yes');
		await expect.element(page.getByLabelText('selected cells')).toHaveTextContent('4');
	});

	it('should ignore default-prevented direct meta double clicks like the original grid', async () => {
		await render(DataGridEditingMetaFixture);

		await page.getByRole('button', { name: 'Prevented double click' }).click();

		await expect.element(page.getByLabelText('meta editing cell', { exact: true })).toHaveTextContent('none');
		await expect.element(page.getByLabelText('hook editing cell', { exact: true })).toHaveTextContent('none');
	});

	it('should notify data changes for non-empty missing-row updates like the original grid', async () => {
		await render(DataGridDataUpdateFixture);

		await page.getByRole('button', { name: 'Update missing row' }).click();

		await expect.element(page.getByLabelText('change count')).toHaveTextContent('1');
		await expect.element(page.getByLabelText('first name')).toHaveTextContent('Ada');
	});

	it('should hide row mutation shortcuts unless enabled', async () => {
		await render(DataGridKeyboardShortcutsDefaultFixture);

		window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', ctrlKey: true, bubbles: true }));

		await expect.element(page.getByRole('heading', { name: 'Keyboard shortcuts' })).toBeInTheDocument();
		expect(document.body.textContent).not.toContain('Insert row below');
		expect(document.body.textContent).not.toContain('Delete selected rows');
	});

	it('should show row mutation shortcuts when enabled', async () => {
		await render(DataGridKeyboardShortcutsEnabledFixture);

		window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', ctrlKey: true, bubbles: true }));

		await expect.element(page.getByRole('heading', { name: 'Keyboard shortcuts' })).toBeInTheDocument();
		expect(document.body.textContent).toContain('Insert row below');
		expect(document.body.textContent).toContain('Delete selected rows');
	});

	it('should not wrap horizontal arrow navigation across rows', async () => {
		await render(Page);
		await page.getByRole('button', { name: 'Data Grid Demo' }).click();

		await waitFor(() => document.querySelector('[data-slot="grid-row"][data-index="1"]'));

		const firstRow = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-row"][data-index="0"]')
		);
		const secondRow = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="grid-row"][data-index="1"]')
		);
		const firstRowCells = firstRow.querySelectorAll<HTMLElement>('[data-slot="grid-cell"]');
		const lastCell = firstRowCells.item(firstRowCells.length - 1);
		const lastWrapper = await waitFor(() =>
			lastCell.querySelector<HTMLElement>('[data-slot="grid-cell-wrapper"]')
		);

		lastWrapper.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
		lastWrapper.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
		lastWrapper.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		await waitFor(() => lastWrapper.dataset.focused !== undefined);

		lastWrapper.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
		);

		expect(lastWrapper.dataset.focused).toBeDefined();
		expect(secondRow.querySelector('[data-slot="grid-cell-wrapper"][data-focused]')).toBeNull();
	});
});
