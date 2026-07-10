import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/Input";
import { PasswordInput } from "../../components/PasswordInput";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const user = await login(data.username, data.password);
      toast.success(`Welcome back, ${user.username}!`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Invalid login details.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">
          Weekly Report Sync
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Sign in to manage your performance cycles
        </p>

        <form onSubmit={handleSubmit(onSubmit)}>
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 mt-2"
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

        {/* Manager/Admin Specialized Portal Button */}
        <button
          type="button"
          onClick={() => {
            toast.success(
              "Manager mode initialized! Please enter your administrative credentials above.",
            );
          }}
          className="w-full py-2 border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-md font-semibold text-sm transition flex items-center justify-center gap-2 border-l-4 border-l-blue-600"
        >
          <HiOutlineShieldCheck className="text-blue-600 w-5 h-5" />
          <span>Log In as Manager/Administer </span>
        </button>

        <p className="text-sm text-center text-gray-600 mt-5">
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
