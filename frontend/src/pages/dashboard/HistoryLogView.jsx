import React, { useState } from "react";
import {
  RefreshCw,
  ChevronRight,
  Calendar,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertCircle,
  X,
} from "lucide-react";

export default function HistoryLogView({
  history,
  loading,
  fetchPersonalWorkspaceContext,
  startReportEditing,
  handleSubmitReport,
}) {
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDate, setSearchDate] = useState("");

  // Track expanded rows for accordion-style detail views
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 🌟 Helper to quickly flush out filter matrices and restore all logs
  const resetFilters = () => {
    setSearchTerm("");
    setSearchDate("");
  };

  // Frontend dynamic filtering engine
  const filteredHistory = history.filter((report) => {
    const projectName = (
      report.project_name || "General Workspace"
    ).toLowerCase();
    const matchesProject = projectName.includes(searchTerm.toLowerCase());

    // Check if selected query filter date falls inside or matches the report dates
    const matchesDate =
      !searchDate ||
      report.week_start === searchDate ||
      report.week_end === searchDate;

    return matchesProject && matchesDate;
  });

  return (
    <div className="max-w-8xl mx-auto space-y-4 font-sans">
      {/* Search and Filters Context Toolbar Bar */}
      <section className="bg-white p-4 border rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Project Name Search Input */}
        <div className="sm:col-span-5 relative">
          <Search
            size={14}
            className="absolute left-3.5 top-3.5 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search logs by project name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-xl bg-slate-50 focus:outline-none text-xs font-semibold text-slate-800"
          />
        </div>

        {/* Date Filter Input Selector */}
        <div className="sm:col-span-4 relative">
          <Calendar
            size={14}
            className="absolute left-3.5 top-3.5 text-slate-400"
          />
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-xl bg-slate-50 focus:outline-none text-xs font-semibold text-slate-600"
          />
        </div>

        {/* 🌟 UPGRADED: Dynamic Clear Filters Trigger Action Button */}
        <div className="sm:col-span-3 flex gap-2 justify-end">
          {(searchTerm || searchDate) && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 text-slate-500 hover:text-red-600 px-2.5 py-2 text-xs font-bold transition rounded-xl hover:bg-red-50"
              title="Clear active filters"
            >
              <X size={14} />
              <span>Clear</span>
            </button>
          )}

          {/* Synchronize Matrix Button */}
          <button
            onClick={fetchPersonalWorkspaceContext}
            disabled={loading}
            className="bg-slate-100 hover:bg-slate-200 border text-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Sync Logs</span>
          </button>
        </div>
      </section>

      {/* Structured Row Ledger System */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-100">
                <th className="p-3 w-10"></th>
                <th className="p-3">Project / Category</th>
                <th className="p-3">Reporting Cycle Week</th>
                <th className="p-3">Tasks Completed Summary Overview</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700 font-medium">
              {filteredHistory.map((report) => {
                const isExpanded = !!expandedRows[report.id];

                return (
                  <React.Fragment key={report.id}>
                    {/* Main Row Layer */}
                    <tr
                      className={`hover:bg-slate-50/60 transition duration-150 ${isExpanded ? "bg-slate-50/40" : ""}`}
                    >
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleRow(report.id)}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded transition"
                        >
                          {isExpanded ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </button>
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        {report.project_name || "General Workspace"}
                      </td>
                      <td className="p-3 text-slate-500 font-mono">
                        {report.week_start} → {report.week_end}
                      </td>
                      <td className="p-3 text-slate-600 max-w-[240px] truncate">
                        {report.tasks_completed || (
                          <span className="text-slate-400 italic font-normal">
                            None logged
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                            report.status === "SUBMITTED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => startReportEditing(report)}
                          className="text-slate-500 hover:text-blue-600 font-bold transition rounded px-2 py-1"
                        >
                          Edit
                        </button>
                        {report.status !== "SUBMITTED" && (
                          <button
                            onClick={() => handleSubmitReport(report.id)}
                            className="text-emerald-600 hover:text-emerald-700 font-black inline-flex items-center gap-0.5 border border-emerald-200 bg-emerald-50/50 px-2 py-1 rounded-lg shadow-sm transition"
                          >
                            Submit <ChevronRight size={11} />
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Accordion Row Expansion: Displays extended parameters */}
                    {isExpanded && (
                      <tr className="bg-slate-50/30">
                        <td
                          colSpan="6"
                          className="p-4 border-t border-slate-100"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-slate-700 font-semibold border border-slate-100 p-3 bg-white rounded-xl shadow-inner">
                            {/* Left Sub-column: Planned Objectives */}
                            <div className="md:col-span-5 space-y-2">
                              <div>
                                <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  Tasks Planned for Next Week
                                </h5>
                                <p className="text-slate-600 whitespace-pre-line text-[11px] leading-relaxed mt-1 bg-slate-50 p-2 rounded-lg border border-dashed">
                                  {report.tasks_planned || (
                                    <span className="italic text-slate-400 font-normal">
                                      No details populated.
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            {/* Center Sub-column: Impediment Tracking */}
                            <div className="md:col-span-4 space-y-2 border-l border-slate-100 pl-2">
                              <div>
                                <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  Blockers & Challenges
                                </h5>
                                <p
                                  className={`text-[11px] leading-relaxed mt-1 p-2 rounded-lg border ${
                                    report.blockers
                                      ? "bg-red-50/30 text-red-700 border-red-100 font-medium"
                                      : "bg-slate-50 text-slate-400 italic font-normal"
                                  }`}
                                >
                                  {report.blockers ||
                                    "No workflow impediments encountered."}
                                </p>
                              </div>
                            </div>

                            {/* Right Sub-column: Numeric Resource Details */}
                            <div className="md:col-span-3 space-y-3 border-l border-slate-100 pl-2 text-[11px]">
                              <div>
                                <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  Hours Tracked
                                </h5>
                                <p className="text-slate-800 font-black mt-0.5">
                                  {report.hours_worked
                                    ? `${report.hours_worked} hrs`
                                    : "Unspecified"}
                                </p>
                              </div>
                              <div>
                                <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  Resource References
                                </h5>
                                {report.notes ? (
                                  <a
                                    href={
                                      report.notes.startsWith("http")
                                        ? report.notes
                                        : `https://${report.notes}`
                                    }
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 hover:underline font-bold mt-0.5 block truncate flex items-center gap-0.5"
                                  >
                                    <span>Open Note Attachment</span>
                                    <ExternalLink size={10} />
                                  </a>
                                ) : (
                                  <p className="text-slate-400 italic font-normal mt-0.5">
                                    None attached
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {/* No Logs Found Fallback */}
              {filteredHistory.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="p-8 text-center text-slate-400 font-medium italic"
                  >
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <AlertCircle size={18} className="text-slate-300" />
                      <span>
                        No historical activity log matches found under current
                        filters.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
