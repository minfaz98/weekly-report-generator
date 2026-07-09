import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/Input";
import { PasswordInput } from "../../components/PasswordInput";

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      const errorMsg = err.response?.data
        ? Object.values(err.response.data).flat().join(" ")
        : "Registration failed.";
      toast.error(errorMsg);
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
          Join Your Workspace
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Create a standardized tracking profile
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Username"
            {...register("username", { required: "Username required" })}
            error={errors.username}
          />
          <Input
            label="Email Address"
            type="email"
            {...register("email", { required: "Email required" })}
            error={errors.email}
          />
          <PasswordInput
            label="Password"
            {...register("password", {
              required: "Password required",
              minLength: { value: 8, message: "Minimum 8 characters" },
            })}
            error={errors.password}
          />
          <div className="w-full flex flex-col gap-1.5 mb-6">
            <label className="text-sm font-semibold text-gray-700">
              Account Workplace Role
            </label>
            <select
              {...register("role", { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            >
              <option value="TEAM_MEMBER">Team Member</option>
              <option value="MANAGER">Manager / Administrator</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50"
          >
            {isSubmitting ? "Registering..." : "Register Profile"}
          </button>
        </form>
        <p className="text-sm text-center text-gray-600 mt-5">
          Already registered?{" "}
          <Link
            to="/"
            className="text-blue-600 font-semibold hover:underline"
          >
            Log In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
