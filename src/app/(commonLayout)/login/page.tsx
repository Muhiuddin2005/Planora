"use client";

import { Suspense, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { loginUser, resendOtp } from "@/services/auth.service";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { AlertTriangle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import dynamic from "next/dynamic";

const EventAnimation = dynamic(
  () => import("@/components/shared/EventAnimation"),
  { ssr: false }
);

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Capture the redirect URL from the query string (defaults to dashboard)
  const redirectUrl = searchParams.get("redirect") || "/dashboard";
  const invitedEmail = searchParams.get("email") || "";
  const warning = searchParams.get("warning") || "";

  const [loggedInUserEmail, setLoggedInUserEmail] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: invitedEmail,
      password: "",
    },
  });

  // Prefill email if it arrives later or changes in query params
  useEffect(() => {
    if (invitedEmail) {
      setValue("email", invitedEmail);
    }
  }, [invitedEmail, setValue]);

  // Check login state and redirect/validate against invitation email
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode<{ email: string }>(token);
        const tokenEmail = decoded.email;
        setLoggedInUserEmail(tokenEmail);

        if (invitedEmail) {
          if (tokenEmail.toLowerCase() === invitedEmail.toLowerCase()) {
            router.push(redirectUrl);
          } else {
            // Stay on page and show warning
            setIsCheckingAuth(false);
          }
        } else {
          // No invitation email in query, simply redirect logged-in user to dashboard
          router.push(redirectUrl);
        }
      } catch (err) {
        // Clean up corrupt token
        localStorage.removeItem("accessToken");
        document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
        setIsCheckingAuth(false);
      }
    } else {
      setIsCheckingAuth(false);
    }
  }, [router, invitedEmail, redirectUrl]);

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      const token = data.data.token;
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", token);
        document.cookie = `accessToken=${token}; path=/; max-age=${60 * 60 * 24 * 10}; SameSite=Lax`;
      }
      toast.success("Login successful!");
      
      // Send them to the requested page or the dashboard
      router.push(redirectUrl);
    },
    onError: async (error: unknown, variables: { email: string; password?: string }) => {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || "Invalid login credentials";

      // Intercept the banned user message
      if (errorMessage.toLowerCase().includes("permanently banned") || errorMessage.toLowerCase().includes("banned")) {
        router.push("/banned");
      } else if (errorMessage === "EMAIL_NOT_VERIFIED") {
        toast.error("Email not verified. Sending a new OTP...");
        try {
          await resendOtp({ email: variables.email });
          router.push(`/verify-email?email=${encodeURIComponent(variables.email)}`);
        } catch (resendErr: any) {
          toast.error(resendErr.response?.data?.message || "Failed to send new OTP");
        }
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const onSubmit = (formData: { email: string; password: string }) => {
    mutation.mutate(formData);
  };

  const handleDemoAdminLogin = () => {
    const adminEmail = "admin@gmail.com";
    const adminPassword = "123456aA!";
    setValue("email", adminEmail, { shouldValidate: true });
    setValue("password", adminPassword, { shouldValidate: true });
    mutation.mutate({ email: adminEmail, password: adminPassword });
  };

  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center px-4">
        <Card className="w-[400px] shadow-xl border-slate-800 bg-slate-900/40 backdrop-blur-md py-8">
          <CardContent className="flex flex-col items-center justify-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
            <p className="text-xs text-slate-400 font-medium">Verifying access gateway...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mismatch view: logged-in user is NOT the invited user
  if (loggedInUserEmail && invitedEmail && loggedInUserEmail.toLowerCase() !== invitedEmail.toLowerCase()) {
    return (
      <div className="flex justify-center items-center px-4">
        <Card className="w-[420px] shadow-xl border-amber-900/50 bg-amber-950/10 backdrop-blur-md">
          <CardHeader className="space-y-1 pb-2">
            <div className="flex justify-center mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-950 text-amber-500 border border-amber-900/50">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
            <CardTitle className="text-center text-xl font-bold tracking-tight text-amber-200">
              Account Mismatch
            </CardTitle>
            <p className="text-center text-xs text-amber-400 font-medium">
              You are logged in with a different account
            </p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300 pt-2">
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2.5">
              <div>
                <span className="font-semibold text-[10px] text-slate-500 block uppercase tracking-wider">Logged In As</span>
                <span className="font-medium text-slate-200 text-sm break-all">{loggedInUserEmail}</span>
              </div>
              <hr className="border-slate-800" />
              <div>
                <span className="font-semibold text-[10px] text-slate-500 block uppercase tracking-wider">Invitation Sent To</span>
                <span className="font-medium text-indigo-400 text-sm break-all">{invitedEmail}</span>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 text-center leading-relaxed px-1">
              To view and accept this invitation, please sign in with the email address that received the invitation.
            </p>

            <div className="flex flex-col gap-2 pt-2">
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                onClick={() => {
                  // Logout, prefill, and refresh
                  localStorage.removeItem("accessToken");
                  document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
                  window.location.reload();
                }}
              >
                Sign Out & Switch Accounts
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-slate-800 text-slate-300 hover:bg-slate-800 font-medium"
                onClick={() => router.push("/dashboard")}
              >
                Continue as {loggedInUserEmail}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-[580px] shadow-2xl border-slate-800 bg-slate-900/40 backdrop-blur-md p-6 sm:p-10">
      <CardHeader className="space-y-3 pb-6">
        <CardTitle className="text-center text-3xl font-extrabold tracking-tight text-white">Sign In to Planora</CardTitle>
        <p className="text-center text-sm text-slate-400">Enter your credentials to access your workspace</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {warning && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-red-900 bg-red-950/20 text-red-200 text-sm leading-relaxed animate-in fade-in duration-200">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="font-bold text-red-400">Access Violation</p>
              <p className="text-red-300/90 mt-0.5">{warning}</p>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Input placeholder="name@example.com" {...register("email")} className="h-12 focus-visible:ring-indigo-600 bg-slate-900/60 border-slate-800 text-white placeholder:text-slate-500 text-base" />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{String(errors.email.message)}</p>}
          </div>
          <div className="space-y-2">
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                {...register("password")} 
                className="h-12 focus-visible:ring-indigo-600 bg-slate-900/60 border-slate-800 text-white placeholder:text-slate-500 pr-12 cursor-pointer text-base" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              {errors.password && <p className="text-red-500 text-xs font-medium">{String(errors.password.message)}</p>}
              <Link href="/forgot-password" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 ml-auto hover:underline select-none">
                Forgot password?
              </Link>
            </div>
          </div>
          <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base" disabled={mutation.isPending}>
            {mutation.isPending ? "Logging in..." : "Login"}
          </Button>

          <div className="relative flex items-center justify-center pt-2 pb-1">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-slate-900/90 px-3 text-[11px] text-slate-500 font-semibold uppercase tracking-wider whitespace-nowrap absolute">
              Quick Recruiter Access
            </span>
          </div>

          <Button
            type="button"
            onClick={handleDemoAdminLogin}
            disabled={mutation.isPending}
            className="w-full h-12 bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-amber-500/10 hover:from-amber-500/20 hover:to-amber-500/20 border border-amber-500/40 text-amber-300 hover:text-amber-200 font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2.5 shadow-lg shadow-amber-950/40"
          >
            <ShieldCheck className="h-5 w-5 text-amber-400" />
            <span>Demo Admin (One-Click Login)</span>
          </Button>
        </form>
        
        <div className="text-center text-sm text-slate-400 pt-4 border-t border-slate-800">
          <span>Don't have an account? </span>
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline">
            Sign Up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// Wrap the main page in Suspense to avoid Next.js build errors with useSearchParams
export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-950 relative overflow-hidden">
      {/* Left Side: GSAP Animation Panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[30%] relative overflow-hidden items-center justify-center">
        {/* Subtle grid pattern overlay */}
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

      {/* Right Side: Login Form */}
      <div className="flex-1 lg:w-[70%] flex justify-center items-center px-6 sm:px-12 md:px-20 py-12 z-10">
        <Suspense fallback={<div className="animate-pulse text-white">Loading secure gateway...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
