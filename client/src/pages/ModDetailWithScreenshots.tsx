import { useParams } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Heart, ArrowLeft, Share2, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { ReviewForm } from "@/components/ReviewForm";

export default function ModDetail() {
  const params = useParams();
  const modId = parseInt(params.id as string);
  const { user } = useAuth();
  const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);

  const { data: mod, isLoading, error } = trpc.mods.detail.useQuery(
    { id: modId },
    { enabled: !!modId }
  );

  const { data: reviews = [] } = trpc.mods.reviews.useQuery(
    { modId },
    { enabled: !!modId }
  );

  const { data: screenshots = [] } = trpc.mods.screenshots.useQuery(
    { modId },
    { enabled: !!modId }
  );

  const { data: favorites = [] } = trpc.mods.favorites.useQuery(undefined, {
    enabled: !!user,
  });

  const isFavorited = favorites.some((fav: any) => fav.mod.id === modId);

  const utils = trpc.useUtils();
  const addFavoriteMutation = trpc.mods.addFavorite.useMutation({
    onSuccess: () => {
      utils.mods.favorites.invalidate();
    },
  });
  const removeFavoriteMutation = trpc.mods.removeFavorite.useMutation({
    onSuccess: () => {
      utils.mods.favorites.invalidate();
    },
  });

  const handleToggleFavorite = async () => {
    if (!user) {
      alert("Please log in to add favorites");
      return;
    }

    try {
      if (isFavorited) {
        await removeFavoriteMutation.mutateAsync({ modId });
      } else {
        await addFavoriteMutation.mutateAsync({ modId });
      }
    } catch (err) {
      console.error("Failed to update favorite:", err);
    }
  };

  const handlePrevScreenshot = () => {
    setCurrentScreenshotIndex((prev) =>
      prev === 0 ? screenshots.length - 1 : prev - 1
    );
  };

  const handleNextScreenshot = () => {
    setCurrentScreenshotIndex((prev) =>
      prev === screenshots.length - 1 ? 0 : prev + 1
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (error || !mod) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
        <div className="max-w-4xl mx-auto">
          <a href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8">
            <ArrowLeft size={20} />
            Back to Mods
          </a>
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-red-200">
            <p>Mod not found. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const currentScreenshot = screenshots[currentScreenshotIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <a href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
            <ArrowLeft size={20} />
            Back to Mods
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2">
            {/* Screenshots Gallery */}
            {screenshots.length > 0 ? (
              <div className="mb-6">
                <div className="relative w-full bg-slate-700 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: "16/9" }}>
                  <img
                    src={currentScreenshot.url}
                    alt={currentScreenshot.caption || `Screenshot ${currentScreenshotIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {screenshots.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevScreenshot}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 p-2 rounded-full transition"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={handleNextScreenshot}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 p-2 rounded-full transition"
                      >
                        <ChevronRight size={24} />
                      </button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-sm">
                        {currentScreenshotIndex + 1} / {screenshots.length}
                      </div>
                    </>
                  )}
                </div>
                {currentScreenshot.caption && (
                  <p className="text-slate-300 text-sm">{currentScreenshot.caption}</p>
                )}
                {/* Thumbnail strip */}
                {screenshots.length > 1 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto">
                    {screenshots.map((screenshot: any, index: number) => (
                      <button
                        key={screenshot.id}
                        onClick={() => setCurrentScreenshotIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition ${
                          index === currentScreenshotIndex
                            ? "border-blue-500"
                            : "border-slate-600 hover:border-slate-500"
                        }`}
                      >
                        <img
                          src={screenshot.url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : mod.imageUrl ? (
              <div className="w-full h-64 bg-slate-700 rounded-lg overflow-hidden mb-6">
                <img
                  src={mod.imageUrl}
                  alt={mod.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            {/* Title and Meta */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2">{mod.name}</h1>
              <div className="flex items-center gap-4 text-slate-400 mb-4">
                <span>by {mod.author}</span>
                <Badge variant="secondary">{mod.version}</Badge>
                <Badge variant="outline">{mod.category}</Badge>
              </div>
              <p className="text-slate-300 text-lg">{mod.description}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Download size={20} className="text-blue-400" />
                      <span className="text-2xl font-bold">{mod.downloads || 0}</span>
                    </div>
                    <p className="text-slate-400 text-sm">Downloads</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Heart size={20} className="text-red-400" />
                      <span className="text-2xl font-bold">{averageRating}</span>
                    </div>
                    <p className="text-slate-400 text-sm">Rating ({reviews.length})</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-2">{mod.compatible || "N/A"}</div>
                    <p className="text-slate-400 text-sm">Compatible</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tags */}
            {mod.tags && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(mod.tags || "[]").map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Review Form */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              <ReviewForm modId={modId} />
            </div>

            {/* Reviews */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Reviews ({reviews.length})</h3>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review: any) => (
                    <Card key={review.id} className="bg-slate-800/50 border-slate-700">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">Rating: {review.rating}/5</span>
                          </div>
                          <span className="text-slate-400 text-sm">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-slate-300">{review.comment}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-slate-700 sticky top-24">
              {/* Download Button */}
              <a href={mod.downloadUrl} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 mb-4">
                  <Download size={20} className="mr-2" />
                  Download Mod
                </Button>
              </a>

              {/* Favorite Button */}
              <Button
                variant={isFavorited ? "default" : "outline"}
                className="w-full mb-4"
                onClick={handleToggleFavorite}
                disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
              >
                <Heart size={20} className="mr-2" fill={isFavorited ? "currentColor" : "none"} />
                {isFavorited ? "Favorited" : "Add to Favorites"}
              </Button>

              {/* Share Button */}
              <Button
                variant="outline"
                className="w-full mb-6"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }}
              >
                <Share2 size={20} className="mr-2" />
                Share
              </Button>

              {/* Source Link */}
              {mod.sourceUrl && (
                <a href={mod.sourceUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    <ExternalLink size={20} className="mr-2" />
                    View on {mod.sourceType === "github" ? "GitHub" : "Nexus"}
                  </Button>
                </a>
              )}

              {/* Installation Guide */}
              <div className="mt-8 pt-8 border-t border-slate-700">
                <h4 className="font-semibold mb-4">Installation Guide</h4>
                <div className="text-sm text-slate-300 space-y-3">
                  <div>
                    <h5 className="font-semibold mb-2">1. Download MelonLoader</h5>
                    <p>Visit melonwiki.xyz and download MelonLoader for your game.</p>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">2. Install BTD Mod Helper</h5>
                    <p>Download BTD Mod Helper from GitHub and place it in your Mods folder.</p>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">3. Download This Mod</h5>
                    <p>Click the download button above to get the mod file.</p>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">4. Place in Mods Folder</h5>
                    <p>Extract and place the .dll file in your BTD6 Mods folder.</p>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-2">5. Launch Game</h5>
                    <p>Start BTD6 and enjoy your mods!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
