"use client";

import { AlertOctagon, UserPlus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function BannedPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 bg-slate-50/50">
      <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl shadow-xl overflow-hidden p-8 text-center animate-in zoom-in-95 duration-300">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 mb-6 shadow-sm">
          <AlertOctagon className="h-10 w-10" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
          Account Suspended
        </h1>
        
        <p className="text-slate-600 font-medium mb-6 leading-relaxed">
          The account you are trying to access has been permanently banned from Planora due to security violations or breaches of our terms of service.
        </p>
        
        <div className="flex flex-col gap-3 mt-4 pt-6 border-t border-slate-100">
          <Button 
            className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md flex items-center justify-center gap-2" 
            size="lg"
            onClick={() => router.push("/register")}
          >
            <UserPlus className="h-4.5 w-4.5" />
            Register a New Account
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 text-slate-600"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}
