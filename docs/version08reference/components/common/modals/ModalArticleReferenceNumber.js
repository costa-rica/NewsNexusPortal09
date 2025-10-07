import styles from "../../../styles/modals/ModalReportArticleReferenceNumber.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRectangleXmark } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function ModalArticleReferenceNumber(props) {
  const userReducer = useSelector((state) => state.user);
  const [articleReportContractsArray, setArticleReportContractsArray] =
    useState(
      props.selectedArticle?.ArticleReportContracts.map((contract) => ({
        ...contract,
        toggleEdit: true,
        originalArticleReferenceNumberInReport:
          contract.articleReferenceNumberInReport,
      }))
    );

  const isOriginalValueSame = (rowOriginal, propertyName) => {
    const originalContract = props.selectedArticle?.ArticleReportContracts.find(
      (contract) => contract.id === rowOriginal.id
    );

    return rowOriginal[propertyName] === originalContract?.[propertyName];
  };

  const handleUpdateArticleReportReferenceNumber = async (
    articleReportContract
  ) => {
    const bodyObj = {
      articleReferenceNumberInReport:
        articleReportContract.articleReferenceNumberInReport,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/update-article-report-reference-number/${articleReportContract.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userReducer.token}`,
          },
          body: JSON.stringify(bodyObj),
        }
      );

      if (response.status !== 200) {
        console.log(`There was a server error: ${response.status}`);
        return;
      }

      alert(
        `Article accepted status for report id: ${articleReportContract.reportId} updated successfully!`
      );
      props.fetchApprovedArticlesArray();
      props.isModalOpenSetter(false);
    } catch (error) {
      console.error("Error updating article accepted status:", error);
    }
  };

  return (
    <div className={styles.divOverlay}>
      <div className={styles.divContent}>
        <div className={styles.divTop}>
          <FontAwesomeIcon
            icon={faRectangleXmark}
            onClick={() => props.isModalOpenSetter(false)}
            className={styles.faIconClose}
          />

          <h2>
            Article-Report Reference Numbers for Article ID:{" "}
            {props.selectedArticle?.articleId}
          </h2>
          <p>Title: {props.selectedArticle?.title}</p>
        </div>
        <div className={styles.divMiddle}>
          This article was included in the following reports:
          <div className={styles.divArticleRejectionFormList}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Report Id</th>
                  <th>Reference Number</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {articleReportContractsArray.map((contract) => (
                  <tr key={contract.id}>
                    <td>{contract.reportId}</td>

                    <td>
                      <input
                        type="text"
                        className={`${styles.inputArticleReferenceNumber} ${
                          contract.toggleEdit
                            ? ""
                            : styles.inputArticleReferenceNumberEditable
                        }`}
                        disabled={contract.toggleEdit}
                        value={contract.articleReferenceNumberInReport || ""}
                        onChange={(e) => {
                          const updatedArray = articleReportContractsArray.map(
                            (item) =>
                              item.id === contract.id
                                ? {
                                    ...item,
                                    articleReferenceNumberInReport:
                                      e.target.value,
                                  }
                                : item
                          );
                          setArticleReportContractsArray(updatedArray);
                        }}
                      />
                    </td>
                    <td className={styles.tdEditButton}>
                      <button
                        className={`${styles.btn} ${
                          isOriginalValueSame(
                            contract,
                            "articleReferenceNumberInReport"
                          )
                            ? ""
                            : styles.btnWarningYellow
                        } ${
                          contract.articleReferenceNumberInReport
                            ? ""
                            : "btnRed"
                        }`}
                        onClick={() => {
                          const updatedArray = articleReportContractsArray.map(
                            (item) => {
                              if (item.id === contract.id) {
                                const isCurrentlyEditing = !item.toggleEdit;

                                return {
                                  ...item,
                                  toggleEdit: !item.toggleEdit,
                                  articleReferenceNumberInReport:
                                    isCurrentlyEditing
                                      ? item.originalArticleReferenceNumberInReport // reset on Undo
                                      : item.articleReferenceNumberInReport,
                                };
                              }
                              return item;
                            }
                          );

                          setArticleReportContractsArray(updatedArray);
                        }}
                        // onClick={() => {
                        //   const updatedArray = articleReportContractsArray.map(
                        //     (item) =>
                        //       item.id === contract.id
                        //         ? {
                        //             ...item,
                        //             toggleEdit: !item.toggleEdit,
                        //           }
                        //         : item
                        //   );
                        //   setArticleReportContractsArray(updatedArray);
                        // }}
                      >
                        {isOriginalValueSame(
                          contract,
                          "articleReferenceNumberInReport"
                        )
                          ? "Edit"
                          : "Undo"}
                      </button>
                    </td>
                    <td>
                      {isOriginalValueSame(
                        contract,
                        "articleReferenceNumberInReport"
                      ) ? (
                        <div className={styles.divPlaceHolder}></div>
                      ) : (
                        <button
                          className={`${styles.btn} ${
                            isOriginalValueSame(
                              contract,
                              "articleReferenceNumberInReport"
                            )
                              ? ""
                              : styles.btnActive
                          }`}
                          onClick={() =>
                            handleUpdateArticleReportReferenceNumber(contract)
                          }
                          disabled={isOriginalValueSame(
                            contract,
                            "articleReferenceNumberInReport"
                          )}
                        >
                          Submit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className={styles.divBottom}>
          <button
            onClick={() => {
              props.isModalOpenSetter(false);
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
