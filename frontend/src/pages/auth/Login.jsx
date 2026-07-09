import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

// Unified paths matching your structured authentication branch configuration
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
      toast.error(
        err.response?.data?.detail || "Invalid login details credentials.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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
