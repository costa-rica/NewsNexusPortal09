import styles from "../../styles/articles/ReviewArticles.module.css";
import TemplateView from "../common/TemplateView";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Table01 from "../common/Tables/Table01";
import { createColumnHelper } from "@tanstack/react-table";
import InputDropdownCheckbox from "../common/InputDropdownCheckbox";
import ModalInformation from "../common/modals/ModalInformation";
import { useDispatch } from "react-redux";
import {
  toggleHideIrrelevant,
  toggleHideApproved,
  updateStateArray,
  updateArticleTableBodyParams,
} from "../../reducers/user";
import SummaryStatistics from "../common/SummaryStatistics";

export default function ReviewArticles() {
  const userReducer = useSelector((state) => state.user);
  const [articlesArray, setArticlesArray] = useState([]);
  const [isOpenModalInformation, setIsOpenModalInformation] = useState(false);
  const [modalInformationContent, setModalInformationContent] = useState({
    title: "Information",
    content: "",
  });
  const [isOpenStateWarning, setIsOpenStateWarning] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const dispatch = useDispatch();
  const [loadingComponents, setLoadingComponents] = useState({
    table01: false,
    summaryStatistics: false,
  });
  const [loadingTimes, setLoadingTimes] = useState({
    timeToRenderResponseFromApiInSeconds: "loading...",
    timeToRenderTable01InSeconds: "loading...",
  });
  const [allowUpdateSelectedArticle, setAllowUpdateSelectedArticle] =
    useState(true);

  useEffect(() => {
    fetchArticlesArray();
  }, []);

  useEffect(() => {
    if (!allowUpdateSelectedArticle) return;
    const filteredArticles = userReducer.hideIrrelevant
      ? articlesArray.filter((article) => article.isRelevant !== false)
      : articlesArray;

    if (filteredArticles.length > 0) {
      setSelectedArticle({
        ...filteredArticles[0],
        content: filteredArticles[0].description,
      });
      updateStateArrayWithArticleState(filteredArticles[0]);
    }
  }, [articlesArray, userReducer.hideIrrelevant]);

  // // This is used to force the 180 day limit on the published date
  // useEffect(() => {
  //   const currentVal =
  //     userReducer.articleTableBodyParams?.returnOnlyThisPublishedDateOrAfter;

  //   const date180DaysAgo = new Date(
  //     new Date().setDate(new Date().getDate() - 180)
  //   );
  //   const iso180DaysAgo = date180DaysAgo.toISOString().split("T")[0];

  //   if (!currentVal || new Date(currentVal) < date180DaysAgo) {
  //     dispatch(
  //       updateArticleTableBodyParams({
  //         returnOnlyThisPublishedDateOrAfter: iso180DaysAgo,
  //       })
  //     );
  //   }
  // }, []);

  const fetchArticlesArray = async () => {
    let startTime = null;
    const bodyParams = {
      ...userReducer.articleTableBodyParams,
      // entityWhoCategorizesIdSemantic: 1,
      semanticScorerEntityName: "NewsNexusSemanticScorer02",
    };

    try {
      setLoadingComponents((prev) => ({
        ...prev,
        table01: true,
      }));
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/with-ratings`,
        {
          headers: {
            Authorization: `Bearer ${userReducer.token}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(bodyParams),
        }
      );

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text(); // Log response text for debugging
        throw new Error(`Server Error: ${errorText}`);
      }

      const result = await response.json();
      console.log("Fetched Data:", result);

      startTime = Date.now();
      if (result.articlesArray && Array.isArray(result.articlesArray)) {
        setArticlesArray(result.articlesArray);
        setLoadingTimes((prev) => ({
          ...prev,
          timeToRenderResponseFromApiInSeconds: `${result.timeToRenderResponseFromApiInSeconds.toFixed(
            1
          )} s`,
        }));
      } else {
        setArticlesArray([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setArticlesArray([]);
    }
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

  const handleSelectArticleFromTable = async (article) => {
    console.log("Selected article:", article);

    // STEP 1: Call API to see if an approved record for this article exists
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/get-approved/${article.id}`,
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
      console.log("Fetched Data (/articles/get-approved):", result);

      if (result.article && result.article.id) {
        setSelectedArticle({
          ...result.article,
          ...article,
          approved: result.result,
          content: result.content,
        });
        // modify the stateArray with the states that the article is associated with

        // const articleStateIds = result.article.States.map((state) => state.id);
        // const tempStatesArray = userReducer.stateArray.map((stateObj) => {
        //   if (articleStateIds.includes(stateObj.id)) {
        //     return { ...stateObj, selected: true };
        //   } else {
        //     return { ...stateObj, selected: false };
        //   }
        // });
        // dispatch(updateStateArray(tempStatesArray));
        updateStateArrayWithArticleState(result.article);
      } else {
        // const tempStatesArray = userReducer.stateArray.map((stateObj) => {
        //   return { ...stateObj, selected: false };
        // });
        // dispatch(updateStateArray(tempStatesArray));
        updateStateArrayWithArticleState(article);
        setSelectedArticle({ ...article, content: article.description });
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  const handleClickIsRelevant = async (articleId) => {
    console.log("Clicked is relevant for article:", articleId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/user-toggle-is-not-relevant/${articleId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userReducer.token}`,
          },
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
          let updatedArticle = articlesArray.find(
            (article) => article.id === articleId
          );
          updatedArticle.isRelevant = !updatedArticle.isRelevant;
          setArticlesArray(
            articlesArray.map((article) =>
              article.id === articleId ? updatedArticle : article
            )
          );
          if (selectedArticle.id === articleId) {
            setSelectedArticle(updatedArticle);
          }
        }
      }
    } catch (error) {
      console.error("Error validating states:", error.message);
    }
  };
  const handleClickIsReviewed = async (articleId) => {
    console.log("Clicked is reviewed for article:", articleId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/is-being-reviewed/${articleId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userReducer.token}`,
          },
          body: JSON.stringify({
            isBeingReviewed: !articlesArray.find(
              (article) => article.id === articleId
            ).isBeingReviewed,
          }),
        }
      );

      // console.log(`Response status: ${response.status}`);
      // let resJson = null;
      // const contentType = response.headers.get("Content-Type");

      // if (contentType?.includes("application/json")) {
      //   resJson = await response.json();
      // }

      // if (resJson) {
      //   console.log("Fetched Data:", resJson);
      //   if (response.status === 400) {
      //     setRequestResponseMessage(resJson.message);
      //     setIsOpenRequestResponse(true);
      //     return;
      //   } else {
      //     let updatedArticle = articlesArray.find(
      //       (article) => article.id === articleId
      //     );
      //     updatedArticle.isRelevant = !updatedArticle.isRelevant;
      //     setArticlesArray(
      //       articlesArray.map((article) =>
      //         article.id === articleId ? updatedArticle : article
      //       )
      //     );
      //     if (selectedArticle.id === articleId) {
      //       setSelectedArticle(updatedArticle);
      //     }
      //   }
      // }

      let resJson = null;
      try {
        resJson = await response.json();
      } catch (e) {
        console.warn("Could not parse JSON response:", e);
      }
      if (response.status !== 200) {
        if (resJson?.error) {
          setIsOpenModalInformation(true);
          setModalInformationContent({
            title: "Error Toggling Is Reviewed",
            content: resJson.error,
          });
          return;
        } else {
          console.log(`${response.status}`);
          let updatedArticle = articlesArray.find(
            (article) => article.id === articleId
          );
          updatedArticle.isBeingReviewed = !updatedArticle.isBeingReviewed;
          setArticlesArray(
            articlesArray.map((article) =>
              article.id === articleId ? updatedArticle : article
            )
          );
          if (selectedArticle.id === articleId) {
            setSelectedArticle(updatedArticle);
          }
        }
        // return;
      } else {
        // alert("Report created successfully!");
        console.log(`${response.status}`);
        let updatedArticle = articlesArray.find(
          (article) => article.id === articleId
        );
        updatedArticle.isBeingReviewed = !updatedArticle.isBeingReviewed;
        setArticlesArray(
          articlesArray.map((article) =>
            article.id === articleId ? updatedArticle : article
          )
        );
        if (selectedArticle.id === articleId) {
          setSelectedArticle(updatedArticle);
        }
      }
    } catch (error) {
      console.error("Error validating states:", error.message);
    }
  };

  const updateStateArrayWithArticleState = (article) => {
    if (!article?.States) {
      return;
    }
    const articleStateIds = article.States.map((state) => state.id);
    const tempStatesArray = userReducer.stateArray.map((stateObj) => {
      if (articleStateIds.includes(stateObj.id)) {
        return { ...stateObj, selected: true };
      } else {
        return { ...stateObj, selected: false };
      }
    });
    dispatch(updateStateArray(tempStatesArray));
  };

  const columnHelper = createColumnHelper();
  const columnsForArticlesTable = [
    columnHelper.accessor("id", {
      header: "ID",
      enableSorting: true,
      cell: ({ row }) => (
        <button
          onClick={() => handleSelectArticleFromTable(row.original)}
          style={{
            fontSize: "10px",
          }}
        >
          {row.original.id}
        </button>
      ),
    }),
    columnHelper.accessor("isBeingReviewed", {
      // header: "Relevant ?",
      header: () => <div className={styles.columnHeaderSmall}>Watched ?</div>,
      enableSorting: true,
      cell: ({ getValue, row }) => (
        <div className={styles.divBtnRelevant}>
          <button
            className={`${styles.btnRelevant} ${
              getValue() === false ? "btnOpaque" : ""
            }`}
            onClick={() => handleClickIsReviewed(row.original.id)}
          >
            {getValue() === true ? "Yes" : "No"}
          </button>
        </div>
      ),
    }),
    columnHelper.accessor("title", { header: "Title", enableSorting: true }),
    columnHelper.accessor("description", {
      header: "Description",
      enableSorting: true,
      cell: ({ getValue }) => (
        <div
          style={{
            fontSize: "10px",
          }}
        >
          {getValue() && getValue().slice(0, 100)}
        </div>
      ),
    }),
    columnHelper.accessor("publishedDate", {
      header: "Published Date",
      enableSorting: true,
    }),
    columnHelper.accessor("url", {
      header: "URL",
      enableSorting: true,
      cell: ({ getValue }) => {
        const rawUrl = getValue();
        if (!rawUrl) return null;

        // const strippedUrl = rawUrl.replace(/^https?:\/\//, "");
        const strippedUrl = rawUrl
          .replace(/^https?:\/\//, "") // remove http:// or https://
          .replace(/^www\./, ""); // then remove www. if present

        return (
          <div className={styles.columnHeaderUrl}>
            <div className="tooltipWrapper">
              <Link href={rawUrl}>{strippedUrl.slice(0, 20)}</Link>
              <span className="tooltipText">{rawUrl}</span>
            </div>
          </div>
        );
      },
    }),

    columnHelper.accessor("statesStringCommaSeparated", {
      header: "State",
      enableSorting: true,
    }),
    columnHelper.accessor("isRelevant", {
      // header: "Relevant ?",
      header: () => <div className={styles.columnHeaderSmall}>Relevant ?</div>,
      enableSorting: true,
      cell: ({ getValue, row }) => (
        <div className={styles.divBtnRelevant}>
          <button
            className={`${styles.btnRelevant} ${
              getValue() === false ? "btnOpaque" : ""
            }`}
            onClick={() => handleClickIsRelevant(row.original.id)}
          >
            {getValue() === true ? "Yes" : "No"}
          </button>
        </div>
      ),
    }),
    // NOTE: for some reason keyword is different so it needs to be explicitly converted to a
    // string in order for the search to work in this column
    columnHelper.accessor((row) => row.requestQueryString?.toString() ?? "", {
      id: "requestQueryString",
      // header: "Request Query String",
      header: () => (
        <div className={styles.columnHeaderSmall}>Request Query String</div>
      ),
      enableSorting: true,
      cell: ({ getValue }) => {
        return <div className={styles.columnCellSmall}>{getValue()}</div>;
      },
    }),
    columnHelper.accessor("nameOfOrg", {
      id: "nameOfOrg",
      header: () => <div className={styles.columnHeaderSmall}>Added by:</div>,
      enableSorting: true,
      cell: ({ getValue }) => {
        return <div className={styles.columnCellSmall}>{getValue()}</div>;
      },
    }),
    columnHelper.accessor("semanticRatingMax", {
      header: () => (
        <div className={styles.columnHeaderSmall}>Nexus Semantic Rating</div>
      ),
      enableSorting: true,
      cell: ({ getValue }) => {
        const value = getValue();
        const normalized = Math.max(0, Math.min(1, value)); // Clamp between 0 and 1
        const green = Math.floor(normalized * 200); // max ~200 for readability
        const color = `rgb(${128 - green / 3}, ${green}, ${128 - green / 3})`; // green to gray gradient
        const percent = Math.round(normalized * 100);
        return value === "N/A" ? (
          <div className={styles.divColumnCenter}>
            <span>N/A</span>
          </div>
        ) : (
          <div className={styles.divColumnCenter}>
            <span
              className={styles.circleRating}
              style={{ backgroundColor: color }}
            >
              <span className={styles.circleRatingText}>{percent}%</span>
            </span>
          </div>
        );
      },
    }),
    columnHelper.accessor("locationClassifierScore", {
      header: () => (
        <div className="tooltipWrapper">
          <span className={styles.columnHeaderSmall}>
            Nexus Location Rating
          </span>
          <span className="tooltipText">
            This score is a determination of how likely the events in this
            article occurred in the United States.
          </span>
        </div>
      ),
      enableSorting: true,
      cell: ({ getValue }) => {
        const value = getValue();
        const normalized = Math.max(0, Math.min(1, value)); // Clamp between 0 and 1
        const green = Math.floor(normalized * 200); // max ~200 for readability
        const color = `rgb(${128 - green / 3}, ${green}, ${128 - green / 3})`; // green to gray gradient
        const percent = Math.round(normalized * 100);
        return value === "N/A" ? (
          <div className={styles.divColumnCenter}>
            <span>N/A</span>
          </div>
        ) : (
          <div className={styles.divColumnCenter}>
            <span
              className={styles.circleRating}
              style={{ backgroundColor: color }}
            >
              <span className={styles.circleRatingText}>{percent}%</span>
            </span>
          </div>
        );
      },
    }),
  ];

  const handleClickedValidateState = async () => {
    console.log("clicked validate state");
    setAllowUpdateSelectedArticle(false);

    // const selectedStateIds = stateArray
    //   .filter((st) => st.selected)
    //   .map((st) => st.id);
    const selectedStateObjs = userReducer.stateArray.filter(
      (st) => st.selected
    );
    const selectedStateIds = selectedStateObjs.map((st) => st.id);
    const selectedStateNamesString = selectedStateObjs
      .map((st) => st.name)
      .join(", ");
    try {
      const bodyObj = {
        stateIdArray: selectedStateIds,
      };
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/states/${selectedArticle.id}`,
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
          // fetchArticlesArray();
          let updatedArticle = articlesArray.find(
            (article) => article.id === selectedArticle.id
          );
          updatedArticle.States = selectedStateObjs;
          updatedArticle.states = selectedStateNamesString;
          setArticlesArray(
            articlesArray.map((article) =>
              article.id === selectedArticle.id ? updatedArticle : article
            )
          );
          setIsOpenModalInformation(true);
          setModalInformationContent({
            title: "Successfully validated state(s)",
            content: "NOTE: Table won't update unless you refresh the page.",
          });
        }
      }
    } catch (error) {
      console.error("Error validating states:", error.message);
    }
  };

  const handleApproveArticle = async () => {
    try {
      // // selectedArticle?.isApproved ? "Un-approve" : "Approve"
      let approvedStatusObject = {};
      if (selectedArticle?.isApproved) {
        approvedStatusObject = {
          approvedStatus: "Un-approve",
          isApproved: false,
        };
      } else {
        approvedStatusObject = {
          approvedStatus: "Approve",
          isApproved: true,
        };
      }

      const bodyObj = {
        ...approvedStatusObject,
        headlineForPdfReport: selectedArticle.title,
        publicationNameForPdfReport: selectedArticle.publicationName,
        publicationDateForPdfReport: selectedArticle.publishedDate,
        textForPdfReport: selectedArticle.content,
        urlForPdfReport: selectedArticle.url,
        kmNotes: "",
      };

      // /// ---- OBE ------
      // const bodyObj = {
      //   isApproved: !selectedArticle.isApproved,
      //   headlineForPdfReport: selectedArticle.title,
      //   publicationNameForPdfReport: selectedArticle.publicationName,
      //   publicationDateForPdfReport: selectedArticle.publishedDate,
      //   textForPdfReport: selectedArticle.content,
      //   urlForPdfReport: selectedArticle.url,
      //   kmNotes: "",
      // };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/approve/${selectedArticle.id}`,
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
          //modify selected article
          setSelectedArticle({
            ...selectedArticle,
            isApproved: !selectedArticle.isApproved,
          });
          let tempArray = [...articlesArray];
          tempArray = tempArray.map((article) => {
            if (article.id === selectedArticle.id) {
              return {
                ...article,
                isApproved: !article.isApproved,
              };
            }
            return article;
          });
          setArticlesArray(tempArray);
        }
      }
    } catch (error) {
      console.error("Error approving article:", error.message);
    }
  };

  const filteredArticlesArray = articlesArray.filter((article) => {
    let returnFlag = true;
    if (userReducer.articleTableBodyParams.returnOnlyIsNotApproved) {
      returnFlag = article.isApproved === false;
    }
    if (userReducer.articleTableBodyParams.returnOnlyIsRelevant) {
      returnFlag = returnFlag && article.isRelevant === true;
    }
    return returnFlag;
  });

  const handleUpdateArticleContent = async () => {
    try {
      const bodyObj = {
        articleId: selectedArticle.id,
        contentToUpdate: selectedArticle.content,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/update-approved`,
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
      } else {
        alert("There was an error");
      }

      if (resJson.result) {
        setIsOpenModalInformation(true);
        setModalInformationContent({
          title: "Success",
          content: "Updated article content in report.",
        });
      }
    } catch (error) {
      setIsOpenModalInformation(true);
      setModalInformationContent({
        title: "Error updating article content",
        content: error.message,
      });
    }
  };

  return (
    <TemplateView>
      <main className={styles.main}>
        <div className={styles.divMainTop}>
          <SummaryStatistics loading={loadingComponents.summaryStatistics} />
        </div>
        <div className={styles.divMainMiddle}>
          <div className={styles.divMainMiddleLeft}>
            <div className={`${styles.divMainMiddleLeftTitle} tooltipWrapper`}>
              <h2>Article Approval Details</h2>
              <span>(article Id: {selectedArticle?.id})</span>
              <div className="tooltipText">
                This is the content for CPSC report PDF
              </div>
            </div>
            <div className={styles.divArticleDetail}>
              <div className="tooltipWrapper">
                <span className={styles.lblArticleDetailMain}>Headline:</span>
                <span className="tooltipText">This is the article title</span>
              </div>
              <input
                type="text"
                value={selectedArticle?.title}
                className={styles.inputArticleDetail}
                disabled
              />
            </div>

            <div className={styles.divArticleDetail}>
              <div className="tooltipWrapper">
                <span className={styles.lblArticleDetailMain}>
                  Publication:
                </span>
                <span className="tooltipText">
                  Name of newspaper or organization that published the article
                </span>
              </div>
              <input
                type="text"
                value={selectedArticle?.publicationName}
                className={styles.inputArticleDetail}
                // onChange={(e) =>
                disabled
              />
            </div>
            <div className={styles.divArticleDetail}>
              <div className="tooltipWrapper">
                <span className={styles.lblArticleDetailMain}>
                  Publication Date:
                </span>
                <span className="tooltipText">Date article was published</span>
              </div>
              <input
                type="date"
                value={selectedArticle?.publishedDate}
                className={styles.inputArticleDetail}
                // onChange={(e) =>
                disabled
              />
            </div>
            <div className={styles.divArticleDetail}>
              <div className="tooltipWrapper">
                <span className={styles.lblArticleDetailMain}>
                  Article State:
                </span>
                <span className="tooltipText">
                  State(s) article is relevant to
                </span>
              </div>
              <div className={styles.divManageStates}>
                {/* <StateSelector
                  stateArray={stateArray}
                  setStateArray={setStateArray}
                /> */}
                <InputDropdownCheckbox
                  inputObjectArray={
                    loadingComponents.table01 ? [] : userReducer.stateArray
                  }
                  setInputObjectArray={(value) =>
                    dispatch(updateStateArray(value))
                  }
                  displayName="name"
                  inputDefaultText="select states ..."
                />
              </div>
              <button
                className={styles.btnSubmit}
                onClick={() => {
                  handleClickedValidateState();
                }}
              >
                Validate State
              </button>
            </div>

            <div className={styles.divArticleDetailContent}>
              <div className="tooltipWrapper">
                <span className={styles.lblArticleDetailMain}>Content:</span>
                <span className="tooltipText">This is the article content</span>
              </div>
              <textarea
                value={selectedArticle?.content}
                className={styles.inputArticleDetailContent}
                onChange={(e) => {
                  setSelectedArticle({
                    ...selectedArticle,
                    content: e.target.value,
                  });
                }}
                // disabled
              />
            </div>
          </div>
          <div className={styles.divMainMiddleRight}>
            <button
              className={`${styles.btnSubmit} ${
                selectedArticle?.isApproved ? styles.btnOpaque : ""
              }`}
              onClick={() => {
                // console.log("approve article");
                handleApproveArticle();
              }}
            >
              {selectedArticle?.isApproved ? "Un-approve" : "Approve"}
            </button>
            {selectedArticle?.isApproved && (
              <button
                className={styles.btnSubmit}
                onClick={() => {
                  handleUpdateArticleContent();
                }}
              >
                Update Content
              </button>
            )}
          </div>
        </div>
        <div className={styles.divMainBottom}>
          <div className={styles.divRequestTableGroupSuper}>
            <div className={styles.divRequestTableParameters}>
              <div className={styles.divRequestTableParametersLeft}>
                <div className={styles.divParametersDetail}>
                  <div className={styles.divParametersDetailDate}>
                    <div className="tooltipWrapper">
                      <span className={styles.lblParametersDetailMain}>
                        Database Date Limit:
                      </span>
                      <span className="tooltipText">
                        Limits downloading aritlces added to the Nexus News
                        Database before this date
                      </span>
                    </div>
                    <input
                      className={styles.inputParametersDetailDate}
                      type="date"
                      value={
                        userReducer.articleTableBodyParams
                          ?.returnOnlyThisCreatedAtDateOrAfter
                      }
                      onChange={(e) =>
                        dispatch(
                          updateArticleTableBodyParams({
                            returnOnlyThisCreatedAtDateOrAfter: e.target.value,
                          })
                        )
                      }
                    />
                  </div>
                  <div className={styles.divParametersDetailDate}>
                    <div className="tooltipWrapper">
                      <span className={styles.lblParametersDetailMain}>
                        Published Date Limit:
                      </span>
                      <span className="tooltipText">
                        Limits downloading aritlces published before this date
                      </span>
                    </div>
                    <input
                      className={styles.inputParametersDetailDate}
                      type="date"
                      value={
                        userReducer.articleTableBodyParams
                          ?.returnOnlyThisPublishedDateOrAfter
                      }
                      onChange={(e) =>
                        dispatch(
                          updateArticleTableBodyParams({
                            returnOnlyThisPublishedDateOrAfter: e.target.value,
                          })
                        )
                      }
                      // min={
                      //   new Date(new Date().setDate(new Date().getDate() - 180))
                      //     .toISOString()
                      //     .split("T")[0]
                      // }
                    />
                  </div>
                </div>

                <div className={styles.divParametersDetail}>
                  <button
                    className={`${styles.btnSubmitRequestTableParameters} ${
                      userReducer.articleTableBodyParams.returnOnlyIsNotApproved
                        ? styles.btnOpaque
                        : ""
                    }`}
                    onClick={() => {
                      dispatch(toggleHideApproved());
                    }}
                  >
                    {userReducer.articleTableBodyParams.returnOnlyIsNotApproved
                      ? "Show Approved"
                      : "Hide Approved"}
                  </button>
                  <button
                    className={`${styles.btnSubmitRequestTableParameters} ${
                      userReducer.articleTableBodyParams.returnOnlyIsRelevant
                        ? styles.btnOpaque
                        : ""
                    }`}
                    onClick={() => {
                      dispatch(toggleHideIrrelevant());
                    }}
                  >
                    {userReducer.articleTableBodyParams.returnOnlyIsRelevant
                      ? "Show Irrelevant"
                      : "Hide Irrelevant"}
                  </button>
                </div>
              </div>
              <div className={styles.divParametersDetailLoadingStatistics}>
                <div className={styles.divParametersDetailLoadingStatisticsRow}>
                  <span className={styles.lblParametersDetailTimes}>
                    Time to get table data (API):{" "}
                  </span>
                  <span className={styles.lblParametersDetailTimes}>
                    {/* check if loadingTimes.timeToRenderResponseFromApiInSeconds is a number */}
                    {loadingTimes.timeToRenderResponseFromApiInSeconds}
                  </span>
                </div>
                <div className={styles.divParametersDetailLoadingStatisticsRow}>
                  <div className={styles.lblParametersDetailTimes}>
                    Time to load table (Website):{" "}
                  </div>
                  <div className={styles.lblParametersDetailTimes}>
                    {loadingTimes.timeToRenderTable01InSeconds}
                    {/* {loadingComponents.table01
                      ? "loading..."
                      : loadingTimes.timeToRenderTable01InSeconds.toFixed(1) +
                        " s"} */}
                  </div>
                </div>
              </div>
            </div>
            <Table01
              columns={columnsForArticlesTable}
              data={filteredArticlesArray}
              selectedRowId={selectedArticle?.id}
              loading={loadingComponents.table01}
            />
          </div>
        </div>
      </main>

      {isOpenStateWarning && (
        <ModalInformation
          isModalOpenSetter={setIsOpenStateWarning}
          title="Problem with state request"
          content="Maybe no selected states ?"
        />
      )}
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
