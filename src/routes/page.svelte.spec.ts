import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { toast } from 'svelte-sonner';
import Page from './+page.svelte';
import layoutCssSource from './layout.css?raw';
import ActionBarEmptyFixture from './action-bar-empty-fixture.svelte';
import ActionBarLoopFixture from './action-bar-loop-fixture.svelte';
import ActionBarPortalFixture from './action-bar-portal-fixture.svelte';
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
import FpsDocumentFragmentFixture from './fps-document-fragment-fixture.svelte';
import HooksFixture from './hooks-fixture.svelte';
import SheetFixture from './sheet-fixture.svelte';
import uiIndexSource from '$lib/components/ui/index.ts?raw';
import libIndexSource from '$lib/index.ts?raw';
import actionBarSource from '$lib/components/ui/action-bar/action-bar.svelte?raw';
import buttonSource from '$lib/components/ui/button/button.svelte?raw';
import checkboxSource from '$lib/components/ui/checkbox/checkbox.svelte?raw';
import calendarCellSource from '$lib/components/ui/calendar/calendar-cell.svelte?raw';
import calendarDaySource from '$lib/components/ui/calendar/calendar-day.svelte?raw';
import calendarGridSource from '$lib/components/ui/calendar/calendar-grid.svelte?raw';
import calendarMonthSource from '$lib/components/ui/calendar/calendar-month.svelte?raw';
import calendarNextButtonSource from '$lib/components/ui/calendar/calendar-next-button.svelte?raw';
import calendarPrevButtonSource from '$lib/components/ui/calendar/calendar-prev-button.svelte?raw';
import calendarSource from '$lib/components/ui/calendar/calendar.svelte?raw';
import commandDialogSource from '$lib/components/ui/command/command-dialog.svelte?raw';
import commandInputSource from '$lib/components/ui/command/command-input.svelte?raw';
import commandItemSource from '$lib/components/ui/command/command-item.svelte?raw';
import commandLinkItemSource from '$lib/components/ui/command/command-link-item.svelte?raw';
import commandShortcutSource from '$lib/components/ui/command/command-shortcut.svelte?raw';
import dataTableConfigSource from '$lib/config/data-table.ts?raw';
import dataTableTypesSource from '$lib/types/data-table.ts?raw';
import dataGridActionBarSource from '$lib/components/data-grid/data-grid-action-bar.svelte?raw';
import dataGridHelpersSource from '$lib/data-grid.ts?raw';
import dataGridCellWrapperSource from '$lib/components/data-grid/data-grid-cell-wrapper.svelte?raw';
import dataGridColumnHeaderSource from '$lib/components/data-grid/data-grid-column-header.svelte?raw';
import dataGridFileCellSource from '$lib/components/data-grid/cells/file-cell.svelte?raw';
import dataGridFilterMenuSource from '$lib/components/data-grid/data-grid-filter-menu.svelte?raw';
import dataGridRangeCalendarSource from '$lib/components/data-grid/data-grid-range-calendar.svelte?raw';
import dataGridRowSource from '$lib/components/data-grid/data-grid-row.svelte?raw';
import dataGridRowHeightMenuSource from '$lib/components/data-grid/data-grid-row-height-menu.svelte?raw';
import dataGridRowSelectCellSource from '$lib/components/data-grid/cells/row-select-cell.svelte?raw';
import dataGridRowSelectHeaderSource from '$lib/components/data-grid/cells/row-select-header.svelte?raw';
import dataGridSearchSource from '$lib/components/data-grid/data-grid-search.svelte?raw';
import dataGridSelectCellSource from '$lib/components/data-grid/cells/select-cell.svelte?raw';
import dataGridSkeletonGridSource from '$lib/components/data-grid/data-grid-skeleton-grid.svelte?raw';
import dataGridSkeletonToolbarSource from '$lib/components/data-grid/data-grid-skeleton-toolbar.svelte?raw';
import dataGridSkeletonSource from '$lib/components/data-grid/data-grid-skeleton.svelte?raw';
import dataGridSortMenuSource from '$lib/components/data-grid/data-grid-sort-menu.svelte?raw';
import dataGridViewMenuSource from '$lib/components/data-grid/data-grid-view-menu.svelte?raw';
import dataTableAdvancedToolbarSource from '$lib/components/data-table/data-table-advanced-toolbar.svelte?raw';
import dataTableColumnHeaderSource from '$lib/components/data-table/data-table-column-header.svelte?raw';
import dataTableDateFilterSource from '$lib/components/data-table/data-table-date-filter.svelte?raw';
import dataTableFacetedFilterSource from '$lib/components/data-table/data-table-faceted-filter.svelte?raw';
import dataTableFilterListSource from '$lib/components/data-table/data-table-filter-list.svelte?raw';
import dataTableFilterMenuSource from '$lib/components/data-table/data-table-filter-menu.svelte?raw';
import dataTablePaginationSource from '$lib/components/data-table/data-table-pagination.svelte?raw';
import dataTableRangeFilterSource from '$lib/components/data-table/data-table-range-filter.svelte?raw';
import dataTableSliderFilterSource from '$lib/components/data-table/data-table-slider-filter.svelte?raw';
import dataTableSortListSource from '$lib/components/data-table/data-table-sort-list.svelte?raw';
import dataTableSkeletonSource from '$lib/components/data-table/data-table-skeleton.svelte?raw';
import dataTableToolbarSource from '$lib/components/data-table/data-table-toolbar.svelte?raw';
import dataTableViewOptionsSource from '$lib/components/data-table/data-table-view-options.svelte?raw';
import dataTableSource from '$lib/components/data-table/data-table.svelte?raw';
import typesIndexSource from '$lib/types/index.ts?raw';
import dialogContentSource from '$lib/components/ui/dialog/dialog-content.svelte?raw';
import dialogHeaderSource from '$lib/components/ui/dialog/dialog-header.svelte?raw';
import dialogOverlaySource from '$lib/components/ui/dialog/dialog-overlay.svelte?raw';
import dropdownMenuCheckboxItemSource from '$lib/components/ui/dropdown-menu/dropdown-menu-checkbox-item.svelte?raw';
import dropdownMenuContentSource from '$lib/components/ui/dropdown-menu/dropdown-menu-content.svelte?raw';
import dropdownMenuGroupHeadingSource from '$lib/components/ui/dropdown-menu/dropdown-menu-group-heading.svelte?raw';
import dropdownMenuItemSource from '$lib/components/ui/dropdown-menu/dropdown-menu-item.svelte?raw';
import dropdownMenuLabelSource from '$lib/components/ui/dropdown-menu/dropdown-menu-label.svelte?raw';
import dropdownMenuRadioItemSource from '$lib/components/ui/dropdown-menu/dropdown-menu-radio-item.svelte?raw';
import dropdownMenuSubContentSource from '$lib/components/ui/dropdown-menu/dropdown-menu-sub-content.svelte?raw';
import dropdownMenuSubTriggerSource from '$lib/components/ui/dropdown-menu/dropdown-menu-sub-trigger.svelte?raw';
import facetedBadgeListSource from '$lib/components/ui/faceted/faceted-badge-list.svelte?raw';
import facetedContentSource from '$lib/components/ui/faceted/faceted-content.svelte?raw';
import facetedItemSource from '$lib/components/ui/faceted/faceted-item.svelte?raw';
import fpsSource from '$lib/components/ui/fps/fps.svelte?raw';
import inputSource from '$lib/components/ui/input/input.svelte?raw';
import labelSource from '$lib/components/ui/label/label.svelte?raw';
import popoverContentSource from '$lib/components/ui/popover/popover-content.svelte?raw';
import separatorSource from '$lib/components/ui/separator/separator.svelte?raw';
import selectContentSource from '$lib/components/ui/select/select-content.svelte?raw';
import selectGroupSource from '$lib/components/ui/select/select-group.svelte?raw';
import selectItemSource from '$lib/components/ui/select/select-item.svelte?raw';
import selectLabelSource from '$lib/components/ui/select/select-label.svelte?raw';
import selectTriggerSource from '$lib/components/ui/select/select-trigger.svelte?raw';
import sheetContentSource from '$lib/components/ui/sheet/sheet-content.svelte?raw';
import sheetHeaderSource from '$lib/components/ui/sheet/sheet-header.svelte?raw';
import sheetIndexSource from '$lib/components/ui/sheet/index.ts?raw';
import sheetOverlaySource from '$lib/components/ui/sheet/sheet-overlay.svelte?raw';
import skeletonSource from '$lib/components/ui/skeleton/skeleton.svelte?raw';
import sliderSource from '$lib/components/ui/slider/slider.svelte?raw';
import sonnerSource from '$lib/components/ui/sonner/sonner.svelte?raw';
import tableCellSource from '$lib/components/ui/table/table-cell.svelte?raw';
import tableHeadSource from '$lib/components/ui/table/table-head.svelte?raw';
import textareaSource from '$lib/components/ui/textarea/textarea.svelte?raw';
import toggleSource from '$lib/components/ui/toggle/toggle.svelte?raw';
import toggleGroupSource from '$lib/components/ui/toggle-group/toggle-group.svelte?raw';
import toggleGroupItemSource from '$lib/components/ui/toggle-group/toggle-group-item.svelte?raw';
import tooltipContentSource from '$lib/components/ui/tooltip/tooltip-content.svelte?raw';
import tooltipSource from '$lib/components/ui/tooltip/tooltip.svelte?raw';
import tooltipProviderSource from '$lib/components/ui/tooltip/tooltip-provider.svelte?raw';
import dataGridSource from '$lib/components/data-grid/data-grid.svelte?raw';
import utilsSource from '$lib/utils.ts?raw';
import useAsRefSource from '$lib/hooks/use-as-ref.svelte.ts?raw';
import useLazyRefSource from '$lib/hooks/use-lazy-ref.ts?raw';
import useMediaQuerySource from '$lib/hooks/use-media-query.svelte.ts?raw';
import useMountedSource from '$lib/hooks/use-mounted.svelte.ts?raw';

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

	it('should expose hook utilities like the original hook set', async () => {
		await render(HooksFixture);

		await expect.element(page.getByLabelText('as ref')).toHaveTextContent('Ada');
		await expect.element(page.getByLabelText('lazy ref')).toHaveTextContent('created once');
		await expect.element(page.getByLabelText('lazy initializations')).toHaveTextContent('1');

		await page.getByRole('button', { name: 'Update hook state' }).click();
		await expect.element(page.getByLabelText('as ref')).toHaveTextContent('Grace');
		await expect.element(page.getByLabelText('lazy initializations')).toHaveTextContent('1');
		await expect.element(page.getByLabelText('mounted')).toHaveTextContent('mounted');
		await expect.element(page.getByLabelText('media query')).toHaveTextContent('matched');
	});

	it('should render the original sheet primitive on top of dialog primitives', async () => {
		await render(SheetFixture);

		const sheet = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="sheet-content"]')
		);
		const overlay = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="sheet-overlay"]')
		);

		expect(sheet.getAttribute('role')).toBe('dialog');
		expect(sheet.className).toContain('slide-in-from-left');
		expect(sheet.className).toContain('border-r');
		expect(sheet.textContent).toContain('Sheet title');
		expect(overlay.className).toContain('bg-black/50');
		expect(document.querySelector<HTMLElement>('[data-slot="sheet-close"]')?.textContent).toContain(
			'Close'
		);
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
		expect(content.className).toContain('rounded-md');
		expect(content.className).not.toContain('rounded-sm');
		expect(content.className).not.toContain('rounded-[2px]');
		expect(trigger.className).not.toContain('data-[size=sm]:h-full');
		expect(trigger.className).toContain(
			'size-full !w-full items-start border-none p-0 shadow-none focus-visible:ring-0 dark:bg-transparent'
		);
		expect(trigger.getAttribute('style') ?? '').toContain('width: calc(100% - 16px)');
		const firstItem = await waitFor(() =>
			content.querySelector<HTMLElement>('[data-slot="select-item"]')
		);
		expect(firstItem.className).toContain('rounded-sm');
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

	it('should space file count labels like the original grid', () => {
		expect(dataGridFileCellSource).toContain("{' '}");
		expect(dataGridFileCellSource).toContain("{files.length === 1 ? 'file' : 'files'}");
		expect(dataGridFileCellSource).not.toContain(
			"{files.length}\n\t\t\t\t\t\t\t\t\t{files.length === 1 ? 'file' : 'files'}"
		);
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
		expect(dataGridColumnHeaderSource).toContain(
			'<Icon {...props} class="size-3.5 shrink-0 text-muted-foreground" />'
		);
		expect(dataGridColumnHeaderSource).not.toContain('<span {...props}>');
	});

	it('should forward data grid column header trigger props like the original grid', () => {
		expect(dataGridColumnHeaderSource).toContain(
			'interface Props extends ComponentProps<typeof DropdownMenuTrigger>'
		);
		expect(dataGridColumnHeaderSource).toContain('...triggerProps');
		expect(dataGridColumnHeaderSource).toContain('{...triggerProps}');
		expect(dataGridColumnHeaderSource).toContain('onPointerDownProp?.(event)');
	});

	it('should forward data grid wrapper props like the original grid', () => {
		expect(dataGridSource).toContain(
			"WithElementRef<Omit<HTMLAttributes<HTMLDivElement>, 'dir'>, HTMLDivElement>"
		);
		expect(dataGridSource).toContain('...restProps');
		expect(dataGridSource).toContain('{...restProps}');
		expect(dataGridSource).toContain('bind:this={ref}');
	});

	it('should keep data grid add-row footer cell class aligned with the original grid', () => {
		expect(dataGridSource).toContain(
			'class="relative flex h-9 grow items-center bg-muted/30 transition-colors hover:bg-muted/50 focus:bg-muted/50 focus:outline-none"'
		);
		expect(dataGridSource).not.toContain('h-9 w-full cursor-pointer');
	});

	it('should forward data grid row props like the original grid row', () => {
		expect(dataGridRowSource).toContain(
			"interface Props extends WithElementRef<Omit<HTMLAttributes<HTMLDivElement>, 'dir'>, HTMLDivElement>"
		);
		expect(dataGridRowSource).toContain('...restProps');
		expect(dataGridRowSource).toContain('{...restProps}');
		expect(dataGridRowSource).toContain('bind:this={getRowElement, setRowElement}');
		expect(dataGridRowSource).toContain('style: styleProp');
	});

	it('should keep data grid row content visibility styling aligned with the original grid', () => {
		expect(dataGridRowSource).toContain(
			"'absolute flex w-full border-b [content-visibility:auto]'"
		);
		expect(dataGridRowSource).toContain('content-visibility: auto;');
	});

	it('should forward data grid cell wrapper props like the original grid wrapper', () => {
		expect(dataGridCellWrapperSource).toContain(
			"interface Props extends WithElementRef<Omit<HTMLAttributes<HTMLDivElement>, 'dir'>, HTMLDivElement>"
		);
		expect(dataGridCellWrapperSource).toContain('...restProps');
		expect(dataGridCellWrapperSource).toContain('{...restProps}');
		expect(dataGridCellWrapperSource).toContain('bind:this={getWrapperElement, setWrapperElement}');
		expect(dataGridCellWrapperSource).toContain('ref = $bindable(null)');
		expect(dataGridCellWrapperSource).toContain('onClickProp?.(event)');
		expect(dataGridCellWrapperSource).toContain('onKeyDownProp?.(event)');
		expect(dataGridCellWrapperSource).toContain('text-start');
		expect(dataGridCellWrapperSource).not.toContain("dir === 'rtl' ? 'text-right' : 'text-left'");
	});

	it('should keep data grid select editor content radius aligned with the original grid', () => {
		expect(dataGridSelectCellSource).toContain(
			'class="min-w-[calc(var(--bits-select-anchor-width)_+_16px)]"'
		);
		expect(dataGridSelectCellSource).not.toContain(
			'class="min-w-[calc(var(--bits-select-anchor-width)_+_16px)] rounded-sm"'
		);
	});

	it('should style row select debug hitboxes like the original grid', () => {
		expect(dataGridRowSelectCellSource).toContain(
			"debug && 'border border-red-500 border-dashed bg-red-500/20'"
		);
		expect(dataGridRowSelectHeaderSource).toContain(
			"debug && 'border border-red-500 border-dashed bg-red-500/20'"
		);
		expect(dataGridRowSelectHeaderSource).not.toContain('outline outline-dashed');
	});

	it('should forward data table column header trigger props like the original table', () => {
		expect(dataTableColumnHeaderSource).toContain(
			'interface Props extends ComponentProps<typeof DropdownMenuTrigger>'
		);
		expect(dataTableColumnHeaderSource).toContain('...triggerProps');
		expect(dataTableColumnHeaderSource).toContain('{...triggerProps}');
	});

	it('should keep data grid action bar style update API aligned with the original grid', () => {
		expect(dataGridActionBarSource).toContain('styleOptions?: CellSelectOption[]');
		expect(dataGridActionBarSource).toContain('onStyleUpdate?: (value: string) => void');
		expect(dataGridActionBarSource).toContain(
			"const secondaryLabel = $derived(styleOptions ? 'Style' : 'Department')"
		);
		expect(dataGridActionBarSource).toContain('{secondaryLabel}');
	});

	it('should forward data grid filter menu popover content props like the original grid', () => {
		expect(dataGridFilterMenuSource).toContain(
			'interface Props extends ComponentProps<typeof PopoverContent>'
		);
		expect(dataGridFilterMenuSource).toContain('...contentProps');
		expect(dataGridFilterMenuSource).toContain('{...contentProps}');
		expect(dataGridFilterMenuSource).not.toContain("align = 'start'");
	});

	it('should forward data grid sort menu popover content props like the original grid', () => {
		expect(dataGridSortMenuSource).toContain(
			'interface Props extends ComponentProps<typeof PopoverContent>'
		);
		expect(dataGridSortMenuSource).toContain('...contentProps');
		expect(dataGridSortMenuSource).toContain('{...contentProps}');
		expect(dataGridSortMenuSource).not.toContain("align = 'start'");
	});

	it('should keep data grid drag handle focus styling aligned with outline buttons', () => {
		expect(dataGridFilterMenuSource).toContain('Button, buttonVariants');
		expect(dataGridFilterMenuSource).toContain('aria-label="drag handle for filter"');
		expect(dataGridFilterMenuSource).toContain(
			"buttonVariants({ variant: 'outline', size: 'icon' })"
		);
		expect(dataGridFilterMenuSource).toContain("'size-8 shrink-0 cursor-grab rounded'");
		expect(dataGridFilterMenuSource).not.toContain('focus-visible:ring-1 focus-visible:ring-ring');
		expect(dataGridSortMenuSource).toContain('Button, buttonVariants');
		expect(dataGridSortMenuSource).toContain('aria-label="drag handle for sort"');
		expect(dataGridSortMenuSource).toContain(
			"buttonVariants({ variant: 'outline', size: 'icon' })"
		);
		expect(dataGridSortMenuSource).toContain("'size-8 shrink-0 cursor-grab rounded'");
		expect(dataGridSortMenuSource).not.toContain('focus-visible:ring-1 focus-visible:ring-ring');
	});

	it('should forward row height select content props like the original grid', () => {
		expect(dataGridRowHeightMenuSource).toContain(
			'interface Props extends ComponentProps<typeof SelectContent>'
		);
		expect(dataGridRowHeightMenuSource).toContain('...contentProps');
		expect(dataGridRowHeightMenuSource).toContain(
			'<SelectContent class={className} {...contentProps}>'
		);
		expect(dataGridRowHeightMenuSource).not.toContain("align = 'start'");
	});

	it('should forward view menu popover content props like the original grid', () => {
		expect(dataGridViewMenuSource).toContain(
			'interface Props extends ComponentProps<typeof PopoverContent>'
		);
		expect(dataGridViewMenuSource).toContain('...contentProps');
		expect(dataGridViewMenuSource).toContain(
			"<PopoverContent {dir} class={cn('w-44 p-0', className)} {...contentProps}>"
		);
		expect(dataGridViewMenuSource).not.toContain("align = 'start'");
	});

	it('should forward data grid skeleton root props like the original grid', () => {
		expect(dataGridSkeletonSource).toContain(
			'interface Props extends WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>'
		);
		expect(dataGridSkeletonSource).toContain('...restProps');
		expect(dataGridSkeletonSource).toContain('bind:this={ref}');
		expect(dataGridSkeletonSource).toContain('{...restProps}');
	});

	it('should forward data grid skeleton toolbar root props like the original grid', () => {
		expect(dataGridSkeletonToolbarSource).toContain(
			'interface Props extends WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>'
		);
		expect(dataGridSkeletonToolbarSource).toContain('...restProps');
		expect(dataGridSkeletonToolbarSource).toContain('bind:this={ref}');
		expect(dataGridSkeletonToolbarSource).toContain('{...restProps}');
	});

	it('should forward data grid skeleton grid root props like the original grid', () => {
		expect(dataGridSkeletonGridSource).toContain(
			'interface Props extends WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>'
		);
		expect(dataGridSkeletonGridSource).toContain('...restProps');
		expect(dataGridSkeletonGridSource).toContain('bind:ref');
		expect(dataGridSkeletonGridSource).toContain('{...restProps}');
	});

	it('should keep input styling aligned with the original ui input', () => {
		expect(inputSource).toContain("import { cn");
		expect(inputSource).toContain('data-slot="input"');
		expect(inputSource).toContain('class={cn(');
		expect(inputSource).toContain('className');
		expect(inputSource).toContain('min-w-0');
		expect(inputSource).toContain('shadow-xs');
		expect(inputSource).toContain('selection:bg-primary');
		expect(inputSource).toContain('focus-visible:ring-[3px]');
		expect(inputSource).toContain('aria-invalid:border-destructive');
		expect(inputSource).not.toContain('{className}"');
	});

	it('should keep separator slot naming aligned with the original ui separator', () => {
		expect(separatorSource).toContain('"data-slot": dataSlot = "separator-root"');
		expect(separatorSource).toContain('orientation = "horizontal"');
		expect(separatorSource).toContain('decorative = true');
		expect(separatorSource).toContain('{orientation}');
		expect(separatorSource).toContain('{decorative}');
	});

	it('should keep checkbox slots and state styling aligned with the original ui checkbox', () => {
		expect(checkboxSource).toContain('ref = $bindable(null)');
		expect(checkboxSource).toContain('bind:ref');
		expect(checkboxSource).toContain('data-slot="checkbox"');
		expect(checkboxSource).toContain('data-slot="checkbox-indicator"');
		expect(checkboxSource).toContain('aria-invalid:border-destructive');
		expect(checkboxSource).toContain('dark:bg-input/30');
		expect(checkboxSource).toContain('dark:data-[state=checked]:bg-primary');
	});

	it('should keep calendar month spacing aligned with the original ui calendar', () => {
		expect(calendarMonthSource).toContain('flex w-full flex-col gap-4');
		expect(calendarGridSource).toContain('flex w-full border-collapse flex-col gap-1');
		expect(calendarGridSource).not.toContain('mt-4 flex w-full');
	});

	it('should keep calendar root sizing aligned with the original ui calendar', () => {
		expect(calendarSource).toContain('group/calendar w-fit p-3');
		expect(dataGridRangeCalendarSource).toContain('group/calendar w-fit p-3');
	});

	it('should keep calendar navigation disabled styling aligned with original and Bits state', () => {
		expect(calendarPrevButtonSource).toContain('aria-disabled:opacity-50');
		expect(calendarPrevButtonSource).toContain('disabled:opacity-50');
		expect(calendarPrevButtonSource).toContain('data-[disabled]:opacity-50');
		expect(calendarNextButtonSource).toContain('aria-disabled:opacity-50');
		expect(calendarNextButtonSource).toContain('disabled:opacity-50');
		expect(calendarNextButtonSource).toContain('data-[disabled]:opacity-50');
	});

	it('should keep calendar day sizing aligned with the original ui calendar', () => {
		expect(calendarDaySource).toContain(
			'flex aspect-square size-auto w-full min-w-(--cell-size)'
		);
		expect(dataGridRangeCalendarSource).toContain(
			'flex aspect-square size-auto w-full min-w-(--cell-size)'
		);
		expect(calendarDaySource).not.toContain('size-(--cell-size) flex select-none');
	});

	it('should keep calendar cell sizing aligned with the original ui calendar', () => {
		expect(calendarCellSource).toContain('relative h-full w-full aspect-square');
		expect(dataGridRangeCalendarSource).toContain('relative h-full w-full aspect-square');
		expect(calendarCellSource).not.toContain('size-(--cell-size) relative');
	});

	it('should keep calendar range edge rounding aligned with the original ui calendar', () => {
		expect(calendarCellSource).toContain(
			'[&:first-child[data-selected]_[data-bits-day]]:rounded-l-md'
		);
		expect(calendarCellSource).toContain(
			'[&:last-child[data-selected]_[data-bits-day]]:rounded-r-md'
		);
		expect(calendarCellSource).not.toContain('rounded-s-md');
		expect(calendarCellSource).not.toContain('rounded-e-md');
		expect(dataGridRangeCalendarSource).toContain(
			'[&:first-child_[data-bits-day]]:rounded-l-md'
		);
		expect(dataGridRangeCalendarSource).toContain(
			'[&:last-child_[data-bits-day]]:rounded-r-md'
		);
		expect(dataGridRangeCalendarSource).toContain('data-[range-start]:rounded-r-none');
		expect(dataGridRangeCalendarSource).toContain('data-[range-end]:rounded-l-none');
		expect(dataGridRangeCalendarSource).not.toContain('rounded-s-none');
		expect(dataGridRangeCalendarSource).not.toContain('rounded-e-none');
	});

	it('should keep calendar day focus treatment aligned with the original ui calendar', () => {
		expect(calendarDaySource).toContain(
			'focus:relative focus:z-10 focus:border-ring focus:ring-[3px] focus:ring-ring/50'
		);
		expect(dataGridRangeCalendarSource).toContain(
			'focus:relative focus:z-10 focus:border-ring focus:ring-[3px] focus:ring-ring/50'
		);
		expect(calendarDaySource).not.toContain('focus:border-ring focus:ring-ring/50 focus:relative');
	});

	it('should keep dialog close marker and state styling aligned with the original ui dialog', () => {
		expect(dialogContentSource).toContain('data-slot="dialog-close"');
		expect(dialogContentSource).toContain('left-[50%] top-[50%]');
		expect(dialogContentSource).not.toContain('start-[50%]');
		expect(dialogContentSource).toContain('absolute top-4 right-4');
		expect(dialogContentSource).not.toContain('absolute end-4 top-4');
		expect(dialogContentSource).toContain('data-[state=open]:bg-accent');
		expect(dialogContentSource).toContain('data-[state=open]:text-muted-foreground');
	});

	it('should keep dialog header alignment aligned with the original ui dialog', () => {
		expect(dialogHeaderSource).toContain('flex flex-col gap-2 text-center sm:text-left');
		expect(dialogHeaderSource).not.toContain('sm:text-start');
	});

	it('should keep dialog overlay animation aligned with the original ui dialog', () => {
		expect(dialogOverlaySource).toContain('data-slot="dialog-overlay"');
		expect(dialogOverlaySource).toContain('data-[state=closed]:animate-out');
		expect(dialogOverlaySource).toContain('data-[state=open]:animate-in');
		expect(dialogOverlaySource).toContain('data-[state=closed]:fade-out-0');
		expect(dialogOverlaySource).toContain('data-[state=open]:fade-in-0');
	});

	it('should expose the original ui sheet primitive styling and API', () => {
		expect(libIndexSource).toContain("} from './components/ui/sheet';");
		expect(sheetIndexSource).toContain('Root as Sheet');
		expect(sheetIndexSource).toContain('Content as SheetContent');
		expect(sheetIndexSource).toContain('Trigger as SheetTrigger');
		expect(sheetContentSource).toContain('data-slot="sheet-content"');
		expect(sheetOverlaySource).toContain('data-slot="sheet-overlay"');
		expect(sheetOverlaySource).toContain('bg-black/50');
		expect(sheetContentSource).toContain('data-[state=open]:duration-500');
		expect(sheetContentSource).toContain('data-[state=closed]:duration-300');
		expect(sheetContentSource).toContain('slide-in-from-right');
		expect(sheetContentSource).toContain('slide-in-from-left');
		expect(sheetContentSource).toContain('slide-in-from-top');
		expect(sheetContentSource).toContain('slide-in-from-bottom');
		expect(sheetContentSource).toContain('data-slot="sheet-close"');
		expect(sheetHeaderSource).toContain('flex flex-col gap-1.5 p-4');
	});

	it('should expose remaining original lightweight ui primitives from the package root', () => {
		expect(libIndexSource).toContain("export { Separator } from './components/ui/separator';");
		expect(libIndexSource).toContain("export { Skeleton } from './components/ui/skeleton';");
		expect(libIndexSource).toContain("export { Textarea } from './components/ui/textarea';");
		expect(separatorSource).toContain('data-[orientation=horizontal]:h-px');
		expect(skeletonSource).toContain('data-slot="skeleton"');
		expect(skeletonSource).toContain('animate-pulse');
		expect(textareaSource).toContain('data-slot={dataSlot}');
		expect(textareaSource).toContain('field-sizing-content');
		expect(textareaSource).toContain('focus-visible:ring-[3px]');
	});

	it('should expose existing original ui primitive modules through public barrels', () => {
		expect(uiIndexSource).toContain("export { Badge, badgeVariants, type BadgeVariant } from './badge';");
		expect(uiIndexSource).toContain('CalendarNextButton');
		expect(uiIndexSource).toContain('CommandDialog');
		expect(uiIndexSource).toContain('DialogContent');
		expect(uiIndexSource).toContain('DropdownMenuContent');
		expect(uiIndexSource).toContain('DropdownMenuPortal');
		expect(uiIndexSource).toContain("export { Kbd, KbdGroup } from './kbd';");
		expect(uiIndexSource).toContain('PopoverContent');
		expect(uiIndexSource).toContain("export { Toaster } from './sonner';");
		expect(uiIndexSource).toContain('TooltipProvider');
		expect(libIndexSource).toContain("export { Badge, badgeVariants, type BadgeVariant } from './components/ui/badge';");
		expect(libIndexSource).toContain('CalendarNextButton');
		expect(libIndexSource).toContain('CommandDialog');
		expect(libIndexSource).toContain('DialogContent');
		expect(libIndexSource).toContain('DropdownMenuContent');
		expect(libIndexSource).toContain('DropdownMenuPortal');
		expect(libIndexSource).toContain("export { Kbd, KbdGroup } from './components/ui/kbd';");
		expect(libIndexSource).toContain('PopoverContent');
		expect(libIndexSource).toContain("export { Toaster } from './components/ui/sonner';");
		expect(libIndexSource).toContain('TooltipProvider');
		expect(libIndexSource).toContain('SelectContent');
		expect(libIndexSource).toContain('SelectTrigger');
	});

	it('should expose implemented data-grid helpers from the package root', () => {
		expect(dataGridHelpersSource).toContain('export function getColumnBorderVisibility');
		expect(dataGridHelpersSource).toContain('export function getColumnPinningStyle');
		expect(dataGridHelpersSource).toContain('export function parseTsv');
		expect(dataGridHelpersSource).toContain('export function serializeCellsToTsv');
		expect(dataGridHelpersSource).toContain('export function scrollCellIntoView');
		expect(libIndexSource).toContain('getColumnBorderVisibility');
		expect(libIndexSource).toContain('getColumnPinningStyle as getDataGridColumnPinningStyle');
		expect(libIndexSource).toContain('formatCellValueForCopy');
		expect(libIndexSource).toContain('getIsInPopover');
		expect(libIndexSource).toContain('parsePastedCellValue');
		expect(libIndexSource).toContain('serializeCellsToTsv');
		expect(libIndexSource).toContain('scrollCellIntoView');
		expect(libIndexSource).toContain('toPinningStyleString');
	});

	it('should expose original-style data table config and row action types', () => {
		expect(dataTableConfigSource).toContain('export type DataTableConfig = typeof dataTableConfig');
		expect(dataTableTypesSource).toContain(
			"export type FilterVariant = (typeof dataTableConfig)['filterVariants'][number];"
		);
		expect(dataTableTypesSource).toContain(
			"export type JoinOperator = (typeof dataTableConfig)['joinOperators'][number];"
		);
		expect(dataTableTypesSource).toContain('export interface DataTableRowAction<TData>');
		expect(libIndexSource).toContain('DataTableRowAction');
		expect(libIndexSource).toContain('MULTI_SELECT_OPERATORS');
		expect(libIndexSource).toContain("export type { DataTableConfig } from './config/data-table';");
		expect(libIndexSource).toContain('SearchMatch');
		expect(libIndexSource).toContain('SearchStateData');
		expect(libIndexSource).toContain('FilterValue');
	});

	it('should expose original-style general utility types without server-only dependencies', () => {
		expect(typesIndexSource).toContain('export type Prettify<T>');
		expect(typesIndexSource).toContain('export interface SearchParams');
		expect(typesIndexSource).not.toContain('drizzle-orm');
		expect(typesIndexSource).not.toContain('React.ElementType');
		expect(libIndexSource).toContain("export type { Prettify, SearchParams } from './types';");
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

	it('should keep dropdown item focus styling aligned with the original ui menu', () => {
		expect(dropdownMenuItemSource).toContain('data-highlighted:bg-accent');
		expect(dropdownMenuItemSource).toContain('focus:bg-accent');
		expect(dropdownMenuItemSource).toContain('data-[variant=destructive]:focus:bg-destructive/10');
		expect(dropdownMenuCheckboxItemSource).toContain('data-highlighted:bg-accent');
		expect(dropdownMenuCheckboxItemSource).toContain('data-highlighted:text-accent-foreground');
		expect(dropdownMenuCheckboxItemSource).toContain('focus:bg-accent');
		expect(dropdownMenuRadioItemSource).toContain('data-highlighted:bg-accent');
		expect(dropdownMenuRadioItemSource).toContain('data-highlighted:text-accent-foreground');
		expect(dropdownMenuRadioItemSource).toContain('focus:bg-accent');
		expect(dropdownMenuSubTriggerSource).toContain('focus:bg-accent');
	});

	it('should keep dropdown menu item inset spacing aligned with the original ui menu', () => {
		expect(dropdownMenuItemSource).toContain('data-[inset]:pl-8');
		expect(dropdownMenuItemSource).not.toContain('data-[inset]:ps-8');
		expect(dropdownMenuLabelSource).toContain('data-[inset]:pl-8');
		expect(dropdownMenuGroupHeadingSource).toContain('data-[inset]:pl-8');
		expect(dropdownMenuCheckboxItemSource).toContain('py-1.5 pr-2 pl-8');
		expect(dropdownMenuCheckboxItemSource).toContain('absolute left-2');
		expect(dropdownMenuRadioItemSource).toContain('py-1.5 pr-2 pl-8');
		expect(dropdownMenuRadioItemSource).toContain('absolute left-2');
		expect(dropdownMenuSubTriggerSource).toContain('data-[inset]:pl-8');
		expect(dropdownMenuSubTriggerSource).toContain('ml-auto size-4');
	});

	it('should keep select item focus styling aligned with the original ui select', () => {
		expect(selectItemSource).toContain('data-[highlighted]:bg-accent');
		expect(selectItemSource).toContain('data-[highlighted]:text-accent-foreground');
		expect(selectItemSource).toContain('focus:bg-accent');
		expect(selectItemSource).toContain('focus:text-accent-foreground');
	});

	it('should keep select item spacing aligned with the original ui select', () => {
		expect(selectItemSource).toContain('py-1.5 pr-8 pl-2');
		expect(selectItemSource).toContain('absolute right-2');
		expect(selectItemSource).not.toContain('pe-8 ps-2');
		expect(selectItemSource).not.toContain('absolute end-2');
	});

	it('should keep select labels backed by the select primitive', () => {
		expect(selectLabelSource).toContain('SelectPrimitive.GroupHeading');
		expect(selectLabelSource).toContain('data-slot="select-label"');
		expect(selectLabelSource).toContain('text-muted-foreground px-2 py-1.5 text-xs');
		expect(selectLabelSource).not.toContain('<div');
	});

	it('should keep command input padding aligned with the original ui command', () => {
		expect(commandInputSource).toContain('border-b px-3');
		expect(commandInputSource).not.toContain('pe-8 ps-3');
	});

	it('should keep command item selected styling aligned with Bits and original command state', () => {
		expect(commandItemSource).toContain('data-[selected]:bg-accent');
		expect(commandItemSource).toContain('data-[selected=true]:bg-accent');
		expect(commandItemSource).toContain('data-[selected]:text-accent-foreground');
		expect(commandItemSource).toContain('data-[selected=true]:text-accent-foreground');
		expect(commandItemSource).toContain('data-[disabled]:pointer-events-none');
		expect(commandItemSource).toContain('data-[disabled=true]:pointer-events-none');
		expect(commandLinkItemSource).toContain('data-[selected]:bg-accent');
		expect(commandLinkItemSource).toContain('data-[selected=true]:bg-accent');
		expect(commandLinkItemSource).toContain('data-[selected]:text-accent-foreground');
		expect(commandLinkItemSource).toContain('data-[selected=true]:text-accent-foreground');
		expect(commandLinkItemSource).toContain('data-[disabled]:pointer-events-none');
		expect(commandLinkItemSource).toContain('data-[disabled=true]:pointer-events-none');
	});

	it('should keep command dialog default description aligned with the original ui command', () => {
		expect(commandDialogSource).toContain('description = "Search for a command to run..."');
		expect(commandDialogSource).not.toContain('description = "Search for a command to run",');
	});

	it('should keep command shortcut spacing aligned with the original ui command', () => {
		expect(commandShortcutSource).toContain('ml-auto text-muted-foreground text-xs tracking-widest');
		expect(commandShortcutSource).not.toContain('ms-auto');
	});

	it('should keep select trigger disabled styling aligned with original and Bits state', () => {
		expect(selectTriggerSource).toContain('disabled:cursor-not-allowed');
		expect(selectTriggerSource).toContain('data-[disabled]:cursor-not-allowed');
		expect(selectTriggerSource).toContain('disabled:opacity-50');
		expect(selectTriggerSource).toContain('data-[disabled]:opacity-50');
	});

	it('should keep select content popper offset aligned with original', () => {
		expect(selectContentSource).toContain('sideOffset = 0');
		expect(selectContentSource).toContain('data-[side=bottom]:translate-y-1');
		expect(selectContentSource).not.toContain('sideOffset = 4');
	});

	it('should keep floating content side animations aligned with the original ui primitives', () => {
		for (const source of [
			selectContentSource,
			popoverContentSource,
			dropdownMenuContentSource,
			dropdownMenuSubContentSource,
			tooltipContentSource
		]) {
			expect(source).toContain('data-[side=left]:slide-in-from-right-2');
			expect(source).toContain('data-[side=right]:slide-in-from-left-2');
			expect(source).not.toContain('data-[side=left]:slide-in-from-end-2');
			expect(source).not.toContain('data-[side=right]:slide-in-from-start-2');
		}
	});

	it('should forward select group refs like the original select primitive', () => {
		expect(selectGroupSource).toContain('let { ref = $bindable(null)');
		expect(selectGroupSource).toContain('<SelectPrimitive.Group bind:ref');
	});

	it('should keep table checkbox alignment aligned with the original ui table', () => {
		expect(tableHeadSource).toContain('text-left');
		expect(tableHeadSource).not.toContain('text-start');
		expect(tableHeadSource).toContain('[&:has([role=checkbox])]:pr-0');
		expect(tableHeadSource).not.toContain('[&:has([role=checkbox])]:pe-0');
		expect(tableCellSource).toContain('[&:has([role=checkbox])]:pr-0');
		expect(tableCellSource).not.toContain('[&:has([role=checkbox])]:pe-0');
		expect(tableHeadSource).toContain('[&>[role=checkbox]]:translate-y-[2px]');
		expect(tableCellSource).toContain('[&>[role=checkbox]]:translate-y-[2px]');
	});

	it('should keep slider thumb styling aligned with original and Bits state', () => {
		expect(sliderSource).toContain('bg-background');
		expect(sliderSource).toContain('disabled:pointer-events-none');
		expect(sliderSource).toContain('aria-disabled:pointer-events-none');
		expect(sliderSource).toContain('data-[disabled]:pointer-events-none');
		expect(sliderSource).toContain('disabled:opacity-50');
		expect(sliderSource).toContain('aria-disabled:opacity-50');
		expect(sliderSource).toContain('data-[disabled]:opacity-50');
		expect(sliderSource).not.toContain('bg-white');
	});

	it('should keep toaster surface tokens aligned with the original ui sonner', () => {
		expect(sonnerSource).toContain("theme = 'system'");
		expect(sonnerSource).toContain('--normal-bg: var(--popover)');
		expect(sonnerSource).toContain('--normal-text: var(--popover-foreground)');
		expect(sonnerSource).toContain('--normal-border: var(--border)');
		expect(sonnerSource).toContain('group-[.toaster]:bg-popover');
		expect(sonnerSource).toContain('group-[.toaster]:text-popover-foreground');
		expect(sonnerSource).not.toContain('group-[.toaster]:bg-background');
		expect(sonnerSource).not.toContain('group-[.toaster]:text-foreground');
	});

	it('should keep dark theme surface tokens aligned with the original table', () => {
		expect(layoutCssSource).toContain('--destructive-foreground: oklch(0.577 0.245 27.325)');
		expect(layoutCssSource).toContain('--color-destructive-foreground: var(--destructive-foreground)');
		expect(layoutCssSource).toContain('--card: oklch(0.145 0 0)');
		expect(layoutCssSource).toContain('--popover: oklch(0.145 0 0)');
		expect(layoutCssSource).toContain('--primary: oklch(0.985 0 0)');
		expect(layoutCssSource).toContain('--destructive: oklch(0.396 0.141 25.723)');
		expect(layoutCssSource).toContain('--destructive-foreground: oklch(0.637 0.237 25.331)');
		expect(layoutCssSource).toContain('--border: oklch(0.269 0 0)');
		expect(layoutCssSource).toContain('--input: oklch(0.269 0 0)');
		expect(layoutCssSource).toContain('--sidebar-ring: oklch(0.439 0 0)');
		expect(layoutCssSource).not.toContain('--popover: oklch(0.205 0 0)');
		expect(layoutCssSource).not.toContain('--border: oklch(1 0 0 / 10%)');
	});

	it('should keep root body treatment aligned with the original app layout', () => {
		expect(layoutCssSource).toContain(
			'@apply min-h-screen bg-background font-sans text-foreground antialiased'
		);
		expect(layoutCssSource).not.toContain('@apply bg-background text-foreground');
	});

	it('should export table footer from the package root like the original table primitive', () => {
		expect(libIndexSource).toContain('TableFooter');
		expect(libIndexSource).toContain("} from './components/ui/table';");
	});

	it('should expose the original absolute URL utility', () => {
		expect(libIndexSource).toContain("export { getAbsoluteUrl } from './utils';");
		expect(utilsSource).toContain('export function getAbsoluteUrl(path: string)');
		expect(utilsSource).toContain('path.startsWith("/") ? path : `/${path}`');
		expect(utilsSource).toContain('typeof window !== "undefined"');
		expect(utilsSource).toContain('process.env.VERCEL_URL');
		expect(utilsSource).toContain('process.env.PORT ?? 3000');
	});

	it('should expose the small hook utilities from the package root like the original hooks', () => {
		expect(libIndexSource).toContain(
			"export { useAsRef, type AsRef } from './hooks/use-as-ref.svelte.js';"
		);
		expect(libIndexSource).toContain("export { useLazyRef, type LazyRef } from './hooks/use-lazy-ref';");
		expect(libIndexSource).toContain(
			"export { useMounted, type MountedState } from './hooks/use-mounted.svelte.js';"
		);
		expect(libIndexSource).toContain(
			"export { useMediaQuery, type MediaQueryState } from './hooks/use-media-query.svelte.js';"
		);
		expect(useAsRefSource).toContain('export function useAsRef');
		expect(useAsRefSource).toContain('const current = $derived(getValue(value))');
		expect(useLazyRefSource).toContain('export function useLazyRef');
		expect(useLazyRefSource).toContain('current: fn()');
		expect(useMountedSource).toContain('export function useMounted()');
		expect(useMountedSource).toContain('mounted = true');
		expect(useMediaQuerySource).toContain('export function useMediaQuery');
		expect(useMediaQuerySource).toContain('window.matchMedia(currentQuery)');
		expect(useMediaQuerySource).toContain("addEventListener('change', onChange)");
	});

	it('should expose the original ui label primitive styling', () => {
		expect(libIndexSource).toContain("export { Label } from './components/ui/label';");
		expect(labelSource).toContain('data-slot="label"');
		expect(labelSource).toContain('flex select-none items-center gap-2');
		expect(labelSource).toContain('peer-disabled:cursor-not-allowed');
		expect(labelSource).toContain('group-data-[disabled=true]:pointer-events-none');
	});

	it('should expose the original ui faceted primitive styling', () => {
		expect(libIndexSource).toContain('FacetedBadgeList');
		expect(libIndexSource).toContain("} from './components/ui/faceted';");
		expect(facetedBadgeListSource).toContain('Select options...');
		expect(facetedBadgeListSource).toContain('rounded-sm px-1 font-normal');
		expect(facetedContentSource).toContain('w-[200px]');
		expect(facetedContentSource).toContain('p-0');
		expect(facetedItemSource).toContain('data-selected={isSelected}');
		expect(facetedItemSource).toContain('flex size-4 items-center justify-center rounded-sm border border-primary');
	});

	it('should expose the original ui fps primitive styling', () => {
		expect(libIndexSource).toContain("export { Fps, fpsVariants } from './components/ui/fps';");
		expect(fpsSource).toContain('data-slot="fps"');
		expect(fpsSource).toContain('portalContainer?: Element | DocumentFragment | null');
		expect(fpsSource).toContain('font-mono text-foreground text-sm backdrop-blur-sm');
		expect(fpsSource).toContain('"top-right": "top-4 right-4"');
		expect(fpsSource).toContain('warning: "text-orange-500"');
		expect(fpsSource).toContain("isDocumentFragment(portalContainer)");
	});

	it('should portal fps into document fragments like the original ui fps', async () => {
		await render(FpsDocumentFragmentFixture);

		const host = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-testid="fps-shadow-host"]')
		);
		const fps = await waitFor(() => host.shadowRoot?.querySelector<HTMLElement>('[data-slot="fps"]'));

		expect(fps).toBeTruthy();
		expect(fps.getAttribute('aria-hidden')).toBe('true');
	});

	it('should expose the original ui toggle primitive styling', () => {
		expect(libIndexSource).toContain(
			"export { Toggle, toggleVariants } from './components/ui/toggle';"
		);
		expect(toggleSource).toContain('data-slot="toggle"');
		expect(toggleSource).toContain('data-[state=on]:bg-accent');
		expect(toggleSource).toContain('focus-visible:ring-[3px]');
		expect(toggleSource).toContain('default: "h-9 min-w-9 px-2"');
	});

	it('should expose the original ui toggle group primitive styling', () => {
		expect(libIndexSource).toContain(
			"export { ToggleGroup, ToggleGroupItem } from './components/ui/toggle-group';"
		);
		expect(toggleGroupSource).toContain('data-slot="toggle-group"');
		expect(toggleGroupSource).toContain('group/toggle-group flex w-fit items-center rounded-md');
		expect(toggleGroupItemSource).toContain('data-slot="toggle-group-item"');
		expect(toggleGroupItemSource).toContain('first:rounded-l-md last:rounded-r-md');
		expect(toggleGroupItemSource).toContain('data-[variant=outline]:border-l-0');
	});

	it('should keep data table slider filter inputs compact like the original table', () => {
		expect(dataTableSliderFilterSource).not.toContain('text-muted-foreground text-sm">to</span>');
		expect(dataTableSliderFilterSource).toContain("class={cn('h-8 w-24', unit && 'pr-8')}");
	});

	it('should keep data table slider filter labels aligned with the original table', () => {
		expect(dataTableSliderFilterSource).toContain('class="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"');
		expect(dataTableSliderFilterSource).toContain('<label for={`${inputId}-from`} class="sr-only">From</label>');
		expect(dataTableSliderFilterSource).toContain('<label for={`${inputId}-to`} class="sr-only">to</label>');
		expect(dataTableSliderFilterSource).toContain('<label for={`${inputId}-slider`} class="sr-only">{title} slider</label>');
		expect(dataTableSliderFilterSource).toContain('pattern="[0-9]*"');
		expect(dataTableSliderFilterSource).toContain('id={`${inputId}-slider`}');
		expect(dataTableSliderFilterSource).not.toContain(
			'flex items-center justify-between text-muted-foreground text-xs'
		);
	});

	it('should keep tooltip provider delay aligned with the original ui tooltip', () => {
		expect(tooltipProviderSource).toContain('delayDuration = 0');
	});

	it('should wrap tooltip roots in a provider like the original ui tooltip', () => {
		expect(tooltipSource).toContain('<TooltipProvider>');
		expect(tooltipSource).toContain('<TooltipPrimitive.Root {...restProps}>');
	});

	it('should keep data table view option class passthrough aligned with the original table', () => {
		expect(dataTableViewOptionsSource).toContain("class=\"ml-auto hidden h-8 font-normal lg:flex\"");
		expect(dataTableViewOptionsSource).toContain(
			'interface Props extends ComponentProps<typeof PopoverContent>'
		);
		expect(dataTableViewOptionsSource).toContain('...contentProps');
		expect(dataTableViewOptionsSource).toContain("class={cn('w-44 p-0', className)}");
		expect(dataTableViewOptionsSource).toContain(
			"<PopoverContent class={cn('w-44 p-0', className)} {...contentProps}>"
		);
		expect(dataTableViewOptionsSource).not.toContain(
			"class={cn('ml-auto hidden h-8 font-normal lg:flex', className)}"
		);
		expect(dataTableViewOptionsSource).not.toContain("align = 'start'");
	});

	it('should keep data table faceted clear control aligned with the original table', () => {
		expect(dataTableFacetedFilterSource).toContain('role="button"');
		expect(dataTableFacetedFilterSource).toContain('tabindex={0}');
		expect(dataTableFacetedFilterSource).toContain('resolvedColumn?.getFilterValue()');
		expect(dataTableFacetedFilterSource).not.toContain('type="button"');
	});

	it('should keep data table toolbar filter variants aligned with the original table', () => {
		expect(dataTableToolbarSource).toContain('column.getFilterValue()');
		expect(dataTableToolbarSource).toContain('getColumnStringFilterValue(column)');
		expect(dataTableToolbarSource).not.toContain('getBooleanOptions');
		expect(dataTableToolbarSource).not.toContain("variant === 'boolean'");
		expect(dataTableToolbarSource).not.toContain("label: 'True'");
	});

	it('should forward data table toolbar root props like the original table', () => {
		expect(dataTableToolbarSource).toContain(
			'interface Props extends WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>'
		);
		expect(dataTableToolbarSource).toContain('...restProps');
		expect(dataTableToolbarSource).toContain('bind:this={ref}');
		expect(dataTableToolbarSource).toContain('{...restProps}');
	});

	it('should forward data table advanced toolbar root props like the original table', () => {
		expect(dataTableAdvancedToolbarSource).toContain(
			'interface Props extends WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>'
		);
		expect(dataTableAdvancedToolbarSource).toContain('...restProps');
		expect(dataTableAdvancedToolbarSource).toContain('bind:this={ref}');
		expect(dataTableAdvancedToolbarSource).toContain('{...restProps}');
	});

	it('should keep data table date filter trigger and popover aligned with the original table', () => {
		expect(dataTableDateFilterSource).toContain('role="button"');
		expect(dataTableDateFilterSource).toContain('tabindex={0}');
		expect(dataTableDateFilterSource).toContain("Clear ${title ?? 'column'} filter");
		expect(dataTableDateFilterSource).toContain('data-[orientation=vertical]:h-4');
		expect(dataTableDateFilterSource).toContain("join(' - ')");
		expect(dataTableDateFilterSource).toContain('class="w-auto p-0"');
		expect(dataTableDateFilterSource).toContain('resolvedColumn?.getFilterValue()');
		expect(dataTableDateFilterSource).toContain('function calendarDateToTimestamp');
		expect(dataTableDateFilterSource).toContain('.getTime()');
		expect(dataTableDateFilterSource).toContain('.map((value) => formatDate(value))');
		expect(dataTableDateFilterSource).toContain('.some((item) => item !== undefined)');
		expect(dataTableDateFilterSource).toContain('DataGridRangeCalendar');
		expect(dataTableDateFilterSource).toContain('onValueChange={onRangeCalendarChange}');
		expect(dataTableDateFilterSource).toContain('captionLayout="dropdown"');
		expect(dataTableDateFilterSource).toContain(
			'<CalendarPicker\n\t\t\t\ttype="single"\n\t\t\t\tcaptionLayout="dropdown"'
		);
		expect(dataTableDateFilterSource).not.toContain('class="w-72 space-y-3"');
		expect(dataTableDateFilterSource).not.toContain('class="grid sm:grid-cols-2"');
		expect(dataTableDateFilterSource).not.toContain('>Date</span>');
		expect(dataTableDateFilterSource).not.toContain('>From</span>');
		expect(dataTableDateFilterSource).not.toContain('>To</span>');
	});

	it('should keep data table filter chip segment borders aligned with the original table', () => {
		expect(dataTableFilterMenuSource).toContain('rounded-l-md border border-r-0');
		expect(dataTableFilterMenuSource).toContain('rounded-none border-r-0 px-2.5 lowercase');
		expect(dataTableFilterMenuSource).toContain(
			'rounded-none bg-transparent px-1.5 py-0.5 [&_svg]:hidden'
		);
		expect(dataTableFilterMenuSource).toContain(
			'class="h-full min-w-16 rounded-none border px-1.5 font-normal dark:bg-input/30"'
		);
		expect(dataTableFilterMenuSource).not.toContain('ChevronsUpDown');
		expect(dataTableFilterMenuSource).not.toContain(
			'rounded-none border-l-0 px-2.5 lowercase'
		);
		expect(dataTableFilterMenuSource).not.toContain(
			'h-8 rounded-none border-l-0 px-2.5 data-size:h-8 [&_svg]:hidden'
		);
	});

	it('should keep data table filter select trigger content aligned with the original table', () => {
		expect(dataTableFilterMenuSource).toContain('selectedOptions = selectOptions.filter');
		expect(dataTableFilterMenuSource).toContain(
			"{variant === 'multiSelect' ? 'Select options...' : 'Select option...'}"
		);
		expect(dataTableFilterMenuSource).toContain(
			'class="flex items-center -space-x-2 rtl:space-x-reverse"'
		);
		expect(dataTableFilterMenuSource).toContain('selectedOption.icon');
		expect(dataTableFilterMenuSource).toContain('rounded-full border bg-background p-0.5');
		expect(dataTableFilterMenuSource).not.toContain("'Select values'");
		expect(dataTableFilterMenuSource).not.toContain("'Select value'");
	});

	it('should keep data table draft select option counts aligned with the original table', () => {
		expect(dataTableFilterMenuSource).toContain('{#if option.count}');
		expect(dataTableFilterMenuSource).toContain(
			'<span class="ml-auto font-mono text-xs">{option.count}</span>'
		);
		expect(dataTableFilterMenuSource).not.toContain('option.count !== undefined');
	});

	it('should keep data table filter menu draft values inside the command list like the original table', () => {
		expect(dataTableFilterMenuSource).toContain(
			"import BadgeCheck from '@lucide/svelte/icons/badge-check'"
		);
		expect(dataTableFilterMenuSource).toMatch(
			/\{:else if selectedColumn\.variant === 'boolean'\}[\s\S]*<CommandInput[\s\S]*placeholder=\{selectedColumn\.label\}[\s\S]*<CommandItem value="true"[\s\S]*<CommandItem[\s\S]*value="false"[\s\S]*\{:else if selectedColumn\.variant === 'select'/
		);
		expect(dataTableFilterMenuSource).toMatch(
			/\{:else if selectedColumn\.variant === 'select' \|\| selectedColumn\.variant === 'multiSelect'\}[\s\S]*<CommandInput[\s\S]*placeholder=\{selectedColumn\.label\}[\s\S]*\{#each selectedColumn\.options \?\? \[\] as option[\s\S]*\{:else if selectedColumn\.variant === 'text'/
		);
		expect(dataTableFilterMenuSource).toMatch(
			/\{:else if selectedColumn\.variant === 'text' \|\| selectedColumn\.variant === 'number'\}[\s\S]*<BadgeCheck \/>[\s\S]*Filter by "\{draftValue\}"[\s\S]*\{:else\}/
		);
		expect(dataTableFilterMenuSource).toMatch(
			/\{:else if selectedColumn\.variant === 'date'\}[\s\S]*<CalendarPicker[\s\S]*type="single"[\s\S]*captionLayout="dropdown"[\s\S]*\{:else if selectedColumn\.variant === 'dateRange'\}/
		);
		expect(dataTableFilterMenuSource).toMatch(
			/\{:else if selectedColumn\.variant === 'dateRange'\}[\s\S]*<DataGridRangeCalendar[\s\S]*captionLayout="dropdown"[\s\S]*\{:else\}/
		);
		expect(dataTableFilterMenuSource).not.toContain(
			"type={selectedColumn.variant === 'range' ? 'number' : 'date'}"
		);
	});

	it('should close data table filter field selector after choosing a field like the original table', () => {
		expect(dataTableFilterMenuSource).toContain('openFieldSelectors.has(filterKey)');
		expect(dataTableFilterMenuSource).toContain('setFieldSelectorOpen(filterKey, false)');
	});

	it('should delay clearing data table filter menu draft state while closing like the original table', () => {
		expect(dataTableFilterMenuSource).toContain('setTimeout(resetDraft, 100)');
		expect(dataTableFilterMenuSource).not.toContain('if (!nextOpen) {\\n\\t\\t\\tresetDraft();');
	});

	it('should keep data table filter menu draft keyboard back behavior aligned with the original table', () => {
		expect(dataTableFilterMenuSource).toContain('function selectColumnForDraft');
		expect(dataTableFilterMenuSource).toContain('requestAnimationFrame(() => draftInputRef?.focus())');
		expect(dataTableFilterMenuSource).toContain('function onDraftInputKeyDown');
		expect(dataTableFilterMenuSource).toContain('selectedColumnId = null;');
		expect(dataTableFilterMenuSource).toContain('onkeydown={onDraftInputKeyDown}');
		expect(dataTableFilterMenuSource).not.toContain(
			'onSelect={() => (selectedColumnId = column.id)}'
		);
	});

	it('should keep data table filter menu chip aria wiring aligned with the original table', () => {
		expect(dataTableFilterMenuSource).toContain("import { useId } from 'bits-ui'");
		expect(dataTableFilterMenuSource).toContain('id={filterItemId}');
		expect(dataTableFilterMenuSource).toContain('aria-controls={operatorListboxId}');
		expect(dataTableFilterMenuSource).toContain('id={operatorListboxId}');
		expect(dataTableFilterMenuSource).toContain('id={inputId}');
		expect(dataTableFilterMenuSource).toContain('aria-controls={inputListboxId}');
		expect(dataTableFilterMenuSource).toContain('id={inputListboxId}');
		expect(dataTableFilterMenuSource).toContain('aria-controls={filterItemId}');
		expect(dataTableFilterMenuSource).toContain('role="status"');
		expect(dataTableFilterMenuSource).toContain('aria-live="polite"');
		expect(dataTableFilterMenuSource).toContain('Open filter command menu');
	});

	it('should keep data table filter menu trigger shortcuts aligned with the original table', () => {
		expect(dataTableFilterMenuSource).toContain('<svelte:window onkeydown={handleKeyDown} />');
		expect(dataTableFilterMenuSource).toContain('FILTER_SHORTCUT_KEY');
		expect(dataTableFilterMenuSource).toContain('onTriggerKeyDown');
		expect(dataTableFilterMenuSource).toContain('bind:ref={triggerRef}');
		expect(dataTableFilterMenuSource).toContain('requestAnimationFrame(() => triggerRef?.focus())');
		expect(dataTableFilterMenuSource).toContain('removeFilter(getFilterKey(lastFilter');
		expect(dataTableFilterMenuSource).toContain(
			'class="w-full max-w-[var(--bits-popover-content-available-width)] p-0"'
		);
		expect(dataTableFilterMenuSource).not.toContain('sm:w-80');
		expect(dataTableFilterMenuSource).toContain(
			'<Command loop class="[&_[data-slot=command-input-wrapper]_svg]:hidden">'
		);
	});

	it('should forward data table filter menu popover content props like the original table', () => {
		expect(dataTableFilterMenuSource).toContain(
			'interface Props extends ComponentProps<typeof PopoverContent>'
		);
		expect(dataTableFilterMenuSource).toContain('...contentProps');
		expect(dataTableFilterMenuSource).toContain('{...contentProps}');
		expect(dataTableFilterMenuSource).not.toContain("align = 'start'");
	});

	it('should keep data table filter list value column bounded like the original table', () => {
		expect(dataTableFilterListSource).toContain('sm:min-w-[380px]');
		expect(dataTableFilterListSource).toContain('max-h-[300px]');
		expect(dataTableFilterListSource).not.toContain('sm:min-w-[480px]');
		expect(dataTableFilterListSource).not.toContain('max-h-[400px]');
		expect(dataTableFilterListSource).toContain('min-w-36 max-w-60 flex-1');
		expect(dataTableFilterListSource).not.toContain(
			"variant === 'range' ? 'min-w-52' : 'min-w-36'"
		);
		expect(dataTableFilterListSource).toContain('class="w-[200px] p-0"');
	});

	it('should use calendar popovers for data table filter list dates like the original table', () => {
		expect(dataTableFilterListSource).toContain(
			"import { Calendar } from '$lib/components/ui/calendar/index.js'"
		);
		expect(dataTableFilterListSource).toContain(
			"import DataGridRangeCalendar from '$lib/components/data-grid/data-grid-range-calendar.svelte'"
		);
		expect(dataTableFilterListSource).toContain('<CalendarIcon />');
		expect(dataTableFilterListSource).toContain('<DataGridRangeCalendar');
		expect(dataTableFilterListSource).toContain('<Calendar');
		expect(dataTableFilterListSource).toContain('getDateDisplayValue(filterValues, operator)');
		expect(dataTableFilterListSource).not.toContain('type="date"');
		expect(dataTableFilterListSource).not.toContain('id={`${inputId}-end`}');
	});

	it('should remove the last data table filter from the trigger shortcut like the original table', () => {
		expect(dataTableFilterListSource).toContain('removeFilter(getFilterKey(lastFilter');
		expect(dataTableFilterListSource).toContain('requestAnimationFrame(() => addButtonRef?.focus())');
		expect(dataTableFilterListSource).not.toContain('event.preventDefault();\n\t\t\tresetFilters();');
	});

	it('should remove data table filter rows only when child selectors are closed like the original table', () => {
		expect(dataTableFilterListSource).toContain('openFieldSelectors.has(filterKey)');
		expect(dataTableFilterListSource).toContain('openOperatorSelectors.has(filterKey)');
		expect(dataTableFilterListSource).toContain('openValueSelectors.has(filterKey)');
		expect(dataTableFilterListSource).toContain('onFilterItemKeyDown(event, filterKey)');
		expect(dataTableFilterListSource).toContain('removeFilter(filterKey)');
	});

	it('should keep data table filter list aria wiring aligned with the original table', () => {
		expect(dataTableFilterListSource).toContain("import { useId } from 'bits-ui'");
		expect(dataTableFilterListSource).toContain('aria-labelledby={labelId}');
		expect(dataTableFilterListSource).toContain('aria-describedby={descriptionId}');
		expect(dataTableFilterListSource).toContain('role="list"');
		expect(dataTableFilterListSource).toContain('role="listitem"');
		expect(dataTableFilterListSource).toContain('id={filterItemId}');
		expect(dataTableFilterListSource).toContain('tabindex={-1}');
		expect(dataTableFilterListSource).toContain('aria-controls={joinOperatorListboxId}');
		expect(dataTableFilterListSource).toContain('id={joinOperatorListboxId}');
		expect(dataTableFilterListSource).toContain('aria-controls={fieldListboxId}');
		expect(dataTableFilterListSource).toContain('id={fieldListboxId}');
		expect(dataTableFilterListSource).toContain('aria-controls={operatorListboxId}');
		expect(dataTableFilterListSource).toContain('id={operatorListboxId}');
		expect(dataTableFilterListSource).toContain('aria-controls={inputListboxId}');
		expect(dataTableFilterListSource).toContain('id={inputListboxId}');
		expect(dataTableFilterListSource).toContain('aria-controls={filterItemId}');
	});

	it('should forward data table filter list popover content props like the original table', () => {
		expect(dataTableFilterListSource).toContain(
			'interface Props extends ComponentProps<typeof PopoverContent>'
		);
		expect(dataTableFilterListSource).toContain('...contentProps');
		expect(dataTableFilterListSource).toContain('{...contentProps}');
		expect(dataTableFilterListSource).not.toContain("align = 'start'");
	});

	it('should keep data table filter list field options plain like the original table', () => {
		expect(dataTableFilterListSource).not.toContain('{#if column.icon}');
		expect(dataTableFilterListSource).not.toContain('{@const Icon = column.icon}');
	});

	it('should keep data table filter drag handle focus styling aligned with outline buttons', () => {
		expect(dataTableFilterListSource).toContain('Button, buttonVariants');
		expect(dataTableFilterListSource).toContain('aria-label="drag handle for filter"');
		expect(dataTableFilterListSource).toContain(
			"buttonVariants({ variant: 'outline', size: 'icon' })"
		);
		expect(dataTableFilterListSource).toContain("'size-8 shrink-0 cursor-grab rounded'");
		expect(dataTableFilterListSource).not.toContain('focus-visible:ring-1 focus-visible:ring-ring');
	});

	it('should keep data table slider filter popover sizing aligned with the original table', () => {
		expect(dataTableSliderFilterSource).toContain('flex w-auto flex-col gap-4');
		expect(dataTableSliderFilterSource).toContain('flex items-center gap-4');
		expect(dataTableSliderFilterSource).not.toContain('min-w-72');
		expect(dataTableSliderFilterSource).not.toContain('flex items-center gap-3');
	});

	it('should keep data table slider filter trigger aligned with the original table', () => {
		expect(dataTableSliderFilterSource).toContain('role="button"');
		expect(dataTableSliderFilterSource).toContain('tabindex={0}');
		expect(dataTableSliderFilterSource).toContain('<span>{title}</span>');
		expect(dataTableSliderFilterSource).toContain('resolvedColumn?.getFilterValue()');
		expect(dataTableSliderFilterSource).not.toContain('rounded-r-none');
		expect(dataTableSliderFilterSource).not.toContain('rounded-l-none');
		expect(dataTableSliderFilterSource).not.toContain('max-w-40 truncate text-muted-foreground text-xs');
	});

	it('should keep data table range filters in the original two-input shape by default', () => {
		expect(dataTableRangeFilterSource).toContain('showSlider = false');
		expect(dataTableRangeFilterSource).toContain("'flex w-full items-center gap-2'");
		expect(dataTableRangeFilterSource).toContain('sr-only shrink-0 text-muted-foreground');
		expect(dataTableRangeFilterSource).not.toContain('showSlider = true');
		expect(dataTableRangeFilterSource).not.toContain(
			"'flex w-full flex-col gap-2', !showSlider && 'flex-row items-center gap-2'"
		);
		expect(dataTableRangeFilterSource).not.toContain(
			'shrink-0 text-muted-foreground text-xs">to'
		);
	});

	it('should keep data table range filter unit adornments aligned with original numeric inputs', () => {
		expect(dataTableRangeFilterSource).toContain("class={cn('h-8 w-full rounded', unit && 'pr-8')}");
		expect(dataTableRangeFilterSource).toContain(
			'rounded-r-md bg-accent px-2 text-muted-foreground text-sm'
		);
		expect(dataTableRangeFilterSource).not.toContain("unit && 'pr-7'");
		expect(dataTableRangeFilterSource).not.toContain('px-1.5 text-muted-foreground text-xs');
	});

	it('should keep data table sort field options plain like the original table', () => {
		expect(dataTableSortListSource).not.toContain("from '@lucide/svelte/icons/check'");
		expect(dataTableSortListSource).not.toContain("column.id === sort.id ? 'opacity-100'");
		expect(dataTableSortListSource).toContain('{#each columns as column (column.id)}');
		expect(dataTableSortListSource).not.toContain('getSelectableColumns');
	});

	it('should keep data table sort drag handle focus styling aligned with outline buttons', () => {
		expect(dataTableSortListSource).toContain('Button, buttonVariants');
		expect(dataTableSortListSource).toContain('aria-label="drag handle for sort"');
		expect(dataTableSortListSource).toContain(
			"buttonVariants({ variant: 'outline', size: 'icon' })"
		);
		expect(dataTableSortListSource).toContain("'size-8 shrink-0 cursor-grab rounded'");
		expect(dataTableSortListSource).not.toContain('focus-visible:ring-1 focus-visible:ring-ring');
	});

	it('should remove data table sort rows only when child selectors are closed like the original table', () => {
		expect(dataTableSortListSource).toContain('openFieldSelectors.has(sort.id)');
		expect(dataTableSortListSource).toContain('openDirectionSelectors.has(sort.id)');
		expect(dataTableSortListSource).toContain('onSortItemKeyDown(event, sort.id)');
		expect(dataTableSortListSource).toContain('onSortRemove(sortId)');
	});

	it('should keep data table sort list aria wiring aligned with the original table', () => {
		expect(dataTableSortListSource).toContain("import { useId } from 'bits-ui'");
		expect(dataTableSortListSource).toContain('aria-labelledby={labelId}');
		expect(dataTableSortListSource).toContain('aria-describedby={descriptionId}');
		expect(dataTableSortListSource).toContain('role="list"');
		expect(dataTableSortListSource).toContain('role="listitem"');
		expect(dataTableSortListSource).toContain('id={sortItemId}');
		expect(dataTableSortListSource).toContain('tabindex={-1}');
		expect(dataTableSortListSource).toContain('id={fieldTriggerId}');
		expect(dataTableSortListSource).toContain('aria-controls={fieldListboxId}');
		expect(dataTableSortListSource).toContain('id={fieldListboxId}');
		expect(dataTableSortListSource).toContain('aria-controls={directionListboxId}');
		expect(dataTableSortListSource).toContain('id={directionListboxId}');
		expect(dataTableSortListSource).toContain('aria-controls={sortItemId}');
	});

	it('should forward data table sort list popover content props like the original table', () => {
		expect(dataTableSortListSource).toContain(
			'interface Props extends ComponentProps<typeof PopoverContent>'
		);
		expect(dataTableSortListSource).toContain('...contentProps');
		expect(dataTableSortListSource).toContain('{...contentProps}');
		expect(dataTableSortListSource).not.toContain("align = 'start'");
	});

	it('should keep data table pagination page size width aligned with the original table', () => {
		expect(dataTablePaginationSource).toContain('h-8 w-18 data-size:h-8');
		expect(dataTablePaginationSource).not.toContain('w-[4.5rem]');
	});

	it('should keep data table pagination last-page action aligned with the original table', () => {
		expect(dataTablePaginationSource).toContain(
			'onclick={() => table.setPageIndex(table.getPageCount() - 1)}'
		);
		expect(dataTablePaginationSource).not.toContain('Math.max(table.getPageCount() - 1, 0)');
	});

	it('should forward data table pagination root props like the original table', () => {
		expect(dataTablePaginationSource).toContain(
			'interface Props extends WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>'
		);
		expect(dataTablePaginationSource).toContain('...restProps');
		expect(dataTablePaginationSource).toContain('bind:this={ref}');
		expect(dataTablePaginationSource).toContain('{...restProps}');
	});

	it('should forward data table root props like the original table', () => {
		expect(dataTableSource).toContain(
			'interface Props extends WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>'
		);
		expect(dataTableSource).toContain('...restProps');
		expect(dataTableSource).toContain('bind:this={ref}');
		expect(dataTableSource).toContain('{...restProps}');
	});

	it('should forward data table range filter root props like the original table', () => {
		expect(dataTableRangeFilterSource).toContain(
			'interface Props extends WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>'
		);
		expect(dataTableRangeFilterSource).toContain('...restProps');
		expect(dataTableRangeFilterSource).toContain('bind:this={ref}');
		expect(dataTableRangeFilterSource).toContain('{...restProps}');
	});

	it('should forward data table skeleton root props like the original table', () => {
		expect(dataTableSkeletonSource).toContain(
			'interface Props extends WithElementRef<HTMLAttributes<HTMLDivElement>, HTMLDivElement>'
		);
		expect(dataTableSkeletonSource).toContain('...restProps');
		expect(dataTableSkeletonSource).toContain('bind:this={ref}');
		expect(dataTableSkeletonSource).toContain('{...restProps}');
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
		expect(items[0].tabIndex).toBe(0);
		expect(items[1].tabIndex).toBe(-1);

		const rightEvent = new KeyboardEvent('keydown', {
			key: 'ArrowRight',
			bubbles: true,
			cancelable: true
		});
		document.activeElement?.dispatchEvent(rightEvent);
		expect(rightEvent.defaultPrevented).toBe(true);

		await waitFor(() => document.activeElement === items[1]);
		expect(document.activeElement?.textContent).toContain('Department');
		expect(items[0].tabIndex).toBe(-1);
		expect(items[1].tabIndex).toBe(0);

		document.activeElement?.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'End', bubbles: true, cancelable: true })
		);
		await waitFor(() => document.activeElement === items[2]);
		expect(document.activeElement?.textContent).toContain('Delete');
		expect(items[1].tabIndex).toBe(-1);
		expect(items[2].tabIndex).toBe(0);

		document.activeElement?.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
		);
		await waitFor(() => document.activeElement === items[0]);
		expect(items[0].tabIndex).toBe(0);
		expect(items[2].tabIndex).toBe(-1);
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

	it('should remove the action bar group tab stop when there are no focusable items', async () => {
		await render(ActionBarEmptyFixture);

		const group = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-slot="action-bar-group"]')
		);

		expect(group.tabIndex).toBe(-1);
	});

	it('should portal action bars to body and custom containers like the original component', async () => {
		await render(ActionBarPortalFixture);

		const defaultHost = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-testid="default-action-bar-host"]')
		);
		const defaultBar = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-testid="default-action-bar"]')
		);
		const customTarget = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-testid="custom-action-bar-target"]')
		);
		const customHost = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-testid="custom-action-bar-host"]')
		);
		const customBar = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-testid="custom-action-bar"]')
		);
		const fragmentTarget = await waitFor(() =>
			document.querySelector<HTMLElement>('[data-testid="fragment-action-bar-target"]')
		);
		const fragmentBar = await waitFor(() =>
			fragmentTarget.shadowRoot?.querySelector<HTMLElement>('[data-testid="fragment-action-bar"]')
		);

		expect(defaultBar.parentElement).toBe(document.body);
		expect(defaultHost.contains(defaultBar)).toBe(false);
		expect(customBar.parentElement).toBe(customTarget);
		expect(customHost.contains(customBar)).toBe(false);
		expect(fragmentTarget.shadowRoot?.contains(fragmentBar)).toBe(true);
	});

	it('should keep action bar portal source aligned with the original component', () => {
		expect(actionBarSource).toContain("import { Portal } from 'bits-ui';");
		expect(actionBarSource).toContain('portalContainer?: Element | DocumentFragment | null;');
		expect(actionBarSource).toContain('isDocumentFragment(portalContainer)');
		expect(actionBarSource).toContain('portalContainer.appendChild(fragmentPortalHost)');
		expect(actionBarSource).toContain('<Portal to={portalTarget}>');
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
		expect(dataGridFilterMenuSource).toContain('setValueSelectorOpen(filter.id, false)');
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
		expect(dataGridFilterMenuSource).toContain('class="w-[200px] p-0"');
		expect(dataGridFilterMenuSource).toMatch(
			/\{#if operator === 'isAnyOf' \|\| operator === 'isNoneOf'\}[\s\S]*class="w-48 p-0"[\s\S]*\{@const selectedOption = selectOptions\.find[\s\S]*class="w-\[200px\] p-0"/
		);
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

	it('should close single-value select filter popovers after choosing a value like the original menu', async () => {
		await render(DataGridFilterSelectPlaceholderFixture);

		await page.getByRole('button', { name: 'Filter 1' }).click();

		const valueTrigger = await waitFor(() =>
			page.getByRole('button', { name: 'Value', exact: true }).element()
		);
		const listboxId = valueTrigger.getAttribute('aria-controls');
		valueTrigger.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

		const activeOption = await waitFor(() =>
			Array.from(document.querySelectorAll<HTMLElement>('[data-slot="command-item"]')).find(
				(element) => element.textContent?.includes('Active')
			)
		);
		activeOption.click();

		await waitFor(() => (listboxId ? document.getElementById(listboxId) === null : null));
		await expect.element(page.getByRole('button', { name: 'Active', exact: true })).toBeInTheDocument();
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
