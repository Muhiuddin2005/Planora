"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "@/services/auth.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotFormValues = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
  });

  const mutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (data) => {
      toast.success(data?.message || "Reset link sent successfully! Check your email.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to request reset password link");
    },
  });

  const onSubmit = (data: ForgotFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 bg-slate-50/50">
      <Card className="w-[400px] shadow-lg border-slate-200 bg-white rounded-2xl overflow-hidden">
        <CardHeader className="space-y-1 pb-4">
          <div className="flex justify-center mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <Mail className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl font-bold tracking-tight text-slate-900">Forgot Password</CardTitle>
          <p className="text-center text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Enter your registered email address and we'll send you a secure link to reset your account credentials.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input placeholder="name@example.com" {...register("email")} className="focus-visible:ring-indigo-600 rounded-lg" />
              {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 font-semibold cursor-pointer" disabled={mutation.isPending}>
              {mutation.isPending ? "Sending..." : "Request Reset Link"}
            </Button>
          </form>
          
          <div className="text-center pt-2 border-t border-slate-100">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-semibold hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
