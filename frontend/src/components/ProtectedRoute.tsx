import { useEffect, useState } from "react";
import { useAppSelector } from "../store";
import { useLocation, Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const { user, loading } = useAppSelector((state) => state.auth);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useAuth();

  useEffect(() => {
    if (!loading) {
      setInitialCheckDone(true);
    }
  }, [loading]);

  console.log(
    "Protected route render - authenticated:",
    !!user,
    "loading:",
    loading,
    "initialCheckDone:",
    initialCheckDone
  );

  if (loading || !initialCheckDone) {
    return <h1>Loading...</h1>;
  }

  if (!user) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("User authenticated, rendering children");
  return <>{children}</>;
}
