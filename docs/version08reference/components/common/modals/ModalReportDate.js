import styles from "../../../styles/modals/ModalReportDate.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRectangleXmark } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
export default function ModalReportDate(props) {
  const [reportDate, reportDateSetter] = useState(() => {
    const initialDate = props.selectedReport?.dateSubmittedToClient;
    return initialDate ? initialDate.split("T")[0] : "";
  });

  return (
    <div className={styles.divOverlay}>
      <div className={styles.divContent}>
        <div className={styles.divTop}>
          <FontAwesomeIcon
            icon={faRectangleXmark}
            onClick={() => props.isModalOpenSetter(false)}
            className={styles.faIconClose}
          />
          {props.selectedReport.dateSubmittedToClient !== "N/A" ? (
            <h2 className={styles.divWarning}>
              Report already has a date are you sure you want to change it?
            </h2>
          ) : (
            <h2>{props.title}</h2>
          )}
        </div>
        <div className={styles.divMiddle}>
          <p>{props.content}</p>

          <input
            type="date"
            value={reportDate}
            className={`${styles.inputDate} ${
              props.selectedReport.dateSubmittedToClient !== "N/A"
                ? styles.divWarning
                : ""
            }`}
            onChange={(e) => reportDateSetter(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>
        <div className={styles.divBottom}>
          <button
            onClick={() => {
              props.sendNewReportDate(reportDate);
              props.isModalOpenSetter(false);
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
