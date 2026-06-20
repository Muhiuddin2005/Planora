"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "@/services/auth.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-[\]{}|;:',.<>?/`~])[A-Za-z\d@$!%*?&#^()_+=\-[\]{}|;:',.<>?/`~]{8,}$/;

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().regex(
    passwordRegex,
    "Password must meet all requirement criteria below"
  ),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password cannot be the same as current password",
  path: ["newPassword"],
});

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
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
    mutationFn: changePassword,
    onSuccess: (data) => {
      toast.success(data?.message || "Password updated successfully!");
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update password. Please check your credentials.");
    },
  });

  const onSubmit = (data: ChangePasswordValues) => {
    mutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
        <KeyRound className="h-5 w-5 text-indigo-600" />
        <h3 className="text-base font-bold text-slate-900">Change Password</h3>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Current Password */}
        <div className="space-y-1.5 relative">
          <Label htmlFor="currentPassword font-semibold text-slate-700">Current Password</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrent ? "text" : "password"}
              placeholder="••••••••"
              {...register("currentPassword")}
              className="focus-visible:ring-indigo-600 rounded-lg pr-10 cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-red-500 text-xs font-semibold">{errors.currentPassword.message}</p>
          )}
        </div>

        {/* New Password */}
        <div className="space-y-1.5 relative">
          <Label htmlFor="newPassword font-semibold text-slate-700">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNew ? "text" : "password"}
              placeholder="••••••••"
              {...register("newPassword")}
              className="focus-visible:ring-indigo-600 rounded-lg pr-10 cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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

          {errors.newPassword && (
            <p className="text-red-500 text-xs font-semibold">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5 relative">
          <Label htmlFor="confirmPassword font-semibold text-slate-700">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              {...register("confirmPassword")}
              className="focus-visible:ring-indigo-600 rounded-lg pr-10 cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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

          {errors.confirmPassword && (
            <p className="text-red-500 text-xs font-semibold">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Action Button */}
        <Button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer rounded-lg shadow-sm"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating Password...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Update Password
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
