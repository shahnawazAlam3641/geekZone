import { useEffect, useRef } from "react";
import { logout, setLoading, setUser } from "../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../store";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const authCheckRef = useRef(false);

  useEffect(() => {
    // Only check auth once per component mount
    if (!authCheckRef.current && !loading && !user) {
      authCheckRef.current = true;

      const checkAuth = async () => {
        try {
          dispatch(setLoading(true));
          const response = await axios.get(BASE_URL + "/auth/me", {
            withCredentials: true,
          });

          if (response.data.user) {
            dispatch(setUser(response.data.user));
          } else {
            dispatch(logout());
          }
        } catch (error) {
          console.log("Auth error:", error);
          dispatch(logout());
        } finally {
          dispatch(setLoading(false));
        }
      };

      checkAuth();
    }
  }, [dispatch, user, loading]);

  const logoutUser = async () => {
    try {
      await axios.post(
        BASE_URL + "/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
      dispatch(logout());
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return { user, isAuthenticated: !!user, logoutUser };
}
