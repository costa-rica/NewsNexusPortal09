import styles from "../../styles/articles/AddArticle.module.css";
import { useEffect, useState } from "react";
import TemplateView from "../common/TemplateView";
import InputDropdownCheckbox from "../common/InputDropdownCheckbox";
import ModalYesNo from "../common/modals/ModalYesNo";
import { useSelector } from "react-redux";
import SummaryStatistics from "../common/SummaryStatistics";
import Table01 from "../common/Tables/Table01";
import { createColumnHelper } from "@tanstack/react-table";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { updateStateArray } from "../../reducers/user";
export default function AddDeleteArticle() {
  const userReducer = useSelector((state) => state.user);
  const dispatch = useDispatch();
  // const [article, setArticle] = useState({});
  const [newArticle, setNewArticle] = useState({});
  // const [stateArray, setStateArray] = useState(userReducer.stateArray);
  const [articlesArray, setArticlesArray] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isOpenAreYouSure, setIsOpenAreYouSure] = useState(false);
  const [inputErrors, setInputErrors] = useState({
    publicationName: false,
    title: false,
    publishedDate: false,
    content: false,
  });
  // const [loadingTable01, setLoadingTable01] = useState(false);
  const [loadingComponents, setLoadingComponents] = useState({
    table01: false,
    summaryStatistics: false,
  });
  useEffect(() => {
    fetchArticlesArray();
    updateStateArrayWithArticleState({ States: [] });
  }, []);

  const handleAddAndSubmitArticle = async () => {
    const selectedStateObjs = userReducer.stateArray.filter(
      (st) => st.selected
    );
    const errors = {
      publicationName: !newArticle.publicationName,
      title: !newArticle.title,
      publishedDate: !newArticle.publishedDate,
      content: !newArticle.content,
    };
    setInputErrors(errors);

    if (
      !newArticle.publicationName ||
      !newArticle.title ||
      !newArticle.publishedDate ||
      !newArticle.content
    ) {
      alert(
        "Please fill in all required fields: publication name, title, published date, content"
      );
      return;
    }

    // Validation first
    if (selectedStateObjs.length === 0) {
      alert("Please select at least one state");
      return;
    }

    // Construct updated article
    const updatedArticle = {
      ...newArticle,
      stateObjArray: selectedStateObjs,
      isApproved: true,
      kmNotes: "added manually",
    };

    setNewArticle(updatedArticle);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/add-article`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userReducer.token}`,
          },
          body: JSON.stringify(updatedArticle),
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
          alert(resJson.message);
          return;
        } else {
          alert("Successfully added article");
          // setArticle({});
          const blankArticle = {
            publicationName: "",
            title: "",
            url: "",
            publishedDate: "",
            content: "",
            States: [],
          };

          setNewArticle(blankArticle);
          // Deselect all states
          // setStateArray(userReducer.stateArray);
          updateStateArrayWithArticleState(blankArticle);
        }
      }
    } catch (error) {
      console.error("Error adding article:", error.message);
    }
    // fetchArticlesSummaryStatistics();
    fetchArticlesArray();
  };

  const fetchArticlesArray = async () => {
    try {
      // setLoadingTable01(true);
      setLoadingComponents((prev) => ({
        ...prev,
        table01: true,
      }));
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles`,
        {
          headers: {
            Authorization: `Bearer ${userReducer.token}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(userReducer.articleTableBodyParams),
        }
      );

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text(); // Log response text for debugging
        throw new Error(`Server Error: ${errorText}`);
      }

      const result = await response.json();
      console.log("Fetched (from POST /articles):", result);

      if (result.articlesArray && Array.isArray(result.articlesArray)) {
        setArticlesArray(result.articlesArray);
        setSelectedArticle({
          ...result.articlesArray[0],
          content: result.articlesArray[0].description,
        });
        // updateStateArrayWithArticleState(result.articlesArray[0]);
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
  };

  const updateStateArrayWithArticleState = (article) => {
    if (!article?.States) {
      // alert("There are no states associated with this article");
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
  // Table Articles
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
      cell: ({ getValue }) => (
        <div
          style={{
            fontSize: "12px",
            maxWidth: "150px",
          }}
        >
          {/* {getValue()} */}
          {getValue() && (
            <Link href={getValue()}>{getValue().slice(0, 40)}</Link>
          )}
        </div>
      ),
    }),
    columnHelper.accessor("statesStringCommaSeparated", {
      header: "State",
      enableSorting: true,
    }),

    // NOTE: for some reason keyword is different so it needs to be explicitly converted to a
    // string in order for the search to work in this column
    columnHelper.accessor((row) => row.keyword?.toString() ?? "", {
      id: "keyword",
      header: "Keyword",
      enableSorting: true,
    }),
    columnHelper.accessor("delete", {
      // header: "Relevant ?",
      header: () => (
        <div style={{ display: "flex", flexWrap: "nowrap" }}>Delete</div>
      ),
      enableSorting: true,
      cell: ({ row }) => (
        <div className={styles.divBtnRelevant}>
          <button
            className={styles.btnDelete}
            // onClick={() => handleClickDelete(row.original.id)}
            onClick={() => {
              setSelectedArticle(row.original);
              setIsOpenAreYouSure(true);
            }}
          >
            Delete
          </button>
        </div>
      ),
    }),
  ];

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
        setNewArticle({
          ...result.article,
          ...article,
          approved: result.result,
          content: result.content,
        });
        // alert(JSON.stringify(selectedArticle.States));
        // let tempStateArray = userReducer.stateArray;
        // // let tempStateArray = stateArray;
        // // alert(JSON.stringify(article.States));

        // tempStateArray.forEach((state) => {
        //   state.selected = false;
        //   article.States.forEach((articleState) => {
        //     if (state.id === articleState.id) {
        //       state.selected = true;
        //     }
        //   });
        // });
        // setStateArray(tempStateArray);
        updateStateArrayWithArticleState(article);
      } else {
        setSelectedArticle({ ...article, content: article.description });
        setNewArticle({ ...article, content: article.description });
        // let tempStateArray = stateArray;
        // alert(JSON.stringify(article.States));

        // tempStateArray.forEach((state) => {
        //   state.selected = false;
        // });
        // setStateArray(tempStateArray);
        // setStateArray(userReducer.stateArray);
        updateStateArrayWithArticleState(article);
      }
      // // modify the stateArray with the states that the article is associated with
      // updateStateArrayWithArticleState(article);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  const handleClickDelete = async (articleId) => {
    console.log("Delete article:", articleId);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/${articleId}`,
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
        return;
      }

      let tempArticlesArray = articlesArray;
      tempArticlesArray = tempArticlesArray.filter(
        (article) => article.id !== articleId
      );
      setArticlesArray(tempArticlesArray);
      setSelectedArticle(null);
      setNewArticle({});
      // setStateArray(userReducer.stateArray);
      updateStateArrayWithArticleState(article);
      alert("Article deleted successfully!");
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  };

  const deleteArticleModalContent = (
    <div>
      <p>Delete Article ID: {selectedArticle?.id}</p>
      <p style={{ fontWeight: "bold" }}>{selectedArticle?.title}</p>
      <p>This action cannot be undone.</p>
    </div>
  );

  return (
    <TemplateView>
      <main className={styles.main}>
        <div className={styles.divMainTop}>
          <SummaryStatistics />
        </div>
        <h1 className={styles.title}> Add / Delete Article </h1>

        <div className={styles.divMainMiddle}>
          <div className={styles.divArticleDetail}>
            <span className={styles.lblArticleDetailMain}>
              Publication Name:
            </span>
            <input
              type="text"
              value={newArticle?.publicationName || ""}
              className={`${inputErrors.publicationName ? "inputError" : ""} ${
                styles.inputArticleDetail
              }`}
              onChange={(e) =>
                setNewArticle({
                  ...newArticle,
                  publicationName: e.target.value,
                })
              }
            />
          </div>

          <div className={styles.divArticleDetail}>
            <span className={styles.lblArticleDetailMain}>Title:</span>
            <input
              type="text"
              value={newArticle?.title || ""}
              className={`${inputErrors.title ? "inputError" : ""} ${
                styles.inputArticleDetail
              }`}
              onChange={(e) =>
                setNewArticle({ ...newArticle, title: e.target.value })
              }
            />
          </div>

          <div className={styles.divArticleDetail}>
            <span className={styles.lblArticleDetailMain}>URL:</span>
            <input
              type="text"
              value={newArticle?.url || ""}
              className={styles.inputArticleDetail}
              onChange={(e) =>
                setNewArticle({ ...newArticle, url: e.target.value })
              }
            />
          </div>
          <div className={styles.divArticleDetail}>
            <span className={styles.lblArticleDetailMain}>Published Date:</span>
            <input
              type="date"
              value={newArticle?.publishedDate || ""}
              className={`${inputErrors.publishedDate ? "inputError" : ""} ${
                styles.inputArticleDetail
              }`}
              onChange={(e) =>
                setNewArticle({ ...newArticle, publishedDate: e.target.value })
              }
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
              <InputDropdownCheckbox
                inputObjectArray={userReducer.stateArray}
                setInputObjectArray={(value) =>
                  dispatch(updateStateArray(value))
                }
                displayName="name"
                inputDefaultText="select states ..."
              />
            </div>
          </div>

          <div className={styles.divArticleDetailContent}>
            <span className={styles.lblArticleDetailMain}>Content:</span>

            <textarea
              value={newArticle?.content || ""}
              className={`${inputErrors.content ? "inputError" : ""} ${
                styles.inputArticleDetailContent
              }`}
              onChange={(e) => {
                setNewArticle({
                  ...newArticle,
                  content: e.target.value,
                });
              }}
            />
          </div>
          <div className={styles.divMainMiddleBottom}>
            {newArticle?.id ? (
              <div className={styles.divMainMiddleBottomButtons}>
                <button
                  className={styles.btnClear}
                  onClick={() => {
                    setNewArticle({});
                    updateStateArrayWithArticleState({ States: [] });
                  }}
                >
                  Clear
                </button>
              </div>
            ) : (
              <button
                className={styles.btnSubmit}
                onClick={() => {
                  handleAddAndSubmitArticle();
                }}
              >
                Submit
              </button>
            )}
          </div>
        </div>

        <div className={styles.divBottom}>
          {/* <div className={styles.divArticlesTableSuper}> */}
          <Table01
            columns={columnsForArticlesTable}
            data={
              userReducer.hideIrrelevant
                ? articlesArray.filter(
                    (article) => article.isRelevant !== false
                  )
                : articlesArray
            }
            selectedRowId={selectedArticle?.id}
            loading={loadingComponents.table01}
          />
          {/* </div> */}
        </div>
      </main>

      {isOpenAreYouSure && (
        <ModalYesNo
          isModalOpenSetter={setIsOpenAreYouSure}
          title="Are you sure?"
          // content={`You are about to delete article ID: ${selectedArticle.id}. \n Titled: ${selectedArticle.title}. \n This action cannot be undone.`}
          content={deleteArticleModalContent}
          handleYes={() => handleClickDelete(selectedArticle.id)}
          handleNo={() => setIsOpenAreYouSure(false)}
        />
      )}
    </TemplateView>
  );
}
