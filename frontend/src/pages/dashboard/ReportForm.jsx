import React from "react";
import {
  Save,
  CheckCircle,
  Clock,
  AlertTriangle,
  Bell,
  Kanban,
} from "lucide-react";

export default function ReportForm({
  form,
  projects,
  handleInputChange,
  handleSaveDraft,
  clearFormFields,
}) {
  return (
    <div className="max-w-5xl mx-auto space-y-4 font-sans">
      {/* Project Assignment Notification Deck */}
      <section className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex gap-3 shadow-inner">
        <Bell className="text-blue-600 shrink-0 mt-0.5" size={16} />
        <div className="space-y-1.5 text-xs font-semibold text-blue-950 w-full">
          <h4 className="font-black text-slate-800 tracking-wide uppercase text-[10px]">
            Active Team Task Allocations
          </h4>
          {projects.length === 0 ? (
            <p className="text-slate-400 text-[11px] font-medium italic">
              You are not currently allocated to any operational project
              branches.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <p className="text-[11px] font-medium text-slate-600 w-full mb-1">
                You are assigned to the following projects:
              </p>
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-blue-200/60 px-2.5 py-1 rounded-xl shadow-sm flex items-center gap-1 text-[11px] font-bold text-blue-700"
                >
                  <Kanban size={11} className="text-blue-500" />
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Structured Weekly Activity Form */}
      <div className="bg-white p-6 border border-slate-100 rounded-2xl shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
            {form.id ? "Modify Structured Report" : "Compile Weekly Activity"}
          </h2>
          {form.id && (
            <button
              type="button"
              onClick={clearFormFields}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
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
                required
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
                required
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
                required
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
              required
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
              <AlertTriangle className="text-amber-500" size={13} /> Blockers /
              challenges
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
      </div>
    </div>
  );
}
