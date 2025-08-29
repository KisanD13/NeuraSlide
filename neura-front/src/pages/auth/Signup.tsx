import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../../components/layout/Navbar";
import { theme } from "../../config/theme";
import { useAuthContext } from "../../contexts/AuthContext";
import { signup } from "./api";
import { tokenManager } from "../../libs/api/axiosInstance";
import { useApiCall } from "../../hooks/useApiCall";

export default function Signup() {
  const navigate = useNavigate();
  const { setUser, user } = useAuthContext();
  const { callApi, isLoading } = useApiCall();

  console.log(user);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    teamName: "",
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.teamName.trim()) {
      newErrors.teamName = "Team/Business name is required";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const result = await callApi({
      apiFunction: signup,
      data: {
        name: formData.name,
        email: formData.email,
        teamName: formData.teamName,
        password: formData.password,
      },
    });

    console.log(result);

    if (result.success && result.data) {
      // Store token and set user
      tokenManager.setToken(result.data.data.accessToken);
      setUser(result.data.data.user);

      // Redirect to dashboard on successful signup
      navigate("/dashboard");
    } else {
      // Show error message
      setErrors({ general: result.message || "Signup failed" });
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.gradients.background}`}
    >
      <Navbar />

      <div className="flex items-center justify-center min-h-screen p-4 pt-20">
        <div className="w-full max-w-md relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className={theme.typography.heading}>Create Your Account</h1>
          </motion.div>

          {/* Signup Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={theme.components.card.glass}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={`${theme.components.input.base} ${
                    errors.name
                      ? theme.components.input.error
                      : theme.components.input.normal
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`${theme.components.input.base} ${
                    errors.email
                      ? theme.components.input.error
                      : theme.components.input.normal
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Team/Business Name */}
              <div>
                <label
                  htmlFor="teamName"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Team/Business Name
                </label>
                <input
                  type="text"
                  id="teamName"
                  name="teamName"
                  value={formData.teamName}
                  onChange={handleInputChange}
                  required
                  className={`${theme.components.input.base} ${
                    errors.teamName
                      ? theme.components.input.error
                      : theme.components.input.normal
                  }`}
                  placeholder="Enter your business name"
                />
                {errors.teamName && (
                  <p className="mt-1 text-sm text-red-400">{errors.teamName}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={8}
                  className={`${theme.components.input.base} ${
                    errors.password
                      ? theme.components.input.error
                      : theme.components.input.normal
                  }`}
                  placeholder="Create a strong password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className={`${theme.components.input.base} ${
                    errors.confirmPassword
                      ? theme.components.input.error
                      : theme.components.input.normal
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms Acceptance */}
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleInputChange}
                  required
                  className={`w-5 h-5 mt-0.5 bg-white/5 border rounded focus:ring-2 focus:ring-cyan-500/50 text-cyan-500 ${
                    errors.acceptTerms ? "border-red-400" : "border-white/20"
                  }`}
                />
                <label
                  htmlFor="acceptTerms"
                  className={`text-sm ${theme.typography.body} leading-relaxed`}
                >
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className={`${theme.typography.link} underline`}
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/privacy"
                    className={`${theme.typography.link} underline`}
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-sm text-red-400">{errors.acceptTerms}</p>
              )}

              {/* General Error */}
              {errors.general && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{errors.general}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full ${theme.components.button.primary}
                  ${isLoading ? theme.components.button.disabled : "cursor-pointer"}`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Signup */}
              <button
                type="button"
                disabled
                className={`w-full ${theme.components.button.secondary} ${theme.components.button.disabled}`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <img
                    src="/images/google-icon.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  <span>Continue with Google</span>
                </div>
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className={theme.typography.body}>
                Already have an account?{" "}
                <Link
                  to="/auth/login"
                  className={`${theme.typography.link} font-medium`}
                >
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 text-center"
          >
            <div
              className={`flex items-center justify-center space-x-8 ${theme.typography.body}`}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">14-day free trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm">No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-sm">Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
