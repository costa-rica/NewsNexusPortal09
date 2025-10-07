import styles from "../../styles/articles/GetArticlesDetailed.module.css";
import TemplateView from "../common/TemplateView";
import ModalInformation from "../common/modals/ModalInformation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import TableRequests from "../common/Tables/TableRequests";
import { createColumnHelper } from "@tanstack/react-table";
import SummaryStatistics from "../common/SummaryStatistics";
import { useDispatch } from "react-redux";
import {
  updateArticlesSummaryStatistics,
  // updateIncludeDomainsArray,
  // updateExcludeDomainsArray,
} from "../../reducers/user";
import InputDropdownCheckbox from "../common/InputDropdownCheckbox";
import ModalLoading from "../common/modals/ModalLoading";

export default function GetArticlesNewsApi() {
  const [keywordsArray, setKeywordsArray] = useState([]);
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
  const [websiteDomainObjArray, setWebsiteDomainObjArray] = useState([]);

  const [includeExclude, setIncludeExclude] = useState("exclude");

  // const [newsOrgArray, setNewsOrgArray] = useState([]);
  const [newsOrg, setNewsOrg] = useState("NewsAPI");
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

  // const filteredKeywords = keywordsArray.filter((keyword) =>
  //   keyword.toLowerCase().includes(filterKeyword.toLowerCase())
  // );
  // const [loadingTableRequests, setLoadingTableRequests] = useState(false);
  const [loadingComponents, setLoadingComponents] = useState({
    tableRequests: false,
    summaryStatistics: false,
    pageLoading: false,
  });

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
    // fetchArticlesSummaryStatistics();
    fetchWebsiteDomains();
  }, []);
  useEffect(() => {
    if (!endDate) {
      const today = new Date().toISOString().split("T")[0];
      setEndDate(today);
    }
  }, []);
  // const fetchKeywordsArray = async () => {
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/keywords`,
  //       {
  //         headers: { Authorization: `Bearer ${userReducer.token}` },
  //       }
  //     );

  //     console.log(`Response status: ${response.status}`);

  //     if (!response.ok) {
  //       const errorText = await response.text(); // Log response text for debugging
  //       throw new Error(`Server Error: ${errorText}`);
  //     }

  //     const result = await response.json();
  //     console.log("Fetched Data:", result);

  //     if (result.keywordsArray && Array.isArray(result.keywordsArray)) {
  //       setKeywordsArray(result.keywordsArray);
  //     } else {
  //       setKeywordsArray([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error.message);
  //     setKeywordsArray([]);
  //   }
  // };

  const requestNewsApi = async () => {
    setLoadingComponents((prev) => ({
      ...prev,
      pageLoading: true,
    }));
    try {
      let includeWebsiteDomainObjArray = [];
      let excludeWebsiteDomainObjArray = [];
      if (includeExclude === "include") {
        includeWebsiteDomainObjArray = websiteDomainObjArray.filter(
          (domain) => domain.selected === true
        );
      } else {
        excludeWebsiteDomainObjArray = websiteDomainObjArray.filter(
          (domain) => domain.selected === true
        );
      }

      const bodyObj = {
        newsOrg,
        startDate,
        endDate,
        keywordsAnd,
        keywordsOr,
        keywordsNot,
        includeWebsiteDomainObjArray,
        excludeWebsiteDomainObjArray,
      };
      // alert(JSON.stringify(bodyObj));
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/news-api/get-articles`,
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
          // return;
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
      setLoadingComponents((prev) => ({
        ...prev,
        tableRequests: true,
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
      tableRequests: false,
    }));
  };
  // const fetchNewsOrgArray = async () => {
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/news-aggregators/news-org-apis`,
  //       {
  //         headers: { Authorization: `Bearer ${userReducer.token}` },
  //       }
  //     );

  //     console.log(`Response status: ${response.status}`);

  //     const result = await response.json();
  //     console.log("Fetched Data:", result);

  //     if (result.newsOrgArray && Array.isArray(result.newsOrgArray)) {
  //       setNewsOrgArray(result.newsOrgArray);
  //     } else {
  //       setNewsOrgArray([]);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching data:", error.message);
  //     setNewsOrgArray([]);
  //   }
  // };

  const handleCopyRequest = (rowData) => {
    // setNewsOrg(rowData.nameOfOrg);
    // setFilterKeyword(rowData.keyword);
    setStartDate(rowData.startDate);
    setEndDate(rowData.endDate);
    setKeywordsAnd(rowData.andArray);
    setKeywordsNot(rowData.notArray);
    setKeywordsOr(rowData.orArray);
    if (rowData.excludeString) {
      const rowDataDomainIds = rowData.excludeSourcesArray.map(
        (domain) => domain.id
      );
      console.log(rowDataDomainIds);
      let tempArray = websiteDomainObjArray;
      for (let domain of tempArray) {
        if (rowDataDomainIds.includes(domain.websiteDomainId)) {
          domain.selected = true;
        } else {
          domain.selected = false;
        }
      }
      setWebsiteDomainObjArray(tempArray);
      setIncludeExclude("exclude");
    }
    if (rowData.includeString) {
      const rowDataDomainIds = rowData.includeSourcesArray.map(
        (domain) => domain.id
      );
      console.log(rowDataDomainIds);
      let tempArray = websiteDomainObjArray;
      for (let domain of tempArray) {
        if (rowDataDomainIds.includes(domain.websiteDomainId)) {
          domain.selected = true;
        } else {
          domain.selected = false;
        }
      }
      setWebsiteDomainObjArray(tempArray);
      setIncludeExclude("include");
    }
    if (!rowData.excludeString && !rowData.includeString) {
      let tempArray = websiteDomainObjArray;
      for (let domain of tempArray) {
        domain.selected = false;
      }
      setWebsiteDomainObjArray(tempArray);
      setIncludeExclude("exclude");
    }
  };

  // const fetchArticlesSummaryStatistics = async () => {
  //   try {
  //     setLoadingComponents((prev) => ({
  //       ...prev,
  //       summaryStatistics: true,
  //     }));
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/summary-statistics`,
  //       {
  //         headers: { Authorization: `Bearer ${userReducer.token}` },
  //       }
  //     );

  //     console.log(`Response status: ${response.status}`);

  //     if (!response.ok) {
  //       const errorText = await response.text(); // Log response text for debugging
  //       throw new Error(`Server Error: ${errorText}`);
  //     }

  //     const result = await response.json();
  //     console.log(
  //       "Fetched Data (articles/summary-statistics):",
  //       result.summaryStatistics
  //     );

  //     if (result.summaryStatistics) {
  //       console.log("-----> make summary statistics");
  //       dispatch(updateArticlesSummaryStatistics(result.summaryStatistics));
  //     }
  //   } catch (error) {
  //     console.error(
  //       "Error fetching articles summary statistics:",
  //       error.message
  //     );
  //   }
  //   setLoadingComponents((prev) => ({
  //     ...prev,
  //     summaryStatistics: false,
  //   }));
  // };

  const fetchWebsiteDomains = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/website-domains`,
        {
          headers: { Authorization: `Bearer ${userReducer.token}` },
        }
      );

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text(); // Log response text for debugging
        throw new Error(`Server Error: ${errorText}`);
      }

      const result = await response.json();
      console.log("Fetched Data (website-domains):", result);

      if (result.websiteDomains) {
        // dispatch(updateIncludeDomainsArray(result.websiteDomains));
        let tempWebsiteDomainsArray = [];
        for (let i = 0; i < result.websiteDomains.length; i++) {
          tempWebsiteDomainsArray.push({
            id: i,
            websiteDomainId: result.websiteDomains[i].id,
            name: result.websiteDomains[i].name,
            selected: false,
          });
        }
        setWebsiteDomainObjArray(tempWebsiteDomainsArray);
      }
    } catch (error) {
      console.error("Error fetching website domains:", error.message);
    }
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
            <div className={styles.divRequestGroupInputDropdownCheckbox}>
              {/* Do you see me? */}

              <label htmlFor="includeDomains">Domains: </label>
              <div style={{ width: "100%" }}>
                <InputDropdownCheckbox
                  inputObjectArray={websiteDomainObjArray}
                  setInputObjectArray={setWebsiteDomainObjArray}
                  displayName="name"
                  inputDefaultText="select domains ..."
                />
              </div>
              <div className={styles.divRequestGroupSelectIncludeExclude}>
                <select
                  className={styles.inputRequestKeyword}
                  value={includeExclude}
                  onChange={(e) => setIncludeExclude(e.target.value)}
                >
                  <option value="include">Include</option>
                  <option value="exclude">Exclude</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.divMainBottom}>
          <div className={styles.divRequestTableGroup}>
            <TableRequests
              data={newsApiRequestsArray}
              columns={columnsForRequestTable}
              onCopyRequest={handleCopyRequest}
              loading={loadingComponents.tableRequests}
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
