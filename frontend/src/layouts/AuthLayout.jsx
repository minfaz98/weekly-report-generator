import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Panel */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-700 to-indigo-900 text-white p-10">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-6">Weekly Report Generator</h1>

          <p className="text-lg leading-8 text-blue-100">
            A modern platform for managing projects, submitting weekly reports,
            tracking productivity, and monitoring team performance.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center bg-gray-50 p-6">
        <Outlet />
      </div>
    </div>
  );
}
