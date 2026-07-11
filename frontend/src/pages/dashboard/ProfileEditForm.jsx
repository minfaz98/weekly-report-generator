import React, { useState, useEffect } from "react";
import { User, Mail, ShieldAlert, Lock } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../api/axios";

export default function ProfileEditForm() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    role: "",
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user_profile");
    if (stored) {
      const parsed = JSON.parse(stored);
      setProfile({
        username: parsed.username || "",
        email: parsed.email || "",
        role: parsed.role || "",
      });
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // 🌟 Upgraded: Sends both the updated username and email payloads back to the patch engine
      const response = await API.patch("auth/profile/", {
        username: profile.username,
        email: profile.email,
      });
      localStorage.setItem("user_profile", JSON.stringify(response.data));
      toast.success("Account credentials updated successfully.");
    } catch (err) {
      toast.error(
        err.response?.data?.username?.[0] ||
          err.response?.data?.email?.[0] ||
          err.response?.data?.detail ||
          "Failed to synchronize credential changes.",
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white p-6 border rounded-2xl shadow-sm space-y-4 max-w-xl mx-auto">
      <div className="border-b pb-3">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
          <User size={16} className="text-blue-600" /> Account Security Portal
        </h2>
      </div>

      <form
        onSubmit={handleUpdateProfile}
        className="space-y-4 text-xs font-semibold text-slate-700"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 🌟 UPGRADED: Editable Username Input Field */}
          <div>
            <label className="block text-slate-500 mb-1 flex items-center gap-1">
              <User size={12} className="text-blue-500" /> Username
            </label>
            <input
              type="text"
              name="username"
              value={profile.username}
              onChange={handleChange}
              className="w-full border p-2.5 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800"
              placeholder="Enter unique username"
              required
            />
          </div>

          {/* Read-Only Locked Field: Role Badge */}
          <div>
            <label className="block text-slate-400 mb-1 flex items-center gap-1">
              <Lock size={11} /> Access Clearance Role
            </label>
            <input
              type="text"
              value={
                profile.role === "MANAGER"
                  ? "Managerial clearance"
                  : "Standard Team Member"
              }
              disabled
              className="w-full border p-2.5 rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed outline-none"
            />
          </div>
        </div>

        {/* Editable Field: Email */}
        <div>
          <label className="block text-slate-500 mb-1 flex items-center gap-1">
            <Mail size={13} className="text-blue-500" /> Account Email Address
          </label>
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            className="w-full border p-2.5 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800"
            placeholder="name@gmail.com"
            required
          />
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border flex gap-2 text-[11px] text-slate-500 font-medium">
          <ShieldAlert size={16} className="shrink-0 mt-0.5 text-blue-600" />
          <p>
            Passwords are fully hashed under default security regulations. To
            initiate password rotation workflows, please submit a recovery token
            request.
          </p>
        </div>

        <button
          type="submit"
          disabled={updating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-sm disabled:opacity-50"
        >
          {updating ? "Updating Credentials..." : "Apply Changes"}
        </button>
      </form>
    </div>
  );
}
