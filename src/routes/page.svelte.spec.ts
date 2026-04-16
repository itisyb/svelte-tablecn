import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render h1', async () => {
		render(Page);

		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toBeInTheDocument();
	});

	it('should show selected advanced filter values', async () => {
		render(Page);

		await page.getByRole('button', { name: 'Data Table Demo' }).click();
		await page.getByRole('button', { name: 'Advanced Table' }).click();
		await page.getByRole('button', { name: 'Open filter menu' }).click();
		await page.getByRole('option', { name: 'Department' }).click();
		await page.getByRole('option', { name: 'Engineering' }).click();

		const departmentChip = page.getByRole('listitem').filter({ hasText: 'Department' });
		const engineeringChip = page.getByText('Engineering');

		await expect.element(departmentChip).toBeInTheDocument();
		await expect.element(engineeringChip).toBeInTheDocument();
	});

	it('should show selected basic faceted filter values', async () => {
		render(Page);

		await page.getByRole('button', { name: 'Data Table Demo' }).click();
		await page.getByRole('button', { name: 'Basic Table' }).click();

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
		render(Page);

		await page.getByRole('button', { name: 'Data Table Demo' }).click();
		await page.getByRole('button', { name: 'Basic Table' }).click();

		await expect
			.element(page.getByLabelText('Filter Salary').getByText('50000 - 90000'))
			.toBeInTheDocument();

		window.history.replaceState({}, '', '/');
	});

	it('should update single select filter state when changing options', async () => {
		render(Page);

		await page.getByRole('button', { name: 'Data Table Demo' }).click();
		await page.getByRole('button', { name: 'Advanced Table' }).click();
		await page.getByRole('button', { name: 'Open filter menu' }).click();
		await page.getByRole('option', { name: 'Department' }).click();
		await page.getByRole('option', { name: 'Engineering' }).click();

		const departmentChip = page.getByRole('listitem').filter({ hasText: 'Department' });
		await expect.element(page.getByText('Engineering')).toBeInTheDocument();

		await page.getByLabelText('Change Department value').click();
		await page.getByRole('option', { name: 'Finance' }).click();

		await expect
			.element(page.getByLabelText('Change Department value').getByText('Finance'))
			.toBeInTheDocument();
	});
});
