"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { createNewEvent } from "@/services/event.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { jwtDecode } from "jwt-decode";
import { Sparkles, Upload, Loader2 } from "lucide-react";
import { useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  shortDescription: z.string().min(5, "Short description must be at least 5 characters").max(100, "Must be under 100 characters"),
  fullDescription: z.string().min(10, "Full description needs more detail"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  venue: z.string().min(1, "Venue is required"),
  isPublic: z.boolean(),
  isPaid: z.boolean(),
  fee: z.number().min(0, "Fee must be a positive number"),
  imageUrl: z.string().url("Invalid image URL").or(z.literal("")).optional(),
  category: z.string().min(1, "Category is required"),
});

type EventFormValues = z.infer<typeof eventSchema>;

export default function CreateEventPage() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrlPreview, setImageUrlPreview] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      shortDescription: "",
      fullDescription: "",
      date: "",
      time: "",
      venue: "",
      isPublic: true,
      isPaid: false,
      fee: 0,
      imageUrl: "",
      category: "Technology",
    }
  });

  const isPaid = watch("isPaid");

  const mutation = useMutation({
    mutationFn: createNewEvent,
    onSuccess: () => {
      toast.success("Event created successfully!");
      router.push("/dashboard");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to create event");
    },
  });

  const onSubmit = (data: EventFormValues) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
    let userId = "";
    if (token) {
      try {
        const decoded = jwtDecode<{ userId: string }>(token);
        userId = decoded.userId;
      } catch (e) {
        console.error("JWT decoding failed", e);
      }
    }

    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("date", new Date(data.date).toISOString());
    formData.append("time", data.time);
    formData.append("venue", data.venue);
    formData.append("isPublic", String(data.isPublic));
    formData.append("isPaid", String(data.isPaid));
    formData.append("fee", String(data.isPaid ? data.fee : 0));
    formData.append("ownerId", userId);

    const descriptionJSON = JSON.stringify({
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription,
      category: data.category,
    });
    formData.append("description", descriptionJSON);
    
    if (imageFile) {
      formData.append("image", imageFile);
    }
    
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Card className="border-slate-200 shadow-md rounded-2xl overflow-hidden bg-white">
        <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
          <div className="relative z-10 space-y-1">
            <span className="inline-flex items-center gap-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-indigo-500/30">
              <Sparkles className="h-3 w-3" /> Host Portal
            </span>
            <CardTitle className="text-2xl font-bold tracking-tight text-white">Host a New Event</CardTitle>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-indigo-600/30 blur-2xl" />
        </div>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title" className="font-semibold text-slate-700">Event Title</Label>
              <Input id="title" placeholder="Web3 Developer Summit 2026" {...register("title")} className="focus-visible:ring-indigo-600 rounded-lg" />
              {errors.title && <p className="text-red-500 text-xs font-semibold mt-1">{errors.title.message}</p>}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="category" className="font-semibold text-slate-700">Category</Label>
              <select
                id="category"
                {...register("category")}
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 text-slate-800"
              >
                <option value="Technology">Technology</option>
                <option value="Business">Business</option>
                <option value="Education">Education</option>
                <option value="Social">Social</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Health">Health &amp; Fitness</option>
              </select>
              {errors.category && <p className="text-red-500 text-xs font-semibold mt-1">{errors.category.message}</p>}
            </div>

            {/* Short Description */}
            <div className="space-y-1.5">
              <Label htmlFor="shortDescription" className="font-semibold text-slate-700">Short Description</Label>
              <Input id="shortDescription" placeholder="A brief hook summary (max 100 chars)..." {...register("shortDescription")} className="focus-visible:ring-indigo-600 rounded-lg" />
              {errors.shortDescription && <p className="text-red-500 text-xs font-semibold mt-1">{errors.shortDescription.message}</p>}
            </div>

            {/* Full Description */}
            <div className="space-y-1.5">
              <Label htmlFor="fullDescription" className="font-semibold text-slate-700">Full Description</Label>
              <textarea
                id="fullDescription"
                rows={4}
                placeholder="Give a detailed description about schedule, hosts, and what attendees will learn..."
                {...register("fullDescription")}
                className="flex min-h-[100px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600"
              />
              {errors.fullDescription && <p className="text-red-500 text-xs font-semibold mt-1">{errors.fullDescription.message}</p>}
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date" className="font-semibold text-slate-700">Date</Label>
                <Input id="date" type="date" {...register("date")} className="focus-visible:ring-indigo-600 rounded-lg" />
                {errors.date && <p className="text-red-500 text-xs font-semibold mt-1">{errors.date.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="time" className="font-semibold text-slate-700">Time</Label>
                <Input id="time" type="time" {...register("time")} className="focus-visible:ring-indigo-600 rounded-lg" />
                {errors.time && <p className="text-red-500 text-xs font-semibold mt-1">{errors.time.message}</p>}
              </div>
            </div>

            {/* Venue */}
            <div className="space-y-1.5">
              <Label htmlFor="venue" className="font-semibold text-slate-700">Venue</Label>
              <Input id="venue" placeholder="Grand Ballroom or Zoom Link" {...register("venue")} className="focus-visible:ring-indigo-600 rounded-lg" />
              {errors.venue && <p className="text-red-500 text-xs font-semibold mt-1">{errors.venue.message}</p>}
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">Event Banner Image</Label>
              
              {imageUrlPreview ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrlPreview} alt="Event Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageUrlPreview(null);
                      setImageFile(null);
                      setValue("imageUrl", "");
                    }}
                    className="absolute top-2.5 right-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-md text-xs font-bold transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors relative min-h-[140px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setImageFile(file);
                      setImageUrlPreview(URL.createObjectURL(file));
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2 text-center pointer-events-none">
                    <Upload className="h-8 w-8 text-indigo-500" />
                    <p className="text-sm font-semibold text-slate-700">Click or drag image here to select</p>
                    <p className="text-[10px] text-slate-400">PNG, JPG, WebP up to 5MB. Uploads when you publish.</p>
                  </div>
                </div>
              )}
              {errors.imageUrl && <p className="text-red-500 text-xs font-semibold mt-1">{errors.imageUrl.message}</p>}
            </div>

            {/* Settings Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-4 rounded-xl bg-slate-50 border-slate-200">
              <div className="flex items-center space-x-2.5">
                <input type="checkbox" id="isPublic" {...register("isPublic")} className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                <Label htmlFor="isPublic" className="text-slate-700 cursor-pointer font-medium text-sm">Public Event</Label>
              </div>
              <div className="flex items-center space-x-2.5">
                <input type="checkbox" id="isPaid" {...register("isPaid")} className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                <Label htmlFor="isPaid" className="text-slate-700 cursor-pointer font-medium text-sm">Require Ticket Fee</Label>
              </div>
            </div>

            {/* Ticket Fee */}
            {isPaid && (
              <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-150">
                <Label htmlFor="fee" className="font-semibold text-slate-700">Ticket Fee ($)</Label>
                <Input id="fee" type="number" step="0.01" {...register("fee", { valueAsNumber: true })} className="focus-visible:ring-indigo-600 rounded-lg" />
                {errors.fee && <p className="text-red-500 text-xs font-semibold mt-1">{errors.fee.message}</p>}
              </div>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md font-semibold text-white py-2 rounded-lg cursor-pointer" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating Event..." : "Publish Event"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
