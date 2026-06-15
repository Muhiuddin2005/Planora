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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"],
});

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }
  });

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
              className="focus-visible:ring-indigo-600 rounded-lg pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
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
              className="focus-visible:ring-indigo-600 rounded-lg pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
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
              className="focus-visible:ring-indigo-600 rounded-lg pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
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
