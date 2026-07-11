import React, { useState } from "react";
import {
  KeyRound,
  ShieldAlert,
  X,
  UserCheck,
  Phone,
  Mail,
  User,
  Search,
  RefreshCw,
  UserMinus,
  AlertTriangle,
} from "lucide-react";
import API from "../../api/axios";
import toast from "react-hot-toast";

export default function Users({ users, refreshUserList }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    userId: null,
    username: "",
    newPassword: "",
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null,
    username: "",
  });

  // Modal Controllers
  const openPasswordModal = (id, username) => {
    setPasswordModal({
      isOpen: true,
      userId: id,
      username: username,
      newPassword: "",
    });
  };

  const closePasswordModal = () => {
    setPasswordModal({
      isOpen: false,
      userId: null,
      username: "",
      newPassword: "",
    });
  };

  const openDeleteModal = (id, username) => {
    setDeleteModal({ isOpen: true, userId: id, username: username });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, userId: null, username: "" });
  };

  // Action Engines
  const handlePasswordOverride = async (e) => {
    e.preventDefault();
    if (passwordModal.newPassword.length < 8) {
      toast.error("Override password must contain a minimum of 8 characters.");
      return;
    }
    try {
      await API.post(`auth/users/${passwordModal.userId}/override-password/`, {
        password: passwordModal.newPassword,
      });
      toast.success(`Credentials for @${passwordModal.username} updated.`);
      closePasswordModal();
    } catch (err) {
      toast.error("Failed to apply manual credentials override to database.");
    }
  };

  const handleUserPurge = async () => {
    try {
      await API.delete(`auth/users/${deleteModal.userId}/`);
      toast.success(
        `Account entry @${deleteModal.username} safely purged from workspace directory.`,
      );
      closeDeleteModal();
      refreshUserList();
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        "Authorization constraint execution failure.";
      toast.error(errorMsg);
      closeDeleteModal();
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const fullName = `${u.first_name || ""} ${u.last_name || ""}`.toLowerCase();
    return (
      fullName.includes(term) ||
      (u.username || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term) ||
      (u.contact_number || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="w-full bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden font-sans relative">
      {/* Title Header Ribbon */}
      <div className="p-4 border-b bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Workspace User Directory Management
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Audit configurations, manage offboarding operations, and apply
            system profile drops.
          </p>
        </div>
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            type="button"
            onClick={refreshUserList}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition shadow-sm text-slate-600"
          >
            <RefreshCw size={13} />
          </button>
          <span className="bg-slate-900 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-xl whitespace-nowrap text-center flex-1 sm:flex-none">
            Active Accounts: {users.length}
          </span>
        </div>
      </div>

      {/* Dynamic Search Controller */}
      <div className="p-3 border-b border-slate-100 bg-white flex items-center relative">
        <div className="relative w-full max-w-md">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search team members by name, username, email or contact record..."
            className="w-full text-xs border border-slate-200 pl-9 pr-8 py-2.5 rounded-xl bg-slate-50/40 focus:bg-white outline-none focus:ring-2 focus:ring-blue-100 transition"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Responsive Grid Flow Table */}
      <div className="w-full overflow-x-auto block align-middle">
        <div className="inline-block min-w-full">
          <table className="min-w-full text-left border-collapse text-xs table-auto">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200 whitespace-nowrap">
                <th className="p-3">Full Name</th>
                <th className="p-3">Username</th>
                <th className="p-3">Email Address</th>
                <th className="p-3">Contact Number</th>
                <th className="p-3">System Role</th>
                <th className="p-3 text-center">Administrative Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700 font-medium">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                    {u.first_name && u.last_name ? (
                      `${u.first_name} ${u.last_name}`
                    ) : (
                      <span className="text-slate-400 italic font-normal">
                        Not Provided
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-slate-600 font-bold whitespace-nowrap">
                    @{u.username}
                  </td>
                  <td className="p-3 text-slate-500 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <Mail size={12} className="text-slate-400 shrink-0" />
                      <span>{u.email}</span>
                    </span>
                  </td>
                  <td className="p-3 text-slate-500 whitespace-nowrap">
                    {u.contact_number ? (
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-slate-400 shrink-0" />
                        {u.contact_number}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic font-normal">
                        No Record
                      </span>
                    )}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase ${
                        u.role === "MANAGER"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {u.role === "MANAGER" ? "Manager" : "Team Member"}
                    </span>
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => openPasswordModal(u.id, u.username)}
                        className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 shadow-sm"
                      >
                        <KeyRound size={12} className="text-blue-600" />
                        <span>Reset Pass</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(u.id, u.username)}
                        className="border border-red-200 bg-white hover:bg-red-50 text-red-600 transition px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 shadow-sm"
                      >
                        <UserMinus size={12} />
                        <span>Offboard User</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Password Reset Modal */}
      {passwordModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <form
            onSubmit={handlePasswordOverride}
            className="bg-white border border-slate-100 rounded-2xl p-5 max-w-sm w-full shadow-xl space-y-4 text-slate-700 font-semibold text-xs"
          >
            <div className="flex justify-between items-start border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-slate-900 font-black">
                <User size={15} className="text-blue-600" />
                <h3>Manual Password Override</h3>
              </div>
              <button
                type="button"
                onClick={closePasswordModal}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={14} />
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-slate-600 font-medium">
                Resetting credentials for{" "}
                <strong className="text-slate-900 font-bold">
                  @{passwordModal.username}
                </strong>
                .
              </p>
              <input
                type="password"
                value={passwordModal.newPassword}
                onChange={(e) =>
                  setPasswordModal({
                    ...passwordModal,
                    newPassword: e.target.value,
                  })
                }
                placeholder="Minimum 8 characters..."
                className="w-full border p-2.5 rounded-xl bg-slate-50/50 focus:bg-white outline-none transition"
                required
              />
            </div>
            <div className="flex gap-2 justify-end font-bold pt-1">
              <button
                type="button"
                onClick={closePasswordModal}
                className="bg-slate-100 px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-slate-900 text-white px-4 py-2 rounded-xl"
              >
                Apply Override
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 🛑 SAFELY OFFBOARD / DELETE USER MODAL CARD */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 max-w-sm w-full shadow-xl space-y-4 text-slate-700 font-semibold text-xs">
            <div className="flex justify-between items-start border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-red-600 font-black">
                <AlertTriangle size={15} />
                <h3>Safely Offboard Team Member</h3>
              </div>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2 text-slate-600 leading-relaxed font-medium">
              <p>
                Are you sure you want to completely erase the account profile
                for{" "}
                <strong className="text-slate-900 font-bold">
                  @{deleteModal.username}
                </strong>
                ?
              </p>
              <p className="bg-red-50 border border-dashed border-red-100 text-[11px] text-red-700 p-2.5 rounded-xl font-semibold">
                Notice: Processing this action clears authentication
                authorization arrays. Relational child metrics (like past
                reports) will cascade or unbind safely according to server
                constraints.
              </p>
            </div>

            <div className="flex gap-2 justify-end font-bold pt-1">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUserPurge}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl shadow-sm transition"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
