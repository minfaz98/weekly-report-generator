import React from "react";
import { useAuth } from "../../hooks/useAuth";
import TeamMemberWorkspace from "./TeamMemberWorkspace";
import ManagerWorkspace from "../manager/ManagerWorkspace";

// 🌟 Upgraded: Importing the decoupled structural layouts
import Header from "../../components/Header";
import Navbar from "../../components/Navbar";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto p-2 space-y-2 font-sans bg-slate-50/30 min-h-screen">
      {/* 🚀 Dynamic Shared Infrastructure Stack */}
      <Header />
      {/* 🛡️ Primary Structural Role Boundary Routing Core */}
      <main className="animate-fadeIn">
        {user?.role === "MANAGER" ? (
          <ManagerWorkspace />
        ) : (
          <TeamMemberWorkspace />
        )}
      </main>
    </div>
  );
}
