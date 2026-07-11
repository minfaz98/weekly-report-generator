import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Layers,
  History,
  User,
  BarChart2,
  FolderPlus,
  Users,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  // Helper function to check if a navigation item route is currently active
  const isActive = (path) => location.pathname === path;

  // Base styling configurations for navigation links
  const baseLinkStyle =
    "flex items-center gap-2 px-4 py-2.5 rounded-xl transition text-xs font-bold w-full ";
  const activeStyle = "bg-slate-900 text-white shadow-sm";
  const inactiveStyle =
    "text-slate-500 hover:text-slate-800 hover:bg-slate-100";

  // Check if the current user possesses administrative clearances
  const isAdminOrManager = user?.is_superuser || user?.role === "MANAGER";

  return (
    <nav className="w-full bg-white border-b border-slate-100 py-2 px-4 shadow-sm">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center gap-2">
        {/* 🌟 SHARED NAVIGATION LINKS: Available to all authenticated workers */}
        <Link
          to="/dashboard"
          className={`${baseLinkStyle} ${isActive("/dashboard") ? activeStyle : inactiveStyle}`}
        >
          <Layers size={14} />
          <span>Workspace Console</span>
        </Link>

        {/* 🌟 ROLE-BASED CONDITIONAL LINK DECK */}
        {isAdminOrManager ? (
          <>
            {/* Manager/Admin Specific Matrix Links */}
            <Link
              to="/analytics"
              className={`${baseLinkStyle} ${isActive("/analytics") ? activeStyle : inactiveStyle}`}
            >
              <BarChart2 size={14} className="text-blue-600" />
              <span>AI Insights Panel</span>
            </Link>

            <Link
              to="/manage-projects"
              className={`${baseLinkStyle} ${isActive("/manage-projects") ? activeStyle : inactiveStyle}`}
            >
              <FolderPlus size={14} className="text-blue-600" />
              <span>Project Matrix</span>
            </Link>

            <Link
              to="/workforce"
              className={`${baseLinkStyle} ${isActive("/workforce") ? activeStyle : inactiveStyle}`}
            >
              <Users size={14} className="text-blue-600" />
              <span>Team Directory</span>
            </Link>
          </>
        ) : (
          <>
            {/* Standard Team Member Specific Links */}
            <Link
              to="/history-logs"
              className={`${baseLinkStyle} ${isActive("/history-logs") ? activeStyle : inactiveStyle}`}
            >
              <History size={14} />
              <span>My Submission Logs</span>
            </Link>
          </>
        )}

        {/* Profile Settings Link (Shared by Everyone) */}
        <Link
          to="/profile-settings"
          className={`${baseLinkStyle} ${isActive("/profile-settings") ? activeStyle : inactiveStyle} sm:ml-auto`}
        >
          <User size={14} />
          <span>Security Portal</span>
        </Link>
      </div>
    </nav>
  );
}
