import { Routes, Route } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}
