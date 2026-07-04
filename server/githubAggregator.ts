import axios from "axios";
import { createMod } from "./db";
import { InsertMod } from "../drizzle/schema";

const GITHUB_API_BASE = "https://api.github.com";
const BTD6_MOD_TOPIC = "btd6-mod";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  stargazers_count: number;
  language: string;
}

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  assets: Array<{
    name: string;
    download_count: number;
    browser_download_url: string;
  }>;
}

/**
 * Fetch all BTD6 mod repositories from GitHub
 */
export async function fetchBTD6ModsFromGitHub(): Promise<GitHubRepo[]> {
  try {
    const response = await axios.get(`${GITHUB_API_BASE}/search/repositories`, {
      params: {
        q: `topic:${BTD6_MOD_TOPIC}`,
        sort: "stars",
        order: "desc",
        per_page: 100,
      },
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    return response.data.items || [];
  } catch (error) {
    console.error("[GitHub] Failed to fetch BTD6 mods:", error);
    return [];
  }
}

/**
 * Fetch releases from a specific GitHub repository
 */
export async function fetchGitHubReleases(
  owner: string,
  repo: string
): Promise<GitHubRelease[]> {
  try {
    const response = await axios.get(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/releases`,
      {
        params: { per_page: 10 },
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    return response.data || [];
  } catch (error) {
    console.error(`[GitHub] Failed to fetch releases for ${owner}/${repo}:`, error);
    return [];
  }
}

/**
 * Extract .dll file from GitHub releases
 */
export function extractDllDownloadUrl(releases: GitHubRelease[]): string | null {
  for (const release of releases) {
    for (const asset of release.assets) {
      if (asset.name.endsWith(".dll")) {
        return asset.browser_download_url;
      }
    }
  }
  return null;
}

/**
 * Convert GitHub repo to mod database entry
 */
export async function convertGitHubRepoToMod(repo: GitHubRepo): Promise<InsertMod | null> {
  try {
    // Fetch releases to get the latest .dll download
    const releases = await fetchGitHubReleases(repo.owner.login, repo.name);
    const downloadUrl = extractDllDownloadUrl(releases);

    if (!downloadUrl) {
      console.warn(`[GitHub] No .dll found for ${repo.full_name}`);
      return null;
    }

    // Extract version from latest release tag
    const latestRelease = releases[0];
    const version = latestRelease?.tag_name || "1.0.0";

    return {
      name: repo.name,
      description: repo.description || "No description available",
      author: repo.owner.login,
      version: version.replace(/^v/, ""), // Remove 'v' prefix if present
      category: "Content", // Default category, could be improved with repo topics
      tags: JSON.stringify(["github", "community"]),
      downloadUrl,
      sourceUrl: repo.html_url,
      sourceType: "github",
      imageUrl: repo.owner.avatar_url,
      compatible: "Latest", // Could be improved by parsing README
      downloads: repo.stargazers_count, // Use stars as proxy for popularity
      rating: 0,
    };
  } catch (error) {
    console.error(`[GitHub] Failed to convert repo ${repo.full_name}:`, error);
    return null;
  }
}

/**
 * Sync all BTD6 mods from GitHub to database
 */
export async function syncGitHubMods(): Promise<number> {
  try {
    console.log("[GitHub] Starting mod sync...");
    const repos = await fetchBTD6ModsFromGitHub();
    console.log(`[GitHub] Found ${repos.length} repositories`);

    let synced = 0;
    for (const repo of repos) {
      try {
        const mod = await convertGitHubRepoToMod(repo);
        if (mod) {
          await createMod(mod);
          synced++;
        }
      } catch (error) {
        console.error(`[GitHub] Failed to sync ${repo.full_name}:`, error);
      }
    }

    console.log(`[GitHub] Synced ${synced} mods`);
    return synced;
  } catch (error) {
    console.error("[GitHub] Sync failed:", error);
    return 0;
  }
}
