"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axiosInstance";
import ProfileUpload from "@/components/dashboard/ProfileUpload";
import ChangePasswordForm from "@/components/dashboard/ChangePasswordForm";
import { User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
    } else {
      setMounted(true);
    }
  }, [router]);

  const { data: profileData } = useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => (await axiosInstance.get("/auth/me")).data,
    enabled: mounted,
  });

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  const user = profileData?.data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-1 flex items-center gap-2">
          <User className="h-7 w-7 text-indigo-600" />
          Profile Settings
        </h1>
        <p className="text-slate-500 text-sm">Manage your profile information and account security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <ProfileUpload currentPic={user?.profilePic} />
          
          {/* User Information Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Account Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                <span className="text-sm font-semibold text-slate-800">{user?.name || "N/A"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                <span className="text-sm font-semibold text-slate-800 break-all">{user?.email || "N/A"}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Role</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                  {user?.role || "USER"}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">
                  {user?.status || "ACTIVE"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
