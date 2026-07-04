import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, ArrowLeft, Download, Trash2 } from "lucide-react";

export default function Profile() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { data: favorites = [], isLoading: favoritesLoading } = trpc.mods.favorites.useQuery(
    undefined,
    { enabled: !!user }
  );

  const utils = trpc.useUtils();
  const removeFavoriteMutation = trpc.mods.removeFavorite.useMutation({
    onSuccess: () => {
      utils.mods.favorites.invalidate();
    },
  });

  const handleRemoveFavorite = async (modId: number) => {
    try {
      await removeFavoriteMutation.mutateAsync({ modId });
    } catch (err) {
      console.error("Failed to remove favorite:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <a href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-8">
            <ArrowLeft size={20} />
            Back to Mods
          </a>
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Please Log In</h1>
            <p className="text-slate-400 mb-6">You need to be logged in to view your profile.</p>
            <a href="/">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Go Back
              </Button>
            </a>
          </div>
        </div>
      </div>
    );
  }

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
        {/* User Info Card */}
        <Card className="bg-slate-800/50 border-slate-700 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm">Name</p>
                <p className="text-lg font-semibold">{user?.name || "Anonymous"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Email</p>
                <p className="text-lg font-semibold">{user?.email || "Not provided"}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Member Since</p>
                <p className="text-lg font-semibold">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                </p>
              </div>
              <div className="pt-4">
                <Button
                  variant="destructive"
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Log Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Favorites Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">My Favorite Mods ({favorites.length})</h2>

          {favoritesLoading ? (
            <div className="flex justify-center items-center h-96">
              <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
          ) : favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {favorites.map((fav: any) => {
                const mod = fav.mod;
                return (
                  <Card key={mod.id} className="bg-slate-800/50 border-slate-700">
                    {mod.imageUrl && (
                      <div className="w-full h-40 bg-slate-700 overflow-hidden rounded-t-lg">
                        <img
                          src={mod.imageUrl}
                          alt={mod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{mod.name}</CardTitle>
                          <CardDescription className="text-slate-400">
                            by {mod.author}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">{mod.version}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                        {mod.description || "No description available"}
                      </p>
                      <div className="flex gap-2">
                        <a href={mod.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                            <Download size={16} className="mr-1" />
                            Download
                          </Button>
                        </a>
                        <Button
                          variant="outline"
                          className="border-slate-600 hover:bg-slate-700"
                          onClick={() => handleRemoveFavorite(mod.id)}
                          disabled={removeFavoriteMutation.isPending}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-slate-400 text-lg">
                  You haven't added any favorite mods yet.
                </p>
                <a href="/" className="inline-block mt-4">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Browse Mods
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
