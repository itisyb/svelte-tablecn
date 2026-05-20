import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import {
	departments,
	generateDemoPeople,
	skills,
	statuses
} from '$lib/demo/person-data.js';
import DataTableShowcase from './data-table-showcase.svelte';

const tableRows = generateDemoPeople(200, { lite: true });

async function renderShowcase(
	mode: 'basic' | 'advanced' = 'basic',
	advancedFilterUi: 'advancedFilters' | 'commandFilters' = 'commandFilters'
) {
	await render(DataTableShowcase, {
		mode,
		advancedFilterUi,
		rows: tableRows,
		departments,
		statuses,
		skills
	});
}

describe('data-table-showcase.svelte', () => {
	it('should show selected advanced filter values', async () => {
		await renderShowcase('advanced');
		await page.getByRole('button', { name: 'Open filter menu' }).click();
		await page.getByRole('option', { name: 'Department' }).click();
		await page.getByRole('option', { name: 'Engineering' }).click();

		const departmentChip = page.getByRole('listitem').filter({ hasText: 'Department' });

		await expect.element(departmentChip).toBeInTheDocument();
		await expect
			.element(page.getByLabelText('Change Department value').getByText('Engineering'))
			.toBeInTheDocument();
	});

	it('should show selected basic faceted filter values', async () => {
		await renderShowcase('basic');
		await page.getByLabelText('Filter Department').click();
		await page.getByRole('option', { name: 'Marketing' }).click();
		await expect
			.element(page.getByLabelText('Filter Department').getByText('Marketing'))
			.toBeInTheDocument();

		await page.getByLabelText('Filter Status').click();
		await page.getByRole('option', { name: 'Active' }).click();
		await expect
			.element(page.getByLabelText('Filter Status').getByText('Active'))
			.toBeInTheDocument();
	});

	it('should show selected basic range filter values from URL state', async () => {
		window.history.replaceState({}, '', '/?salary=50000,90000');
		await renderShowcase('basic');
		await expect
			.element(page.getByLabelText('Filter Salary').getByText('50,000 - 90,000 $'))
			.toBeInTheDocument();
		window.history.replaceState({}, '', '/');
	});

	it('should update single select filter state when changing options', async () => {
		await renderShowcase('advanced');
		await page.getByRole('button', { name: 'Open filter menu' }).click();
		await page.getByRole('option', { name: 'Department' }).click();
		await page.getByRole('option', { name: 'Engineering' }).click();

		await expect
			.element(page.getByLabelText('Change Department value').getByText('Engineering'))
			.toBeInTheDocument();

		await page.getByLabelText('Change Department value').click();
		await page.getByRole('option', { name: 'Finance' }).click();

		await expect
			.element(page.getByLabelText('Change Department value').getByText('Finance'))
			.toBeInTheDocument();
	});
});
