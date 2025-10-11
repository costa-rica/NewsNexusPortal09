"use client";
import React, { useState, useMemo } from "react";
import {
	useReactTable,
	getCoreRowModel,
	getPaginationRowModel,
	getFilteredRowModel,
	getSortedRowModel,
	flexRender,
	createColumnHelper,
	ColumnDef,
	PaginationState,
	SortingState,
} from "@tanstack/react-table";
import { LoadingDots } from "../common/LoadingDots";

export interface Report {
	id: number;
	dateSubmittedToClient: string | null;
	ArticleReportContracts: Array<{
		articleId: number;
		articleReferenceNumberInReport: string;
	}>;
	selected: boolean;
}

interface ReportGroup {
	crName: string;
	reportsArray: Report[];
}

// Create columnHelper outside component for stable reference
const columnHelper = createColumnHelper<Report>();

interface TableReportsWeeklyCpscSelectableRowsProps {
	data: ReportGroup[];
	loading?: boolean;
	onRowSelect: (reportId: number) => void;
}

const TableReportsWeeklyCpscSelectableRows: React.FC<
	TableReportsWeeklyCpscSelectableRowsProps
> = ({ data, loading = false, onRowSelect }) => {
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});
	const [globalFilter, setGlobalFilter] = useState("");
	const [sorting, setSorting] = useState<SortingState>([]);

	// Flatten the data structure for the table
	const flattenedData = useMemo(() => {
		const flattened: Report[] = [];
		data.forEach((group) => {
			group.reportsArray.forEach((report) => {
				flattened.push(report);
			});
		});
		return flattened;
	}, [data]);

	const columns = useMemo<ColumnDef<Report, unknown>[]>(
		() => [
			columnHelper.accessor("id", {
				header: "Report ID",
				enableSorting: true,
				cell: ({ getValue }) => (
					<div className="text-sm text-gray-800 dark:text-gray-200 font-medium">
						{getValue()}
					</div>
				),
			}),
			columnHelper.accessor("dateSubmittedToClient", {
				header: () => (
					<div className="text-center">
						<div>Date Submitted to Client</div>
						<div className="text-xs font-normal">(ET)</div>
					</div>
				),
				enableSorting: true,
				cell: ({ getValue }) => {
					const date = getValue();
					return (
						<div className="text-sm text-center text-gray-800 dark:text-gray-200">
							{date ? date.split("T")[0] : "missing value"}
						</div>
					);
				},
			}),
			columnHelper.display({
				id: "articleCount",
				header: "Article Count",
				enableSorting: true,
				cell: ({ row }) => {
					return (
						<div className="text-sm text-center text-gray-800 dark:text-gray-200">
							{row.original.ArticleReportContracts?.length || 0}
						</div>
					);
				},
			}),
		],
		[]
	);

	const table = useReactTable({
		data: flattenedData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		state: {
			pagination,
			globalFilter,
			sorting,
		},
		onPaginationChange: setPagination,
		onGlobalFilterChange: setGlobalFilter,
		onSortingChange: setSorting,
		autoResetPageIndex: false,
	});

	if (loading) {
		return (
			<div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
				<LoadingDots className="py-20" />
			</div>
		);
	}

	return (
		<div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
			{/* Table Controls */}
			<div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-gray-200 dark:border-gray-800">
				{/* Show rows */}
				<div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
					<span>Show rows:</span>
					{[5, 10, 20].map((size) => (
						<button
							key={size}
							onClick={() =>
								setPagination((prev) => ({
									...prev,
									pageSize: size,
									pageIndex: 0,
								}))
							}
							className={`px-3 py-1 rounded ${
								pagination.pageSize === size
									? "bg-brand-500 text-white"
									: "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
							}`}
						>
							{size}
						</button>
					))}
				</div>

				{/* Search */}
				<div className="flex-1 max-w-xs">
					<input
						type="text"
						value={globalFilter ?? ""}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="w-full h-9 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-theme-xs focus:outline-hidden focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
						placeholder="Search..."
					/>
				</div>

				{/* Pagination */}
				<div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
					<button
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:hover:bg-gray-700"
					>
						&lt; Prev
					</button>
					<span>
						Page {table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount()}
					</span>
					<button
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:hover:bg-gray-700"
					>
						Next &gt;
					</button>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="bg-gray-50 dark:bg-gray-800/50">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider dark:text-gray-300 cursor-pointer select-none"
										onClick={header.column.getToggleSortingHandler()}
									>
										<div className="flex items-center gap-2">
											{flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
											{header.column.getCanSort() && (
												<span className="text-gray-400">
													{{
														asc: "↑",
														desc: "↓",
													}[header.column.getIsSorted() as string] ?? "↕"}
												</span>
											)}
										</div>
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody className="divide-y divide-gray-200 dark:divide-gray-800">
						{table.getRowModel().rows.map((row) => (
							<tr
								key={row.id}
								onClick={() => onRowSelect(row.original.id)}
								className={`cursor-pointer transition-colors ${
									row.original.selected
										? "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50"
										: "hover:bg-gray-50 dark:hover:bg-gray-800/50"
								}`}
							>
								{row.getVisibleCells().map((cell) => (
									<td
										key={cell.id}
										className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200"
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* No results message */}
			{table.getRowModel().rows.length === 0 && (
				<div className="text-center py-8 text-gray-500 dark:text-gray-400">
					No reports found
				</div>
			)}
		</div>
	);
};

export default TableReportsWeeklyCpscSelectableRows;
