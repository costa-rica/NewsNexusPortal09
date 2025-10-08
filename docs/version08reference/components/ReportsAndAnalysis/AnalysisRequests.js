import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Table01 from "../common/Tables/Table01";
import Table02Small from "../common/Tables/Table02Small";
import { createColumnHelper } from "@tanstack/react-table";
import TemplateView from "../common/TemplateView";
import styles from "../../styles/reportsAndAnalysis/AnalysisRequests.module.css";
import { useDispatch } from "react-redux";
import { updateRequestsAnalysisTableBodyParams } from "../../reducers/user";

export default function AnalysisRequests() {
  const userReducer = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [requestsArray, setRequestsArray] = useState([]);
  // const [manualFoundCount, setManualFoundCount] = useState(0);
  const [approvedArticleStats, setApprovedArticleStats] = useState({
    countOfApprovedArticles: 0,
    countOfManuallyApprovedArticles: 0,
  });
  const [dateModified, setDateModified] = useState(false);
  const [loadingComponents, setLoadingComponents] = useState({
    table01: false,
  });
  // const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchApprovedArticles = async () => {
    try {
      setLoadingComponents((prev) => ({
        ...prev,
        table01: true,
      }));
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/table-approved-by-request`,
        {
          headers: {
            Authorization: `Bearer ${userReducer.token}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            dateRequestsLimit:
              userReducer.requestsAnalysisTableBodyParams?.dateRequestsLimit,
          }),
        }
      );

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text(); // Log response text for debugging
        throw new Error(`Server Error: ${errorText}`);
      }

      const result = await response.json();
      console.log("Fetched Data:", result);

      if (result.requestsArray && Array.isArray(result.requestsArray)) {
        setRequestsArray(result.requestsArray);
        // setSelectedRequest(result.requestsArray[0]);
        setApprovedArticleStats({
          countOfApprovedArticles: result.countOfApprovedArticles,
          countOfManuallyApprovedArticles:
            result.countOfManuallyApprovedArticles,
        });
        setDateModified(false);
      } else {
        setRequestsArray([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setRequestsArray([]);
    }
    setLoadingComponents((prev) => ({
      ...prev,
      table01: false,
    }));
  };

  const columnHelper = createColumnHelper();
  const columnsForArticlesTable = [
    columnHelper.accessor("id", {
      header: "ID",
      enableSorting: true,
      cell: ({ row }) => row.original.id,
    }),
    columnHelper.accessor("nameOfOrg", {
      header: "Name of Organization",
      enableSorting: true,
      cell: ({ row }) => row.original.nameOfOrg,
    }),
    columnHelper.display({
      header: "AND OR NOT string",
      enableSorting: true,
      cell: ({ row }) => {
        let andString = row.original.andString;
        let orString = row.original.orString;
        let notString = row.original.notString;
        return `AND: ${andString} ${orString ? "OR: " + orString : ""} ${
          notString ? "NOT: " + notString : ""
        }`;
      },
    }),
    columnHelper.accessor("includeOrExcludeDomainsString", {
      header: "Include/Exclude Domains",
      enableSorting: true,
      cell: ({ row }) => row.original.includeOrExcludeDomainsString,
    }),
    columnHelper.accessor("countOfApprovedArticles", {
      header: "Count of Approved Articles",
      enableSorting: true,
      cell: ({ row }) => row.original.countOfApprovedArticles,
    }),
  ];

  useEffect(() => {
    fetchApprovedArticles();
  }, []);

  const downloadTableSpreadsheet = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/analysis/download-excel-file/table-approved-by-request.xlsx`,
        {
          headers: {
            Authorization: `Bearer ${userReducer.token}`,
            "Content-Type": "application/json", // <-- This line was missing!
          },
          method: "POST",
          body: JSON.stringify({
            arrayToExport: requestsArray,
          }),
        }
      );
      // const response = await fetch(
      //   `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/download/table-approved-by-request`,
      //   {
      //     headers: {
      //       Authorization: `Bearer ${userReducer.token}`,
      //     },
      //   }
      // );

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error: ${errorText}`);
      }

      const contentDisposition = response.headers.get("Content-Disposition");
      let fileName = "report.xlsx";

      if (contentDisposition && contentDisposition.includes("filename=")) {
        console.log("----> Content-Disposition header:", contentDisposition);
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match && match[1]) {
          fileName = match[1];
        }
      } else {
        console.log(`---> headers: ${JSON.stringify(response.headers)}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading spreadsheet:", error.message);
    }
  };

  return (
    <TemplateView>
      <main className={styles.main}>
        <div className={styles.divMainTop}>
          <h2>Requests Analysis</h2>
          <div>
            <p>Summary of Approved Articles since:</p>
            <div className={styles.divDateInput}>
              <input
                type="date"
                value={
                  userReducer.requestsAnalysisTableBodyParams?.dateRequestsLimit
                }
                className={dateModified ? styles.inputModified : ""}
                onChange={(e) => {
                  setDateModified(true);
                  dispatch(
                    updateRequestsAnalysisTableBodyParams({
                      dateRequestsLimit: e.target.value,
                    })
                  );
                }}
              />
              {dateModified && (
                <span className={styles.spanModifiedDateText}>
                  * Refresh screen for changes to take effect
                </span>
              )}
            </div>
            <br />
            <ul>
              <li>
                Count of All Approved Articles:{" "}
                {approvedArticleStats.countOfApprovedArticles}
              </li>
              <li>
                Manually Approved Articles:{" "}
                {approvedArticleStats.countOfManuallyApprovedArticles}
              </li>
            </ul>
          </div>
          <div className={styles.divDownloadControls}>
            <button onClick={downloadTableSpreadsheet}>
              Download Table Spreadsheet
            </button>
          </div>
        </div>
        {/* <div className={styles.divMainTop}>
          <div>RequestsAnalysis</div>
          <button onClick={downloadTableSpreadsheet}>
            Download Table Spreadsheet
          </button>
        </div> */}
        <Table01
          data={requestsArray}
          columns={columnsForArticlesTable}
          //   selectedRowId={selectedRequest?.id}
          loading={loadingComponents.table01}
        />
      </main>
    </TemplateView>
  );
}
