import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import styles from "../../styles/InputPassword.module.css";

export default function InputPassword(props) {
  const [passwordVisible, passwordVisibleSetter] = useState(false);
  const [password, passwordSetter] = useState(props.value);

  const togglePasswordVisibility = () => {
    passwordVisibleSetter((prev) => !prev);
  };

  const changeHandler = (e) => {
    passwordSetter(e.target.value);
    props.sendPasswordBackToParent(e.target.value);
  };

  return (
    <div className={styles.divSuperInput}>
      <input
        className={styles.inputPassword}
        onChange={changeHandler}
        value={password}
        placeholder="password"
        type={passwordVisible ? "text" : "password"}
      />

      <FontAwesomeIcon
        icon={passwordVisible ? faEyeSlash : faEye}
        onClick={togglePasswordVisibility}
        className={styles.iconEye}
        style={{ color: passwordVisible ? "#000" : "#aaa" }}
      />
    </div>
  );
}
