"use client";

import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { resetPassword } from "@/services/auth.service";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ShieldCheck, Eye, EyeOff, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";

const EventAnimation = dynamic(
  () => import("@/components/shared/EventAnimation"),
  { ssr: false }
);

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-[\]{}|;:',.<>?/`~])[A-Za-z\d@$!%*?&#^()_+=\-[\]{}|;:',.<>?/`~]{8,}$/;

const resetSchema = z.object({
  newPassword: z.string().regex(
    passwordRegex,
    "Password must meet all requirement criteria below"
  ),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ResetFormValues = z.infer<typeof resetSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    }
  });

  const newPassword = watch("newPassword", "");
  const confirmPassword = watch("confirmPassword", "");

  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[@$!%*?&#^()_+=\-[\]{}|;:',.<>?/`~]/.test(newPassword);

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success("Password reset successful! Please login with your new password.");
      router.push("/login");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reset password. Link may be expired.");
    },
  });

  const onSubmit = (data: ResetFormValues) => {
    if (!token || !email) {
      toast.error("Invalid password reset request credentials.");
      return;
    }
    mutation.mutate({
      token,
      email,
      newPassword: data.newPassword,
    });
  };

  if (!token || !email) {
    return (
      <Card className="w-full max-w-[420px] shadow-lg border-slate-200 bg-white rounded-2xl overflow-hidden p-6 space-y-4">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>
        <h2 className="text-center text-xl font-bold tracking-tight text-slate-900">Link Incomplete</h2>
        <p className="text-center text-xs text-slate-500 leading-relaxed px-2">
          The password reset link is invalid or incomplete. Please request a new link from the forgot password page.
        </p>
        <Link href="/forgot-password" className="w-full block">
          <Button className="w-full bg-slate-900 hover:bg-slate-800">Request New Link</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[420px] shadow-lg border-slate-200 bg-white rounded-2xl overflow-hidden">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex justify-center mb-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-center text-2xl font-bold tracking-tight text-slate-900">Reset Password</CardTitle>
        <p className="text-center text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          Create a new password. Make sure it contains at least 6 characters.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <div className="relative">
              <Input 
                type={showNewPassword ? "text" : "password"} 
                placeholder="New Password" 
                {...register("newPassword")} 
                className="focus-visible:ring-indigo-600 rounded-lg pr-10 cursor-pointer" 
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Live requirements checklist */}
            {newPassword.length > 0 && (
              <div className="mt-2.5 p-3 bg-slate-50 border border-slate-100 rounded-lg text-[11px] space-y-1.5 font-medium transition-all duration-300">
                <p className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider mb-2 select-none">Password Requirements</p>
                <div className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full transition-colors ${hasMinLength ? "bg-emerald-500" : "bg-red-500"}`} />
                  <span className={hasMinLength ? "text-emerald-600" : "text-red-500"}>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full transition-colors ${hasUppercase ? "bg-emerald-500" : "bg-red-500"}`} />
                  <span className={hasUppercase ? "text-emerald-600" : "text-red-500"}>One uppercase letter (A-Z)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full transition-colors ${hasLowercase ? "bg-emerald-500" : "bg-red-500"}`} />
                  <span className={hasLowercase ? "text-emerald-600" : "text-red-500"}>One lowercase letter (a-z)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full transition-colors ${hasNumber ? "bg-emerald-500" : "bg-red-500"}`} />
                  <span className={hasNumber ? "text-emerald-600" : "text-red-500"}>One numeric digit (0-9)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full transition-colors ${hasSpecial ? "bg-emerald-500" : "bg-red-500"}`} />
                  <span className={hasSpecial ? "text-emerald-600" : "text-red-500"}>One special symbol (@$!%*?&...)</span>
                </div>
              </div>
            )}

            {errors.newPassword && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.newPassword.message}</p>}
          </div>
          <div className="space-y-1">
            <div className="relative">
              <Input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Confirm Password" 
                {...register("confirmPassword")} 
                className="focus-visible:ring-indigo-600 rounded-lg pr-10 cursor-pointer" 
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Password match indicator */}
            {confirmPassword.length > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5 pl-1 select-none">
                <div className={`h-1.5 w-1.5 rounded-full ${passwordsMatch ? "bg-emerald-500" : "bg-red-500"}`} />
                <span className={`text-[10px] font-semibold ${passwordsMatch ? "text-emerald-600" : "text-red-500"}`}>
                  {passwordsMatch ? "Passwords match perfectly" : "Passwords do not match"}
                </span>
              </div>
            )}

            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.confirmPassword.message}</p>}
          </div>
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 font-semibold cursor-pointer" disabled={mutation.isPending}>
            {mutation.isPending ? "Updating password..." : "Reset Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[85vh] bg-slate-50/50">
      {/* Left Side: GSAP Animation Panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 relative overflow-hidden items-center justify-center">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <EventAnimation />
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex justify-center items-center px-4 py-8">
        <Suspense fallback={<div className="animate-pulse">Loading password reset gateway...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
