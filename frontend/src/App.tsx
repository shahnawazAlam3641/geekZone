import "./App.css";
import { Navigate, Route, Routes } from "react-router";
import Landing from "./components/pages/Landing";
import Register from "./components/pages/Register";
import Login from "./components/pages/Login";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Feed from "./components/layout/Feed";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />}></Route>
      <Route path="/login" element={<Login />}></Route>

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="feed" element={<Feed />} />
        <Route
          path="messages"
          element={<h1 className="text-5xl text-amber-50">message</h1>}
        />
        <Route
          path="search"
          element={<div className="text-5xl text-amber-50">Search Page</div>}
        />
        <Route
          path="notifications"
          element={
            <div className="text-5xl text-amber-50">Notifications Page</div>
          }
        />
        <Route
          path="profile"
          element={<div className="text-5xl text-amber-50">Profile Page</div>}
        />
        <Route
          path="settings"
          element={<div className="text-5xl text-amber-50">Settings Page</div>}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
