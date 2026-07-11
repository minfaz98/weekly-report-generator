import React from "react";
import { Edit3, Trash2 } from "lucide-react";

export default function ProjectDirectory({
  projects,
  startProjectEditing,
  executeProjectDeletion,
}) {
  return (
    <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
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
                <h4 className="text-sm font-black text-slate-800">{p.name}</h4>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
                  Workers: {p.total_members}
                </span>
              </div>
              <p className="text-slate-500 line-clamp-3 mt-1.5">
                {p.description || "No description provided."}
              </p>
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => startProjectEditing(p)}
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
        {projects.length === 0 && (
          <p className="text-xs text-slate-400 italic py-4 col-span-full text-center">
            No active projects deployed.
          </p>
        )}
      </div>
    </div>
  );
}
