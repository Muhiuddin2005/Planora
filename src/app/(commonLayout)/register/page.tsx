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

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

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
    <div className="flex justify-center items-center min-h-[80vh] px-4 bg-slate-50/50">
      <Card className="w-[400px] shadow-lg border-slate-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold tracking-tight text-slate-900">Create an Account</CardTitle>
          <p className="text-center text-xs text-slate-500">Sign up today to start exploring exclusive events</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input placeholder="Full Name" {...register("name")} className="focus-visible:ring-indigo-600" />
              {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{String(errors.name.message)}</p>}
            </div>
            <div>
              <Input placeholder="name@example.com" {...register("email")} className="focus-visible:ring-indigo-600" />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{String(errors.email.message)}</p>}
            </div>
            <div>
              <Input type="password" placeholder="Password (min 6 characters)" {...register("password")} className="focus-visible:ring-indigo-600" />
              {errors.password && <p className="text-red-500 text-xs mt-1 font-medium">{String(errors.password.message)}</p>}
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
          
          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Already have an account? </span>
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
