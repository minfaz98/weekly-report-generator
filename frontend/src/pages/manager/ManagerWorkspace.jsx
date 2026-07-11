import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Layers,
  History,
  FolderPlus,
  X,
  AlertTriangle,
  Users as UsersIcon,
  Sparkles,
} from "lucide-react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import AIChat from "../../components/AIChat";

import AnalyticsDashboard from "./AnalyticsDashboard";
import ProjectForm from "./ProjectForm";
import ActivityFeed from "./ActivityFeed";
import ProjectDirectory from "./ProjectDirectory";
import Users from "./Users";

export default function ManagerWorkspace() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [filterMember, setFilterMember] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [editingProjId, setEditingProjId] = useState(null);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const [projectDeleteModal, setProjectDeleteModal] = useState({
    isOpen: false,
    projectId: null,
    projectName: "",
  });

  const [metrics, setMetrics] = useState({
    total: 0,
    submitted: 0,
    pending: 0,
    blockers: 0,
    compliance: 0,
  });
  const [trendChartData, setTrendChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [statusChartData, setStatusChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [workloadChartData, setWorkloadChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    fetchAggregatedManagerData();
  }, [filterMember, filterProject, filterStatus, filterStart, filterEnd]);

  const fetchAggregatedManagerData = async () => {
    try {
      const params = {};
      if (filterMember) params.member = filterMember;
      if (filterProject) params.project = filterProject;
      if (filterStatus) params.status = filterStatus;
      if (filterStart) params.start_date = filterStart;
      if (filterEnd) params.end_date = filterEnd;

      const [reportsRes, projectsRes, usersRes] = await Promise.all([
        API.get("reports/", { params }),
        API.get("projects/"),
        API.get("auth/users/"),
      ]);

      const fetchedReports = Array.isArray(reportsRes.data)
        ? reportsRes.data
        : [];
      setReports(fetchedReports);

      const projectsData = projectsRes.data?.results || projectsRes.data;
      const cleanProjects = Array.isArray(projectsData) ? projectsData : [];
      setProjects(cleanProjects);

      const userData = usersRes.data?.results || usersRes.data;
      const cleanUsers = Array.isArray(userData) ? userData : [];
      setUsers(cleanUsers);

      const sub = fetchedReports.filter((r) => r.status === "SUBMITTED").length;
      const pend = fetchedReports.filter(
        (r) => r.status !== "SUBMITTED",
      ).length;
      const blk = fetchedReports.filter(
        (r) => r.blockers && r.blockers.trim().length > 0,
      ).length;
      const rate = fetchedReports.length
        ? Math.round((sub / fetchedReports.length) * 100)
        : 0;

      setMetrics({
        total: fetchedReports.length,
        submitted: sub,
        pending: pend,
        blockers: blk,
        compliance: rate,
      });

      const trendMap = {};
      fetchedReports.forEach((r) => {
        if (r.week_start) {
          trendMap[r.week_start] =
            (trendMap[r.week_start] || 0) + (r.tasks_completed ? 1 : 0);
        }
      });
      const sortedDates = Object.keys(trendMap).sort();
      setTrendChartData({
        labels: sortedDates,
        datasets: [
          {
            label: "Tasks Completed Matrix",
            data: sortedDates.map((d) => trendMap[d]),
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.3,
            fill: true,
          },
        ],
      });

      const teamMembers = cleanUsers.filter((u) => u.role === "TEAM_MEMBER");
      setStatusChartData({
        labels: teamMembers.map((u) => u.username),
        datasets: [
          {
            label: "Submitted Logs",
            data: teamMembers.map(
              (u) =>
                fetchedReports.filter(
                  (r) => r.user_name === u.username && r.status === "SUBMITTED",
                ).length,
            ),
            backgroundColor: "rgb(16, 185, 129)",
          },
          {
            label: "Pending Drafts",
            data: teamMembers.map(
              (u) =>
                fetchedReports.filter(
                  (r) => r.user_name === u.username && r.status !== "SUBMITTED",
                ).length,
            ),
            backgroundColor: "rgb(239, 68, 68)",
          },
        ],
      });

      const projectMap = {};
      fetchedReports.forEach((r) => {
        projectMap[r.project_name || "General Bench"] =
          (projectMap[r.project_name || "General Bench"] || 0) +
          (parseFloat(r.hours_worked) || 0);
      });
      setWorkloadChartData({
        labels: Object.keys(projectMap),
        datasets: [
          {
            data: Object.values(projectMap),
            backgroundColor: [
              "rgba(59, 130, 246, 0.75)",
              "rgba(16, 185, 129, 0.75)",
              "rgba(245, 158, 11, 0.75)",
              "rgba(139, 92, 246, 0.75)",
              "rgba(239, 68, 68, 0.75)",
            ],
            borderWidth: 1,
          },
        ],
      });
    } catch (err) {
      toast.error("Telemetry Ingestion Pipeline Connection Error.");
    }
  };

  const handleResetFilters = () => {
    setFilterMember("");
    setFilterProject("");
    setFilterStatus("");
    setFilterStart("");
    setFilterEnd("");
    toast.success("Workspace criteria filters cleared.");
  };

  const handleProjectCRUD = async (e) => {
    e.preventDefault();
    if (!projName.trim())
      return toast.error("Project Name Identity Cannot Be Empty.");
    const payload = {
      name: projName.trim(),
      description: projDesc.trim(),
      assigned_member_ids: selectedWorkers.map(Number),
    };
    try {
      if (editingProjId) {
        await API.put(`projects/${editingProjId}/`, payload);
        toast.success("Project structure modified successfully.");
      } else {
        await API.post("projects/", payload);
        toast.success("New project workspace created.");
      }
      resetProjectForm();
      setActiveTab("projects-list");
      fetchAggregatedManagerData();
    } catch (err) {
      toast.error("Database validation constraint exception rejected action.");
    }
  };

  const openProjectDeleteModal = (id, name) => {
    setProjectDeleteModal({ isOpen: true, projectId: id, projectName: name });
  };

  const closeProjectDeleteModal = () => {
    setProjectDeleteModal({ isOpen: false, projectId: null, projectName: "" });
  };

  const confirmProjectDeletion = async () => {
    try {
      await API.delete(`projects/${projectDeleteModal.projectId}/`);
      toast.success(
        `Project "${projectDeleteModal.projectName}" successfully purged.`,
      );
      closeProjectDeleteModal();
      fetchAggregatedManagerData();
    } catch (err) {
      toast.error("Linked dependencies locked asset allocation.");
      closeProjectDeleteModal();
    }
  };

  const executeReportDeletion = async (id, member) => {
    try {
      await API.delete(`reports/${id}/`);
      toast.success(`Tracking record removed successfully.`);
      fetchAggregatedManagerData();
    } catch (err) {
      toast.error("Server constraint error rejected action.");
    }
  };

  const startProjectEditing = (p) => {
    setEditingProjId(p.id);
    setProjName(p.name);
    setProjDesc(p.description || "");
    setSelectedWorkers(p.assigned_members?.map((m) => m.id) || []);
    setActiveTab("deploy-project");
  };

  const handleCheckboxChange = (id) => {
    setSelectedWorkers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const resetProjectForm = () => {
    setProjName("");
    setProjDesc("");
    setSelectedWorkers([]);
    setEditingProjId(null);
  };

  const computeSubmissionStatus = (report) => {
    if (report.status !== "SUBMITTED")
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">
          Pending
        </span>
      );
    if (
      report.week_end &&
      report.updated_at &&
      new Date(report.updated_at) > new Date(report.week_end)
    ) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">
          Late
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">
        Submitted
      </span>
    );
  };

  const hasActiveFilters =
    filterMember || filterProject || filterStatus || filterStart || filterEnd;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans min-h-screen relative">
      {/* Dynamic Header Interface Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 border border-slate-100 rounded-2xl shadow-sm gap-4">
        <div className="flex flex-wrap gap-2 text-xs font-bold w-full md:w-auto">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1 ${activeTab === "analytics" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}
          >
            <BarChart3 size={13} /> Analytics Telemetry
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1 ${activeTab === "activity" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}
          >
            <History size={13} /> Activity Feed
          </button>
          <button
            onClick={() => setActiveTab("deploy-project")}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1 ${activeTab === "deploy-project" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}
          >
            <FolderPlus size={13} /> Deploy Project
          </button>
          <button
            onClick={() => setActiveTab("projects-list")}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1 ${activeTab === "projects-list" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}
          >
            <Layers size={13} /> Projects Matrix
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1 ${activeTab === "users" ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}
          >
            <UsersIcon size={13} /> User Management
          </button>
        </div>

        <button
          onClick={() => setIsAiOpen(true)}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-lg shadow-blue-500/20"
        >
          <Sparkles size={14} /> AI Assistant Proxy
        </button>
      </div>

      {/* Query Filters Module */}
      {(activeTab === "analytics" || activeTab === "activity") && (
        <section className="bg-white p-4 border border-slate-100 rounded-2xl shadow-sm space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs font-semibold">
            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className="border p-2.5 rounded-xl bg-slate-50/50 outline-none focus:bg-white transition w-full"
            >
              <option value="">Filter By Team Member...</option>
              {users
                .filter((u) => u.role === "TEAM_MEMBER")
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username}
                  </option>
                ))}
            </select>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="border p-2.5 rounded-xl bg-slate-50/50 outline-none focus:bg-white transition w-full"
            >
              <option value="">Filter By Project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border p-2.5 rounded-xl bg-slate-50/50 outline-none focus:bg-white transition w-full"
            >
              <option value="">Filter By Status...</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
            </select>
            <input
              type="date"
              value={filterStart}
              onChange={(e) => setFilterStart(e.target.value)}
              className="border p-2 rounded-xl bg-slate-50/50 outline-none text-slate-600 focus:bg-white transition w-full"
            />
            <input
              type="date"
              value={filterEnd}
              onChange={(e) => setFilterEnd(e.target.value)}
              className="border p-2 rounded-xl bg-slate-50/50 outline-none text-slate-600 focus:bg-white transition w-full"
            />
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-slate-500 hover:text-red-600 px-3 py-1.5 text-xs font-bold transition rounded-xl hover:bg-red-50"
              >
                <X size={14} />
                <span>Reset Dashboard Queries</span>
              </button>
            </div>
          )}
        </section>
      )}

      {/* Tab Views Router Wrapper */}
      <main className="min-h-[450px]">
        {activeTab === "analytics" && (
          <AnalyticsDashboard
            metrics={metrics}
            trendChartData={trendChartData}
            statusChartData={statusChartData}
            workloadChartData={workloadChartData}
          />
        )}
        {activeTab === "activity" && (
          <ActivityFeed
            reports={reports}
            computeSubmissionStatus={computeSubmissionStatus}
            executeReportDeletion={executeReportDeletion}
          />
        )}
        {activeTab === "deploy-project" && (
          <ProjectForm
            projName={projName}
            setProjName={setProjName}
            projDesc={projDesc}
            setProjDesc={setProjDesc}
            users={users}
            selectedWorkers={selectedWorkers}
            handleCheckboxChange={handleCheckboxChange}
            handleProjectCRUD={handleProjectCRUD}
            editingProjId={editingProjId}
            resetProjectForm={resetProjectForm}
          />
        )}
        {activeTab === "projects-list" && (
          <ProjectDirectory
            projects={projects}
            startProjectEditing={startProjectEditing}
            executeProjectDeletion={openProjectDeleteModal}
          />
        )}
        {activeTab === "users" && (
          <Users users={users} refreshUserList={fetchAggregatedManagerData} />
        )}
      </main>

      {/* Confirmation Modal Overlay */}
      {projectDeleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 max-w-sm w-full shadow-xl space-y-4 text-slate-700 font-semibold text-xs">
            <div className="flex justify-between items-start border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-red-600 font-black">
                <AlertTriangle size={15} />
                <h3>Purge Deployed Project</h3>
              </div>
              <button
                type="button"
                onClick={closeProjectDeleteModal}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={14} />
              </button>
            </div>
            <div className="space-y-2 text-slate-600 leading-relaxed font-medium">
              <p>
                Are you sure you want to completely destroy the project matrix
                framework for{" "}
                <strong className="text-slate-900 font-bold">
                  "{projectDeleteModal.projectName}"
                </strong>
                ?
              </p>
              <p className="bg-red-50 border border-dashed border-red-100 text-[11px] text-red-700 p-2.5 rounded-xl font-semibold">
                Warning: Purging this directory will clear all linked tracking
                metrics and child structural references across the platform
                database.
              </p>
            </div>
            <div className="flex gap-2 justify-end font-bold pt-1">
              <button
                type="button"
                onClick={closeProjectDeleteModal}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmProjectDeletion}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl shadow-sm transition"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}

      <AIChat isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
