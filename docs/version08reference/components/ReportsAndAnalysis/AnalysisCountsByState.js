import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import Table04OptionalPagination from "../common/Tables/Table04OptionalPagination";
import { createColumnHelper } from "@tanstack/react-table";
import TemplateView from "../common/TemplateView";
import styles from "../../styles/reportsAndAnalysis/AnalysisCountsByState.module.css";
import { useDispatch } from "react-redux";

export default function AnalysisCountsByState() {
  const userReducer = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [articleCountByStateArray, setArticleCountByStateArray] = useState([]);
  const [loadingComponents, setLoadingComponents] = useState({
    table01: false,
  });
  const [unassignedArticlesArray, setUnassignedArticlesArray] = useState([]);

  const fetchApprovedArticleStateCounts = async () => {
    try {
      setLoadingComponents((prev) => ({
        ...prev,
        table01: true,
      }));
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/analysis/approved-articles-by-state`,
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

      if (
        result.articleCountByStateArray &&
        Array.isArray(result.articleCountByStateArray)
      ) {
        setArticleCountByStateArray(result.articleCountByStateArray);
      } else {
        setArticleCountByStateArray([]);
      }
      if (
        result.unassignedArticlesArray &&
        Array.isArray(result.unassignedArticlesArray)
      ) {
        // alert("Found unassigned articles");
        setUnassignedArticlesArray(result.unassignedArticlesArray);
      } else {
        // alert("No unassigned articles found");
        setUnassignedArticlesArray([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setArticleCountByStateArray([]);
    }
    setLoadingComponents((prev) => ({
      ...prev,
      table01: false,
    }));
  };

  const columnHelper = createColumnHelper();
  const columnsForArticleCountByStateTable = articleCountByStateArray[0]
    ? Object.keys(articleCountByStateArray[0]).map((key) =>
        columnHelper.accessor(key, {
          header: key,
          enableSorting: true,
          cell: ({ row }) => (
            <div style={{ textAlign: key !== "State" && "center" }}>
              {row.original[key]}
            </div>
          ),
        })
      )
    : [];

  useEffect(() => {
    fetchApprovedArticleStateCounts();
  }, []);

  const downloadTableSpreadsheet = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/analysis/download-excel-file/table-approved-by-state.xlsx`,
        {
          headers: {
            Authorization: `Bearer ${userReducer.token}`,
            "Content-Type": "application/json", // <-- This line was missing!
          },
          method: "POST",
          body: JSON.stringify({
            arrayToExport: articleCountByStateArray,
          }),
        }
      );

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
          <h2>Analysis Counts by State</h2>
          {unassignedArticlesArray.length > 0 && (
            <div className={styles.divUnassignedArticles}>
              <p>Unassigned Articles: </p>
              <ul>
                {unassignedArticlesArray.map((article) => (
                  <li key={article.id}>
                    ID: {article.id} - <a href={article.url}>{article.title}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className={styles.divDownloadControls}>
            <button onClick={downloadTableSpreadsheet}>
              Download Table Spreadsheet
            </button>
          </div>
        </div>

        <Table04OptionalPagination
          data={articleCountByStateArray}
          columns={columnsForArticleCountByStateTable}
          loading={loadingComponents.table01}
          displayAll={true}
        />
      </main>
    </TemplateView>
  );
}
