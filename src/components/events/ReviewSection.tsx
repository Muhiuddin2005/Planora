"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEventReviews, submitReview, deleteReview, updateReview } from "@/services/review.service";
import { toast } from "sonner";
import { Star, MessageSquare, Award, LogIn, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import Swal from "sweetalert2";

interface ReviewSectionProps {
  eventId: string;
}

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  userId: string;
  user: {
    name: string;
    profilePic: string | null;
  };
}

export default function ReviewSection({ eventId }: ReviewSectionProps) {
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  // Edit Review states
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editHoverRating, setEditHoverRating] = useState<number | null>(null);
  const [editComment, setEditComment] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const timer = setTimeout(() => {
      setIsAuthenticated(!!token);
      if (token) {
        try {
          const decoded = jwtDecode<{ userId: string }>(token);
          setCurrentUserId(decoded.userId);
        } catch (e) {
          console.error("Token decode failed", e);
        }
      }
      setMounted(true);
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["reviews", eventId],
    queryFn: () => getEventReviews(eventId),
    enabled: mounted,
  });

  const mutation = useMutation({
    mutationFn: (data: { rating: number; comment?: string }) => submitReview(eventId, data),
    onSuccess: () => {
      toast.success("Review posted successfully!");
      setComment("");
      setRating(5);
      queryClient.invalidateQueries({ queryKey: ["reviews", eventId] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to post review. You can only review events you have attended.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      toast.success("Review deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["reviews", eventId] });
    },
    onError: () => toast.error("Failed to delete review"),
  });

  const updateReviewMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateReview(id, payload),
    onSuccess: () => {
      toast.success("Review updated successfully!");
      setEditingReviewId(null);
      queryClient.invalidateQueries({ queryKey: ["reviews", eventId] });
    },
    onError: () => toast.error("Failed to update review"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please add a comment for your review.");
      return;
    }
    mutation.mutate({ rating, comment });
  };

  const handleStartEdit = (review: ReviewItem) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || "");
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReviewId) return;
    if (!editComment.trim()) {
      toast.error("Please add a comment for your review.");
      return;
    }
    updateReviewMutation.mutate({
      id: editingReviewId,
      payload: { rating: editRating, comment: editComment }
    });
  };

  const reviewsList: ReviewItem[] = reviewsData?.data || [];

  // Calculate average rating
  const averageRating = reviewsList.length > 0 
    ? (reviewsList.reduce((acc, curr) => acc + curr.rating, 0) / reviewsList.length).toFixed(1)
    : "0.0";

  const ratingDescriptions = ["Poor", "Fair", "Average", "Good", "Excellent"];

  if (!mounted) {
    return (
      <div className="py-8 space-y-4 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-24 bg-slate-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-12 border-t border-slate-200 pt-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-indigo-600" />
            Attendee Reviews
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            See what attendees are saying, or share your own experience.
          </p>
        </div>

        {reviewsList.length > 0 && (
          <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-lg p-3 w-fit">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(Number(averageRating))
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm font-semibold text-indigo-900">
              {averageRating} / 5.0 ({reviewsList.length} {reviewsList.length === 1 ? "review" : "reviews"})
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="border border-slate-100 rounded-xl p-5 space-y-3 animate-pulse bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-1/3" />
                      <div className="h-3 bg-slate-200 rounded w-1/4" />
                    </div>
                  </div>
                  <div className="h-4 bg-slate-200 rounded w-5/6" />
                </div>
              ))}
            </div>
          ) : reviewsList.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">No reviews yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Be the first to review this event once you have attended!
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
              {reviewsList.map((review) => {
                const nameInitials = review.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                const isEditing = editingReviewId === review.id;

                return (
                  <div
                    key={review.id}
                    className="border border-slate-200 hover:border-indigo-100 hover:bg-slate-50/30 transition-all rounded-xl p-5 space-y-3 shadow-sm bg-white"
                  >
                    {isEditing ? (
                      <form onSubmit={handleSaveEdit} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-800">Edit Your Feedback</span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setEditRating(star)}
                                onMouseEnter={() => setEditHoverRating(star)}
                                onMouseLeave={() => setEditHoverRating(null)}
                                className="focus:outline-none focus:ring-1 focus:ring-indigo-500 p-0.5 rounded"
                              >
                                <Star
                                  className={`h-5 w-5 transition-colors ${
                                    star <= (editHoverRating ?? editRating)
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-200"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          required
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          className="w-full text-sm rounded-lg border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 bg-white"
                          placeholder="Update your review details..."
                        />

                        <div className="flex gap-2 justify-end">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setEditingReviewId(null)}
                            disabled={updateReviewMutation.isPending}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="submit" 
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            disabled={updateReviewMutation.isPending}
                          >
                            {updateReviewMutation.isPending ? "Saving..." : "Save"}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {review.user.profilePic ? (
                              <img
                                src={review.user.profilePic}
                                alt={review.user.name}
                                className="w-10 h-10 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm tracking-wide shadow-inner">
                                {nameInitials}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-slate-800 text-sm">{review.user.name}</div>
                              <div className="text-xs text-slate-400">
                                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= review.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-200"
                                  }`}
                                />
                              ))}
                            </div>
                            {currentUserId === review.userId && (
                              <div className="flex items-center gap-2.5 mt-0.5">
                                <button 
                                  onClick={() => handleStartEdit(review)}
                                  className="text-xs flex items-center gap-0.5 text-indigo-500 hover:text-indigo-700 font-medium transition-colors cursor-pointer border-none bg-transparent p-0"
                                >
                                  <Edit className="h-3 w-3" /> Edit
                                </button>
                                <button 
                                  onClick={() => {
                                    Swal.fire({
                                      title: "Delete Review?",
                                      text: "Are you sure you want to delete this review?",
                                      icon: "warning",
                                      showCancelButton: true,
                                      confirmButtonColor: "#4f46e5",
                                      cancelButtonColor: "#ef4444",
                                      confirmButtonText: "Yes, delete review!",
                                      iconColor: "#f59e0b",
                                      customClass: {
                                        popup: "rounded-2xl border border-slate-200 shadow-xl bg-white"
                                      }
                                    }).then((result) => {
                                      if (result.isConfirmed) {
                                        deleteMutation.mutate(review.id);
                                      }
                                    });
                                  }}
                                  disabled={deleteMutation.isPending}
                                  className="text-xs flex items-center gap-0.5 text-red-500 hover:text-red-700 font-medium transition-colors cursor-pointer border-none bg-transparent p-0"
                                >
                                  <Trash2 className="h-3 w-3" /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {review.comment && (
                          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line pl-1 border-l-2 border-slate-100">
                            {review.comment}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit Review Card */}
        <div>
          <Card className="border-slate-200 shadow-md">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-600" />
                Write a Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Rating
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            className="p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:scale-110 transition-transform"
                          >
                            <Star
                              className={`h-7 w-7 transition-colors ${
                                star <= (hoverRating ?? rating)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-slate-600 px-2 py-0.5 rounded bg-slate-100 whitespace-nowrap">
                        {ratingDescriptions[(hoverRating ?? rating) - 1]}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="comment" className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Your Comments
                    </label>
                    <textarea
                      id="comment"
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Excellent session, loved the networking time..."
                      className="w-full text-sm rounded-lg border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 bg-white placeholder-slate-400"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? "Submitting..." : "Post Review"}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-6 space-y-4">
                  <p className="text-sm text-slate-500">
                    You need to be logged in and have attended this event to share your feedback.
                  </p>
                  <Link href="/login" passHref className="w-full block">
                    <Button className="w-full bg-slate-900 hover:bg-slate-800 flex items-center justify-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Login to Planora
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
