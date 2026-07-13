import React, { useState, useEffect } from "react";
import { User, Mail, ShieldAlert, Lock, Phone, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../api/axios";

export default function ProfileEditForm() {
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    contact_number: "",
    role: "",
  });

  // Separate states for password updates
  const [passwords, setPasswords] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [updating, setUpdating] = useState(false);

  // Sync state from localStorage on build
  useEffect(() => {
    const stored = localStorage.getItem("user_profile");
    if (stored) {
      const parsed = JSON.parse(stored);
      setProfile({
        first_name: parsed.first_name || "",
        last_name: parsed.last_name || "",
        username: parsed.username || "",
        email: parsed.email || "",
        contact_number: parsed.contact_number || "",
        role: parsed.role || "",
      });
    }
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    // Build the request payload matrix
    const payload = {
      first_name: profile.first_name,
      last_name: profile.last_name,
      username: profile.username,
      email: profile.email,
      contact_number: profile.contact_number,
    };

    // If user interacts with password fields, enforce strict validation matches
    if (passwords.old_password || passwords.new_password) {
      if (!passwords.old_password || !passwords.new_password) {
        toast.error("Please supply both your old and new password sequences.");
        setUpdating(false);
        return;
      }
      if (passwords.new_password !== passwords.confirm_password) {
        toast.error("New passwords do not match.");
        setUpdating(false);
        return;
      }
      payload.old_password = passwords.old_password;
      payload.new_password = passwords.new_password;
    }

    try {
      const response = await API.patch("auth/profile/", payload);

      // Update local tracking configurations
      localStorage.setItem("user_profile", JSON.stringify(response.data));
      toast.success("Account metrics and credentials updated successfully.");

      // Clear password values out of state memory fields safely
      setPasswords({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      const data = err.response?.data;
      toast.error(
        data?.username?.[0] ||
          data?.email?.[0] ||
          data?.contact_number?.[0] ||
          data?.old_password?.[0] ||
          data?.new_password?.[0] ||
          data?.detail ||
          "Failed to synchronize account mutations.",
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="bg-white p-6 border rounded-2xl shadow-sm space-y-4 max-w-xl mx-auto">
      <div className="border-b pb-3">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
          <User size={16} className="text-blue-600" /> Account Settings Portal
        </h2>
      </div>

      <form
        onSubmit={handleUpdateProfile}
        className="space-y-4 text-xs font-semibold text-slate-700"
      >
        {/* Name Fields Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-500 mb-1 flex items-center gap-1">
              <User size={12} className="text-blue-500" /> First Name
            </label>
            <input
              type="text"
              name="first_name"
              value={profile.first_name}
              onChange={handleProfileChange}
              className="w-full border p-2.5 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800"
              placeholder="First name"
              required
            />
          </div>
          <div>
            <label className="block text-slate-500 mb-1 flex items-center gap-1">
              <User size={12} className="text-blue-500" /> Last Name
            </label>
            <input
              type="text"
              name="last_name"
              value={profile.last_name}
              onChange={handleProfileChange}
              className="w-full border p-2.5 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800"
              placeholder="Last name"
              required
            />
          </div>
        </div>

        {/* Identity & Role Core Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-500 mb-1 flex items-center gap-1">
              <User size={12} className="text-blue-500" /> Username
            </label>
            <input
              type="text"
              name="username"
              value={profile.username}
              onChange={handleProfileChange}
              className="w-full border p-2.5 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800"
              placeholder="Unique username"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 flex items-center gap-1">
              <Lock size={11} /> Access Clearance Role
            </label>
            <input
              type="text"
              value={
                profile.role === "MANAGER"
                  ? "Managerial Clearance"
                  : "Standard Team Member"
              }
              disabled
              className="w-full border p-2.5 rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed outline-none"
            />
          </div>
        </div>

        {/* Communication Interfaces (Email & Contact) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-slate-500 mb-1 flex items-center gap-1">
              <Mail size={13} className="text-blue-500" /> Email Address
            </label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleProfileChange}
              className="w-full border p-2.5 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800"
              placeholder="name@gmail.com"
              required
            />
          </div>

          <div>
            <label className="block text-slate-500 mb-1 flex items-center gap-1">
              <Phone size={12} className="text-blue-500" /> Contact Number
            </label>
            <input
              type="text"
              name="contact_number"
              value={profile.contact_number}
              onChange={handleProfileChange}
              className="w-full border p-2.5 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800"
              placeholder="Contact digits"
              required
            />
          </div>
        </div>

        {/* Divider Rule */}
        <hr className="my-4 border-slate-100" />

        {/* Password Mutator Section Card */}
        <div className="space-y-3 bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
          <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <KeyRound size={12} className="text-blue-600" /> Security Credential
            Rotation
          </h3>

          <div>
            <label className="block text-slate-500 mb-1">
              Current Password
            </label>
            <input
              type="password"
              name="old_password"
              value={passwords.old_password}
              onChange={handlePasswordChange}
              className="w-full border p-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800"
              placeholder="••••••••"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-500 mb-1">New Password</label>
              <input
                type="password"
                name="new_password"
                value={passwords.new_password}
                onChange={handlePasswordChange}
                className="w-full border p-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirm_password"
                value={passwords.confirm_password}
                onChange={handlePasswordChange}
                className="w-full border p-2.5 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 text-slate-800"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        {/* Information Warning Banner */}
        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100/50 flex gap-2 text-[11px] text-slate-500 font-medium">
          <ShieldAlert size={16} className="shrink-0 mt-0.5 text-blue-600" />
          <p>
            Leave security rotation parameters blank if password modifications
            are unneeded. Passwords are fully hashed under default system
            protocols.
          </p>
        </div>

        {/* Form Submission Action Hook */}
        <button
          type="submit"
          disabled={updating}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-sm disabled:opacity-50"
        >
          {updating ? "Synchronizing Updates..." : "Apply Account Changes"}
        </button>
      </form>
    </div>
  );
}
