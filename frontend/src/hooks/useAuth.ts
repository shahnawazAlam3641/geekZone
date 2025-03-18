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
          dispatch(setUser(response.data.user));
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

  return { user, isAuthenticated: !!user };
}
