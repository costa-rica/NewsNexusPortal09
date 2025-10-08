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

export default function WeeklyCpsc() {
	const dispatch = useAppDispatch();
	const { token, approvedArticlesArray } = useAppSelector(
		(state) => state.user
	);
	const [reportsArray, setReportsArray] = useState([]);
	const [selectedReport, setSelectedReport] = useState<any>(null);
	const [selectedArticle, setSelectedArticle] = useState<ApprovedArticle | null>(null);
	const [loadingReports, setLoadingReports] = useState(false);
	const [isOpenModalReportDate, setIsOpenModalReportDate] = useState(false);

	useEffect(() => {
		fetchReportsArray();
		if (approvedArticlesArray?.length === 0) {
			fetchApprovedArticlesArray();
		}
	}, []);

	const fetchApprovedArticlesArray = async () => {
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
		approvedArticlesArray?.filter(
			(article) => article.stageArticleForReport
		).length || 0;

	// Update staged articles table when a report ID is clicked
	const handleUpdateStagedArticles = (articleIds: number[]) => {
		const updatedArray = approvedArticlesArray.map((article) => ({
			...article,
			stageArticleForReport: articleIds.includes(article.id),
		}));
		dispatch(updateApprovedArticlesArray(updatedArray));
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
				Create Report
			</h1>

			{/* Top Section - Two Tables Side by Side */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
				{/* Top Left - Reports Table */}
				<div className="flex flex-col gap-4">
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
							// TODO: setIsOpenModalArticleReferenceNumber(true);
							console.log("Open reference number modal for article:", article.id);
						}}
						onOpenRejectedModal={(article) => {
							setSelectedArticle(article);
							// TODO: setIsOpenModalReportRejected(true);
							console.log("Open rejected modal for article:", article.id);
						}}
					/>
				</div>
			</div>

			{/* Bottom Section - Approved Articles Table */}
			<div className="flex flex-col gap-4">
				<h2 className="text-title-md font-semibold text-gray-800 dark:text-white/90">
					Approved Articles ({approvedArticlesArray?.length || 0})
				</h2>
				<TableApprovedArticles
					data={approvedArticlesArray || []}
					onOpenReferenceNumberModal={(article) => {
						setSelectedArticle(article);
						// TODO: setIsOpenModalArticleReferenceNumber(true);
						console.log("Open reference number modal for article:", article.id);
					}}
					onOpenRejectedModal={(article) => {
						setSelectedArticle(article);
						// TODO: setIsOpenModalReportRejected(true);
						console.log("Open rejected modal for article:", article.id);
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
		</div>
	);
}
