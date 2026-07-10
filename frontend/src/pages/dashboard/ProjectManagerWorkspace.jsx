import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  HiOutlineFolderAdd,
  HiOutlineTrash,
  HiOutlinePencilAlt,
  HiOutlineUserGroup,
} from "react-icons/hi";
import API from "../../api/axios";
import { Input } from "../../components/Input";

export default function ProjectManagerWorkspace() {
  const { register, handleSubmit, reset, setValue } = useForm();
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  const fetchWorkspaceData = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        API.get("projects/"),
        API.get("auth/profile/"), // Assuming an endpoint that returns the system users list
      ]);
      setProjects(projRes.data);
      // Fallback array if user endpoint profile isn't a collection lists
      setTeamMembers(Array.isArray(usersRes.data) ? usersRes.data : []);
    } catch (err) {
      toast.error("Failed to sync project dashboard parameters.");
    }
  };

  const onSubmitForm = async (data) => {
    try {
      if (editingId) {
        await API.put(`projects/${editingId}/`, data);
        toast.success("Project profile modified.");
      } else {
        await API.post("projects/", data);
        toast.success("New project workspace registered.");
      }
      reset();
      setEditingId(null);
      fetchWorkspaceData();
    } catch (err) {
      toast.error("An error occurred processing the project entry.");
    }
  };

  const handleEditClick = (project) => {
    setEditingId(project.id);
    setValue("name", project.name);
    setValue("description", project.description);
    setValue("assigned_members", project.assigned_members || []);
  };

  const handleDeleteClick = async (id) => {
    if (
      !window.confirm(
        "Delete this project? Reports tied to it will lose reference tags.",
      )
    )
      return;
    try {
      await API.delete(`projects/${id}/`);
      toast.success("Project removed from system.");
      fetchWorkspaceData();
    } catch (err) {
      toast.error("Could not delete project framework.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
      {/* Creation/Edit Form Block */}
      <div className="lg:col-span-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm h-fit">
        <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <HiOutlineFolderAdd className="text-blue-600" size={18} />
          <span>
            {editingId ? "Edit Project Entity" : "Create Project/Category"}
          </span>
        </h2>
        <form
          onSubmit={handleSubmit(onSubmitForm)}
          className="space-y-4 text-xs"
        >
          <Input
            label="Project name (e.g. Marketing, Client R&D)"
            {...register("name", { required: true })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-700">
              Scope Description
            </label>
            <textarea
              {...register("description")}
              className="w-full border p-2 bg-slate-50 border-gray-300 rounded-md focus:outline-none"
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-gray-700 flex items-center gap-1">
              <HiOutlineUserGroup /> Assign Team Members (Optional)
            </label>
            <select
              multiple
              {...register("assigned_members")}
              className="w-full border p-2 bg-white border-gray-300 rounded-md h-32 focus:ring-2 focus:ring-blue-100"
            >
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.username}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-gray-400 italic">
              Hold Ctrl or Cmd to click multiple profiles
            </span>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition"
            >
              {editingId ? "Save Scope" : "Add Project"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  reset();
                  setEditingId(null);
                }}
                className="px-3 bg-gray-100 rounded-lg text-slate-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Projects List Framework Representation */}
      <div className="lg:col-span-8 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b font-bold text-slate-600">
            <tr>
              <th className="p-3">Project Title</th>
              <th className="p-3">Scope Context</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-700">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                <td className="p-3 font-bold text-slate-900">{p.name}</td>
                <td className="p-3 text-gray-400 truncate max-w-xs">
                  {p.description || "No context defined."}
                </td>
                <td className="p-3 text-right flex justify-end gap-3">
                  <button
                    onClick={() => handleEditClick(p)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-0.5 font-semibold"
                  >
                    <HiOutlinePencilAlt size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(p.id)}
                    className="text-red-500 hover:text-red-700 flex items-center gap-0.5 font-semibold"
                  >
                    <HiOutlineTrash size={14} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
