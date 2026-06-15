"use client";

import { useState } from "react";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, User } from "lucide-react";

export default function ProfileUpload({ currentPic }: { currentPic?: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentPic);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    setPreview(URL.createObjectURL(file));
    setIsUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axiosInstance.patch("/users/profile-pic", formData);
      toast.success("Profile picture updated!");
      setPreview(response.data.data.profilePic);
    } catch (error) {
      toast.error("Failed to upload image.");
      setPreview(currentPic); // Revert on failure
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
      <div className="relative h-16 w-16 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-indigo-50 text-indigo-500">
            <User className="h-8 w-8" />
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-bold text-slate-900">Profile Picture</h3>
        <p className="text-xs text-slate-500 mb-2">JPG, PNG or WebP. Max 5MB.</p>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
          />
          <Button size="sm" variant="outline" disabled={isUploading} className="relative z-0">
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload New"}
          </Button>
        </div>
      </div>
    </div>
  );
}
