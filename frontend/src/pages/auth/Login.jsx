import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { HiOutlineShieldCheck, HiOutlineUser } from "react-icons/hi";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/Input";
import { PasswordInput } from "../../components/PasswordInput";

export default function Login() {
  const [isAdminView, setIsAdminView] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const userProfile = await login(data.username, data.password);

      if (
        isAdminView &&
        !userProfile.is_superuser &&
        userProfile.role !== "MANAGER"
      ) {
        logout();
        toast.error(
          "Access Denied. These credentials do not possess management clearances.",
        );
        return;
      }

      toast.success(`Welcome back, ${userProfile.username}!`);
      navigate("/dashboard");
    } catch (err) {
      let errorMsg = "Invalid username or password credentials.";

      if (err.response?.status === 401 || err.response?.status === 400) {
        const serverData = err.response.data;
        if (serverData && typeof serverData === "object") {
          const detail =
            serverData.detail || Object.values(serverData).flat()[0];
          if (detail) errorMsg = String(detail);
        }
      } else if (err.request) {
        errorMsg =
          "Network timeout connection loss to backend authentication pipelines.";
      }

      toast.error(errorMsg);
    }
  };

  const handleViewToggle = () => {
    reset();
    setIsAdminView(!isAdminView);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md transition-all"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-1 font-sans">
          Weekly Report Sync
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6 font-sans">
          Sign in to manage your performance cycles
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="relative overflow-hidden min-h-[168px]">
            <AnimatePresence mode="wait">
              {isAdminView ? (
                <motion.div
                  key="admin-fields"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <Input
                    label="Admin Username"
                    {...register("username", {
                      required: "Admin username required",
                    })}
                    error={errors.username}
                  />
                  <PasswordInput
                    label="Admin Password"
                    {...register("password", {
                      required: "Admin password required",
                    })}
                    error={errors.password}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="user-fields"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <Input
                    label="Username"
                    {...register("username", { required: "Username required" })}
                    error={errors.username}
                  />
                  <PasswordInput
                    label="Password"
                    {...register("password", { required: "Password required" })}
                    error={errors.password}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 mt-2 text-xs uppercase tracking-wider"
          >
            {isSubmitting ? "Verifying..." : "Sign In"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-400">
              Management Access
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleViewToggle}
          className="w-full py-2 border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-md font-semibold text-sm transition flex items-center justify-center gap-2 border-l-4 border-l-blue-600 shadow-sm"
        >
          {isAdminView ? (
            <>
              <HiOutlineUser className="text-blue-600 w-5 h-5" />
              <span>Log In as Standard Team Member</span>
            </>
          ) : (
            <>
              <HiOutlineShieldCheck className="text-blue-600 w-5 h-5" />
              <span>Log In as Manager/Administer</span>
            </>
          )}
        </button>

        <p className="text-sm text-center text-gray-600 mt-5 font-sans">
          New to the team?{" "}
          <Link
            to="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Create Account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
