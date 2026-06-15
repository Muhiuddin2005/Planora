"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, Ticket, ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/axiosInstance";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionId) {
      axiosInstance
        .post("/payments/verify", { sessionId })
        .then(() => {
          setVerifying(false);
        })
        .catch((err) => {
          console.error("Verification failed:", err);
          setError(true);
          setVerifying(false);
        });
    } else {
      setVerifying(false);
    }
  }, [sessionId]);

  if (verifying) {
    return (
      <div className="max-w-md w-full bg-white/85 backdrop-blur-xl border border-slate-200/50 rounded-3xl shadow-2xl p-12 text-center relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-6" />
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Verifying Payment</h2>
        <p className="text-slate-500 font-medium">Please wait while we confirm your transaction with Stripe...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md w-full bg-white/85 backdrop-blur-xl border border-slate-200/50 rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden">
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600 mb-6">
          <CheckCircle2 className="h-10 w-10 stroke-[2]" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Verification Notice</h2>
        <p className="text-slate-600 font-medium mb-6">
          We couldn't confirm your transaction instantly. Don't worry! Your bank might be processing. Please check your dashboard in a few minutes.
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => router.push("/dashboard")}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg transition-all duration-300"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full bg-white/85 backdrop-blur-xl border border-slate-200/50 rounded-3xl shadow-2xl p-8 text-center relative overflow-hidden transition-all duration-500 hover:shadow-indigo-500/10">
      {/* Decorative gradients */}
      <div className="absolute -top-16 -left-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Success Icon */}
      <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-6 shadow-inner animate-bounce">
        <CheckCircle2 className="h-12 w-12 stroke-[2.5]" />
        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30 animate-ping opacity-75" />
      </div>

      {/* Header */}
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
        Payment Secured!
      </h1>
      <p className="text-slate-600 font-medium leading-relaxed px-2 mb-6">
        Thank you for your purchase! Your seat has been reserved, and your ticket request was processed successfully.
      </p>

      {/* Payment Details Card */}
      {sessionId && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left mb-8 space-y-2">
          <div className="flex justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Payment Method</span>
            <span>Card / Stripe</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-500 font-medium">
            <span>Reference ID</span>
            <span className="font-mono text-indigo-600 max-w-[180px] truncate" title={sessionId}>
              {sessionId}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={() => router.push("/dashboard")}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all duration-300 hover:-translate-y-0.5"
        >
          Go to Dashboard <ArrowRight className="h-4.5 w-4.5 ml-2" />
        </Button>
        <Button
          variant="outline"
          className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 font-semibold py-3 px-6 rounded-2xl transition-all duration-300"
          onClick={() => router.push("/events")}
        >
          <Ticket className="h-4.5 w-4.5 mr-2" /> Explore Events
        </Button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4 py-16 bg-slate-50/50">
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <span className="text-sm font-semibold text-indigo-600">Verifying secure payment...</span>
          </div>
        }
      >
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
