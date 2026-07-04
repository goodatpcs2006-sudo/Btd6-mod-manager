import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";

interface ReviewFormProps {
  modId: number;
  onReviewSubmitted?: () => void;
}

export function ReviewForm({ modId, onReviewSubmitted }: ReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const utils = trpc.useUtils();
  const createReviewMutation = trpc.mods.addReview.useMutation({
    onSuccess: () => {
      utils.mods.reviews.invalidate();
      setRating(5);
      setComment("");
      toast.success("Review submitted successfully!");
      onReviewSubmitted?.();
    },
    onError: (error) => {
      toast.error(`Failed to submit review: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please log in to submit a review");
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5");
      return;
    }

    try {
      await createReviewMutation.mutateAsync({
        modId,
        rating,
        comment: comment.trim() || undefined,
      });
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  if (!user) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <p className="text-slate-300 text-center">
            <a href="/login" className="text-blue-400 hover:text-blue-300 underline">
              Log in
            </a>
            {" "}to submit a review
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Submit a Review</CardTitle>
        <CardDescription className="text-slate-400">
          Share your thoughts about this mod
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={28}
                    className={`${
                      star <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-slate-600"
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-400 mt-2">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-300">
              Comment (Optional)
            </label>
            <Textarea
              placeholder="Share your thoughts about this mod..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 resize-none"
              rows={4}
            />
            <p className="text-xs text-slate-400 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={createReviewMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {createReviewMutation.isPending ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={16} />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
