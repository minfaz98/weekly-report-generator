import React from "react";
import Charts from "../../components/Charts";

export default function AnalyticsDashboard({
  metrics,
  trendChartData,
  statusChartData,
  workloadChartData,
}) {
  return (
    <div className="space-y-6">
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

      {/* Charts Engine Layer Wrapper */}
      <Charts
        trendChartData={trendChartData}
        statusChartData={statusChartData}
        workloadChartData={workloadChartData}
      />
    </div>
  );
}
