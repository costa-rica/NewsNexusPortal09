import styles from "../../styles/common/SummaryStatistics.module.css";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateArticlesSummaryStatistics } from "../../reducers/user";
import ModalLoading from "./modals/ModalLoading";
export default function SummaryStatistics() {
  const userReducer = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [loadingSummaryStatistics, setLoadingSummaryStatistics] =
    useState(false);

  useEffect(() => {
    fetchArticlesSummaryStatistics();
  }, []);

  const fetchArticlesSummaryStatistics = async () => {
    setLoadingSummaryStatistics(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/articles/summary-statistics`,
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
      console.log(
        "Fetched Data (articles/summary-statistics):",
        result.summaryStatistics
      );

      if (result.summaryStatistics) {
        // console.log("-----> make summary statistics");
        dispatch(updateArticlesSummaryStatistics(result.summaryStatistics));
      }
    } catch (error) {
      console.error(
        "Error fetching articles summary statistics:",
        error.message
      );
    }
    setLoadingSummaryStatistics(false);
  };

  return loadingSummaryStatistics ? (
    <div className={styles.divTableMain}>
      <ModalLoading isVisible={true} sizeOfParent={true} />
    </div>
  ) : (
    <div className={styles.divArticleSummaryStatisticsGroupSuper}>
      <div className={styles.divArticleSummaryStatisticsGroup}>
        <div className={styles.divArticlesSummaryStatisticsTitle}>
          Article count
        </div>
        <div className={styles.divArticlesSummaryStatisticsMetric}>
          {/* {userReducer.articlesSummaryStatistics?.articlesCount.toLocaleString()} */}
          {userReducer.articlesSummaryStatistics?.articlesCount != null
            ? userReducer.articlesSummaryStatistics.articlesCount.toLocaleString()
            : "N/A"}
        </div>
      </div>

      <div className={styles.divArticleSummaryStatisticsGroup}>
        <div className={styles.divArticlesSummaryStatisticsTitle}>
          Approved articles
        </div>
        <div className={styles.divArticlesSummaryStatisticsMetric}>
          {/* {userReducer.articlesSummaryStatistics?.articleIsApprovedCount.toLocaleString() } */}
          {userReducer.articlesSummaryStatistics?.articleIsApprovedCount != null
            ? userReducer.articlesSummaryStatistics.articleIsApprovedCount.toLocaleString()
            : "N/A"}
          <div
            className={styles.divArticlesSummaryStatisticsMetricParenthesesDiv}
          >
            <div className="tooltipWrapper">
              (newly approved:{" "}
              {userReducer.articlesSummaryStatistics
                ?.approvedButNotInReportCount != null
                ? userReducer.articlesSummaryStatistics
                    .approvedButNotInReportCount
                : "N/A"}
              )
              <span className="tooltipText">
                {userReducer.articlesSummaryStatistics
                  ?.approvedButNotInReportCount != null
                  ? userReducer.articlesSummaryStatistics
                      .approvedButNotInReportCount
                  : "N/A"}{" "}
                articles have been approved but not added to a report
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.divArticleSummaryStatisticsGroup}>
        <div className={styles.divArticlesSummaryStatisticsTitle}>
          Articles assigned to a state
        </div>
        <div className={styles.divArticlesSummaryStatisticsMetric}>
          {/* {userReducer.articlesSummaryStatistics?.articleHasStateCount.toLocaleString()} */}
          {userReducer.articlesSummaryStatistics?.articleHasStateCount != null
            ? userReducer.articlesSummaryStatistics.articleHasStateCount.toLocaleString()
            : "N/A"}
        </div>
      </div>
      <div className={styles.divArticleSummaryStatisticsGroup}>
        <div className={styles.divArticlesSummaryStatisticsTitle}>
          Articles added this week
        </div>
        <div className={styles.divArticlesSummaryStatisticsMetric}>
          {
            userReducer.articlesSummaryStatistics
              ?.articlesSinceLastThursday20hEst
          }
        </div>
      </div>
      <div className={styles.divArticleSummaryStatisticsGroupTransparent}>
        <button
          className={styles.btnSubmit}
          onClick={() => {
            fetchArticlesSummaryStatistics();
          }}
        >
          Refresh
        </button>
      </div>
      {/* <div className={styles.divArticleSummaryStatisticsGroupTransparent}>
        {JSON.stringify(userReducer.articleTableBodyParams, null, 2)}
      </div> */}
    </div>
  );
}
