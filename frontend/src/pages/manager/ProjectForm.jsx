import React, { useState } from "react";
import { Layers, Users, Search, X, Check } from "lucide-react";

export default function ProjectForm({
  projName,
  setProjName,
  projDesc,
  setProjDesc,
  users,
  selectedWorkers,
  handleCheckboxChange,
  handleProjectCRUD,
  editingProjId,
  resetProjectForm,
}) {
  // Local state for searching assigned team members
  const [memberSearch, setMemberSearch] = useState("");

  // Filter team members dynamically based on the search query
  const filteredTeamMembers = users
    .filter((m) => m.role === "TEAM_MEMBER")
    .filter((m) =>
      m.username.toLowerCase().includes(memberSearch.toLowerCase()),
    );

  return (
    <div className="max-w-5xl mx-auto bg-white border border-slate-100 rounded-2xl shadow-sm p-6 space-y-6 font-sans">
      {/* Dynamic Header View Layer */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Layers size={16} className="text-blue-600" />
            {editingProjId
              ? "Modify Existing Workspace"
              : "Deploy Project Configuration"}
          </h2>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Define system scopes and map cross-functional workforce allocations.
          </p>
        </div>
        {editingProjId && (
          <button
            type="button"
            onClick={resetProjectForm}
            className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-xl font-bold hover:bg-slate-200 transition"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* Main Structural Input Deck Split Layout */}
      <form
        onSubmit={handleProjectCRUD}
        className="grid grid-cols-1 md:grid-cols-12 gap-6 text-xs font-semibold text-slate-700"
      >
        {/* LEFT COLUMN: Text Core Parameters (Identity & Overview Scope) */}
        <div className="md:col-span-6 space-y-4">
          <div>
            <label className="block text-slate-500 mb-1.5 uppercase tracking-wider text-[10px] font-bold">
              Project Framework Identity
            </label>
            <input
              type="text"
              value={projName}
              onChange={(e) => setProjName(e.target.value)}
              className="w-full border border-slate-200 p-3 rounded-xl bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100/60 focus:bg-white transition text-slate-800 font-medium"
              placeholder="e.g., Client Alpha Cloud Migration"
              required
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1.5 uppercase tracking-wider text-[10px] font-bold">
              Operational Scope Overview
            </label>
            <textarea
              value={projDesc}
              onChange={(e) => setProjDesc(e.target.value)}
              rows={5}
              className="w-full border border-slate-200 p-3 rounded-xl bg-slate-50/50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100/60 focus:bg-white transition text-slate-800 font-medium leading-relaxed"
              placeholder="Describe objectives, operational goals, and milestone definitions here..."
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Team Assignment Matrix Area */}
        <div className="md:col-span-6 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-slate-500 flex items-center gap-1 uppercase tracking-wider text-[10px] font-bold">
                <Users size={13} className="text-blue-500" /> Assign Workforce
                Allocations
              </label>
              <span className="text-[10px] font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold">
                Selected: {selectedWorkers.length}
              </span>
            </div>

            {/* 🌟 NEW: Member Search Sub-Bar Input Element */}
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-3 text-slate-400"
              />
              <input
                type="text"
                placeholder="Quick search members by username..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                className="w-full pl-8 pr-8 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none text-[11px] font-medium text-slate-800"
              />
              {memberSearch && (
                <button
                  type="button"
                  onClick={() => setMemberSearch("")}
                  className="absolute right-2.5 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Selectable Checkbox Container Grid Deck */}
            <div className="border border-slate-200 rounded-xl p-2.5 max-h-40 overflow-y-auto bg-slate-50/30 space-y-1">
              {filteredTeamMembers.length === 0 ? (
                <p className="text-slate-400 italic font-medium p-4 text-center">
                  No matching team members found.
                </p>
              ) : (
                filteredTeamMembers.map((m) => {
                  const isChecked = selectedWorkers.includes(m.id);
                  return (
                    <label
                      key={m.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition select-none ${
                        isChecked
                          ? "bg-blue-50/60 border border-blue-100 text-blue-900 font-bold"
                          : "hover:bg-slate-100 text-slate-700 font-medium border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxChange(m.id)}
                          className="rounded text-blue-600 focus:ring-0 border-slate-300 w-3.5 h-3.5"
                        />
                        <span>{m.username}</span>
                      </div>
                      {isChecked && (
                        <Check size={12} className="text-blue-600 stroke-[3]" />
                      )}
                    </label>
                  );
                })
              )}
            </div>
          </div>

          {/* Execution Submit Action Block Trigger */}
          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition shadow-sm active:scale-[0.99]"
          >
            {editingProjId
              ? "Update Deployed Project Structure"
              : "Deploy Project Execution Matrix"}
          </button>
        </div>
      </form>
    </div>
  );
}
