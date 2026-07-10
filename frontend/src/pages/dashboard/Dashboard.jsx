import React from "react";
import { useAuth } from "../../hooks/useAuth";
import TeamMemberWorkspace from "./TeamMemberWorkspace";
import ManagerWorkspace from "./ManagerWorkspace";

export default function Dashboard() {
  const { user } = useAuth();

  // If the elevated token returns the correct role string, drop them straight into management analytics
  if (user?.role === "MANAGER") {
    return <ManagerWorkspace />;
  }

  return <TeamMemberWorkspace />;
}
