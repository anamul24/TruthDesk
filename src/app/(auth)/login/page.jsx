"use client";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaEye, FaEyeSlash, FaGoogle } from "react-icons/fa";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const [isShowPassword, setIsShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLoginFunc = async (data) => {
    setErrorMsg("");
    const { data: res, error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
      rememberMe: true,
      callbackURL: "/",
    });

    if (error) {
      setErrorMsg(error.message || "Login failed. Please try again.");
    }
    if (res) {
      window.location.href = "/";
    }
  };

  const handleGoogleSignin = async () => {
    await authClient.signIn.social({ provider: "google", callbackURL: "/" });
  };

  return (
    <div
      className="min-h-[80vh] flex justify-center items-center px-4"
      style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div
            className="px-8 py-6 text-center"
            style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)" }}
          >
            <h1 className="text-2xl font-black text-white tracking-tight">TruthDesk</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
          </div>

          <div className="px-8 py-6 space-y-5">
            <button
              type="button"
              onClick={handleGoogleSignin}
              className="flex items-center justify-center gap-3 w-full py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-all shadow-sm hover:shadow"
            >
              <FaGoogle className="text-red-500 text-base" />
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-100"></div>
              <span className="text-xs text-gray-400 font-medium">or sign in with email</span>
              <div className="h-px flex-1 bg-gray-100"></div>
            </div>

            {errorMsg && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
                {errorMsg}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit(handleLoginFunc)}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition-all"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-300 transition-all pr-10"
                    placeholder="••••••••"
                    {...register("password", { required: "Password is required" })}
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
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg, #0f172a, #334155)" }}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-slate-800 hover:text-red-600 transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
