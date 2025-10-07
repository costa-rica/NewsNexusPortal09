import styles from "../../styles/ManageUser.module.css";
import InputPassword from "../common/InputPassword";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ModalInformation from "../common/modals/ModalInformation";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, updateStateArray } from "../../reducers/user";

export default function Login() {
  const [isOpenModalWarning, setIsOpenModalWarning] = useState(false);
  const [requestResponseMessage, setRequestResponseMessage] = useState("");
  const [email, emailSetter] = useState(
    process.env.NEXT_PUBLIC_MODE === "workstation"
      ? "nickrodriguez@kineticmetrics.com"
      : ""
  );
  const [password, passwordSetter] = useState(
    process.env.NEXT_PUBLIC_MODE === "workstation" ? "test" : ""
  );
  const dispatch = useDispatch();
  const router = useRouter();
  const userReducer = useSelector((state) => state.user);

  console.log(process.env.NEXT_PUBLIC_MODE);
  useEffect(() => {
    // fetchStateArray();
    if (userReducer.token) {
      // Redirect if token exists
      router.push("/articles/review");
    }
  }, [userReducer]); // Run effect if token changes
  useEffect(() => {
    fetchStateArray();
  }, []);

  const sendPasswordBackToParent = (passwordFromInputPasswordElement) => {
    passwordSetter(passwordFromInputPasswordElement);
  };

  const handleClickLogin = async () => {
    console.log(
      "Login ---> API URL:",
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/login`
    );
    console.log("- handleClickLogin 👀");
    console.log("- email:", email);

    const bodyObj = { email, password };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyObj),
      }
    );

    console.log("Received response:", response.status);

    let resJson = null;
    const contentType = response.headers.get("Content-Type");

    if (contentType?.includes("application/json")) {
      resJson = await response.json();
    }

    if (response.ok) {
      // if (resJson.user.isAdminForKvManagerWebsite) {
      console.log(resJson);
      resJson.email = email;
      try {
        dispatch(loginUser(resJson));
        router.push("/articles/review");
      } catch (error) {
        console.error("Error logging in:", error.message);
        setRequestResponseMessage("There's a problem with the website");
        setIsOpenModalWarning(true);
      }
    } else {
      const errorMessage =
        resJson?.error || `There was a server error: ${response.status}`;
      // alert(errorMessage);
      setRequestResponseMessage(errorMessage);
      setIsOpenModalWarning(true);
    }
  };

  const fetchStateArray = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/states`
      );

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text(); // Log response text for debugging
        throw new Error(`Server Error: ${errorText}`);
      }

      const result = await response.json();
      console.log("Fetched Data (states):", result);

      if (result.statesArray && Array.isArray(result.statesArray)) {
        const tempStatesArray = result.statesArray.map((stateObj) => ({
          ...stateObj,
          selected: false,
        }));
        dispatch(updateStateArray(tempStatesArray));
      } else {
        dispatch(updateStateArray([]));
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
      // dispatch(updateStateArray([]));
    }
  };

  return (
    <div>
      <main className={styles.main}>
        <div className={styles.divLeft}>
          <img
            className={styles.imgNewsNexusLogo}
            src="/images/logoWhiteBackground.png"
            alt="NewsNexus Logo"
          />
          <h1 className={styles.h1PageTitle}>Login</h1>

          <div className={styles.divForm}>
            <div className={styles.divEmailAndPassword}>
              <div className={styles.divInputGroup}>
                <label htmlFor="email">Email</label>
                <input
                  className={styles.inputEmail}
                  onChange={(e) => emailSetter(e.target.value)}
                  value={email}
                  type="email"
                  placeholder="example@gmail.com"
                />
              </div>
              <div className={styles.divInputGroup}>
                <label htmlFor="password">Password</label>
                <InputPassword
                  sendPasswordBackToParent={sendPasswordBackToParent}
                  value={password}
                />
              </div>
            </div>

            <div className={styles.divButtonAndLinks}>
              <div className={styles.divResetPassword}>
                <a href="/forgot-password">Forgot Password</a>
              </div>
              <button
                className={styles.btnSubmit}
                onClick={() => {
                  console.log("Submitted email:", email);
                  console.log("Submitted password:", password);
                  handleClickLogin();
                  // You can call your submit logic or dispatch here
                }}
              >
                Login
              </button>
              <div className={styles.divRegister}>
                <p>
                  Don't have an account yet? <a href="/register">Register</a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.divRight}>
          <img
            className={styles.imgKmLogo}
            src="/images/kmLogo_square1500.png"
            alt="Km Logo"
          />
        </div>
      </main>
      {isOpenModalWarning && (
        <ModalInformation
          isModalOpenSetter={setIsOpenModalWarning}
          title="Login error"
          content={requestResponseMessage}
        />
      )}
    </div>
  );
}
