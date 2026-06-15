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
import { AlertTriangle } from "lucide-react";

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

  const [loggedInUserEmail, setLoggedInUserEmail] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

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
    onError: async (error: unknown, variables: { email: string }) => {
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

  if (isCheckingAuth) {
    return (
      <Card className="w-[400px] shadow-lg border-slate-200 py-8">
        <CardContent className="flex flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-xs text-slate-500 font-medium">Verifying access gateway...</p>
        </CardContent>
      </Card>
    );
  }

  // Mismatch view: logged-in user is NOT the invited user
  if (loggedInUserEmail && invitedEmail && loggedInUserEmail.toLowerCase() !== invitedEmail.toLowerCase()) {
    return (
      <Card className="w-[420px] shadow-xl border-amber-200 bg-amber-50/20">
        <CardHeader className="space-y-1 pb-2">
          <div className="flex justify-center mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-center text-xl font-bold tracking-tight text-amber-900">
            Account Mismatch
          </CardTitle>
          <p className="text-center text-xs text-amber-700 font-medium">
            You are logged in with a different account
          </p>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600 pt-2">
          <div className="p-3 bg-white border border-amber-100 rounded-lg space-y-2.5">
            <div>
              <span className="font-semibold text-[10px] text-slate-400 block uppercase tracking-wider">Logged In As</span>
              <span className="font-medium text-slate-800 text-sm break-all">{loggedInUserEmail}</span>
            </div>
            <hr className="border-slate-100" />
            <div>
              <span className="font-semibold text-[10px] text-slate-400 block uppercase tracking-wider">Invitation Sent To</span>
              <span className="font-medium text-indigo-700 text-sm break-all">{invitedEmail}</span>
            </div>
          </div>
          
          <p className="text-xs text-slate-500 text-center leading-relaxed px-1">
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
              className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
              onClick={() => router.push("/dashboard")}
            >
              Continue as {loggedInUserEmail}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-[400px] shadow-lg border-slate-200">
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold tracking-tight text-slate-900">Sign In to Planora</CardTitle>
        <p className="text-center text-xs text-slate-500">Enter your credentials to access your workspace</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input placeholder="name@example.com" {...register("email")} className="focus-visible:ring-indigo-600" />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{String(errors.email.message)}</p>}
          </div>
          <div>
            <Input type="password" placeholder="Password" {...register("password")} className="focus-visible:ring-indigo-600" />
            <div className="flex items-center justify-between mt-1.5">
              {errors.password && <p className="text-red-500 text-xs font-medium">{String(errors.password.message)}</p>}
              <Link href="/forgot-password" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 ml-auto hover:underline select-none">
                Forgot password?
              </Link>
            </div>
          </div>
          <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={mutation.isPending}>
            {mutation.isPending ? "Logging in..." : "Login"}
          </Button>
        </form>
        
        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>Don't have an account? </span>
          <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
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
    <div className="flex justify-center items-center min-h-[80vh] px-4 bg-slate-50/50">
      <Suspense fallback={<div className="animate-pulse">Loading secure gateway...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
