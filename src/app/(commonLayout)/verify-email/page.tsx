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
import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import { ShieldCheck, Mail, RefreshCw, Loader2 } from "lucide-react";
import { Magnetic } from "@/components/shared/ScrollReveal";

const verifySchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

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
      toast.error(error?.response?.data?.message || "Verification failed. Please check the code.");
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendOtp,
    onSuccess: (res) => {
      toast.success(res.message || "A new OTP has been sent to your email.");
      setResendCooldown(60); // 60s cooldown
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
    if (!email || resendCooldown > 0) return;
    resendMutation.mutate({ email });
  };

  if (!email) {
    return (
      <div className="flex justify-center items-center min-h-[85vh] px-4 bg-slate-950 text-white relative">
        <p className="text-red-400 font-semibold bg-red-950/20 px-4 py-3 rounded-xl border border-red-900/50">
          Error: Email is missing. Please try registering again.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex justify-center items-center min-h-[85vh] px-4 overflow-hidden">
      {/* Event Atmosphere Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/event_bg.png"
          alt="Event background"
          fill
          priority
          sizes="100vw"
          className="object-cover scale-105"
        />
        {/* Sleek Darkening & Blur overlay */}
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
      </div>

      {/* Glassmorphic Verification Card */}
      <Card className="relative z-10 w-[420px] shadow-2xl border-white/10 bg-slate-900/80 backdrop-blur-xl text-white rounded-2xl overflow-hidden p-1">
        {/* Neon accent top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        
        <CardHeader className="space-y-2 pb-4 pt-6">
          <div className="flex justify-center mb-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl font-bold tracking-tight text-white">
            Security Verification
          </CardTitle>
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-xs text-slate-400">
              We sent a 6-digit confirmation code to
            </p>
            <div className="inline-flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/50 px-2.5 py-1 rounded-full text-xs text-indigo-300 font-semibold mt-1">
              <Mail className="h-3 w-3" />
              <span>{email}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <div className="relative">
                <Input 
                  placeholder="000000" 
                  {...register("otp")} 
                  className="bg-slate-950/60 border-slate-700/60 text-white focus-visible:ring-indigo-500 text-center tracking-[0.5em] pl-[0.5em] font-mono text-2xl h-14 rounded-xl cursor-pointer" 
                  maxLength={6}
                />
              </div>
              {errors.otp && (
                <p className="text-red-400 text-xs mt-1 font-semibold text-center select-none">
                  {String(errors.otp.message)}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg border-0 cursor-pointer" 
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                </span>
              ) : (
                "Verify & Proceed"
              )}
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-800 flex items-center justify-center gap-1">
            <span>Didn't receive the code?</span>
            <button
              onClick={handleResend}
              type="button"
              className="text-indigo-400 font-bold hover:text-indigo-300 hover:underline disabled:text-slate-600 transition-colors flex items-center gap-1 cursor-pointer"
              disabled={resendMutation.isPending || resendCooldown > 0}
            >
              {resendMutation.isPending ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" /> Resending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                "Resend OTP"
              )}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-[85vh] bg-slate-950 text-white">Loading verification...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
