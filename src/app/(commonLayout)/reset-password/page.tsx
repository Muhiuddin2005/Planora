"use client";

import { Suspense, useEffect, useState } from "react";
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
import { ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";

const resetSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
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

  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
  });

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
      <Card className="w-[400px] shadow-lg border-slate-200 bg-white rounded-2xl overflow-hidden p-6 space-y-4">
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
    <Card className="w-[400px] shadow-lg border-slate-200 bg-white rounded-2xl overflow-hidden">
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
            <Input type="password" placeholder="New Password" {...register("newPassword")} className="focus-visible:ring-indigo-600 rounded-lg" />
            {errors.newPassword && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.newPassword.message}</p>}
          </div>
          <div className="space-y-1">
            <Input type="password" placeholder="Confirm Password" {...register("confirmPassword")} className="focus-visible:ring-indigo-600 rounded-lg" />
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
    <div className="flex justify-center items-center min-h-[80vh] px-4 bg-slate-50/50">
      <Suspense fallback={<div className="animate-pulse">Loading password reset gateway...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
