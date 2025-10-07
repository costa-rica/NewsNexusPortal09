import styles from "../../styles/articles/GetArticlesDetailed.module.css";
import TemplateView from "../common/TemplateView";
import ModalInformation from "../common/modals/ModalInformation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import TableRequests from "../common/Tables/TableRequests";
import { createColumnHelper } from "@tanstack/react-table";
import SummaryStatistics from "../common/SummaryStatistics";
import { useDispatch } from "react-redux";
import ModalLoading from "../common/modals/ModalLoading";

export default function GetArticlesGNews() {
  // const [keywordsArray, setKeywordsArray] = useState([]);
  const [filterKeyword, setFilterKeyword] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isOpenKeywordWarning, setIsOpenKeywordWarning] = useState(false);

  const [isOpenRequestResponse, setIsOpenRequestResponse] = useState(false);
  const [requestResponseMessage, setRequestResponseMessage] = useState("");
  const [newsApiRequestsArray, setNewsApiRequestsArray] = useState([]);
  const dispatch = useDispatch();
  const [keywordsAnd, setKeywordsAnd] = useState("");
  const [keywordsOr, setKeywordsOr] = useState("");
  const [keywordsNot, setKeywordsNot] = useState("");

  // const [newsOrgArray, setNewsOrgArray] = useState([]);
  const [newsOrg, setNewsOrg] = useState("GNews");
  // const [inputErrors, setInputErrors] = useState({
  //   startDate: false,
  //   endDate: false,
  //   newsOrg: false,
  // });
  const userReducer = useSelector((state) => state.user);
  const todayDate = new Date().toISOString().split("T")[0];
  const minDate = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  // const [loadingTable01, setLoadingTable01] = useState(false);
  const [loadingComponents, setLoadingComponents] = useState({
    table01: false,
    summaryStatistics: false,
    pageLoading: false,
  });
  // const filteredKeywords = keywordsArray.filter((keyword) =>
  //   keyword.toLowerCase().includes(filterKeyword.toLowerCase())
  // );

  const columnHelper = createColumnHelper();
  const columnsForRequestTable = [
    columnHelper.accessor("madeOn", { header: "Made On", enableSorting: true }),
    columnHelper.accessor("nameOfOrg", {
      header: "Org Name",
      enableSorting: true,
    }),
    columnHelper.accessor("keyword", {
      header: "Search Criteria",
      enableSorting: true,
    }),
    columnHelper.accessor("startDate", {
      header: "Start Date",
      enableSorting: true,
    }),
    columnHelper.accessor("endDate", {
      header: "End Date",
      enableSorting: true,
    }),
    columnHelper.accessor("count", {
      header: () => (
        <div className={styles.columnHeaderSmallNote}>
          Count
          <br />
          <span>(Returned)</span>
        </div>
      ),
      enableSorting: true,
      cell: ({ getValue }) => (
        <div
          style={{
            textAlign: "center",
          }}
        >
          {getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("countSaved", {
      header: () => (
        <div className={styles.columnHeaderSmallNote}>
          Count
          <br />
          <span>(Saved)</span>
        </div>
      ),
      enableSorting: true,
      cell: ({ getValue }) => (
        <div
          style={{
            textAlign: "center",
          }}
        >
          {getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("status", { header: "Status", enableSorting: true }),
    columnHelper.display({
      id: "copyRequest",
      header: "Copy Request",
      cell: ({ row }) => (
        <div className={styles.columnCopyBtn}>
          <button onClick={() => handleCopyRequest(row.original)}>Copy</button>
        </div>
      ),
    }),
  ];
  useEffect(() => {
    // fetchKeywordsArray();
    requestNewsApiRequestsArray();
    // fetchNewsOrgArray();
  }, []);
  useEffect(() => {
    if (!endDate) {
      const today = new Date().toISOString().split("T")[0];
      setEndDate(today);
    }
  }, []);

  const requestNewsApi = async () => {
    try {
      const bodyObj = {
        newsOrg,
        startDate,
        endDate,
        keywordsAnd,
        keywordsOr,
        keywordsNot,
      };
      setLoadingComponents((prev) => ({
        ...prev,
        pageLoading: true,
      }));
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/gnews/get-articles`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userReducer.token}`,
          },
          body: JSON.stringify(bodyObj),
        }
      );

      console.log(`Response status: ${response.status}`);
      let resJson = null;
      const contentType = response.headers.get("Content-Type");

      if (contentType?.includes("application/json")) {
        resJson = await response.json();
      }

      if (resJson) {
        console.log("Fetched Data:", resJson);
        if (response.status === 400) {
          setRequestResponseMessage(resJson.message);
          setIsOpenRequestResponse(true);
          return;
        } else {
          setFilterKeyword("");
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);

      const result = await response.json();
      console.log("Error Data:", result);
    }
    setLoadingComponents((prev) => ({
      ...prev,
      pageLoading: false,
    }));
  };
  const requestNewsApiRequestsArray = async () => {
    try {
      // setLoadingTable01(true);
      setLoadingComponents((prev) => ({
        ...prev,
        table01: true,
      }));
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/news-aggregators/requests`,
        {
          headers: {
            Authorization: `Bearer ${userReducer.token}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(userReducer.requestTableBodyParams),
        }
      );

      console.log(`Response status: ${response.status}`);

      const result = await response.json();
      console.log("Fetched Data:", result);

      if (
        result.newsApiRequestsArray &&
        Array.isArray(result.newsApiRequestsArray)
      ) {
        setNewsApiRequestsArray(result.newsApiRequestsArray);
      } else {
        setNewsApiRequestsArray([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setNewsApiRequestsArray([]);
    }
    setLoadingComponents((prev) => ({
      ...prev,
      table01: false,
    }));
  };

  const handleCopyRequest = (rowData) => {
    // setNewsOrg(rowData.nameOfOrg);
    // setFilterKeyword(rowData.keyword);
    setStartDate(rowData.startDate);
    setEndDate(rowData.endDate);
    setKeywordsAnd(rowData.andArray);
    setKeywordsNot(rowData.notArray);
    setKeywordsOr(rowData.orArray);
  };

  return (
    <TemplateView>
      <main className={styles.main}>
        <div className={styles.divMainTop}>
          {/* Some tables with counts will go here */}
          <SummaryStatistics loading={loadingComponents.summaryStatistics} />
        </div>

        <div className={styles.divMainMiddle}>
          <div className={styles.divRequestGroup}>
            <div className={styles.divRequestGroupTop}>
              <div className={styles.divRequestGroupInput}>
                <label htmlFor="newsOrg">News Organization</label>
                <input
                  // className={styles.inputRequestKeyword}
                  className={styles.inputRequestKeyword}
                  value={newsOrg}
                  // onChange={(e) => {
                  //   setNewsOrg(e.target.value);
                  // }}
                  disabled
                />
              </div>
              <div className={styles.divRequestGroupInput}>
                <label htmlFor="startDate">Start Date</label>
                <input
                  // className={styles.inputRequestStartDate}
                  className={styles.inputRequestStartDate}
                  min={minDate}
                  max={todayDate}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  type="date"
                />
              </div>
              <div className={styles.divRequestGroupInput}>
                <label htmlFor="endDate">End Date</label>
                <input
                  // className={styles.inputRequestEndDate}
                  className={styles.inputRequestEndDate}
                  min={minDate}
                  max={todayDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  type="date"
                />
              </div>
              <div className={styles.divRequestGroupInput}>
                <button
                  className={styles.btnSubmit}
                  onClick={() => {
                    requestNewsApi();
                    // You can call your submit logic or dispatch here
                  }}
                >
                  Request Articles
                </button>
              </div>
            </div>
            {/* <div className */}

            <div className={styles.divRequestGroupInputWide}>
              <label htmlFor="keywordsAnd">Keywords AND</label>
              <input
                className={styles.inputRequestKeyword}
                type="text"
                placeholder={`enter word(s), use " " for exact phrase`}
                value={keywordsAnd}
                onChange={(e) => setKeywordsAnd(e.target.value)}
              />
              {keywordsAnd && (
                <button
                  className={styles.btnClearKeyword}
                  onClick={() => setKeywordsAnd("")}
                >
                  ×
                </button>
              )}
            </div>
            <div className={styles.divRequestGroupInputWide}>
              <label htmlFor="keywordsNot">Keywords NOT</label>
              <input
                className={styles.inputRequestKeyword}
                type="text"
                placeholder={`enter word(s), use " " for exact phrase`}
                value={keywordsNot}
                onChange={(e) => setKeywordsNot(e.target.value)}
              />
              {keywordsNot && (
                <button
                  className={styles.btnClearKeyword}
                  onClick={() => setKeywordsNot("")}
                >
                  ×
                </button>
              )}
            </div>
            <div className={styles.divRequestGroupInputWide}>
              <label htmlFor="keywordsOr">Keywords OR</label>
              <input
                className={styles.inputRequestKeyword}
                type="text"
                placeholder={`enter word(s), use " " for exact phrase`}
                value={keywordsOr}
                onChange={(e) => setKeywordsOr(e.target.value)}
              />
              {keywordsOr && (
                <button
                  className={styles.btnClearKeyword}
                  onClick={() => setKeywordsOr("")}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        <div className={styles.divMainBottom}>
          <div className={styles.divRequestTableGroup}>
            <TableRequests
              data={newsApiRequestsArray}
              columns={columnsForRequestTable}
              onCopyRequest={handleCopyRequest}
              loading={loadingComponents.table01}
            />
          </div>
        </div>
        {isOpenKeywordWarning && (
          <ModalInformation
            isModalOpenSetter={setIsOpenKeywordWarning}
            title="Must match keyword"
            content="If you're sure this keyword is correct, you can add it."
          />
        )}

        {isOpenRequestResponse && (
          <ModalInformation
            isModalOpenSetter={setIsOpenRequestResponse}
            title="Problem with request"
            content={requestResponseMessage}
          />
        )}
        <ModalLoading isVisible={loadingComponents.pageLoading} />
      </main>
    </TemplateView>
  );
}
