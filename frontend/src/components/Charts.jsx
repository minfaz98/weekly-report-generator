import React from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";

// Register ChartJS components globally for this sub-module context
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Charts({
  trendChartData,
  statusChartData,
  workloadChartData,
}) {
  // Shared global options object to enforce fluid mobile-responsive canvas bindings
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          font: { size: 10, weight: "bold", family: "sans-serif" },
          padding: 12,
        },
      },
    },
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      x: { stacked: true },
      y: { stacked: true },
    },
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      {/* Chart Item 1: Line Graph Component Grid */}
      <div className="bg-white p-4 border rounded-2xl shadow-sm min-h-[260px] flex flex-col justify-between">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
          Tasks Trend Over Time
        </h3>
        <div className="flex-1 min-h-[180px] max-h-[200px] relative">
          {trendChartData?.labels?.length > 0 ? (
            <Line data={trendChartData} options={chartOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
              Insufficient timeline data nodes compiled.
            </div>
          )}
        </div>
      </div>

      {/* Chart Item 2: Stacked Bar Component Grid */}
      <div className="bg-white p-4 border rounded-2xl shadow-sm min-h-[260px] flex flex-col justify-between">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
          Submission Compliance by Member
        </h3>
        <div className="flex-1 min-h-[180px] max-h-[200px] relative">
          {statusChartData?.labels?.length > 0 ? (
            <Bar data={statusChartData} options={barOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
              Insufficient tracking status inputs loaded.
            </div>
          )}
        </div>
      </div>

      {/* Chart Item 3: Doughnut Component Grid */}
      <div className="bg-white p-4 border rounded-2xl shadow-sm min-h-[260px] flex flex-col justify-between">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
          Hours Logged Distribution
        </h3>
        <div className="flex-1 min-h-[180px] max-h-[200px] relative flex justify-center">
          {workloadChartData?.labels?.length > 0 ? (
            <Doughnut data={workloadChartData} options={chartOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
              No workload hours recorded for this selection.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
