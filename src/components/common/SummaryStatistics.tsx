"use client";
import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateArticlesSummaryStatistics } from "@/store/features/user/userSlice";

// Inline LoadingDots component
const LoadingDots: React.FC = () => {
	return (
		<div className="flex items-center justify-center gap-2 py-20">
			<div className="w-3 h-3 bg-brand-500 rounded-full animate-[bounce_1s_ease-in-out_0s_infinite]"></div>
			<div className="w-3 h-3 bg-brand-500 rounded-full animate-[bounce_1s_ease-in-out_0.1s_infinite]"></div>
			<div className="w-3 h-3 bg-brand-500 rounded-full animate-[bounce_1s_ease-in-out_0.2s_infinite]"></div>
		</div>
	);
};

export const SummaryStatistics: React.FC = () => {
	const dispatch = useAppDispatch();
	const { token, articlesSummaryStatistics } = useAppSelector(
		(state) => state.user
	);
	const [isLoading, setIsLoading] = useState(false);

	const fetchArticlesSummaryStatistics = async () => {
		setIsLoading(true);
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/summary-statistics`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Server Error: ${errorText}`);
			}

			const result = await response.json();

			if (result.summaryStatistics) {
				dispatch(updateArticlesSummaryStatistics(result.summaryStatistics));
			}
		} catch (error) {
			console.error(
				"Error fetching articles summary statistics:",
				error instanceof Error ? error.message : error
			);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchArticlesSummaryStatistics();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (isLoading) {
		return (
			<div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
				<LoadingDots />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex gap-4 overflow-x-auto pb-2 flex-col sm:flex-row sm:flex-nowrap">
				{/* Article count */}
				<div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex-shrink-0 sm:min-w-[200px]">
					<div className="flex items-end justify-between">
						<div>
							<span className="text-sm text-gray-500 dark:text-gray-400">
								Article count
							</span>
							<h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
								{articlesSummaryStatistics?.articlesCount != null
									? articlesSummaryStatistics.articlesCount.toLocaleString()
									: "N/A"}
							</h4>
						</div>
					</div>
				</div>

				{/* Approved articles */}
				<div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex-shrink-0 sm:min-w-[200px]">
					<div className="flex items-end justify-between">
						<div className="w-full">
							<span className="text-sm text-gray-500 dark:text-gray-400">
								Approved articles
							</span>
							<h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
								{articlesSummaryStatistics?.articleIsApprovedCount != null
									? articlesSummaryStatistics.articleIsApprovedCount.toLocaleString()
									: "N/A"}
							</h4>
							<div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
								(newly approved:{" "}
								{articlesSummaryStatistics?.approvedButNotInReportCount != null
									? articlesSummaryStatistics.approvedButNotInReportCount
									: "N/A"}
								)
							</div>
						</div>
					</div>
				</div>

				{/* Articles assigned to a state */}
				<div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex-shrink-0 sm:min-w-[200px]">
					<div className="flex items-end justify-between">
						<div>
							<span className="text-sm text-gray-500 dark:text-gray-400">
								Articles assigned to a state
							</span>
							<h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
								{articlesSummaryStatistics?.articleHasStateCount != null
									? articlesSummaryStatistics.articleHasStateCount.toLocaleString()
									: "N/A"}
							</h4>
						</div>
					</div>
				</div>

				{/* Articles added this week */}
				<div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex-shrink-0 sm:min-w-[200px]">
					<div className="flex items-end justify-between">
						<div>
							<span className="text-sm text-gray-500 dark:text-gray-400">
								Articles added this week
							</span>
							<h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
								{articlesSummaryStatistics?.articlesSinceLastThursday20hEst !=
								null
									? articlesSummaryStatistics.articlesSinceLastThursday20hEst
									: "N/A"}
							</h4>
						</div>
					</div>
				</div>

				{/* Refresh button */}
				<div className="flex items-center flex-shrink-0">
					<button
						onClick={fetchArticlesSummaryStatistics}
						disabled={isLoading}
						className="rounded-lg bg-brand-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-brand-600 dark:hover:bg-brand-700 h-fit"
					>
						Refresh
					</button>
				</div>
			</div>
		</div>
	);
};
