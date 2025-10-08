import styles from "../../styles/reportsAndAnalysis/Reports.module.css";
import TemplateView from "../common/TemplateView";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import ModalYesNo from "../common/modals/ModalYesNo";
import Table01 from "../common/Tables/Table01";
import Table02Small from "../common/Tables/Table02Small";
import Table05ReportsExpandingRows from "../common/Tables/Table05ReportsExpandingRows";
import { createColumnHelper } from "@tanstack/react-table";
import { useDispatch } from "react-redux";
import { updateApprovedArticlesArray } from "../../reducers/user";
import ModalReportDate from "../common/modals/ModalReportDate";

import ModalInformation from "../common/modals/ModalInformation";
import ModalArticleRejected from "../common/modals/ModalArticleRejected";
import ModalLoading from "../common/modals/ModalLoading";
import ModalArticleReferenceNumber from "../common/modals/ModalArticleReferenceNumber";
import reportsTableDummyData from "../../reportsTableDummyData.json";

export default function Reports() {
  const userReducer = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isOpenReportType, setIsOpenReportType] = useState(false);
  const [isOpenAreYouSure, setIsOpenAreYouSure] = useState(false);
  const [reportsArray, setReportsArray] = useState([]);
  // const [reportsArrayNew, setReportsArrayNew] = useState([]);

  const [selectedReport, setSelectedReport] = useState(null);
  const [isOpenModalReportDate, setIsOpenModalReportDate] = useState(false);
  const [isOpenModalInformation, setIsOpenModalInformation] = useState(false);
  const [modalInformationContent, setModalInformationContent] = useState({
    title: "Information",
    content: "",
  });
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isOpenModalReportRejected, setIsOpenModalReportRejected] =
    useState(false);
  const [loadingComponents, setLoadingComponents] = useState({
    table01: false,
    summaryStatistics: false,
    table05ReportsExpandingRows: false,
    pageLoading: false,
  });
  const [
    isOpenModalArticleReferenceNumber,
    setIsOpenModalArticleReferenceNumber,
  ] = useState(false);
  const [loadingTimes, setLoadingTimes] = useState({
    timeToRenderResponseFromApiInSeconds: "refresh ?",
    timeToRenderTable01InSeconds: "refresh ?",
  });
  useEffect(() => {
    fetchReportsArray();
    if (userReducer?.approvedArticlesArray?.length === 0) {
      fetchApprovedArticlesArray();
    }
    // fetchReportsArrayNew();
  }, []);

  // const displayReportIdArray = () => {
  //   console.log(
  //     reportsArrayNew[0].reportsArray[0].ArticleReportContracts.map(
  //       (article) => article.id
  //     )
  //   );
  // };

  // This is what we had before
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

  const fetchReportZipFile = async (reportId) => {
    console.log(`Fetching report zip file for report ID: ${reportId}`);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/download/${reportId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userReducer.token}`,
          },
        }
      );

      if (response.status !== 200) {
        console.log(`There was a server error: ${response.status}`);
        return;
      }

      // Extract filename from Content-Disposition header
      const disposition = response.headers.get("Content-Disposition");
      let filename = "report.zip";
      // console.log(response.headers);
      if (disposition && disposition.includes("filename=")) {
        // console.log(`----> Filename: ${disposition}`);
        filename = disposition
          .split("filename=")[1]
          .replace(/['"]/g, "")
          .trim();
      } else {
        console.log(`----> Filename not found in header`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  const createReport = async () => {
    setLoadingComponents((prev) => ({
      ...prev,
      pageLoading: true,
    }));
    const articlesIdArrayForReport = userReducer.approvedArticlesArray
      .filter((article) => article.stageArticleForReport)
      .map((article) => article.id);
    const bodyObj = { articlesIdArrayForReport };
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userReducer.token}`,
          },
          body: JSON.stringify(bodyObj),
        }
      );

      let resJson = null;
      try {
        resJson = await response.json();
      } catch (e) {
        console.warn("Could not parse JSON response:", e);
        setLoadingComponents((prev) => ({
          ...prev,
          pageLoading: false,
        }));
        return;
      }
      if (response.status !== 200) {
        if (resJson?.error) {
          setIsOpenModalInformation(true);
          setModalInformationContent({
            title: "Error Creating Report",
            content: resJson.error,
          });
        } else {
          console.log(`${response.status}`);
        }
        // return;
      } else {
        alert("Report created successfully!");
      }
      fetchReportsArray();
    } catch (error) {
      console.error("Error creating report:", error);
    }
    setLoadingComponents((prev) => ({
      ...prev,
      pageLoading: false,
    }));
  };
  const handleDelete = async (reportId) => {
    // if (window.confirm("Are you sure you want to delete this report?")) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/${reportId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userReducer.token}`,
          },
        }
      );

      if (response.status !== 200) {
        console.log(`There was a server error: ${response.status}`);
        // return;
      }

      // alert("Report deleted successfully!");
      fetchReportsArray();
    } catch (error) {
      console.error("Error deleting report:", error);
    }
    // }
  };

  // Top Right Table
  const fetchApprovedArticlesArray = async () => {
    setLoadingTimes((prev) => ({
      ...prev,
      timeToRenderResponseFromApiInSeconds: "loading...",
      timeToRenderTable01InSeconds: "loading...",
    }));
    let startTime = null;

    setLoadingComponents((prev) => ({
      ...prev,
      table01: true,
    }));
    console.log("Fetching approved articles array...");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/approved`,
        {
          headers: { Authorization: `Bearer ${userReducer.token}` },
        }
      );

      // console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error: ${errorText}`);
      }

      const result = await response.json();
      // console.log("Fetched Data:", result);

      setLoadingTimes((prev) => ({
        ...prev,
        timeToRenderResponseFromApiInSeconds: `${result.timeToRenderResponseFromApiInSeconds.toFixed(
          1
        )} s`,
      }));
      if (result.articlesArray && Array.isArray(result.articlesArray)) {
        let tempArray = result.articlesArray;
        tempArray.forEach((article) => {
          // article.includeInReport = false;
          article.stageArticleForReport = false;
        });
        // setApprovedArticlesArray(tempArray);
        dispatch(updateApprovedArticlesArray(tempArray));
        console.log("-- articles result.articlesArray --");
        console.log(tempArray);
      } else {
        // setApprovedArticlesArray([]);
        dispatch(updateApprovedArticlesArray([]));
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setApprovedArticlesArray([]);
    }
    console.log("Approved articles array fetched successfully!");
    setLoadingComponents((prev) => ({
      ...prev,
      table01: false,
    }));
    const loadTimeLabel = `${
      startTime ? ((Date.now() - startTime) / 1000).toFixed(1) : 0
    } s`;
    setLoadingTimes((prev) => ({
      ...prev,
      timeToRenderTable01InSeconds: loadTimeLabel,
    }));
  };

  const updateStagedArticlesTableWithReportArticles = (articlesIdArray) => {
    const articles = userReducer.approvedArticlesArray;

    const updatedArray = articles.map((article) => {
      if (articlesIdArray.includes(article.id)) {
        return {
          ...article,
          stageArticleForReport: true,
        };
      }
      return {
        ...article,
        stageArticleForReport: false,
      };
    });

    dispatch(updateApprovedArticlesArray(updatedArray));
  };

  const sendNewReportDate = async (dateSubmittedToClient) => {
    // console.log(dateSubmittedToClient);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/update-submitted-to-client-date/${selectedReport.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userReducer.token}`,
          },
          body: JSON.stringify({ dateSubmittedToClient }),
        }
      );

      if (response.status !== 200) {
        console.log(`There was a server error: ${response.status}`);
        return;
      }

      alert("Report date updated successfully!");
      fetchReportsArray();
    } catch (error) {
      console.error("Error updating report date:", error);
    }
  };

  // Table: Reports (top left)
  const columnHelper = createColumnHelper();

  // Table: Approved Articles (Bottom)
  const columnsApprovedArticles = [
    columnHelper.accessor("id", {
      header: "ID",
      enableSorting: true,
      cell: ({ row }) => (
        <div className={styles.divColumnValue}>{row.original.id}</div>
      ),
    }),
    columnHelper.accessor("articleReferenceNumberInReport", {
      header: "Ref #",
      enableSorting: true,
      cell: ({ row }) => (
        <div className={styles.divColumnValue}>
          <button
            onClick={() => {
              setSelectedArticle(row.original);
              setIsOpenModalArticleReferenceNumber(true);
            }}
            style={{
              fontSize: "10px",
              width: "100%",
            }}
          >
            {/* {row.original.ArticleReportContracts?.[0]
              .articleReferenceNumberInReport || "Missing Ref #"} */}
            {row.original.ArticleReportContracts?.length > 0
              ? row.original.ArticleReportContracts[0]
                  .articleReferenceNumberInReport
              : "Missing Ref #"}
          </button>
        </div>
      ),
    }),
    columnHelper.accessor("isSubmitted", {
      header: "Submitted",
      enableSorting: true,
      cell: ({ row }) => (
        <div className={styles.divColumnValue}>{row.original.isSubmitted}</div>
      ),
    }),
    columnHelper.accessor("title", {
      header: "Headline",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="tooltipWrapper">
          <div className={styles.divColumnValueTitle}>
            {row.original.title.substring(0, 20)}
          </div>
          <span className="tooltipText">{row.original.title}</span>
        </div>
      ),
    }),
    columnHelper.accessor("ArticleReportContracts", {
      header: "Accepted",
      enableSorting: true,
      cell: ({ row }) => (
        <div className={styles.divColumnValue}>
          <button
            onClick={() => {
              setSelectedArticle(row.original);
              setIsOpenModalReportRejected(true);
            }}
            className={`${styles.btn} ${
              // articleHasBeenRejectedAtLeastOnce(row.original) ? "" : "btnRed"
              row.original.articleHasBeenAcceptedByAll ? "" : "btnRed"
            }`}
          >
            {/* {articleHasBeenRejectedAtLeastOnce(row.original) ? "Yes" : "No"} */}
            {row.original.articleHasBeenAcceptedByAll ? "Yes" : "No"}
          </button>
        </div>
      ),
    }),
    columnHelper.accessor("publicationName", {
      header: "Pub Name",
      enableSorting: true,
      cell: ({ row }) => (
        <div className={styles.divColumnValueTitle}>
          {row.original.publicationName}
        </div>
      ),
    }),
    columnHelper.accessor("publishedDate", {
      header: "Pub Date",
      enableSorting: true,
      cell: ({ row }) => (
        <div className={styles.divColumnValueTitle}>
          {row.original.publishedDate.split("T")[0]}
        </div>
      ),
    }),
    columnHelper.accessor("States", {
      header: "State",
      enableSorting: true,
      cell: ({ row }) => (
        <div className={styles.divColumnValueTitle}>
          {row.original.States.length > 1
            ? row.original.States.map((state) => state.abbreviation).join(", ")
            : row.original?.States[0]?.abbreviation}
        </div>
      ),
    }),
    columnHelper.accessor("stageArticleForReport", {
      header: "Stage",
      enableSorting: false,
      cell: ({ row }) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            className={
              row.original.stageArticleForReport
                ? styles.radioButtonActive
                : styles.radioButtonInactive
            }
            onClick={() => {
              const updatedArray = userReducer?.approvedArticlesArray.map(
                (article) =>
                  article.id === row.original.id
                    ? {
                        ...article,
                        stageArticleForReport: !article.stageArticleForReport,
                      }
                    : article
              );
              // setApprovedArticlesArray(updatedArray);
              dispatch(updateApprovedArticlesArray(updatedArray));
            }}
          />
        </div>
      ),
    }),
  ];
  // Table: Staged Articles (Bottom)
  const columnsStagedArticles = [
    columnHelper.accessor("id", {
      header: "ID",
      enableSorting: true,
      cell: ({ row }) => (
        <div className={styles.divColumnValue}>{row.original.id}</div>
      ),
    }),
    columnHelper.accessor("articleReferenceNumberInReport", {
      header: "Ref #",
      enableSorting: true,
      cell: ({ row }) => (
        <div className={styles.divColumnValue}>
          <button
            onClick={() => {
              setSelectedArticle(row.original);

              setIsOpenModalArticleReferenceNumber(true);
            }}
            style={{
              fontSize: "10px",
              width: "100%",
            }}
          >
            {/* {row.original.ArticleReportContracts?.[0]
              .articleReferenceNumberInReport || "Missing Ref #"} */}
            {row.original.ArticleReportContracts?.length > 0
              ? row.original.ArticleReportContracts[0]
                  .articleReferenceNumberInReport
              : "Missing Ref #"}
          </button>
        </div>
      ),
    }),

    columnHelper.accessor("isSubmitted", {
      header: "Submitted",
      enableSorting: true,
      cell: ({ row }) => (
        <div className={styles.divColumnValue}>{row.original.isSubmitted}</div>
      ),
    }),
    columnHelper.accessor("title", {
      header: "Headline",
      enableSorting: true,
      cell: ({ row }) => (
        <div className="tooltipWrapper">
          <div className={styles.divColumnValueTitle}>
            {row.original.title.substring(0, 20)}
          </div>
          <span className="tooltipText">{row.original.title}</span>
        </div>
      ),
    }),
    columnHelper.accessor("ArticleReportContracts", {
      header: "Accepted",
      enableSorting: true,
      cell: ({ row }) => (
        <div className={styles.divColumnValue}>
          <button
            onClick={() => {
              setSelectedArticle(row.original);
              setIsOpenModalReportRejected(true);
            }}
            className={`${styles.btn} ${
              // articleHasBeenRejectedAtLeastOnce(row.original) ? "" : "btnRed"
              row.original.articleHasBeenAcceptedByAll ? "" : "btnRed"
            }`}
          >
            {/* {articleHasBeenRejectedAtLeastOnce(row.original) ? "Yes" : "No"} */}
            {row.original.articleHasBeenAcceptedByAll ? "Yes" : "No"}
          </button>
        </div>
      ),
    }),

    columnHelper.accessor("stateAbbreviation", {
      header: "State",
      enableSorting: true,
      cell: ({ row }) => (
        <div className={styles.divColumnValueTitle}>
          {row.original.stateAbbreviation}
          {/* {row.original.States.length > 1
            ? row.original.States.map((state) => state.abbreviation).join(", ")
            : row.original?.States[0]?.abbreviation} */}
        </div>
      ),
    }),
  ];

  const toggleStageForNotInReport = () => {
    const articles = userReducer.approvedArticlesArray;

    const allNotInReportAreSelected = articles
      .filter((a) => a.ArticleReportContracts.length === 0)
      .every((a) => a.stageArticleForReport);

    const updatedArray = articles.map((article) => {
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

  const handleRecreateReport = async (reportId) => {
    // alert(JSON.stringify(info.row.original, null, 2));
    setLoadingComponents((prev) => ({
      ...prev,
      pageLoading: true,
    }));
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/recreate/${reportId}`,
        {
          headers: { Authorization: `Bearer ${userReducer.token}` },
        }
      );

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error: ${errorText}`);
      }
      const resJson = await response.json();
      // console.log(resJson);
      fetchReportsArray();
      setIsOpenModalInformation(true);
      setModalInformationContent({
        title: "Report Recreated",
        content: `Report ID ${resJson.newReportId} successfully created. This is an updated version of the Report ID ${resJson.originalReportId} submitted on ${resJson.originalReportSubmittedDate}.`,
      });
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
    setLoadingComponents((prev) => ({
      ...prev,
      pageLoading: false,
    }));
  };

  return (
    <TemplateView>
      <ModalLoading isVisible={loadingComponents.pageLoading} />
      <main className={styles.main}>
        <div className={styles.divMainSub}>
          <h1>Create Report</h1>
          <div className={styles.divTop}>
            <div className={styles.divTopLeft}>
              <div className={styles.divReportTable}>
                <Table05ReportsExpandingRows
                  data={reportsArray}
                  updateStagedArticlesTableWithReportArticles={
                    updateStagedArticlesTableWithReportArticles
                  }
                  setIsOpenModalReportDate={setIsOpenModalReportDate}
                  setSelectedReport={setSelectedReport}
                  fetchReportZipFile={fetchReportZipFile}
                  handleRecreateReport={handleRecreateReport}
                  setIsOpenAreYouSure={setIsOpenAreYouSure}
                  loading={loadingComponents.table05ReportsExpandingRows}
                />
              </div>
            </div>
            <div className={styles.divTopRight}>
              <div className={styles.divStagedArticles}>
                <h3>
                  Staged Articles (count:{" "}
                  {
                    userReducer?.approvedArticlesArray?.filter(
                      (article) => article.stageArticleForReport
                    ).length
                  }
                  )
                </h3>
                {userReducer?.approvedArticlesArray?.length > 0 && (
                  <Table02Small
                    columns={columnsStagedArticles}
                    data={userReducer?.approvedArticlesArray?.filter(
                      (article) => article.stageArticleForReport
                    )}
                  />
                )}
              </div>
            </div>
          </div>

          <div className={styles.divBottom}>
            <div className={styles.divRequestTableParameters}>
              <button
                className={styles.btnSubmit}
                onClick={() => {
                  fetchApprovedArticlesArray();
                }}
              >
                Refresh
              </button>
              <div className={styles.divParametersDetailLoadingStatistics}>
                <div className={styles.divParametersDetailLoadingStatisticsRow}>
                  <span className={styles.lblParametersDetailTimes}>
                    Time to get table data (API):{" "}
                  </span>
                  <span className={styles.lblParametersDetailTimes}>
                    {loadingTimes.timeToRenderResponseFromApiInSeconds}
                  </span>
                </div>
                <div className={styles.divParametersDetailLoadingStatisticsRow}>
                  <div className={styles.lblParametersDetailTimes}>
                    Time to load table (Website):{" "}
                  </div>
                  <div className={styles.lblParametersDetailTimes}>
                    {loadingTimes.timeToRenderTable01InSeconds}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.divApprovedArticlesHeader}>
              <h3>
                Approved Articles (count:{" "}
                {userReducer?.approvedArticlesArray?.length})
              </h3>
              <div className={styles.divApprovedArticlesActions}>
                <button
                  className={`${styles.btnSubmit} ${
                    userReducer.approvedArticlesArray?.length > 0 &&
                    userReducer.approvedArticlesArray.every(
                      (article) => article.stageArticleForReport
                    )
                      ? "btnOpaque"
                      : ""
                  }`}
                  onClick={() => {
                    const allSelected = userReducer.approvedArticlesArray.every(
                      (article) => article.stageArticleForReport
                    );

                    const updatedArray = userReducer.approvedArticlesArray.map(
                      (article) => ({
                        ...article,
                        stageArticleForReport: !allSelected, // toggle based on current state
                      })
                    );

                    dispatch(updateApprovedArticlesArray(updatedArray));
                  }}
                >
                  {userReducer.approvedArticlesArray?.length > 0 &&
                  userReducer.approvedArticlesArray.every(
                    (article) => article.stageArticleForReport
                  )
                    ? "Unselect All"
                    : "Select All"}
                </button>
                <button
                  className={styles.btnSubmit}
                  onClick={toggleStageForNotInReport}
                >
                  {userReducer.approvedArticlesArray
                    ?.filter((a) => a.ArticleReportContracts.length === 0)
                    .every((a) => a.stageArticleForReport)
                    ? "Unselect All Not in a Report"
                    : "Select All Not in a Report"}
                </button>
                <button
                  className={styles.btnCreate}
                  onClick={() => setIsOpenReportType(true)}
                >
                  Create Report
                </button>
              </div>
            </div>

            {userReducer?.approvedArticlesArray?.length > 0 && (
              <Table01
                columns={columnsApprovedArticles}
                data={userReducer?.approvedArticlesArray}
                loading={loadingComponents.table01}
              />
            )}
          </div>
        </div>
      </main>
      {isOpenReportType && (
        <ModalYesNo
          isModalOpenSetter={setIsOpenReportType}
          title="Report Type"
          content="This will create a report with all the staged articles."
          yesOptionText="Create Report"
          noOptionText="Cancel"
          handleYes={() => createReport()}
          handleNo={() => setIsOpenReportType(false)}
        />
      )}
      {isOpenAreYouSure && (
        <ModalYesNo
          isModalOpenSetter={setIsOpenAreYouSure}
          title="Are you sure?"
          content="You are about to delete a report. This action cannot be undone."
          handleYes={() => handleDelete(selectedReport.id)}
          handleNo={() => setIsOpenAreYouSure(false)}
        />
      )}
      {isOpenModalReportDate && (
        <ModalReportDate
          isModalOpenSetter={setIsOpenModalReportDate}
          title="Update Report Submission Date"
          content="Select the date the report was submitted to CPSC."
          sendNewReportDate={sendNewReportDate}
          selectedReport={selectedReport}
        />
      )}

      {isOpenModalArticleReferenceNumber && (
        <ModalArticleReferenceNumber
          isModalOpenSetter={setIsOpenModalArticleReferenceNumber}
          title="Article Reference Number"
          content="Article Reference Number Content"
          selectedArticle={selectedArticle}
          fetchApprovedArticlesArray={fetchApprovedArticlesArray}
        />
      )}
      {isOpenModalReportRejected && (
        <ModalArticleRejected
          isModalOpenSetter={setIsOpenModalReportRejected}
          title="Article Rejected Modal"
          content="Article Rejected Modal Content"
          selectedArticle={selectedArticle}
          fetchApprovedArticlesArray={fetchApprovedArticlesArray}
        />
      )}
      {/* Modal Information - used for failed report creation */}
      {isOpenModalInformation && (
        <ModalInformation
          isModalOpenSetter={setIsOpenModalInformation}
          title={modalInformationContent.title}
          content={modalInformationContent.content}
        />
      )}
    </TemplateView>
  );
}
