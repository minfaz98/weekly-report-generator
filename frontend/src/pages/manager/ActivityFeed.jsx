import React, { useState } from "react";
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertTriangle,
  X,
} from "lucide-react";

export default function ActivityFeed({
  reports,
  computeSubmissionStatus,
  executeReportDeletion,
}) {
  const [expandedRows, setExpandedRows] = useState({});
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    reportId: null,
    memberName: "",
  });

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const initiateDeleteConfirmation = (id, memberName) => {
    setDeleteModal({
      isOpen: true,
      reportId: id,
      memberName: memberName,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      reportId: null,
      memberName: "",
    });
  };

  const confirmReportPurge = async () => {
    await executeReportDeletion(deleteModal.reportId, deleteModal.memberName);
    closeDeleteModal();
  };

  return (
    <div className="w-full bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden font-sans relative">
      <div className="p-4 border-b bg-slate-50">
        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
          Recent Activity Feed
        </h3>
      </div>

      <div className="w-full overflow-x-auto block align-middle">
        <div className="inline-block min-w-full">
          <table className="min-w-full text-left border-collapse text-xs table-auto">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 whitespace-nowrap">
                <th className="p-3 w-10"></th>
                <th className="p-3">Team Member</th>
                <th className="p-3">Project</th>
                <th className="p-3">Submission Status</th>
                <th className="p-3">Tasks Completed Summary</th>
                <th className="p-3">Blockers</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700 font-medium">
              {reports.map((r) => {
                const isExpanded = !!expandedRows[r.id];

                return (
                  <React.Fragment key={r.id}>
                    <tr
                      className={`hover:bg-slate-50/50 transition ${isExpanded ? "bg-slate-50/30" : ""}`}
                    >
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleRow(r.id)}
                          className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
                        >
                          {isExpanded ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )}
                        </button>
                      </td>
                      <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                        {r.user_name}
                      </td>
                      <td className="p-3 text-slate-500 Richmond whitespace-nowrap">
                        {r.project_name || "General Bench"}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {computeSubmissionStatus(r)}
                      </td>
                      <td
                        className="p-3 text-slate-600 max-w-[200px] truncate"
                        title={r.tasks_completed}
                      >
                        {r.tasks_completed || (
                          <span className="text-slate-400 italic">
                            None logged
                          </span>
                        )}
                      </td>
                      <td
                        className={`p-3 font-bold max-w-[150px] truncate ${r.blockers ? "text-red-500" : "text-slate-400"}`}
                        title={r.blockers}
                      >
                        {r.blockers || "No Impediments"}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <button
                          onClick={() =>
                            initiateDeleteConfirmation(r.id, r.user_name)
                          }
                          className="text-red-500 hover:text-red-700 transition p-1 rounded hover:bg-red-50 inline-flex items-center gap-0.5 font-bold"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-slate-50/30">
                        <td
                          colSpan="7"
                          className="p-3 sm:p-4 border-t border-slate-100"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-slate-700 font-semibold border border-slate-200 p-4 bg-white rounded-xl shadow-inner">
                            <div className="md:col-span-4 space-y-1">
                              <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Full Tasks Completed
                              </h5>
                              <p className="text-slate-600 whitespace-pre-line text-[11px] leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-dashed">
                                {r.tasks_completed || (
                                  <span className="italic text-slate-400 font-normal">
                                    No details logged.
                                  </span>
                                )}
                              </p>
                            </div>

                            <div className="md:col-span-4 space-y-1 md:border-l md:border-slate-100 md:pl-3">
                              <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                Tasks Planned for Next Week
                              </h5>
                              <p className="text-slate-600 whitespace-pre-line text-[11px] leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-dashed">
                                {r.tasks_planned || (
                                  <span className="italic text-slate-400 font-normal">
                                    No details logged.
                                  </span>
                                )}
                              </p>
                            </div>

                            <div className="md:col-span-4 space-y-3 md:border-l md:border-slate-100 md:pl-3 text-[11px]">
                              <div>
                                <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                                  Detailed Blockers
                                </h5>
                                <p
                                  className={`p-2 rounded-lg border text-[11px] font-medium leading-relaxed ${
                                    r.blockers
                                      ? "bg-red-50/40 text-red-700 border-red-100"
                                      : "bg-slate-50 text-slate-400 italic font-normal"
                                  }`}
                                >
                                  {r.blockers || "Clear workflow execution."}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                                <div>
                                  <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                    Hours Worked
                                  </h5>
                                  <p className="text-slate-800 font-black mt-0.5">
                                    {r.hours_worked
                                      ? `${r.hours_worked} hrs`
                                      : "Unspecified"}
                                  </p>
                                </div>
                                <div>
                                  <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                    References
                                  </h5>
                                  {r.notes ? (
                                    <a
                                      href={
                                        r.notes.startsWith("http")
                                          ? r.notes
                                          : `https://${r.notes}`
                                      }
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-blue-600 hover:underline font-bold mt-0.5 block truncate flex items-center gap-0.5"
                                    >
                                      <span>View Resource</span>
                                      <ExternalLink size={10} />
                                    </a>
                                  ) : (
                                    <p className="text-slate-400 italic font-normal mt-0.5">
                                      None
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {reports.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="p-8 text-center text-slate-400 italic"
                  >
                    No activity feed tracking items located.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 max-w-sm w-full shadow-xl space-y-4 text-slate-700 font-semibold">
            <div className="flex justify-between items-start border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-red-600 font-black text-xs">
                <AlertTriangle size={15} />
                <h3>Purge Tracking Record</h3>
              </div>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={14} />
              </button>
            </div>

            <div className="text-xs space-y-2 text-slate-600 leading-relaxed font-medium">
              <p>
                Are you sure you want to permanently destroy this weekly
                performance report submitted by{" "}
                <strong className="text-slate-900 font-bold">
                  @{deleteModal.memberName}
                </strong>
                ?
              </p>
              <p className="bg-red-50/50 border border-dashed border-red-100 text-[11px] text-red-700 p-2.5 rounded-xl font-semibold">
                Warning: This operational database purge clears relational
                dependencies and cannot be reversed.
              </p>
            </div>

            <div className="flex gap-2 justify-end text-xs font-bold pt-1">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReportPurge}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl shadow-sm transition"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
