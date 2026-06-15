"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { verifyEmail, resendOtp } from "@/services/auth.service";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Suspense } from "react";

const verifySchema = z.object({
  otp: z.string().min(6, "OTP must be at least 6 characters").max(6, "OTP must be exactly 6 characters"),
});

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(verifySchema),
  });

  const mutation = useMutation({
    mutationFn: verifyEmail,
    onSuccess: (res) => {
      toast.success(res.message || "Email verified successfully!");
      if (res.data?.token) {
        const token = res.data.token;
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", token);
          document.cookie = `accessToken=${token}; path=/; max-age=${60 * 60 * 24 * 10}; SameSite=Lax`;
        }
      }
      router.push("/dashboard");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Verification failed");
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendOtp,
    onSuccess: (res) => {
      toast.success(res.message || "A new OTP has been sent to your email.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to resend OTP");
    },
  });

  const onSubmit = (data: any) => {
    if (!email) {
      toast.error("Email is missing. Please register again.");
      return;
    }
    mutation.mutate({ email, otp: data.otp });
  };

  const handleResend = () => {
    if (!email) return;
    resendMutation.mutate({ email });
  };

  if (!email) {
    return (
      <div className="flex justify-center items-center min-h-[80vh] px-4 bg-slate-50/50">
        <p className="text-red-500 font-medium">Error: Email is missing. Please try registering again.</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 bg-slate-50/50">
      <Card className="w-[400px] shadow-lg border-slate-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold tracking-tight text-slate-900">Verify your Email</CardTitle>
          <p className="text-center text-xs text-slate-500">
            We sent a 6-digit code to <strong>{email}</strong>
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input 
                placeholder="Enter 6-digit OTP" 
                {...register("otp")} 
                className="focus-visible:ring-indigo-600 text-center tracking-widest text-lg" 
                maxLength={6}
              />
              {errors.otp && <p className="text-red-500 text-xs mt-1 font-medium text-center">{String(errors.otp.message)}</p>}
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={mutation.isPending}>
              {mutation.isPending ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-4 border-t border-slate-100">
            <span>Didn't receive the code? </span>
            <button
              onClick={handleResend}
              type="button"
              className="text-indigo-600 font-semibold hover:underline disabled:text-slate-400"
              disabled={resendMutation.isPending}
            >
              {resendMutation.isPending ? "Resending..." : "Resend OTP"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[80vh]">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
