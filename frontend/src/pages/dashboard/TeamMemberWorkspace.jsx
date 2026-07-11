import React, { useState, useEffect } from "react";
import { FileText, LogOut, User, Layers, History } from "lucide-react";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";

import ReportForm from "./ReportForm";
import ProfileEditForm from "./ProfileEditForm";
import HistoryLogView from "./HistoryLogView";

export default function TeamMemberWorkspace() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("reports");
  const [history, setHistory] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: null,
    project: "",
    week_start: "",
    week_end: "",
    tasks_completed: "",
    tasks_planned: "",
    blockers: "",
    hours_worked: "",
    notes: "",
  });

  useEffect(() => {
    fetchPersonalWorkspaceContext();
  }, []);

  const fetchPersonalWorkspaceContext = async () => {
    setLoading(true);
    try {
      const [reportsRes, projectsRes] = await Promise.all([
        API.get("reports/"),
        API.get("projects/"),
      ]);
      setHistory(Array.isArray(reportsRes.data) ? reportsRes.data : []);
      const projectsData = projectsRes.data?.results || projectsRes.data;
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (err) {
      toast.error("Failed to synchronize reporting context arrays.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    if (!form.project || !form.week_start || !form.week_end) {
      toast.error(
        "Please pick a project and select your reporting week range.",
      );
      return;
    }

    try {
      const payload = {
        ...form,
        project: Number(form.project),
        status: "DRAFT",
      };

      if (form.id) {
        await API.put(`reports/${form.id}/`, payload);
        toast.success("Draft logs updated.");
      } else {
        await API.post("reports/", payload);
        toast.success("New weekly report saved as draft.");
      }
      clearFormFields();
      fetchPersonalWorkspaceContext();
    } catch (err) {
      toast.error("Failed to write report instance.");
    }
  };

  const handleSubmitReport = async (id) => {
    try {
      await API.post(`reports/${id}/submit/`);
      toast.success("Report submitted successfully.");
      fetchPersonalWorkspaceContext();
    } catch (err) {
      toast.error("Submission pipeline trace error.");
    }
  };

  const startReportEditing = (report) => {
    setForm({
      id: report.id,
      project: report.project ? String(report.project) : "",
      week_start: report.week_start,
      week_end: report.week_end,
      tasks_completed: report.tasks_completed,
      tasks_planned: report.tasks_planned,
      blockers: report.blockers || "",
      hours_worked: report.hours_worked || "",
      notes: report.notes || "",
    });
    setActiveTab("reports");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFormFields = () => {
    setForm({
      id: null,
      project: "",
      week_start: "",
      week_end: "",
      tasks_completed: "",
      tasks_planned: "",
      blockers: "",
      hours_worked: "",
      notes: "",
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 font-sans min-h-screen">
      {/* Dynamic Workspace Options Selector Bar */}
      <div className="flex gap-2 border-b pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab("reports")}
          className={`px-4 py-2 rounded-t-xl transition flex items-center gap-1 ${
            activeTab === "reports"
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:text-slate-800 bg-slate-100"
          }`}
        >
          <Layers size={13} /> Weekly Reporting Workspace
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-t-xl transition flex items-center gap-1 ${
            activeTab === "history"
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:text-slate-800 bg-slate-100"
          }`}
        >
          <History size={13} /> Submission Log History
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-t-xl transition flex items-center gap-1 ${
            activeTab === "profile"
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:text-slate-800 bg-slate-100"
          }`}
        >
          <User size={13} /> Edit Account Details
        </button>
      </div>

      {/* Primary Context Workspace Deck Layout Router */}
      <main className="min-h-[400px]">
        {activeTab === "reports" && (
          <ReportForm
            form={form}
            projects={projects}
            handleInputChange={handleInputChange}
            handleSaveDraft={handleSaveDraft}
            clearFormFields={clearFormFields}
          />
        )}

        {activeTab === "history" && (
          <HistoryLogView
            history={history}
            loading={loading}
            fetchPersonalWorkspaceContext={fetchPersonalWorkspaceContext}
            startReportEditing={startReportEditing}
            handleSubmitReport={handleSubmitReport}
          />
        )}

        {activeTab === "profile" && <ProfileEditForm />}
      </main>
    </div>
  );
}
