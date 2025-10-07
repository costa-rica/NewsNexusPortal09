import styles from "../../../styles/modals/ModalReportArticleRejected.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRectangleXmark } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function ModalArticleRejected(props) {
  const userReducer = useSelector((state) => state.user);
  const [articleReportContractsArray, setArticleReportContractsArray] =
    useState(props.selectedArticle?.ArticleReportContracts);
  const isOriginalValueSame = (rowOriginal, propertyName) => {
    const originalContract = props.selectedArticle?.ArticleReportContracts.find(
      (contract) => contract.id === rowOriginal.id
    );

    return rowOriginal[propertyName] === originalContract?.[propertyName];
  };

  const handleUpdateArticleAcceptedByCpsc = async (articleReportContract) => {
    const bodyObj = {
      articleRejectionReason: articleReportContract.articleRejectionReason,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/reports/toggle-article-rejection/${articleReportContract.id}`,
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

          <h2>Report Rejected for Article ID: {props.selectedArticle?.id}</h2>
          <p>Title: {props.selectedArticle?.title}</p>
        </div>
        <div className={styles.divMiddle}>
          This article was included in the following reports:
          <div className={styles.divArticleRejectionFormList}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Report Id</th>
                  <th>Accepted</th>
                  <th>Reason</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {articleReportContractsArray.map((contract) => (
                  <tr key={contract.id}>
                    <td>{contract.reportId}</td>
                    <td className={styles.divAccepted}>
                      <button
                        className={`${styles.btn} ${
                          isOriginalValueSame(contract, "articleAcceptedByCpsc")
                            ? ""
                            : styles.btnWarningYellow
                        } ${contract.articleAcceptedByCpsc ? "" : "btnRed"}`}
                        onClick={() => {
                          const updatedArray = articleReportContractsArray.map(
                            (item) =>
                              item.id === contract.id
                                ? {
                                    ...item,
                                    articleAcceptedByCpsc:
                                      !item.articleAcceptedByCpsc,
                                  }
                                : item
                          );
                          setArticleReportContractsArray(updatedArray);
                        }}
                      >
                        {contract.articleAcceptedByCpsc ? "Yes" : "No"}
                      </button>
                    </td>
                    <td>
                      <input
                        type="text"
                        className={styles.inputRejectionReason}
                        disabled={isOriginalValueSame(
                          contract,
                          "articleAcceptedByCpsc"
                        )}
                        value={contract.articleRejectionReason || ""}
                        onChange={(e) => {
                          const updatedArray = articleReportContractsArray.map(
                            (item) =>
                              item.id === contract.id
                                ? {
                                    ...item,
                                    articleRejectionReason: e.target.value,
                                  }
                                : item
                          );
                          setArticleReportContractsArray(updatedArray);
                        }}
                      />
                    </td>
                    <td>
                      {isOriginalValueSame(
                        contract,
                        "articleAcceptedByCpsc"
                      ) ? (
                        <div className={styles.divPlaceHolder}></div>
                      ) : (
                        <button
                          className={`${styles.btn} ${
                            isOriginalValueSame(
                              contract,
                              "articleAcceptedByCpsc"
                            )
                              ? ""
                              : styles.btnActive
                          }`}
                          onClick={() =>
                            handleUpdateArticleAcceptedByCpsc(contract)
                          }
                          disabled={isOriginalValueSame(
                            contract,
                            "articleAcceptedByCpsc"
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
