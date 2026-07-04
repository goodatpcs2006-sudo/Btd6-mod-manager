import { z } from "zod";
import { adminProcedure, router } from "./_core/trpc";
import { syncGitHubMods } from "./githubAggregator";
import { syncNexusMods } from "./nexusAggregator";
import { ENV } from "./_core/env";

export const adminRouter = router({
  // Sync mods from GitHub
  syncGitHub: adminProcedure
    .mutation(async () => {
      try {
        const count = await syncGitHubMods();
        return {
          success: true,
          message: `Synced ${count} mods from GitHub`,
          count,
        };
      } catch (error) {
        console.error("GitHub sync error:", error);
        return {
          success: false,
          message: "Failed to sync mods from GitHub",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Sync mods from Nexus Mods
  syncNexus: adminProcedure
    .mutation(async () => {
      if (!ENV.nexusApiKey) {
        return {
          success: false,
          message: "Nexus Mods API key not configured. Please set NEXUS_MODS_API_KEY environment variable.",
        };
      }

      try {
        const count = await syncNexusMods(ENV.nexusApiKey);
        return {
          success: true,
          message: `Synced ${count} mods from Nexus Mods`,
          count,
        };
      } catch (error) {
        console.error("Nexus sync error:", error);
        return {
          success: false,
          message: "Failed to sync mods from Nexus Mods",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Sync all sources
  syncAll: adminProcedure
    .mutation(async () => {
      try {
        const githubCount = await syncGitHubMods();
        let nexusCount = 0;
        let nexusError: string | null = null;

        if (ENV.nexusApiKey) {
          try {
            nexusCount = await syncNexusMods(ENV.nexusApiKey);
          } catch (error) {
            nexusError = error instanceof Error ? error.message : "Unknown error";
            console.error("Nexus sync error:", error);
          }
        }

        return {
          success: true,
          message: `Synced ${githubCount} mods from GitHub${nexusCount > 0 ? ` and ${nexusCount} from Nexus Mods` : ""}`,
          github: githubCount,
          nexus: nexusCount,
          total: githubCount + nexusCount,
          nexusWarning: !ENV.nexusApiKey
            ? "Nexus Mods API key not configured"
            : nexusError
              ? `Nexus sync failed: ${nexusError}`
              : undefined,
        };
      } catch (error) {
        console.error("Sync all error:", error);
        return {
          success: false,
          message: "Failed to sync mods",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),
});
