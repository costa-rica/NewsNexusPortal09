import styles from "../../../styles/modals/ModalInformation.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRectangleXmark } from "@fortawesome/free-solid-svg-icons";

export default function ModalInformation(props) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalTop}>
          <FontAwesomeIcon
            icon={faRectangleXmark}
            onClick={() => props.isModalOpenSetter(false)}
            className={styles.closeModalIcon}
          />
          <h2>{props.title}</h2>
        </div>
        <div>
          <p>{props.content}</p>
        </div>
      </div>
    </div>
  );
}
