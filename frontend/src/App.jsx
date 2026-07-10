import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";

// Optional: Import your workspaces directly if you want explicit route declarations later
import TeamMemberWorkspace from "./pages/dashboard/TeamMemberWorkspace";
import ManagerWorkspace from "./pages/dashboard/ManagerWorkspace";

export default function App() {
  return (
    <Routes>
      {/* Auth Route Layout Matrix */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />{" "}
        {/* 🌟 Explicit redirect target layer */}
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Main Core Workspaces Dashboard Entry Point */}
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}
