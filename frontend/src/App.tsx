import "./App.css";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Login from "./components/pages/Login";
import Register from "./components/pages/Register";
import Feed from "./components/layout/Feed";
import UserProfile from "./components/pages/UserProfile";
import Landing from "./components/pages/Landing";
import MainLayout from "./components/layout/MainLayout";
import Messages from "./components/pages/Messages";
import SearchPage from "./components/layout/SearchPage";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes - only accessible when not authenticated */}
        <Route
          path="/"
          element={
            <ProtectedRoute requireAuth={false}>
              <Landing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute requireAuth={false}>
              <Register />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:userId"
          element={
            // <ProtectedRoute>
            <MainLayout>
              <UserProfile />
              {/* <div>Call </div> */}
            </MainLayout>
            // </ProtectedRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Feed />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages/:conversationId?"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <MainLayout>
                <SearchPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
