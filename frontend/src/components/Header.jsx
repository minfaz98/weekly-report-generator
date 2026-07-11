import React from "react";
import { FileText, LogOut, ShieldCheck, UserCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

export default function Header() {
  const { user, logout } = useAuth();

  const handleSignOut = () => {
    logout();
    toast.success("Signed out successfully.");
    window.location.href = "/login";
  };

  const isAdminOrManager = user?.is_superuser || user?.role === "MANAGER";

  return (
    <header
      className={`p-4 sm:p-6 rounded-2xl text-white flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-lg transition-all duration-300 gap-4 ${
        isAdminOrManager
          ? "bg-gradient-to-r from-slate-800 to-indigo-950" // Sleek dark/indigo theme for managers
          : "bg-gradient-to-r from-blue-700 to-indigo-800" // Dynamic corporate blue theme for team members
      }`}
    >
      <div className="w-full sm:w-auto">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <FileText className="animate-pulse shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
            <h1 className="text-lg sm:text-xl font-black tracking-tight">
              Performance Sync Terminal
            </h1>
          </div>

          {/* Dynamic Visual Role Badge Indicator */}
          <span
            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-0.5 border whitespace-nowrap ${
              isAdminOrManager
                ? "bg-blue-500/20 text-blue-200 border-blue-400/30"
                : "bg-emerald-500/20 text-emerald-200 border-emerald-400/30"
            }`}
          >
            {isAdminOrManager ? (
              <>
                <ShieldCheck size={10} /> Management
              </>
            ) : (
              <>
                <UserCheck size={10} /> Contributor
              </>
            )}
          </span>
        </div>

        <p className="text-xs text-blue-200 mt-1.5 leading-relaxed max-w-xl">
          {isAdminOrManager
            ? `Welcome back, Administrator @${user?.username || "Staff"}. AI insights and workspace data lines are active.`
            : `Welcome back, @${user?.username || "Member"}. Compile structures and report weekly project iterations.`}
        </p>
      </div>

      <button
        onClick={handleSignOut}
        className="w-full sm:w-auto justify-center bg-white/10 hover:bg-white/20 px-4 py-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-white/5 shadow-sm whitespace-nowrap shrink-0"
      >
        <LogOut size={14} /> Sign Out
      </button>
    </header>
  );
}
