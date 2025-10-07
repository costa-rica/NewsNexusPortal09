// import Home from '../components/Home';
import { useDispatch } from "react-redux";
import { logoutUserFully } from "../../reducers/user";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Logout() {
  const dispatch = useDispatch();
  const router = useRouter();
  useEffect(() => {
    dispatch(logoutUserFully());
    router.push("/");
  }, []);
  return <div>Logout Screen</div>;
}
