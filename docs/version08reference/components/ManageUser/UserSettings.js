import styles from "../../styles/UserSettings.module.css";
import TemplateView from "../common/TemplateView";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  updateRequestTableBodyParams,
  updateArticleTableBodyParams,
} from "../../reducers/user";

export default function UserSettings() {
  const userReducer = useSelector((state) => state.user);
  const dispatch = useDispatch();

  return (
    <TemplateView>
      <main className={styles.main}>
        <h1 className={styles.title}>User Settings</h1>

        <div className={styles.divSettingsGroup}>
          <h3>Requests Tables</h3>
          <div className={styles.divSettingDetail}>
            <span className={styles.lblSettingDetailMain}>
              Request Table Date Limit:
            </span>
            <input
              type="date"
              value={userReducer.requestTableBodyParams?.dateLimitOnRequestMade}
              className={styles.inputSettingDetail}
              onChange={(e) =>
                dispatch(
                  updateRequestTableBodyParams({
                    dateLimitOnRequestMade: e.target.value,
                  })
                )
              }
            />
          </div>
          <div className={styles.divSettingDetail}>
            <span className={styles.lblSettingDetailMain}>
              Include Automated :
            </span>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={
                  userReducer.requestTableBodyParams?.includeIsFromAutomation ||
                  false
                }
                onChange={(e) =>
                  dispatch(
                    updateRequestTableBodyParams({
                      includeIsFromAutomation: e.target.checked,
                    })
                  )
                }
              />
              <span className={styles.slider}></span>
            </label>
            {userReducer.requestTableBodyParams?.includeIsFromAutomation && (
              <span className={styles.confirmationText}>
                ⚠️ This could slow down the website
              </span>
            )}
          </div>
        </div>

        {/* <div className={styles.divSettingsGroup}>
          <h3>Article Tables</h3>
          <div className={styles.divSettingDetail}>
            <span className={styles.lblSettingDetailMain}>
              Article Published Date Limit:
            </span>
            <input
              type="date"
              value={
                userReducer.articleTableBodyParams
                  ?.returnOnlyThisPublishedDateOrAfter
              }
              className={styles.inputSettingDetail}
              onChange={(e) =>
                dispatch(
                  updateArticleTableBodyParams({
                    returnOnlyThisPublishedDateOrAfter: e.target.value,
                  })
                )
              }
            />
          </div>

          <div className={styles.divSettingDetail}>
            <span className={styles.lblSettingDetailMain}>
              Include Approved Articles :
            </span>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={
                  !userReducer.articleTableBodyParams?.returnOnlyIsNotApproved
                }
                onChange={(e) =>
                  dispatch(
                    updateArticleTableBodyParams({
                      returnOnlyIsNotApproved: !e.target.checked,
                    })
                  )
                }
              />
              <span className={styles.slider}></span>
            </label>
            {!userReducer.articleTableBodyParams?.returnOnlyIsNotApproved && (
              <span className={styles.confirmationText}>
                ⚠️ This could slow down the website
              </span>
            )}
          </div>
          <div className={styles.divSettingDetail}>
            <span className={styles.lblSettingDetailMain}>
              Include Relevant Articles :
            </span>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={
                  !userReducer.articleTableBodyParams?.returnOnlyIsRelevant
                }
                onChange={(e) =>
                  dispatch(
                    updateArticleTableBodyParams({
                      returnOnlyIsRelevant: !e.target.checked,
                    })
                  )
                }
              />
              <span className={styles.slider}></span>
            </label>
            {!userReducer.articleTableBodyParams?.returnOnlyIsRelevant && (
              <span className={styles.confirmationText}>
                ⚠️ This could slow down the website
              </span>
            )}
          </div>
        </div> */}
      </main>
    </TemplateView>
  );
}
