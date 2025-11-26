<script lang="ts" generics="TData">
	import type { CellVariantProps, FileCellData } from '$lib/types/data-grid.js';
	import { getCellKey, getLineCount } from '$lib/types/data-grid.js';
	import DataGridCellWrapper from '../data-grid-cell-wrapper.svelte';
	import { PopoverContent } from '$lib/components/ui/popover/index.js';
	import { Popover as PopoverPrimitive } from 'bits-ui';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { cn } from '$lib/utils.js';
	import { toast } from 'svelte-sonner';
	import Upload from '@lucide/svelte/icons/upload';
	import X from '@lucide/svelte/icons/x';
	import FileIcon from '@lucide/svelte/icons/file';
	import FileImage from '@lucide/svelte/icons/file-image';
	import FileVideo from '@lucide/svelte/icons/file-video';
	import FileAudio from '@lucide/svelte/icons/file-audio';
	import FileText from '@lucide/svelte/icons/file-text';
	import FileArchive from '@lucide/svelte/icons/file-archive';
	import FileSpreadsheet from '@lucide/svelte/icons/file-spreadsheet';
	import Presentation from '@lucide/svelte/icons/presentation';
	import type { Component } from 'svelte';

	let {
		cell,
		table,
		rowIndex,
		columnId,
		isEditing,
		isFocused,
		isSelected,
		readOnly = false
	}: CellVariantProps<TData> = $props();

	const cellValue = $derived((cell.getValue() as FileCellData[]) ?? []);
	const cellKey = $derived(getCellKey(rowIndex, columnId));
	let prevCellKey = $state('');

	let files = $state<FileCellData[]>([]);
	let uploadingFiles = $state<Set<string>>(new Set());
	let isDraggingOver = $state(false);
	let isDragging = $state(false);
	let error = $state<string | null>(null);
	let containerRef = $state<HTMLDivElement | null>(null);
	let fileInputRef = $state<HTMLInputElement | null>(null);
	let dropzoneRef = $state<HTMLDivElement | null>(null);
	const cellOpts = $derived(cell.column.columnDef.meta?.cell);
	const sideOffset = $derived(-(containerRef?.clientHeight ?? 0));

	const fileCellOpts = $derived(cellOpts?.variant === 'file' ? cellOpts : null);
	const maxFileSize = $derived(fileCellOpts?.maxFileSize ?? 10 * 1024 * 1024);
	const maxFiles = $derived(fileCellOpts?.maxFiles ?? 10);
	const accept = $derived(fileCellOpts?.accept);
	const multiple = $derived(fileCellOpts?.multiple ?? true);

	const acceptedTypes = $derived(accept ? accept.split(',').map((t) => t.trim()) : null);

	// Sync with cell value - compare by content, not reference
	$effect(() => {
		const cv = cellValue;
		if (!isEditing) {
			// Only update if arrays differ by content (compare by id)
			const cvIds = cv.map((f) => f.id).join(',');
			const filesIds = files.map((f) => f.id).join(',');
			if (cvIds !== filesIds) {
				files = [...cv];
				error = null;
			}
		}
	});

	// Reset error when cell changes
	$effect(() => {
		if (prevCellKey !== cellKey) {
			prevCellKey = cellKey;
			error = null;
		}
	});

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
	}

	function getFileIcon(type: string): Component {
		if (type.startsWith('image/')) return FileImage;
		if (type.startsWith('video/')) return FileVideo;
		if (type.startsWith('audio/')) return FileAudio;
		if (type.includes('pdf')) return FileText;
		if (type.includes('zip') || type.includes('rar')) return FileArchive;
		if (type.includes('word') || type.includes('document') || type.includes('doc')) return FileText;
		if (type.includes('sheet') || type.includes('excel') || type.includes('xls'))
			return FileSpreadsheet;
		if (type.includes('presentation') || type.includes('powerpoint') || type.includes('ppt'))
			return Presentation;
		return FileIcon;
	}

	function validateFile(file: File): string | null {
		if (maxFileSize && file.size > maxFileSize) {
			return `File size exceeds ${formatFileSize(maxFileSize)}`;
		}
		if (acceptedTypes) {
			const fileExtension = `.${file.name.split('.').pop()}`;
			const isAccepted = acceptedTypes.some((type) => {
				if (type.endsWith('/*')) {
					const baseType = type.slice(0, -2);
					return file.type.startsWith(`${baseType}/`);
				}
				if (type.startsWith('.')) {
					return fileExtension.toLowerCase() === type.toLowerCase();
				}
				return file.type === type;
			});
			if (!isAccepted) {
				return 'File type not accepted';
			}
		}
		return null;
	}

	async function addFiles(newFiles: File[], skipUpload = false) {
		if (readOnly) return;
		error = null;

		if (maxFiles && files.length + newFiles.length > maxFiles) {
			const errorMessage = `Maximum ${maxFiles} files allowed`;
			error = errorMessage;
			toast.error(errorMessage);
			setTimeout(() => {
				error = null;
			}, 2000);
			return;
		}

		const rejectedFiles: Array<{ name: string; reason: string }> = [];
		const filesToValidate: File[] = [];

		for (const file of newFiles) {
			const validationError = validateFile(file);
			if (validationError) {
				rejectedFiles.push({ name: file.name, reason: validationError });
				continue;
			}
			filesToValidate.push(file);
		}

		if (rejectedFiles.length > 0) {
			const firstError = rejectedFiles[0];
			if (firstError) {
				error = firstError.reason;

				const truncatedName =
					firstError.name.length > 20 ? `${firstError.name.slice(0, 20)}...` : firstError.name;

				if (rejectedFiles.length === 1) {
					toast.error(firstError.reason, {
						description: `"${truncatedName}" has been rejected`
					});
				} else {
					toast.error(firstError.reason, {
						description: `"${truncatedName}" and ${rejectedFiles.length - 1} more rejected`
					});
				}

				setTimeout(() => {
					error = null;
				}, 2000);
			}
		}

		if (filesToValidate.length > 0) {
			if (!skipUpload) {
				const tempFiles = filesToValidate.map((f) => ({
					id: crypto.randomUUID(),
					name: f.name,
					size: f.size,
					type: f.type,
					url: undefined
				}));
				const filesWithTemp = [...files, ...tempFiles];
				files = filesWithTemp;

				const uploadingIds = new Set<string>(tempFiles.map((f) => f.id));
				uploadingFiles = uploadingIds;

				let uploadedFiles: FileCellData[] = [];
				const rowData = table.options.data[rowIndex];

				if (table.options.meta?.onFilesUpload && rowData) {
					try {
						uploadedFiles = await table.options.meta.onFilesUpload({
							files: filesToValidate,
							rowIndex,
							columnId,
							row: rowData
						});
					} catch (err) {
						toast.error(
							err instanceof Error
								? err.message
								: `Failed to upload ${filesToValidate.length} file${filesToValidate.length !== 1 ? 's' : ''}`
						);
						files = files.filter((f) => !uploadingIds.has(f.id));
						uploadingFiles = new Set();
						return;
					}
				} else {
					await new Promise((resolve) => setTimeout(resolve, 800));
					uploadedFiles = filesToValidate.map((f, i) => ({
						id: tempFiles[i]?.id ?? crypto.randomUUID(),
						name: f.name,
						size: f.size,
						type: f.type,
						url: URL.createObjectURL(f)
					}));
				}

				const finalFiles = filesWithTemp
					.map((f) => {
						if (uploadingIds.has(f.id)) {
							return uploadedFiles.find((uf) => uf.name === f.name) ?? f;
						}
						return f;
					})
					.filter((f) => f.url !== undefined);

				files = finalFiles;
				uploadingFiles = new Set();
				table.options.meta?.onDataUpdate?.({ rowIndex, columnId, value: finalFiles });
			} else {
				const newFilesData: FileCellData[] = filesToValidate.map((f) => ({
					id: crypto.randomUUID(),
					name: f.name,
					size: f.size,
					type: f.type,
					url: URL.createObjectURL(f)
				}));
				const updatedFiles = [...files, ...newFilesData];
				files = updatedFiles;
				table.options.meta?.onDataUpdate?.({ rowIndex, columnId, value: updatedFiles });
			}
		}
	}

	async function removeFile(fileId: string) {
		if (readOnly) return;
		error = null;

		const fileToRemove = files.find((f) => f.id === fileId);
		if (!fileToRemove) return;

		const rowData = table.options.data[rowIndex];
		if (table.options.meta?.onFilesDelete && rowData) {
			try {
				await table.options.meta.onFilesDelete({
					fileIds: [fileId],
					rowIndex,
					columnId,
					row: rowData
				});
			} catch (err) {
				toast.error(err instanceof Error ? err.message : `Failed to delete ${fileToRemove.name}`);
				return;
			}
		}

		if (fileToRemove.url?.startsWith('blob:')) {
			URL.revokeObjectURL(fileToRemove.url);
		}

		const updatedFiles = files.filter((f) => f.id !== fileId);
		files = updatedFiles;
		table.options.meta?.onDataUpdate?.({ rowIndex, columnId, value: updatedFiles });
	}

	async function clearAll() {
		if (readOnly) return;
		error = null;

		const rowData = table.options.data[rowIndex];
		if (table.options.meta?.onFilesDelete && rowData && files.length > 0) {
			try {
				await table.options.meta.onFilesDelete({
					fileIds: files.map((f) => f.id),
					rowIndex,
					columnId,
					row: rowData
				});
			} catch (err) {
				toast.error(err instanceof Error ? err.message : 'Failed to delete files');
				return;
			}
		}

		for (const file of files) {
			if (file.url?.startsWith('blob:')) {
				URL.revokeObjectURL(file.url);
			}
		}
		files = [];
		table.options.meta?.onDataUpdate?.({ rowIndex, columnId, value: [] });
	}

	function handleCellDragEnter(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		if (event.dataTransfer?.types.includes('Files')) {
			isDraggingOver = true;
		}
	}

	function handleCellDragLeave(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const x = event.clientX;
		const y = event.clientY;

		if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
			isDraggingOver = false;
		}
	}

	function handleCellDragOver(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
	}

	function handleCellDrop(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		isDraggingOver = false;

		const droppedFiles = Array.from(event.dataTransfer?.files ?? []);
		if (droppedFiles.length > 0) {
			addFiles(droppedFiles, false);
		}
	}

	function handleDropzoneDragEnter(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		isDragging = true;
	}

	function handleDropzoneDragLeave(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const x = event.clientX;
		const y = event.clientY;

		if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
			isDragging = false;
		}
	}

	function handleDropzoneDragOver(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
	}

	function handleDropzoneDrop(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		isDragging = false;

		const droppedFiles = Array.from(event.dataTransfer?.files ?? []);
		addFiles(droppedFiles, false);
	}

	function handleDropzoneClick() {
		fileInputRef?.click();
	}

	function handleDropzoneKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleDropzoneClick();
		}
	}

	function handleFileInputChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const selectedFiles = Array.from(target.files ?? []);
		addFiles(selectedFiles, false);
		target.value = '';
	}

	function handleOpenChange(isOpen: boolean) {
		if (isOpen && !readOnly) {
			error = null;
			table.options.meta?.onCellEditingStart?.(rowIndex, columnId);
		} else {
			error = null;
			table.options.meta?.onCellEditingStop?.();
		}
	}

	function handleEscapeKeyDown(event: KeyboardEvent) {
		event.stopPropagation();
	}

	function handleOpenAutoFocus(event: Event) {
		event.preventDefault();
		queueMicrotask(() => {
			dropzoneRef?.focus();
		});
	}

	function handleWrapperKeyDown(event: KeyboardEvent) {
		if (isEditing) {
			if (event.key === 'Escape') {
				event.preventDefault();
				files = [...cellValue];
				error = null;
				table.options.meta?.onCellEditingStop?.();
			} else if (event.key === ' ') {
				event.preventDefault();
				handleDropzoneClick();
			}
		} else if (isFocused && event.key === 'Enter') {
			event.preventDefault();
			table.options.meta?.onCellEditingStart?.(rowIndex, columnId);
		} else if (!isEditing && isFocused && event.key === 'Tab') {
			event.preventDefault();
			table.options.meta?.onCellEditingStop?.({
				direction: event.shiftKey ? 'left' : 'right'
			});
		}
	}

	const rowHeight = $derived(table.options.meta?.rowHeight ?? 'short');
	const lineCount = $derived(getLineCount(rowHeight));

	// Simple visible file calculation
	const maxVisibleFiles = $derived(lineCount * 2);
	const visibleFiles = $derived(files.slice(0, maxVisibleFiles));
	const hiddenFileCount = $derived(Math.max(0, files.length - maxVisibleFiles));
</script>

<DataGridCellWrapper
	bind:wrapperRef={containerRef}
	{cell}
	{table}
	{rowIndex}
	{columnId}
	{isEditing}
	{isFocused}
	{isSelected}
	class={cn({
		'ring-1 ring-primary/80 ring-inset': isDraggingOver
	})}
	ondragenter={handleCellDragEnter}
	ondragleave={handleCellDragLeave}
	ondragover={handleCellDragOver}
	ondrop={handleCellDrop}
	onkeydown={handleWrapperKeyDown}
>
	{#if isEditing}
		<PopoverPrimitive.Root open={isEditing} onOpenChange={handleOpenChange}>
			<PopoverContent
				data-grid-cell-editor=""
				align="start"
				sideOffset={sideOffset}
				class="w-[400px] rounded-none p-0"
				onkeydown={handleEscapeKeyDown}
				onOpenAutoFocus={handleOpenAutoFocus}
				customAnchor={containerRef}
			>
				<div class="flex flex-col gap-2 p-3">
					<span class="sr-only">File upload</span>
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<div
						role="region"
						aria-invalid={!!error}
						data-dragging={isDragging ? '' : undefined}
						data-invalid={error ? '' : undefined}
						tabindex={isDragging ? -1 : 0}
						class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 outline-none transition-colors hover:bg-accent/30 focus-visible:border-ring/50 data-[dragging]:border-primary/30 data-[invalid]:border-destructive data-[dragging]:bg-accent/30 data-[invalid]:ring-destructive/20"
						bind:this={dropzoneRef}
						onclick={handleDropzoneClick}
						ondragenter={handleDropzoneDragEnter}
						ondragleave={handleDropzoneDragLeave}
						ondragover={handleDropzoneDragOver}
						ondrop={handleDropzoneDrop}
						onkeydown={handleDropzoneKeyDown}
					>
						<Upload class="size-8 text-muted-foreground" />
						<div class="text-center text-sm">
							<p class="font-medium">
								{isDragging ? 'Drop files here' : 'Drag files here'}
							</p>
							<p class="text-muted-foreground text-xs">or click to browse</p>
						</div>
						<p class="text-muted-foreground text-xs">
							{maxFileSize
								? `Max size: ${formatFileSize(maxFileSize)}${maxFiles ? ` • Max ${maxFiles} files` : ''}`
								: maxFiles
									? `Max ${maxFiles} files`
									: 'Select files to upload'}
						</p>
					</div>
					<input
						type="file"
						{multiple}
						{accept}
						class="sr-only"
						bind:this={fileInputRef}
						onchange={handleFileInputChange}
					/>
					{#if files.length > 0}
						<div class="flex flex-col gap-2">
							<div class="flex items-center justify-between">
								<p class="font-medium text-muted-foreground text-xs">
									{files.length}
									{files.length === 1 ? 'file' : 'files'}
								</p>
								<Button
									type="button"
									variant="ghost"
									size="sm"
									class="h-6 text-muted-foreground text-xs"
									onclick={clearAll}
								>
									Clear all
								</Button>
							</div>
							<div class="max-h-[200px] space-y-1 overflow-y-auto">
								{#each files as file (file.id)}
									{@const FileIcon = getFileIcon(file.type)}
									<div class="flex items-center gap-2 rounded-md border bg-muted/50 px-2 py-1.5">
										<FileIcon class="size-4 shrink-0 text-muted-foreground" />
										<div class="flex-1 overflow-hidden">
											<p class="truncate text-sm">{file.name}</p>
											<p class="text-muted-foreground text-xs">{formatFileSize(file.size)}</p>
										</div>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											class="size-5 rounded-sm"
											onclick={() => removeFile(file.id)}
										>
											<X class="size-3" />
										</Button>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			</PopoverContent>
		</PopoverPrimitive.Root>
	{/if}
	{#if isDraggingOver}
		<div class="flex items-center justify-center gap-2 text-primary text-sm">
			<Upload class="size-4" />
			<span>Drop files here</span>
		</div>
	{:else if files.length > 0}
		<div class="flex flex-wrap items-center gap-1 overflow-hidden">
			{#each visibleFiles as file (file.id)}
				{@const isUploading = uploadingFiles.has(file.id)}
				{#if isUploading}
					<Skeleton
						class="h-5 shrink-0 px-1.5"
						style="width: {Math.min(file.name.length * 8 + 30, 100)}px"
					/>
				{:else}
					{@const FileIcon = getFileIcon(file.type)}
					<Badge variant="secondary" class="h-5 shrink-0 gap-1 px-1.5 text-xs">
						<FileIcon class="size-3 shrink-0" />
						<span class="max-w-[100px] truncate">{file.name}</span>
					</Badge>
				{/if}
			{/each}
			{#if hiddenFileCount > 0}
				<Badge variant="outline" class="h-5 shrink-0 px-1.5 text-muted-foreground text-xs">
					+{hiddenFileCount}
				</Badge>
			{/if}
		</div>
	{/if}
</DataGridCellWrapper>
