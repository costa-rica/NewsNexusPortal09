import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Table04OptionalPagination from "../common/Tables/Table04OptionalPagination";
import { createColumnHelper } from "@tanstack/react-table";
import TemplateView from "../common/TemplateView";
import ModalLoading from "../common/modals/ModalLoading";
import styles from "../../styles/reportsAndAnalysis/AnalysisCountsByState.module.css";
import { useDispatch } from "react-redux";

export default function AnalysisDeduper() {
	const userReducer = useSelector((state) => state.user);
	const dispatch = useDispatch();
	const [loadingComponents, setLoadingComponents] = useState({
		table05ReportsExpandingRows: false,
		pageLoading: false,
	});
	const [reportsArray, setReportsArray] = useState([]);
	const fetchReportsArray = async () => {
		try {
			setLoadingComponents((prev) => ({
				...prev,
				table05ReportsExpandingRows: true,
			}));
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${userReducer.token}`,
					},
				}
			);

			if (response.status !== 200) {
				console.log(`There was a server error: ${response.status}`);
				return;
			}
			const resJson = await response.json();
			// console.log(resJson);
			setReportsArray(resJson.reportsArrayByCrName);
			// setRefreshTableWarning(false);
		} catch (error) {
			console.error("Error fetching reports:", error);
		}
		setLoadingComponents((prev) => ({
			...prev,
			table05ReportsExpandingRows: false,
		}));
	};
	useEffect(() => {
		fetchReportsArray();
	}, []);

	const fetchRequestDeduperJob = async (reportId) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE_URL}/deduper/request-job/${reportId}`,
				{
					headers: {
						Authorization: `Bearer ${userReducer.token}`,
						"Content-Type": "application/json",
					},
					method: "GET",
				}
			);

			console.log(`Response status: ${response.status}`);

			if (!response.ok) {
				const errorText = await response.text(); // Log response text for debugging
				throw new Error(`Server Error: ${errorText}`);
			}

			const result = await response.json();
			console.log("Fetched Data:", result);

			if (result.result === "true") {
				alert("Deduper job requested successfully!");
			} else {
				alert("Failed to request deduper job");
			}
		} catch (error) {
			console.error("Error fetching data:", error.message);
			// setRequestsArray([]);
		}
		setLoadingComponents((prev) => ({
			...prev,
			table01: false,
		}));
	};

	return (
		<TemplateView>
			<ModalLoading isVisible={loadingComponents.pageLoading} />
			<main className={styles.main}>
				<div className={styles.divMainTop}>
					<h2>Analysis Deduper</h2>

					<div className={styles.divDownloadControls}>
						<button onClick={() => console.log("Download Table Spreadsheet")}>
							Download Table Spreadsheet
						</button>
					</div>

					<div
						style={{
							display: "flex",
							flexDirection: "column",
							width: "50%",
							gap: "10px",
						}}
					>
						{/* TODO: map reports in descending order */}
						{reportsArray.map((report) => (
							<div key={report.id}>
								<div>{report.crName}</div>
								<div>
									{report.reportsArray.map((subreport) => (
										<div style={{ display: "flex", gap: "10px" }}>
											<div>{subreport.id}</div>
											<div>{subreport.dateSubmittedToClient.slice(0, 10)}</div>
											<button
												onClick={() => fetchRequestDeduperJob(subreport.id)}
											>
												Build report
											</button>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</main>
		</TemplateView>
	);
}
