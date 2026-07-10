import React, { useState, useEffect } from "react";
import {
  Plus,
  Save,
  CheckCircle,
  RefreshCw,
  Clock,
  BookOpen,
  AlertTriangle,
  FileText,
  ChevronRight,
  LogOut,
} from "lucide-react";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function TeamMemberWorkspace() {
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
      // Fallback arrays prevent crash mapping errors if backend responds with null or empty structures
      setHistory(Array.isArray(reportsRes.data) ? reportsRes.data : []);

      // Check if Django response data is wrapped inside a paginated results matrix block
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
        project: Number(form.project), // Enforce strict numeric PK matching
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
      project: report.project ? String(report.project) : "", // String binding conversion for form select values
      week_start: report.week_start,
      week_end: report.week_end,
      tasks_completed: report.tasks_completed,
      tasks_planned: report.tasks_planned,
      blockers: report.blockers || "",
      hours_worked: report.hours_worked || "",
      notes: report.notes || "",
    });
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
    <div className="max-w-6xl mx-auto p-4 space-y-6 font-sans">
      <header className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 rounded-2xl text-white flex justify-between items-center shadow-lg">
        <div>
          <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
            <FileText /> Personal Weekly Report
          </h1>
          <p className="text-xs text-blue-200">
            Compile and submit fixed structural status Reports.
          </p>
        </div>
        <button
          onClick={() => {
            window.location.href = "/login";
          }}
          className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-7 bg-white p-6 border rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
              {form.id ? "Modify Structured Report" : "Compile Weekly Activity"}
            </h2>
            {form.id && (
              <button
                type="button"
                onClick={clearFormFields}
                className="text-xs text-black-400 hover:text-slate-600 font-semibold"
              >
                Reset Form
              </button>
            )}
          </div>

          <form
            onSubmit={handleSaveDraft}
            className="space-y-4 text-xs font-semibold text-slate-700"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-500 mb-1">
                  Project/Category
                </label>
                <select
                  name="project"
                  value={form.project}
                  onChange={handleInputChange}
                  className="w-full border p-2.5 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Choose project...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-500 mb-1">
                  Week Opening Date
                </label>
                <input
                  type="date"
                  name="week_start"
                  value={form.week_start}
                  onChange={handleInputChange}
                  className="w-full border p-2.5 rounded-xl bg-slate-50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">
                  Week Closing Date
                </label>
                <input
                  type="date"
                  name="week_end"
                  value={form.week_end}
                  onChange={handleInputChange}
                  className="w-full border p-2.5 rounded-xl bg-slate-50 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-500 mb-1 flex items-center gap-1">
                <CheckCircle className="text-emerald-500" size={13} /> Tasks
                Completed
              </label>
              <textarea
                name="tasks_completed"
                value={form.tasks_completed}
                onChange={handleInputChange}
                rows={3}
                className="w-full border p-2.5 rounded-xl bg-slate-50 focus:outline-none"
                placeholder="Enumerate itemized deliverables achieved..."
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1 flex items-center gap-1">
                <Clock className="text-blue-500" size={13} /> Tasks planned for
                next week
              </label>
              <textarea
                name="tasks_planned"
                value={form.tasks_planned}
                onChange={handleInputChange}
                rows={3}
                className="w-full border p-2.5 rounded-xl bg-slate-50 focus:outline-none"
                placeholder="Outline active pipeline priorities..."
              />
            </div>

            <div>
              <label className="block text-slate-500 mb-1 flex items-center gap-1">
                <AlertTriangle className="text-amber-500" size={13} /> Blockers
                / challenges
              </label>
              <textarea
                name="blockers"
                value={form.blockers}
                onChange={handleInputChange}
                rows={2}
                className="w-full border p-2.5 rounded-xl bg-slate-50 focus:outline-none"
                placeholder="Identify execution impediments..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 mb-1">
                  Hours worked (Optional)
                </label>
                <input
                  type="number"
                  step="0.5"
                  name="hours_worked"
                  value={form.hours_worked}
                  onChange={handleInputChange}
                  className="w-full border p-2.5 rounded-xl bg-slate-50 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">
                  Supplementary Links (Optional)
                </label>
                <input
                  type="text"
                  name="notes"
                  value={form.notes}
                  onChange={handleInputChange}
                  className="w-full border p-2.5 rounded-xl bg-slate-50 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-slate-800 transition shadow-sm"
            >
              <Save size={14} /> Save Entry
            </button>
          </form>
        </section>

        <section className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center bg-slate-100 p-4 rounded-xl">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1">
              <BookOpen size={14} /> Submission Log History
            </h3>
            <button
              onClick={fetchPersonalWorkspaceContext}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1">
            {history.map((report) => (
              <div
                key={report.id}
                className="bg-white p-4 rounded-xl border shadow-sm space-y-2.5"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    WK: {report.week_start}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${report.status === "SUBMITTED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                  >
                    {report.status}
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800">
                    {report.project_name || "General Workspace"}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                    {report.tasks_completed}
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
                  <button
                    onClick={() => startReportEditing(report)}
                    className="text-xs text-slate-500 hover:text-blue-600 font-bold transition"
                  >
                    Edit
                  </button>
                  {report.status !== "SUBMITTED" && (
                    <button
                      onClick={() => handleSubmitReport(report.id)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-black flex items-center gap-0.5"
                    >
                      Submit <ChevronRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
