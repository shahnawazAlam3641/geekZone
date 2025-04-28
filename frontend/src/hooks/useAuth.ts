import { useEffect, useRef } from "react";
import { logout, setLoading, setUser } from "../store/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../store";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import toast from "react-hot-toast";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector((state) => state.auth);
  const authCheckRef = useRef(false);

  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!authCheckRef.current && !loading && !user) {
      authCheckRef.current = true;

      const checkAuth = async () => {
        try {
          dispatch(setLoading(true));

          // show toast if request takes more than 6 seconds
          toastTimerRef.current = setTimeout(() => {
            toast.loading("Starting backend server, please wait...", {
              id: "auth-loading-toast",
            });
          }, 6000);

          const response = await axios.get(BASE_URL + "/auth/me", {
            withCredentials: true,
          });

          if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
          }
          toast.dismiss("auth-loading-toast");

          if (response.data.user) {
            dispatch(setUser(response.data.user));
          } else {
            dispatch(logout());
          }
        } catch (error) {
          if (toastTimerRef.current) {
            clearTimeout(toastTimerRef.current);
          }
          toast.dismiss("auth-loading-toast");

          console.log("Auth error:", error);
          dispatch(logout());
        } finally {
          dispatch(setLoading(false));
        }
      };

      checkAuth();
    }

    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
        toast.dismiss("auth-loading-toast");
      }
    };
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
