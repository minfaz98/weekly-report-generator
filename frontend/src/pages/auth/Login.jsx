import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye as Eye, FaEyeSlash as EyeOff } from "react-icons/fa";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { login as loginRequest } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const response = await loginRequest(data);

      login(response.data.access, response.data.refresh, response.data.user);

      toast.success("Login successful");

      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Invalid username or password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-8">
      <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>

      <p className="text-gray-500 mb-8">Sign in to continue</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Username"
          name="username"
          register={register}
          error={errors.username}
        />

        <div>
          <label className="text-sm font-medium">Password</label>

          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: "Password is required",
              })}
              className="w-full rounded-lg border px-3 py-3 pr-10"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3"
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button loading={loading}>Login</Button>
      </form>
    </div>
  );
}
