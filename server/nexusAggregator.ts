import axios from "axios";
import { createMod } from "./db";
import { InsertMod } from "../drizzle/schema";

const NEXUS_API_BASE = "https://api.nexusmods.com/v1";
const GAME_DOMAIN = "bloonstd6";

interface NexusMod {
  mod_id: number;
  name: string;
  summary: string;
  description: string;
  author: string;
  version: string;
  category_name: string;
  picture_url: string;
  download_count: number;
  endorsement_count: number;
  uid: number;
}

interface NexusModFile {
  file_id: number;
  name: string;
  version: string;
  category: string;
  download_link: string;
}

/**
 * Fetch mods from Nexus Mods
 */
export async function fetchModsFromNexus(apiKey: string, limit = 50): Promise<NexusMod[]> {
  try {
    const response = await axios.get(`${NEXUS_API_BASE}/games/${GAME_DOMAIN}/mods/latest`, {
      params: { limit },
      headers: {
        "apikey": apiKey,
        "Application-Name": "BTD6ModManager/1.0",
      },
    });

    return response.data || [];
  } catch (error) {
    console.error("[Nexus] Failed to fetch mods:", error);
    return [];
  }
}

/**
 * Fetch files for a specific mod from Nexus
 */
export async function fetchNexusModFiles(
  apiKey: string,
  modId: number
): Promise<NexusModFile[]> {
  try {
    const response = await axios.get(
      `${NEXUS_API_BASE}/games/${GAME_DOMAIN}/mods/${modId}/files`,
      {
        headers: {
          "apikey": apiKey,
          "Application-Name": "BTD6ModManager/1.0",
        },
      }
    );

    return response.data.files || [];
  } catch (error) {
    console.error(`[Nexus] Failed to fetch files for mod ${modId}:`, error);
    return [];
  }
}

/**
 * Get download link for a mod file
 */
export async function getNexusDownloadLink(
  apiKey: string,
  modId: number,
  fileId: number
): Promise<string | null> {
  try {
    const response = await axios.get(
      `${NEXUS_API_BASE}/games/${GAME_DOMAIN}/mods/${modId}/files/${fileId}/download_link`,
      {
        headers: {
          "apikey": apiKey,
          "Application-Name": "BTD6ModManager/1.0",
        },
      }
    );

    // Nexus returns an array of download links
    const links = response.data;
    if (Array.isArray(links) && links.length > 0) {
      return links[0].URI;
    }
    return null;
  } catch (error) {
    console.error(
      `[Nexus] Failed to get download link for mod ${modId} file ${fileId}:`,
      error
    );
    return null;
  }
}

/**
 * Convert Nexus mod to database entry
 */
export async function convertNexusModToMod(
  nexusMod: NexusMod,
  apiKey: string
): Promise<InsertMod | null> {
  try {
    // Fetch files for this mod
    const files = await fetchNexusModFiles(apiKey, nexusMod.mod_id);

    if (files.length === 0) {
      console.warn(`[Nexus] No files found for mod ${nexusMod.mod_id}`);
      return null;
    }

    // Get download link for the latest file
    const latestFile = files[0];
    const downloadUrl = await getNexusDownloadLink(
      apiKey,
      nexusMod.mod_id,
      latestFile.file_id
    );

    if (!downloadUrl) {
      console.warn(`[Nexus] Failed to get download link for mod ${nexusMod.mod_id}`);
      return null;
    }

    return {
      name: nexusMod.name,
      description: nexusMod.summary || nexusMod.description || "No description available",
      author: nexusMod.author,
      version: nexusMod.version,
      category: nexusMod.category_name || "Other",
      tags: JSON.stringify(["nexus", "community"]),
      downloadUrl,
      sourceUrl: `https://www.nexusmods.com/${GAME_DOMAIN}/mods/${nexusMod.mod_id}`,
      sourceType: "nexus",
      imageUrl: nexusMod.picture_url || undefined,
      compatible: "Latest",
      downloads: nexusMod.download_count,
      rating: Math.min(5, Math.max(1, nexusMod.endorsement_count / 100)), // Normalize endorsements to 1-5 scale
    };
  } catch (error) {
    console.error(`[Nexus] Failed to convert mod ${nexusMod.mod_id}:`, error);
    return null;
  }
}

/**
 * Sync all mods from Nexus to database
 */
export async function syncNexusMods(apiKey: string): Promise<number> {
  try {
    console.log("[Nexus] Starting mod sync...");
    const mods = await fetchModsFromNexus(apiKey, 100);
    console.log(`[Nexus] Found ${mods.length} mods`);

    let synced = 0;
    for (const nexusMod of mods) {
      try {
        const mod = await convertNexusModToMod(nexusMod, apiKey);
        if (mod) {
          await createMod(mod);
          synced++;
        }
      } catch (error) {
        console.error(`[Nexus] Failed to sync mod ${nexusMod.mod_id}:`, error);
      }
    }

    console.log(`[Nexus] Synced ${synced} mods`);
    return synced;
  } catch (error) {
    console.error("[Nexus] Sync failed:", error);
    return 0;
  }
}
