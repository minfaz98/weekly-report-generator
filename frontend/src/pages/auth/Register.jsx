import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Input } from "../../components/Input";
import { PasswordInput } from "../../components/PasswordInput";

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      role: "TEAM_MEMBER",
      first_name: "",
      last_name: "",
      username: "",
      contact_number: "",
      email: "",
      password: "",
    },
  });

  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success(
        "Registration successful! Please login with your new credentials.",
      );
      navigate("/login");
    } catch (err) {
      let errorMsg = "Registration failed. Please try again.";

      if (err.response?.data) {
        const serverData = err.response.data;

        if (typeof serverData === "object") {
          const firstKey = Object.keys(serverData)[0];
          const firstError = serverData[firstKey];

          errorMsg = `${firstKey.replace("_", " ")}: ${
            Array.isArray(firstError) ? firstError[0] : firstError
          }`;
        } else if (typeof serverData === "string") {
          errorMsg = serverData;
        }
      }

      toast.error(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-4 px-2">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white rounded-lg shadow-md p-5"
      >
        <h2 className="text-xl font-bold text-center text-gray-800 mb-1">
          Join Your Workspace
        </h2>

        <p className="text-xs text-center text-gray-500 mb-4">
          Create a standardized team member tracking profile
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              label="First Name"
              {...register("first_name", {
                required: "First name is required",
                pattern: {
                  value: /^[A-Za-z\s-]+$/,
                  message: "First name can only contain letters",
                },
              })}
              error={errors.first_name}
            />

            <Input
              label="Last Name"
              {...register("last_name", {
                required: "Last name is required",
                pattern: {
                  value: /^[A-Za-z\s-]+$/,
                  message: "Last name can only contain letters",
                },
              })}
              error={errors.last_name}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              label="Username"
              {...register("username", {
                required: "Username is required",
                minLength: {
                  value: 4,
                  message: "Username must be at least 4 characters",
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: "Alphanumeric characters and underscores only",
                },
              })}
              error={errors.username}
            />

            <Input
              label="Contact Number"
              type="text"
              {...register("contact_number", {
                required: "Contact number is required",
                pattern: {
                  value: /^[0-9+\s-]{9,15}$/,
                  message: "Enter a valid telephone digit configuration",
                },
              })}
              error={errors.contact_number}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            {...register("email", {
              required: "Email address is required",
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "Enter a valid email layout format",
              },
            })}
            error={errors.email}
          />

          <PasswordInput
            label="Password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Minimum 8 characters required",
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                message: "Must include uppercase, lowercase, and a number",
              },
            })}
            error={errors.password}
          />

          <input type="hidden" {...register("role")} value="TEAM_MEMBER" />

          <div className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-[10px] leading-relaxed text-slate-500">
            <ShieldAlert size={15} className="mt-0.5 shrink-0 text-blue-600" />
            <p>
              Forgot your password or username? Contact your Workspace Manager
              to reset or retrieve your account credentials.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Registering..." : "Register Profile"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Log In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
