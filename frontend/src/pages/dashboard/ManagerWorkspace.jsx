import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineTrash,
  HiOutlinePencilAlt,
  HiOutlineUserGroup,
  HiOutlineFolderAdd,
  HiOutlineLogout,
  HiOutlineFilter,
  HiOutlineRefresh,
  HiOutlineBriefcase,
} from "react-icons/hi";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/Input";

export default function ManagerWorkspace() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Primary Data Collections
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // Filters State Grid
  const [filterMember, setFilterMember] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Project Management CRUD & Allocation Form State
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [allocatedMemberIds, setAllocatedMemberIds] = useState([]);
  const [editingProjectId, setEditingProjectId] = useState(null);

  // Status Metrics Panel
  const [metrics, setMetrics] = useState({
    total: 0,
    submitted: 0,
    pending: 0,
    late: 0,
  });

  useEffect(() => {
    fetchComprehensiveDashboardData();
  }, [
    filterMember,
    filterProject,
    filterStatus,
    filterStartDate,
    filterEndDate,
  ]);

  const fetchComprehensiveDashboardData = async () => {
    try {
      // 1. Compile backend request parameters based on target filter inputs
      const params = {};
      if (filterMember) params.user = filterMember;
      if (filterProject) params.project = filterProject;
      if (filterStatus) params.status = filterStatus;
      if (filterStartDate) params.start_date = filterStartDate;
      if (filterEndDate) params.end_date = filterEndDate;

      const [reportsRes, projectsRes, usersRes] = await Promise.all([
        API.get("reports/", { params }),
        API.get("projects/"),
        API.get("auth/profile/"), // Assuming endpoint outputs full list profile access to admins
      ]);

      const reportsList = reportsRes.data;
      setReports(reportsList);
      setProjects(projectsRes.data);
      setAllUsers(Array.isArray(usersRes.data) ? usersRes.data : []);

      // 2. Perform live multi-state aggregation checks over the active dataset
      const subCount = reportsList.filter(
        (r) => r.status === "SUBMITTED",
      ).length;
      const penCount = reportsList.filter((r) => r.status === "DRAFT").length; // Matching your DRAFT choice choice label
      const lateCount = reportsList.filter((r) => r.status === "LATE").length;

      setMetrics({
        total: reportsList.length,
        submitted: subCount,
        pending: penCount,
        late: lateCount,
      });
    } catch (err) {
      toast.error("Failed to sync structural team metadata records.");
    }
  };

  // --- PROJECT CRUD AND MAPPED WORKER ALLOCATION LOGIC ---

  const handleProjectFormSubmit = async (e) => {
    e.preventDefault();
    if (projectName.trim().length < 3) {
      toast.error("Project identity title must contain at least 3 characters.");
      return;
    }

    const payload = {
      name: projectName.strip ? projectName.strip() : projectName.trim(),
      description: projectDesc,
      assigned_member_ids: allocatedMemberIds.map(Number), // Explicit casting alignment to PrimaryKeyRelatedField
    };

    try {
      if (editingProjectId) {
        await API.put(`projects/${editingProjectId}/`, payload);
        toast.success("Project structure modified successfully.");
      } else {
        await API.post("projects/", payload);
        toast.success("New project strategy framework created.");
      }
      clearProjectWorkspaceForm();
      fetchComprehensiveDashboardData();
    } catch (err) {
      toast.error("Constraint block: Failed to write project instance data.");
    }
  };

  const clearProjectWorkspaceForm = () => {
    setProjectName("");
    setProjectDesc("");
    setAllocatedMemberIds([]);
    setEditingProjectId(null);
  };

  const initiateProjectEditCycle = (project) => {
    setEditingProjectId(project.id);
    setProjectName(project.name);
    setProjectDesc(project.description || "");
    setAllocatedMemberIds(project.assigned_members?.map((m) => m.id) || []);
  };

  const executeProjectDeletion = async (id) => {
    if (
      !window.confirm(
        "Purge project framework from active directory? Relational sync records will lose context variables.",
      )
    )
      return;
    try {
      await API.delete(`projects/${id}/`);
      toast.success("Project instance purged.");
      fetchComprehensiveDashboardData();
    } catch (err) {
      toast.error("Deletion rejected by database engine constraints.");
    }
  };

  const handleStatusOverridePatch = async (reportId, nextStatus) => {
    try {
      await API.patch(`reports/${reportId}/`, { status: nextStatus });
      toast.success(`Lifecycle status overwritten to ${nextStatus}`);
      fetchComprehensiveDashboardData();
    } catch (err) {
      toast.error("Failed to alter runtime state parameter.");
    }
  };

  const handleAllocationCheckboxToggle = (id) => {
    setAllocatedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const triggerSessionTermination = () => {
    logout();
    toast.success("Session closed safely.");
    navigate("/login");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-2 font-sans">
      {/* Dynamic Global Navigation Bar Section */}
      <header className="bg-slate-900 text-white p-5 rounded-2xl shadow-md flex justify-between items-center border border-slate-800">
        <div>
          <h1 className="text-xl font-black tracking-tight text-blue-400">
            Team Insights Console
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Workspace control operational overview
          </p>
        </div>
        <button
          onClick={triggerSessionTermination}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase bg-red-950/60 text-red-400 hover:bg-red-900/60 rounded-xl transition border border-red-900/40"
        >
          <HiOutlineLogout size={16} />
          <span>Terminate Session</span>
        </button>
      </header>

      {/* Real-time Compliance Telemetry Counter Blocks */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 border rounded-2xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Monitored Records
          </span>
          <p className="text-2xl font-black text-slate-900 mt-0.5">
            {metrics.total}
          </p>
        </div>
        <div className="bg-white p-4 border rounded-2xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Locked Submissions
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-0.5">
            {metrics.submitted}
          </p>
        </div>
        <div className="bg-white p-4 border rounded-2xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Pending Drafts
          </span>
          <p className="text-2xl font-black text-amber-500 mt-0.5">
            {metrics.pending}
          </p>
        </div>
        <div className="bg-white p-4 border rounded-2xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Late Submissions
          </span>
          <p className="text-2xl font-black text-red-500 mt-0.5">
            {metrics.late}
          </p>
        </div>
      </section>

      {/* Advanced Filter Tray Pipeline Panel */}
      <section className="bg-white p-5 border border-slate-200/60 rounded-2xl shadow-sm space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
          <HiOutlineFilter /> Dynamic Telemetry Filters
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <select
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
            className="text-xs border p-2.5 rounded-xl bg-slate-50 border-slate-200 focus:outline-none"
          >
            <option value="">Filter By Team Member...</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.username}
              </option>
            ))}
          </select>

          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="text-xs border p-2.5 rounded-xl bg-slate-50 border-slate-200 focus:outline-none"
          >
            <option value="">Filter By Project Scope...</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs border p-2.5 rounded-xl bg-slate-50 border-slate-200 focus:outline-none"
          >
            <option value="">Filter By Status Matrix...</option>
            <option value="DRAFT">Draft / Pending</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="LATE">Late Logs</option>
          </select>

          <Input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            placeholder="Start Date"
            className="!mb-0 !py-1.5"
          />
          <Input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            placeholder="End Date"
            className="!mb-0 !py-1.5"
          />
        </div>
      </section>

      {/* Central Interactive Content Management Grid splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Hand: Project Entity CRUD and Allocation Panel (4 Columns) */}
        <section className="lg:col-span-4 bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <HiOutlineFolderAdd className="text-blue-600 w-5 h-5" />
            <h2 className="text-sm font-bold text-slate-800">
              {editingProjectId
                ? "Modify Strategy Parameters"
                : "Initialize Project Entity"}
            </h2>
          </div>

          <form
            onSubmit={handleProjectFormSubmit}
            className="space-y-4 text-xs font-semibold"
          >
            <div>
              <label className="text-slate-600 block mb-1">
                Project Category Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full border p-2.5 rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="e.g. Marketing Execution Framework"
              />
            </div>

            <div>
              <label className="text-slate-600 block mb-1">
                Scope Mission Context
              </label>
              <textarea
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
                className="w-full border p-2.5 rounded-xl bg-slate-50 border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-100"
                rows={3}
                placeholder="Define structural constraints..."
              />
            </div>

            <div>
              <label className="text-slate-600 flex items-center gap-1 mb-2">
                <HiOutlineUserGroup /> Allocate Team Members
              </label>
              <div className="border rounded-xl p-3 max-h-36 overflow-y-auto bg-slate-50 space-y-2">
                {allUsers
                  .filter((u) => u.role === "TEAM_MEMBER")
                  .map((m) => (
                    <label
                      key={m.id}
                      className="flex items-center gap-2 p-1 hover:bg-white rounded-md cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={allocatedMemberIds.includes(m.id)}
                        onChange={() => handleAllocationCheckboxToggle(m.id)}
                        className="rounded text-blue-600 focus:ring-0"
                      />
                      <span className="text-slate-700 font-medium">
                        {m.username}
                      </span>
                    </label>
                  ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-slate-900 text-white font-bold py-2 rounded-xl hover:bg-slate-800 transition"
              >
                {editingProjectId ? "Update Context" : "Commit Group"}
              </button>
              {editingProjectId && (
                <button
                  type="button"
                  onClick={clearProjectWorkspaceForm}
                  className="px-3 bg-slate-100 rounded-xl text-slate-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Right Hand: Core Aggregated Cross-Team Sheet Feed View (8 Columns) */}
        <section className="lg:col-span-8 bg-white border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50/70 border-slate-100 flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Team Progress Stream
            </h3>
            <button
              onClick={fetchComprehensiveDashboardData}
              className="text-slate-400 hover:text-slate-700 transition"
              title="Refresh Streams"
            >
              <HiOutlineRefresh size={16} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                  <th className="p-3">Team Member</th>
                  <th className="p-3">Project</th>
                  <th className="p-3">Timeline Matrix</th>
                  <th className="p-3">Completed Work Logs</th>
                  <th className="p-3">Friction Points</th>
                  <th className="p-3">Compliance Switch</th>
                </tr>
              </thead>
              <tbody className="divide-y text-slate-700">
                {reports.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-3 font-bold text-slate-900">
                      {r.user_name}
                    </td>
                    <td className="p-3 font-medium text-slate-500">
                      {r.project_name || "General Workspace"}
                    </td>
                    <td className="p-3 text-blue-600 font-mono font-medium">
                      {r.week_start} → {r.week_end}
                    </td>
                    <td
                      className="p-3 text-slate-600 max-w-xs truncate"
                      title={r.tasks_completed}
                    >
                      {r.tasks_completed}
                    </td>
                    <td
                      className="p-3 text-red-500 font-semibold max-w-xs truncate"
                      title={r.blockers}
                    >
                      {r.blockers || "None"}
                    </td>
                    <td className="p-3">
                      {/* Dynamic Multi-State Interface Lifecycle Override Selection */}
                      <select
                        value={r.status}
                        onChange={(e) =>
                          handleStatusOverridePatch(r.id, e.target.value)
                        }
                        className={`text-[10px] font-black uppercase rounded-lg p-1.5 border focus:outline-none cursor-pointer ${
                          r.status === "SUBMITTED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : r.status === "LATE"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        <option value="DRAFT">Draft / Pending</option>
                        <option value="SUBMITTED">Submitted</option>
                        <option value="LATE">Late Log</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="p-6 text-center text-slate-400 italic font-medium bg-slate-50/30"
                    >
                      No active operational work summaries verified inside
                      current query parameters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Directory Component Tracking Table Footnote Row */}
      <section className="bg-white border rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1">
          <HiOutlineBriefcase /> Managed Workspaces Directory
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="border border-slate-100 bg-slate-50/50 rounded-xl p-4 flex flex-col justify-between group relative"
            >
              <div>
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-black text-slate-900">
                    {p.name}
                  </h4>
                  <span className="text-[10px] font-bold font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
                    Workers: {p.total_members}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                  {p.description || "No descriptions contextualized."}
                </p>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-2.5 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => initiateProjectEditCycle(p)}
                  className="text-xs text-blue-600 font-bold flex items-center gap-0.5"
                >
                  <HiOutlinePencilAlt /> Modify
                </button>
                <button
                  type="button"
                  onClick={() => executeProjectDeletion(p.id)}
                  className="text-xs text-red-500 font-bold flex items-center gap-0.5"
                >
                  <HiOutlineTrash /> Purge
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
