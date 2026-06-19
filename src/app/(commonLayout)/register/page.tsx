"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "@/services/auth.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import dynamic from "next/dynamic";

const EventAnimation = dynamic(
  () => import("@/components/shared/EventAnimation"),
  { ssr: false }
);

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+=\-[\]{}|;:',.<>?/`~])[A-Za-z\d@$!%*?&#^()_+=\-[\]{}|;:',.<>?/`~]{8,}$/;

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().regex(
    passwordRegex,
    "Password must meet all requirement criteria below"
  ),
});

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    }
  });

  const password = watch("password", "");

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&#^()_+=\-[\]{}|;:',.<>?/`~]/.test(password);

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data: any, variables: any) => {
      toast.success("Registration successful! Check your email for the OTP.");
      router.push(`/verify-email?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Registration failed");
    },
  });

  const onSubmit = (data: any) => {
    mutation.mutate(data);
  };
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

      {/* Right Side: Registration Form */}
      <div className="flex-1 lg:w-[70%] flex justify-center items-center px-6 sm:px-12 md:px-20 py-12 z-10">
        <Card className="w-full max-w-[580px] shadow-2xl border-slate-800 bg-slate-900/40 backdrop-blur-md p-6 sm:p-10">
          <CardHeader className="space-y-3 pb-6">
            <CardTitle className="text-center text-3xl font-extrabold tracking-tight text-white">Create an Account</CardTitle>
            <p className="text-center text-sm text-slate-400">Sign up today to start exploring exclusive events</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Input placeholder="Full Name" {...register("name")} className="h-12 focus-visible:ring-indigo-600 bg-slate-900/60 border-slate-800 text-white placeholder:text-slate-500 cursor-pointer text-base" />
                {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{String(errors.name.message)}</p>}
              </div>
              <div className="space-y-2">
                <Input placeholder="name@example.com" {...register("email")} className="h-12 focus-visible:ring-indigo-600 bg-slate-900/60 border-slate-800 text-white placeholder:text-slate-500 cursor-pointer text-base" />
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
                
                {/* Live requirements checklist */}
                {password.length > 0 && (
                  <div className="mt-2.5 p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs space-y-2 font-medium transition-all duration-300">
                    <p className="text-xs font-bold text-slate-400 block uppercase tracking-wider mb-2 select-none">Password Requirements</p>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full transition-colors ${hasMinLength ? "bg-emerald-500" : "bg-red-500"}`} />
                      <span className={hasMinLength ? "text-emerald-500" : "text-red-400"}>At least 8 characters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full transition-colors ${hasUppercase ? "bg-emerald-500" : "bg-red-500"}`} />
                      <span className={hasUppercase ? "text-emerald-500" : "text-red-400"}>One uppercase letter (A-Z)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full transition-colors ${hasLowercase ? "bg-emerald-500" : "bg-red-500"}`} />
                      <span className={hasLowercase ? "text-emerald-500" : "text-red-400"}>One lowercase letter (a-z)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full transition-colors ${hasNumber ? "bg-emerald-500" : "bg-red-500"}`} />
                      <span className={hasNumber ? "text-emerald-500" : "text-red-400"}>One numeric digit (0-9)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full transition-colors ${hasSpecial ? "bg-emerald-500" : "bg-red-500"}`} />
                      <span className={hasSpecial ? "text-emerald-500" : "text-red-400"}>One special symbol (@$!%*?&...)</span>
                    </div>
                  </div>
                )}

                {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{String(errors.password.message)}</p>}
              </div>
              <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base" disabled={mutation.isPending}>
                {mutation.isPending ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
            
            <div className="text-center text-sm text-slate-400 pt-4 border-t border-slate-800">
              <span>Already have an account? </span>
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
