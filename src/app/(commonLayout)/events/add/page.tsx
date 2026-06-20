"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { createNewEvent } from "@/services/event.service";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState, useRef } from "react";
import { Sparkles, Loader2, Upload } from "lucide-react";
import gsap from "gsap";

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

export default function AddEventPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrlPreview, setImageUrlPreview] = useState<string | null>(null);

  // Refs for GSAP animation
  const bg1 = useRef<HTMLDivElement>(null);
  const bg2 = useRef<HTMLDivElement>(null);
  const bg3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      toast.error("Please sign in to host new events");
      router.push(`/login?redirect=${pathname}`);
    } else {
      try {
        const decoded = jwtDecode<{ userId: string }>(token);
        setUserId(decoded.userId);
        setMounted(true);
      } catch (err) {
        toast.error("Session invalid. Please sign in again");
        router.push(`/login?redirect=${pathname}`);
      }
    }
  }, [router, pathname]);

  // GSAP animation logic
  useEffect(() => {
    if (!mounted) return;

    const ctx = gsap.context(() => {
      const bgs = [bg1.current, bg2.current, bg3.current];
      bgs.forEach((bg, index) => {
        if (!bg) return;
        gsap.to(bg, {
          x: "random(-150, 150)",
          y: "random(-150, 150)",
          scale: "random(0.8, 1.5)",
          opacity: "random(0.1, 0.3)",
          duration: "random(10, 20)",
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 3,
        });
      });
    });

    return () => ctx.revert();
  }, [mounted]);

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
      toast.success("Event created successfully! It is pending admin approval.");
      router.push("/dashboard");
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to create event");
    },
  });

  const onSubmit = (data: EventFormValues) => {
    if (!userId) {
      toast.error("User session missing");
      return;
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

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 relative overflow-hidden flex items-center justify-center py-16 px-4 z-0">
      {/* GSAP Animated Background Auroras */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          ref={bg1}
          className="absolute w-[400px] h-[400px] rounded-full bg-indigo-600/20 blur-[80px]"
          style={{ top: "10%", left: "15%" }}
        />
        <div
          ref={bg2}
          className="absolute w-[500px] h-[500px] rounded-full bg-purple-600/15 blur-[100px]"
          style={{ bottom: "15%", right: "10%" }}
        />
        <div
          ref={bg3}
          className="absolute w-[350px] h-[350px] rounded-full bg-pink-600/15 blur-[80px]"
          style={{ top: "50%", left: "45%" }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="w-full max-w-2xl z-10 relative">
        <Card className="border-slate-800 shadow-2xl bg-slate-900/40 backdrop-blur-md rounded-2xl overflow-hidden">
          <div className="bg-slate-950/80 text-white p-6 relative overflow-hidden border-b border-slate-800">
            <div className="relative z-10 space-y-2">
              <span className="inline-flex items-center gap-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-indigo-500/30">
                <Sparkles className="h-3 w-3" /> Host Portal
              </span>
              <CardTitle className="text-2xl font-bold tracking-tight text-white">Publish New Event</CardTitle>
              <CardDescription className="text-slate-400 text-xs">Create public gatherings or private exclusive meetups on Planora.</CardDescription>
            </div>
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-indigo-600/20 blur-2xl" />
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Title */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="font-semibold text-slate-300">Event Title</Label>
                <Input id="title" placeholder="Web3 Developer Summit 2026" {...register("title")} className="h-11 focus-visible:ring-indigo-600 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 rounded-lg" />
                {errors.title && <p className="text-red-500 text-xs font-semibold mt-1">{errors.title.message}</p>}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="category" className="font-semibold text-slate-300">Category</Label>
                <select
                  id="category"
                  {...register("category")}
                  className="flex h-11 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 text-white"
                >
                  <option value="Technology" className="bg-slate-900 text-white">Technology</option>
                  <option value="Business" className="bg-slate-900 text-white">Business</option>
                  <option value="Education" className="bg-slate-900 text-white">Education</option>
                  <option value="Social" className="bg-slate-900 text-white">Social</option>
                  <option value="Entertainment" className="bg-slate-900 text-white">Entertainment</option>
                  <option value="Health" className="bg-slate-900 text-white">Health &amp; Fitness</option>
                </select>
                {errors.category && <p className="text-red-500 text-xs font-semibold mt-1">{errors.category.message}</p>}
              </div>

              {/* Short Description */}
              <div className="space-y-1.5">
                <Label htmlFor="shortDescription" className="font-semibold text-slate-300">Short Description</Label>
                <Input id="shortDescription" placeholder="A brief hook summary (max 100 chars)..." {...register("shortDescription")} className="h-11 focus-visible:ring-indigo-600 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 rounded-lg" />
                {errors.shortDescription && <p className="text-red-500 text-xs font-semibold mt-1">{errors.shortDescription.message}</p>}
              </div>

              {/* Full Description */}
              <div className="space-y-1.5">
                <Label htmlFor="fullDescription" className="font-semibold text-slate-300">Full Description</Label>
                <textarea
                  id="fullDescription"
                  rows={4}
                  placeholder="Give a detailed description about schedule, hosts, and what attendees will learn..."
                  {...register("fullDescription")}
                  className="flex min-h-[100px] w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm shadow-sm placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-600 text-white"
                />
                {errors.fullDescription && <p className="text-red-500 text-xs font-semibold mt-1">{errors.fullDescription.message}</p>}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="date" className="font-semibold text-slate-300">Date</Label>
                  <Input id="date" type="date" {...register("date")} className="h-11 focus-visible:ring-indigo-600 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 rounded-lg" />
                  {errors.date && <p className="text-red-500 text-xs font-semibold mt-1">{errors.date.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="time" className="font-semibold text-slate-300">Time</Label>
                  <Input id="time" type="time" {...register("time")} className="h-11 focus-visible:ring-indigo-600 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 rounded-lg" />
                  {errors.time && <p className="text-red-500 text-xs font-semibold mt-1">{errors.time.message}</p>}
                </div>
              </div>

              {/* Venue */}
              <div className="space-y-1.5">
                <Label htmlFor="venue" className="font-semibold text-slate-300">Venue</Label>
                <Input id="venue" placeholder="Grand Ballroom or Zoom Link" {...register("venue")} className="h-11 focus-visible:ring-indigo-600 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 rounded-lg" />
                {errors.venue && <p className="text-red-500 text-xs font-semibold mt-1">{errors.venue.message}</p>}
              </div>

              {/* Image Upload Section */}
              <div className="space-y-2">
                <Label className="font-semibold text-slate-300">Event Banner Image</Label>
                
                {imageUrlPreview ? (
                  <div className="relative rounded-xl overflow-hidden border border-slate-800 aspect-video bg-slate-950/40">
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
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl p-6 bg-slate-950/20 hover:bg-slate-950/40 transition-colors relative min-h-[140px]">
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
                      <p className="text-sm font-semibold text-slate-300">Click or drag image here to select</p>
                      <p className="text-[10px] text-slate-500">PNG, JPG, WebP up to 5MB. Uploads when you publish.</p>
                    </div>
                  </div>
                )}
                {errors.imageUrl && <p className="text-red-500 text-xs font-semibold mt-1">{errors.imageUrl.message}</p>}
              </div>

              {/* Settings Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border p-4 rounded-xl bg-slate-950/60 border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <input type="checkbox" id="isPublic" {...register("isPublic")} className="w-4 h-4 rounded text-indigo-600 border-slate-800 focus:ring-indigo-500 bg-slate-950" />
                  <Label htmlFor="isPublic" className="text-slate-300 cursor-pointer font-medium text-sm">Public Event</Label>
                </div>
                <div className="flex items-center space-x-2.5">
                  <input type="checkbox" id="isPaid" {...register("isPaid")} className="w-4 h-4 rounded text-indigo-600 border-slate-800 focus:ring-indigo-500 bg-slate-950" />
                  <Label htmlFor="isPaid" className="text-slate-300 cursor-pointer font-medium text-sm">Require Ticket Fee</Label>
                </div>
              </div>

              {/* Ticket Fee */}
              {isPaid && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-150">
                  <Label htmlFor="fee" className="font-semibold text-slate-300">Ticket Fee ($)</Label>
                  <Input id="fee" type="number" step="0.01" {...register("fee", { valueAsNumber: true })} className="h-11 focus-visible:ring-indigo-600 bg-slate-950/60 border-slate-800 text-white placeholder:text-slate-500 rounded-lg" />
                  {errors.fee && <p className="text-red-500 text-xs font-semibold mt-1">{errors.fee.message}</p>}
                </div>
              )}

              {/* Submit */}
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md font-semibold text-white h-11 rounded-lg cursor-pointer" disabled={mutation.isPending}>
                {mutation.isPending ? "Creating Event..." : "Publish Event"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
