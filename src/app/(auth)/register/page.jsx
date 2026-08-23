"use client";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const [isShowPassword, setIsShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleRegisterFunc = async (data) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const { data: res, error } = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (error) {
        setErrorMsg(error.message || "Registration failed.");
        return;
      }

      if (res) {
        setSuccessMsg("Account created! Redirecting to dashboard...");
        setTimeout(() => {
          window.location.href = "/journalist";
        }, 1500);
      }
    } catch (err) {
      setErrorMsg("Connection error. Please try again.");
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/journalist",
      });
    } catch (err) {
      setErrorMsg("Google signup failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="min-h-[80vh] flex justify-center items-center px-4 py-8"
      style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div
            className="px-6 sm:px-8 py-6 text-center"
            style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)" }}
          >
            <h1 className="text-2xl font-black text-white tracking-tight">TruthDesk</h1>
            <p className="text-slate-400 text-sm mt-1">Create your newsroom account</p>
          </div>

          <div className="px-6 sm:px-8 py-6 space-y-4">
            {errorMsg && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3">
                {successMsg}
              </div>
            )}

            <button
              onClick={handleGoogleSignup}
              disabled={googleLoading || isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
              ) : (
                <FaGoogle className="text-red-500" size={16} />
              )}
              {googleLoading ? "Connecting..." : "Sign up with Google"}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-xs text-gray-400 font-medium">or register with email</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(handleRegisterFunc)}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all bg-white"
                  placeholder="Your full name"
                  {...register("name", {
                    required: "Name is required",
                    minLength: { value: 2, message: "Minimum 2 characters" },
                  })}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all bg-white"
                  placeholder="you@example.com"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={isShowPassword ? "text" : "password"}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all pr-10 bg-white"
                    placeholder="Minimum 8 characters"
                    {...register("password", {
                      required: "Password is required",
                      minLength: { value: 8, message: "Minimum 8 characters" },
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setIsShowPassword(!isShowPassword)}
                  >
                    {isShowPassword ? <FaEye /> : <FaEyeSlash />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || googleLoading}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #0f172a, #334155)" }}
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-slate-800 hover:text-red-600 transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
