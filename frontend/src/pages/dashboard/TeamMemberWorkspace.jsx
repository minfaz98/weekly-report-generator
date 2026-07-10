import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineDocumentAdd,
  HiOutlineCollection,
  HiOutlineClock,
  HiOutlineLightningBolt,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlinePencilAlt,
} from "react-icons/hi";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { Input } from "../../components/Input";

export default function TeamMemberWorkspace() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();
  const [myHistory, setMyHistory] = useState([]);
  const [projects, setProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [activeEditId, setActiveEditId] = useState(null);

  useEffect(() => {
    fetchPersonalHistoryData();
  }, []);

  const fetchPersonalHistoryData = async () => {
    try {
      const [reportsRes, projectsRes] = await Promise.all([
        API.get("reports/"),
        API.get("projects/"),
      ]);
      setMyHistory(reportsRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      toast.error("Failed to synchronize reporting context frameworks.");
    }
  };

  const startReportEdit = (report) => {
    setActiveEditId(report.id);
    setValue("week_start", report.week_start);
    setValue("week_end", report.week_end);
    setValue("project", report.project);
    setValue("tasks_completed", report.tasks_completed);
    setValue("tasks_planned", report.tasks_planned);
    setValue("blockers", report.blockers);
    setValue("hours_worked", report.hours_worked);
    setValue("notes", report.notes);
    toast.success("Sync records loaded to validation engine.");
  };

  const onSubmitReport = async (data) => {
    try {
      if (activeEditId) {
        await API.put(`reports/${activeEditId}/`, data);
        toast.success("Weekly status record updated clean.");
        setActiveEditId(null);
      } else {
        await API.post("reports/", data);
        toast.success("Weekly report instance saved.");
      }
      reset();
      fetchPersonalHistoryData();
    } catch (err) {
      toast.error(
        err.response?.data?.week_end?.[0] || "Failed to commit record updates.",
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-2">
      {/* Welcome Bar context details summary */}
      <div className="bg-white border p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Personal Delivery logs
          </h1>
          <p className="text-xs text-slate-500">
            Provide structured cycle summaries mapped to target projects
          </p>
        </div>
        <div className="text-xs font-mono font-bold text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border">
          Total Submissions: {myHistory.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Strict Rigid Parameter Submission Block Form */}
        <div className="lg:col-span-7 bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
              <HiOutlineDocumentAdd className="text-blue-600" /> Formulate
              Status Details
            </h2>
            {activeEditId && (
              <button
                type="button"
                onClick={() => {
                  reset();
                  setActiveEditId(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-700 underline"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form
            onSubmit={handleSubmit(onSubmitReport)}
            className="p-6 space-y-4 text-xs font-semibold"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Week Start (Monday)"
                {...register("week_start", { required: true })}
                error={errors.week_start}
              />
              <Input
                type="date"
                label="Week End (Friday)"
                {...register("week_end", { required: true })}
                error={errors.week_end}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700">Project / Scope Target</label>
              <select
                {...register("project", {
                  required: "Project boundary target field required",
                })}
                className="w-full px-3 py-2 border rounded-xl bg-white border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select Scoped Assignment Category...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 flex items-center gap-1">
                <HiOutlineCheckCircle /> Tasks Completed This Cycle
              </label>
              <textarea
                {...register("tasks_completed", { required: true })}
                rows={3}
                className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 border-slate-200"
                placeholder="List core milestones hit..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 flex items-center gap-1">
                <HiOutlineLightningBolt /> Tasks Planned For Next Cycle
              </label>
              <textarea
                {...register("tasks_planned", { required: true })}
                rows={3}
                className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 border-slate-200"
                placeholder="List upcoming targets..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 flex items-center gap-1">
                <HiOutlineExclamationCircle /> Blockers / Friction Points
              </label>
              <textarea
                {...register("blockers")}
                rows={2}
                className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 border-slate-200"
                placeholder="Write 'None' if clear..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="number"
                step="0.5"
                label="Hours Worked (Optional)"
                {...register("hours_worked")}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700">
                  Optional Notes or Reference Links
                </label>
                <input
                  type="text"
                  {...register("notes")}
                  className="w-full border px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 border-slate-200"
                  placeholder="PR links or notes..."
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <label className="text-slate-700">Submission State Option</label>
              <select
                {...register("status")}
                className="w-full px-3 py-2 border rounded-xl bg-white border-slate-300 font-bold text-slate-800"
              >
                <option value="DRAFT">Save as Draft Block</option>
                <option value="SUBMITTED">Lock and Submit Report</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 rounded-xl transition text-xs tracking-wider uppercase"
            >
              {isSubmitting
                ? "Locking Data Matrices..."
                : activeEditId
                  ? "Save Code Adaptations"
                  : "Save Record Block"}
            </button>
          </form>
        </div>

        {/* Right Columns: Personal Submission Log Feed (5 Columns) */}
        <div className="lg:col-span-5 bg-slate-50 border p-5 rounded-2xl h-[730px] overflow-y-auto space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1 border-b pb-3">
            <HiOutlineCollection /> History Pipeline Records
          </h3>

          <div className="space-y-3">
            {myHistory.map((report) => (
              <div
                key={report.id}
                className="bg-white p-4 rounded-xl border shadow-sm relative group space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    WK: {report.week_start}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${report.status === "SUBMITTED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}
                    >
                      {report.status}
                    </span>
                    <button
                      onClick={() => startReportEdit(report)}
                      className="text-xs text-slate-400 hover:text-blue-600 transition opacity-0 group-hover:opacity-100"
                    >
                      <HiOutlinePencilAlt size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs font-black text-slate-800">
                  {report.project_name || "General Work"}
                </p>
                <p className="text-xs text-slate-600 line-clamp-2">
                  <strong className="text-slate-700">Completed:</strong>{" "}
                  {report.tasks_completed}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
