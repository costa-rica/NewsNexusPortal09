"use client";
import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { updateApprovedArticlesArray } from "@/store/features/user/userSlice";
import TableReportsWeeklyCpsc from "@/components/tables/TableReportsWeeklyCpsc";
import TableReportWeeklyCpscStagedArticles from "@/components/tables/TableReportWeeklyCpscStagedArticles";
import TableApprovedArticles from "@/components/tables/TableApprovedArticles";
import { ApprovedArticle } from "@/types/article";
import { Modal } from "@/components/ui/modal";
import { ModalReportDateContent } from "@/components/ui/modal/ModalReportDateContent";
import { ModalArticleReferenceNumberContent } from "@/components/ui/modal/ModalArticleReferenceNumberContent";
import { ModalArticleRejectionStatus } from "@/components/ui/modal/ModalArticleRejectionStatus";

export default function WeeklyCpsc() {
	const dispatch = useAppDispatch();
	const { token, approvedArticlesArray } = useAppSelector(
		(state) => state.user
	);
	const [reportsArray, setReportsArray] = useState([]);
	const [selectedReport, setSelectedReport] = useState<any>(null);
	const [selectedArticle, setSelectedArticle] =
		useState<ApprovedArticle | null>(null);
	const [loadingReports, setLoadingReports] = useState(false);
	const [isLoadingApprovedArticles, setIsLoadingApprovedArticles] =
		useState(false);
	const [isOpenModalReportDate, setIsOpenModalReportDate] = useState(false);
	const [
		isOpenModalArticleReferenceNumber,
		setIsOpenModalArticleReferenceNumber,
	] = useState(false);
	const [
		isOpenModalArticleRejectionStatus,
		setIsOpenModalArticleRejectionStatus,
	] = useState(false);

	useEffect(() => {
		fetchReportsArray();
		if (approvedArticlesArray?.length === 0) {
			fetchApprovedArticlesArray();
		}
	}, []);

	const fetchApprovedArticlesArray = async () => {
		setIsLoadingApprovedArticles(true);
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/approved`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Server Error: ${errorText}`);
			}

			const result = await response.json();

			if (result.articlesArray && Array.isArray(result.articlesArray)) {
				const tempArray = result.articlesArray.map((article: any) => ({
					...article,
					stageArticleForReport: false,
				}));
				dispatch(updateApprovedArticlesArray(tempArray));
			} else {
				dispatch(updateApprovedArticlesArray([]));
			}
		} catch (error) {
			console.error("Error fetching approved articles:", error);
			dispatch(updateApprovedArticlesArray([]));
		} finally {
			setIsLoadingApprovedArticles(false);
		}
	};

	const fetchReportsArray = async () => {
		setLoadingReports(true);
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Server Error: ${errorText}`);
			}

			const resJson = await response.json();
			setReportsArray(resJson.reportsArrayByCrName || []);
		} catch (error) {
			console.error("Error fetching reports:", error);
			setReportsArray([]);
		} finally {
			setLoadingReports(false);
		}
	};

	const stagedArticlesCount =
		approvedArticlesArray?.filter((article) => article.stageArticleForReport)
			.length || 0;

	// Update staged articles table when a report ID is clicked
	const handleUpdateStagedArticles = (articleIds: number[]) => {
		const updatedArray = approvedArticlesArray.map((article) => ({
			...article,
			stageArticleForReport: articleIds.includes(article.id),
		}));
		dispatch(updateApprovedArticlesArray(updatedArray));
	};

	// Toggle select all articles
	const handleSelectAll = () => {
		const allSelected = approvedArticlesArray.every(
			(article) => article.stageArticleForReport
		);

		const updatedArray = approvedArticlesArray.map((article) => ({
			...article,
			stageArticleForReport: !allSelected,
		}));

		dispatch(updateApprovedArticlesArray(updatedArray));
	};

	// Toggle select all articles not in any report
	const handleSelectAllNotInReport = () => {
		const articlesNotInReport = approvedArticlesArray.filter(
			(a) => a.ArticleReportContracts.length === 0
		);

		const allNotInReportAreSelected = articlesNotInReport.every(
			(a) => a.stageArticleForReport
		);

		const updatedArray = approvedArticlesArray.map((article) => {
			if (article.ArticleReportContracts.length === 0) {
				return {
					...article,
					stageArticleForReport: !allNotInReportAreSelected,
				};
			}
			return article;
		});

		dispatch(updateApprovedArticlesArray(updatedArray));
	};

	// Create report with staged articles
	const handleCreateReport = async () => {
		if (
			!window.confirm(
				"This will create a report with all the staged articles. Continue?"
			)
		) {
			return;
		}

		setLoadingReports(true);
		const articlesIdArrayForReport = approvedArticlesArray
			.filter((article) => article.stageArticleForReport)
			.map((article) => article.id);

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/create`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ articlesIdArrayForReport }),
				}
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Server Error: ${errorText}`);
			}

			const resJson = await response.json();

			if (resJson?.error) {
				alert(`Error Creating Report: ${resJson.error}`);
			} else {
				alert("Report created successfully!");
			}

			fetchReportsArray();
		} catch (error) {
			console.error("Error creating report:", error);
			alert("Error creating report. Please try again.");
		} finally {
			setLoadingReports(false);
		}
	};

	// Open date modal for editing submission date
	const handleOpenDateModal = (report: any) => {
		setSelectedReport(report);
		setIsOpenModalReportDate(true);
	};

	// Update report submission date
	const handleUpdateReportDate = async (dateSubmittedToClient: string) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/update-submitted-to-client-date/${selectedReport.id}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ dateSubmittedToClient }),
				}
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Server Error: ${errorText}`);
			}

			alert("Report date updated successfully!");
			setIsOpenModalReportDate(false);
			fetchReportsArray();
		} catch (error) {
			console.error("Error updating report date:", error);
			alert("Error updating report date. Please try again.");
		}
	};

	// Download report zip file
	const handleDownloadReport = async (reportId: number) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/download/${reportId}`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Server Error: ${errorText}`);
			}

			// Extract filename from Content-Disposition header
			const disposition = response.headers.get("Content-Disposition");
			let filename = "report.zip";
			if (disposition && disposition.includes("filename=")) {
				filename = disposition
					.split("filename=")[1]
					.replace(/['"]/g, "")
					.trim();
			}

			// Download the file
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		} catch (error) {
			console.error("Error downloading report:", error);
			alert("Error downloading report. Please try again.");
		}
	};

	// Recreate report (create new version)
	const handleRecreateReport = async (reportId: number) => {
		setLoadingReports(true);
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/recreate/${reportId}`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Server Error: ${errorText}`);
			}

			const resJson = await response.json();

			// Show success message with details
			alert(
				`Report ID ${resJson.newReportId} successfully created. This is an updated version of the Report ID ${resJson.originalReportId} submitted on ${resJson.originalReportSubmittedDate}.`
			);

			// Refresh the reports list
			fetchReportsArray();
		} catch (error) {
			console.error("Error recreating report:", error);
			alert("Error recreating report. Please try again.");
		} finally {
			setLoadingReports(false);
		}
	};

	// Delete report
	const handleDeleteReport = async (report: any) => {
		if (
			!window.confirm(
				"Are you sure you want to delete this report? This action cannot be undone."
			)
		) {
			return;
		}

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/${report.id}`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Server Error: ${errorText}`);
			}

			alert("Report deleted successfully!");

			// Refresh the reports list
			fetchReportsArray();
		} catch (error) {
			console.error("Error deleting report:", error);
			alert("Error deleting report. Please try again.");
		}
	};

	return (
		<div className="flex flex-col gap-4 md:gap-6">
			<h1 className="text-title-xl text-gray-700 dark:text-gray-300">
				CPSC Weekly Reports
			</h1>

			{/* Top Section - Two Tables Side by Side */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
				{/* Top Left - Reports Table */}
				<div className="flex flex-col gap-4">
					<h2 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
						Reports ({reportsArray?.length || 0})
					</h2>
					<TableReportsWeeklyCpsc
						data={reportsArray}
						loading={loadingReports}
						onUpdateStagedArticles={handleUpdateStagedArticles}
						onOpenDateModal={handleOpenDateModal}
						onDownloadReport={handleDownloadReport}
						onRecreateReport={handleRecreateReport}
						onDeleteReport={handleDeleteReport}
					/>
				</div>

				{/* Top Right - Staged Articles Table */}
				<div className="flex flex-col gap-4">
					<h2 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
						Staged Articles ({stagedArticlesCount})
					</h2>
					<TableReportWeeklyCpscStagedArticles
						data={
							approvedArticlesArray?.filter(
								(article) => article.stageArticleForReport
							) || []
						}
						onOpenReferenceNumberModal={(article) => {
							setSelectedArticle(article);
							setIsOpenModalArticleReferenceNumber(true);
						}}
						onOpenRejectedModal={(article) => {
							setSelectedArticle(article);
							setIsOpenModalArticleRejectionStatus(true);
						}}
					/>
				</div>
			</div>

			{/* Bottom Section - Approved Articles Table */}
			<div className="flex flex-col gap-4">
				<h2 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
					Approved Articles ({approvedArticlesArray?.length || 0})
				</h2>

				{/* Action Buttons Row */}
				<div className="flex items-center justify-between gap-4">
					{/* Left side - Refresh */}
					<button
						onClick={fetchApprovedArticlesArray}
						className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
					>
						Refresh
					</button>

					{/* Right side - Select All, Select All Not in Report, Create Report */}
					<div className="flex items-center gap-3">
						<button
							onClick={handleSelectAll}
							className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
						>
							{approvedArticlesArray?.length > 0 &&
							approvedArticlesArray.every(
								(article) => article.stageArticleForReport
							)
								? "Unselect All"
								: "Select All"}
						</button>

						<button
							onClick={handleSelectAllNotInReport}
							className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
						>
							{approvedArticlesArray
								?.filter((a) => a.ArticleReportContracts.length === 0)
								.every((a) => a.stageArticleForReport)
								? "Unselect All Not in a Report"
								: "Select All Not in a Report"}
						</button>

						<button
							onClick={handleCreateReport}
							disabled={stagedArticlesCount === 0}
							className="px-4 py-2 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors dark:bg-brand-600 dark:hover:bg-brand-700"
						>
							Create Report
						</button>
					</div>
				</div>

				<TableApprovedArticles
					data={approvedArticlesArray || []}
					loading={isLoadingApprovedArticles}
					onOpenReferenceNumberModal={(article) => {
						setSelectedArticle(article);
						setIsOpenModalArticleReferenceNumber(true);
					}}
					onOpenRejectedModal={(article) => {
						setSelectedArticle(article);
						setIsOpenModalArticleRejectionStatus(true);
					}}
					onToggleStage={(articleId) => {
						const updatedArray = approvedArticlesArray.map((article) =>
							article.id === articleId
								? {
										...article,
										stageArticleForReport: !article.stageArticleForReport,
								  }
								: article
						);
						dispatch(updateApprovedArticlesArray(updatedArray));
					}}
				/>
			</div>

			{/* Modals */}
			{isOpenModalReportDate && selectedReport && (
				<Modal
					isOpen={isOpenModalReportDate}
					onClose={() => setIsOpenModalReportDate(false)}
				>
					<ModalReportDateContent
						selectedReport={selectedReport}
						onSubmit={handleUpdateReportDate}
					/>
				</Modal>
			)}

			{isOpenModalArticleReferenceNumber && selectedArticle && token && (
				<Modal
					isOpen={isOpenModalArticleReferenceNumber}
					onClose={() => setIsOpenModalArticleReferenceNumber(false)}
				>
					<ModalArticleReferenceNumberContent
						selectedArticle={selectedArticle}
						token={token}
						onClose={() => setIsOpenModalArticleReferenceNumber(false)}
						onRefresh={fetchApprovedArticlesArray}
					/>
				</Modal>
			)}

			{isOpenModalArticleRejectionStatus && selectedArticle && token && (
				<Modal
					isOpen={isOpenModalArticleRejectionStatus}
					onClose={() => setIsOpenModalArticleRejectionStatus(false)}
				>
					<ModalArticleRejectionStatus
						selectedArticle={selectedArticle}
						token={token}
						onClose={() => setIsOpenModalArticleRejectionStatus(false)}
						onRefresh={fetchApprovedArticlesArray}
					/>
				</Modal>
			)}
		</div>
	);
}
