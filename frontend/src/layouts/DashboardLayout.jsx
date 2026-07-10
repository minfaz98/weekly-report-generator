import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  HiOutlineDocumentReport,
  HiOutlineChartBar,
  HiOutlineFolder,
  HiLogout,
  HiUser,
} from "react-icons/hi";

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Dynamic Navigation Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4">
        <div className="space-y-6">
          <div className="px-3 py-2 border-b border-slate-700">
            <h1 className="text-lg font-bold tracking-wide text-blue-400">
              ReportSync Engine
            </h1>
            <span className="text-xs text-gray-400 font-mono">
              Role: {user?.role}
            </span>
          </div>

          <nav className="space-y-1">
            {/* Shared Route - Dynamic presentation based on role */}
            <Link
              to="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 text-sm font-medium transition"
            >
              <HiOutlineDocumentReport size={20} className="text-gray-400" />
              <span>
                {user?.role === "MANAGER"
                  ? "Team Dashboard"
                  : "My Weekly Reports"}
              </span>
            </Link>

            {/* Restricted Manager Layout Access Controls */}
            {user?.role === "MANAGER" && (
              <>
                <Link
                  to="/projects"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-slate-800 text-sm font-medium transition"
                >
                  <HiOutlineFolder size={20} className="text-gray-400" />
                  <span>Manage Projects</span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* User Identity Matrix Footer */}
        <div className="border-t border-slate-700 pt-4 space-y-2">
          <div className="flex items-center gap-3 px-3">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white uppercase">
              {user?.username.slice(0, 2)}
            </div>
            <div className="truncate text-xs">
              <p className="font-semibold text-gray-200">{user?.username}</p>
              <p className="text-gray-400 text-[10px]">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md bg-red-950/40 hover:bg-red-900/40 text-red-400 text-xs font-semibold transition"
          >
            <HiLogout size={16} />
            <span>Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Primary Dashboard Content View Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative p-8">
        <Outlet />
      </main>
    </div>
  );
}
