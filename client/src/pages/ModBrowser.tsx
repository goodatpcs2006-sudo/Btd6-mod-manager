import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Download, Heart, Grid3x3, List } from "lucide-react";

const CATEGORIES = [
  "Gameplay",
  "Balance",
  "UI",
  "Quality of Life",
  "Content",
  "Utility",
  "Other",
];

export default function ModBrowser() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Load view mode preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("modBrowserViewMode");
    if (saved === "list" || saved === "grid") {
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    localStorage.setItem("modBrowserViewMode", mode);
  };

  // Fetch mods based on search or category
  const { data: mods = [], isLoading, error } = trpc.mods.list.useQuery(
    {
      limit: 20,
      offset: page * 20,
    },
    {
      enabled: !searchQuery && !selectedCategory,
    }
  );

  const { data: searchMods = [], isLoading: searchLoading } = trpc.mods.search.useQuery(
    {
      query: searchQuery,
      limit: 20,
      offset: page * 20,
    },
    {
      enabled: !!searchQuery,
    }
  );

  const { data: categoryMods = [], isLoading: categoryLoading } = trpc.mods.byCategory.useQuery(
    {
      category: selectedCategory || "",
      limit: 20,
      offset: page * 20,
    },
    {
      enabled: !!selectedCategory,
    }
  );

  const displayMods = searchQuery ? searchMods : selectedCategory ? categoryMods : mods;
  const isLoadingMods = searchQuery ? searchLoading : selectedCategory ? categoryLoading : isLoading;

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold">BTD6 Mod Manager</h1>
              <p className="text-slate-400 mt-1">Browse and manage Bloons TD 6 mods</p>
            </div>
            {user ? (
              <a href="/profile">
                <Button variant="outline" className="border-slate-600 hover:bg-slate-700">
                  My Profile
                </Button>
              </a>
            ) : (
              <a href={getLoginUrl()}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Log In
                </Button>
              </a>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-slate-400" size={20} />
              <Input
                type="text"
                placeholder="Search mods by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
              />
            </div>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Search
            </Button>
            <div className="flex gap-1 bg-slate-800 border border-slate-600 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === "grid" ? "default" : "ghost"}
                onClick={() => handleViewModeChange("grid")}
                className="px-3"
                title="Grid view"
              >
                <Grid3x3 size={16} />
              </Button>
              <Button
                size="sm"
                variant={viewMode === "list" ? "default" : "ghost"}
                onClick={() => handleViewModeChange("list")}
                className="px-3"
                title="List view"
              >
                <List size={16} />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-slate-700 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Categories</h2>
              <div className="space-y-2">
                <Button
                  variant={selectedCategory === null ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setSelectedCategory(null);
                    setPage(0);
                  }}
                >
                  All Mods
                </Button>
                {CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedCategory(category);
                      setPage(0);
                    }}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Mods Grid/List */}
          <div className="lg:col-span-3">
            {isLoadingMods ? (
              <div className="flex justify-center items-center h-96">
                <Loader2 className="animate-spin text-blue-500" size={40} />
              </div>
            ) : error ? (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 text-red-200">
                <p>Error loading mods. Please try again later.</p>
              </div>
            ) : displayMods && displayMods.length > 0 ? (
              <>
                <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" : "space-y-4 mb-8"}>
                  {displayMods.map((mod: any) => (
                    <a key={mod.id} href={`/mod/${mod.id}`} className="block">
                      <Card className={`bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-colors cursor-pointer ${viewMode === "list" ? "flex gap-4" : "h-full"}`}>
                        {mod.imageUrl && (
                          <div className={viewMode === "list" ? "w-32 h-32 bg-slate-700 overflow-hidden rounded flex-shrink-0" : "w-full h-48 bg-slate-700 overflow-hidden rounded-t-lg"}>
                            <img
                              src={mod.imageUrl}
                              alt={mod.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <CardHeader className={viewMode === "list" ? "pb-2" : ""}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <CardTitle className="text-white text-lg">{mod.name}</CardTitle>
                                <CardDescription className="text-slate-400 text-sm">
                                  by {mod.author}
                                </CardDescription>
                              </div>
                              <Badge variant="secondary" className="flex-shrink-0">{mod.version}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className={viewMode === "list" ? "pt-0" : ""}>
                            <p className={`text-slate-300 text-sm mb-3 ${viewMode === "list" ? "line-clamp-1" : "line-clamp-2"}`}>
                              {mod.description || "No description available"}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-slate-400">
                              <div className="flex items-center gap-1">
                                <Download size={16} />
                                <span>{mod.downloads || 0}</span>
                              </div>
                              {mod.rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <Heart size={16} />
                                  <span>{mod.rating}/5</span>
                                </div>
                              )}
                            </div>
                            {viewMode === "grid" && mod.tags && (
                              <div className="flex flex-wrap gap-2 mt-4">
                                {JSON.parse(mod.tags || "[]").slice(0, 3).map((tag: string) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </div>
                      </Card>
                    </a>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="border-slate-600 hover:bg-slate-700"
                  >
                    Previous
                  </Button>
                  <span className="flex items-center text-slate-300">
                    Page {page + 1}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={!displayMods || displayMods.length < 20}
                    className="border-slate-600 hover:bg-slate-700"
                  >
                    Next
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 text-lg">No mods found. Try a different search!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
