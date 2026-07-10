import React, { useState, useEffect } from "react";
import {
  Users,
  Layers,
  AlertCircle,
  BarChart3,
  Filter,
  Sparkles,
  Trash2,
  Edit3,
  LogOut,
} from "lucide-react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import AIChat from "../../components/AIChat";
import Charts from "../../components/Charts"; // 🌟 ADDED: Importing modular analytics charting element

export default function ManagerWorkspace() {
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  // Filter Arrays
  const [filterMember, setFilterMember] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");

  // Project CRUD States
  const [projName, setProjName] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [editingProjId, setEditingProjId] = useState(null);

  const [isAiOpen, setIsAiOpen] = useState(false);

  // Summary Analytics Telemetry State
  const [metrics, setMetrics] = useState({
    total: 0,
    submitted: 0,
    pending: 0,
    blockers: 0,
    compliance: 0,
  });

  // Data mapping matrix hooks destined for Charts component parameter distribution
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

      // Summary Counter Metrics Computations
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

      // 🌟 CHART COMPILING: Line Matrix Trends mapping
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

      // 🌟 CHART COMPILING: Submission Status Bars parsing
      const teamMembers = cleanUsers.filter((u) => u.role === "TEAM_MEMBER");
      const memberNames = teamMembers.map((u) => u.username);
      const submittedCounts = teamMembers.map(
        (u) =>
          fetchedReports.filter(
            (r) => r.user_name === u.username && r.status === "SUBMITTED",
          ).length,
      );
      const pendingCounts = teamMembers.map(
        (u) =>
          fetchedReports.filter(
            (r) => r.user_name === u.username && r.status !== "SUBMITTED",
          ).length,
      );

      setStatusChartData({
        labels: memberNames,
        datasets: [
          {
            label: "Submitted Logs",
            data: submittedCounts,
            backgroundColor: "rgb(16, 185, 129)",
          },
          {
            label: "Pending Drafts",
            data: pendingCounts,
            backgroundColor: "rgb(239, 68, 68)",
          },
        ],
      });

      // 🌟 CHART COMPILING: Workload Doughnut parsing
      const projectMap = {};
      fetchedReports.forEach((r) => {
        const pName = r.project_name || "General Bench";
        const hours = parseFloat(r.hours_worked) || 0;
        projectMap[pName] = (projectMap[pName] || 0) + hours;
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

  const handleProjectCRUD = async (e) => {
    e.preventDefault();
    if (!projName.trim())
      return toast.error("Project Name Identity Cannot Be Empty.");
    if (projName.trim().length < 3)
      return toast.error("Project Identity Demands Minimum 3 Characters.");

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
      fetchAggregatedManagerData();
    } catch (err) {
      toast.error("Database validation constraint exception rejected action.");
    }
  };

  const handleCheckboxChange = (userId) => {
    setSelectedWorkers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const executeProjectDeletion = async (id, name) => {
    if (
      !window.confirm(
        `Purge project context variables for "${name}" from databases? Linked records will clear.`,
      )
    )
      return;
    try {
      await API.delete(`projects/${id}/`);
      toast.success(`Project "${name}" successfully purged.`);
      fetchAggregatedManagerData();
    } catch (err) {
      toast.error("Linked dependencies locked asset allocation.");
    }
  };

  const executeReportDeletion = async (id, member) => {
    if (
      !window.confirm(
        `Permanently destroy this tracking entry submitted by ${member}? This action is permanent.`,
      )
    )
      return;
    try {
      await API.delete(`reports/${id}/`);
      toast.success(`Tracking record for ${member} removed successfully.`);
      fetchAggregatedManagerData();
    } catch (err) {
      toast.error(
        "Server validation constraint error rejected report deletion.",
      );
    }
  };

  const computeSubmissionStatus = (report) => {
    if (report.status !== "SUBMITTED") {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">
          Pending
        </span>
      );
    }
    if (report.week_end && report.updated_at) {
      const deadline = new Date(report.week_end);
      const submission = new Date(report.updated_at);
      if (submission > deadline) {
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 uppercase">
            Late
          </span>
        );
      }
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">
        Submitted
      </span>
    );
  };

  const resetProjectForm = () => {
    setProjName("");
    setProjDesc("");
    setSelectedWorkers([]);
    setEditingProjId(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6 font-sans bg-slate-50/50 min-h-screen">
      {/* Dashboard Top Header Bar */}
      <header className="bg-slate-900 text-white p-5 rounded-2xl flex justify-between items-center shadow-md border border-slate-800">
        <div>
          <h1 className="text-xl font-black text-blue-400 tracking-tight flex items-center gap-2">
            <BarChart3 size={20} /> Admin Management Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Cross-team performance evaluation and intelligence routing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAiOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 border border-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-blue-500/20"
          >
            <Sparkles size={14} className="animate-pulse" /> AI Assistant
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-1.5 transition"
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </header>

      {/* Analytics Counter Banners */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 border rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Logs Submitted
          </span>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {metrics.submitted}
          </p>
        </div>
        <div className="bg-white p-4 border rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Pending Tracking Drafts
          </span>
          <p className="text-2xl font-black text-amber-500 mt-1">
            {metrics.pending}
          </p>
        </div>
        <div className="bg-white p-4 border rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Compliance Matrix Rate
          </span>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {metrics.compliance}%
          </p>
        </div>
        <div className="bg-white p-4 border rounded-2xl shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Active Open Blockers
          </span>
          <p className="text-2xl font-black text-red-500 mt-1">
            {metrics.blockers}
          </p>
        </div>
      </section>

      {/* Query Filter Area */}
      <section className="bg-white p-4 border rounded-2xl shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs font-semibold">
          <select
            value={filterMember}
            onChange={(e) => setFilterMember(e.target.value)}
            className="border p-2.5 rounded-xl bg-slate-50 focus:outline-none"
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
            className="border p-2.5 rounded-xl bg-slate-50 focus:outline-none"
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
            className="border p-2.5 rounded-xl bg-slate-50 focus:outline-none"
          >
            <option value="">Filter By Status...</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
          </select>
          <input
            type="date"
            value={filterStart}
            onChange={(e) => setFilterStart(e.target.value)}
            className="border p-2 rounded-xl bg-slate-50 text-slate-600 focus:outline-none"
          />
          <input
            type="date"
            value={filterEnd}
            onChange={(e) => setFilterEnd(e.target.value)}
            className="border p-2 rounded-xl bg-slate-50 text-slate-600 focus:outline-none"
          />
        </div>
      </section>

      {/* 🌟 MODULE INCLUSION: Render modular extracted charts view wrapper */}
      <Charts
        trendChartData={trendChartData}
        statusChartData={statusChartData}
        workloadChartData={workloadChartData}
      />

      {/* Main Split Grid Section View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Workspace Forms */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white border p-5 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-800 border-b pb-2 flex items-center gap-1.5">
              <Layers size={16} className="text-blue-600" /> Projects /
              Categories
            </h2>
            <form
              onSubmit={handleProjectCRUD}
              className="space-y-4 text-xs font-semibold"
            >
              <div>
                <label className="block text-slate-500 mb-1">
                  Project Framework Identity
                </label>
                <input
                  type="text"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full border p-2.5 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none"
                  placeholder="e.g. Client Alpha Infrastructure"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">
                  Operational Scope Overview
                </label>
                <textarea
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  rows={2}
                  className="w-full border p-2.5 rounded-xl bg-slate-50 placeholder-slate-400 focus:outline-none"
                  placeholder="Context strings..."
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1 flex items-center gap-1">
                  <Users size={13} /> Assign team members
                </label>
                <div className="border rounded-xl p-3 max-h-32 overflow-y-auto bg-slate-50 space-y-2">
                  {users
                    .filter((m) => m.role === "TEAM_MEMBER")
                    .map((m) => (
                      <label
                        key={m.id}
                        className="flex items-center gap-2 cursor-pointer p-1 hover:bg-white rounded transition"
                      >
                        <input
                          type="checkbox"
                          checked={selectedWorkers.includes(m.id)}
                          onChange={() => handleCheckboxChange(m.id)}
                          className="rounded text-blue-600 focus:ring-0"
                        />
                        <span className="text-slate-700 font-medium">
                          {m.username}
                        </span>
                      </label>
                    ))}
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl hover:bg-slate-800 transition"
              >
                {editingProjId ? "Update Project" : "Deploy Project"}
              </button>
            </form>
          </section>
        </div>

        {/* RIGHT COLUMN: Recent Activity Data Grid Table */}
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                Recent Activity Feed
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold border-b">
                    <th className="p-3">Team Member</th>
                    <th className="p-3">Project</th>
                    <th className="p-3">Submission Status</th>
                    <th className="p-3">Tasks Completed Summary</th>
                    <th className="p-3">Intent Actions Planned</th>
                    <th className="p-3">Blockers</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700 font-medium">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 font-bold text-slate-900">
                        {r.user_name}
                      </td>
                      <td className="p-3 text-slate-500">
                        {r.project_name || "General Bench"}
                      </td>
                      <td className="p-3">{computeSubmissionStatus(r)}</td>
                      <td
                        className="p-3 text-slate-600 max-w-[160px] truncate"
                        title={r.tasks_completed}
                      >
                        {r.tasks_completed || (
                          <span className="text-slate-400 italic">
                            None logged
                          </span>
                        )}
                      </td>
                      <td
                        className="p-3 text-slate-600 max-w-[160px] truncate"
                        title={r.intent_actions}
                      >
                        {r.intent_actions || (
                          <span className="text-slate-400 italic">
                            None scheduled
                          </span>
                        )}
                      </td>
                      <td
                        className={`p-3 font-bold max-w-[120px] truncate ${r.blockers ? "text-red-500" : "text-slate-400"}`}
                        title={r.blockers}
                      >
                        {r.blockers || "No Impediments"}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() =>
                            executeReportDeletion(r.id, r.user_name)
                          }
                          className="text-red-500 hover:text-red-700 transition p-1 rounded hover:bg-red-50 inline-flex items-center gap-0.5 font-bold"
                          title="Purge report entry safely"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        className="p-4 text-center text-slate-400 italic"
                      >
                        No activity feed tracking items located.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* Project Directories lists */}
      <section className="bg-white border rounded-2xl p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">
          Operational Project Directories
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-semibold">
          {projects.map((p) => (
            <div
              key={p.id}
              className="border bg-slate-50/50 rounded-xl p-4 flex flex-col justify-between group relative transition hover:bg-slate-50"
            >
              <div>
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-black text-slate-800">
                    {p.name}
                  </h4>
                  <span className="text-[10px] font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
                    Workers: {p.total_members}
                  </span>
                </div>
                <p className="text-slate-500 line-clamp-2 mt-1.5">
                  {p.description || "No description provided."}
                </p>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingProjId(p.id);
                    setProjName(p.name);
                    setProjDesc(p.description || "");
                    setSelectedWorkers(
                      p.assigned_members?.map((m) => m.id) || [],
                    );
                  }}
                  className="text-blue-600 font-bold inline-flex items-center gap-0.5"
                >
                  <Edit3 size={12} /> Edit
                </button>
                <button
                  onClick={() => executeProjectDeletion(p.id, p.name)}
                  className="text-red-500 font-bold inline-flex items-center gap-0.5"
                >
                  <Trash2 size={12} /> Destroy
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <AIChat isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}
