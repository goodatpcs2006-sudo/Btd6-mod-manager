import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Download, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import {
  installModWithBTD6ModHelper,
  isBTD6ModHelperInstalled,
  getInstallationInstructions,
} from "@/services/btd6ModHelper";

interface ModInstallButtonProps {
  modId: number;
  modName: string;
  downloadUrl: string;
  onInstallSuccess?: () => void;
}

export function ModInstallButton({
  modId,
  modName,
  downloadUrl,
  onInstallSuccess,
}: ModInstallButtonProps) {
  const [isInstalling, setIsInstalling] = useState(false);
  const [isModHelperInstalled, setIsModHelperInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    checkModHelper();
  }, []);

  async function checkModHelper() {
    try {
      const installed = await isBTD6ModHelperInstalled();
      setIsModHelperInstalled(installed);
    } catch (error) {
      console.error("Error checking BTD6 Mod Helper:", error);
      setIsModHelperInstalled(false);
    }
  }

  async function handleInstall() {
    if (!isModHelperInstalled) {
      setShowInstructions(true);
      toast.error("BTD6 Mod Helper is not installed");
      return;
    }

    setIsInstalling(true);
    try {
      const result = await installModWithBTD6ModHelper({
        id: modId.toString(),
        name: modName,
        author: "Unknown",
        version: "1.0.0",
        description: modName,
        downloadUrl,
        fileSize: 0,
        compatibility: {
          minBTD6Version: "1.0.0",
          minModHelperVersion: "1.0.0",
          melonLoaderRequired: true,
        },
      });

      if (result.success) {
        toast.success(`${modName} installed successfully!`);
        if (result.requiresRestart) {
          toast.info("Restart BTD6 to load the new mod");
        }
        onInstallSuccess?.();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Installation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsInstalling(false);
    }
  }

  if (!isModHelperInstalled) {
    return (
      <div className="space-y-2">
        <Button
          onClick={() => setShowInstructions(!showInstructions)}
          variant="outline"
          className="w-full border-yellow-600 text-yellow-400 hover:bg-yellow-900/20"
          disabled={isInstalling}
        >
          <AlertCircle size={16} className="mr-2" />
          Setup Required
        </Button>

        {showInstructions && (
          <div className="bg-slate-800/50 border border-slate-700 rounded p-4 text-sm text-slate-300 whitespace-pre-wrap max-h-64 overflow-y-auto">
            {getInstallationInstructions()}
          </div>
        )}
      </div>
    );
  }

  return (
    <Button
      onClick={handleInstall}
      disabled={isInstalling}
      className="w-full bg-blue-600 hover:bg-blue-700"
    >
      {isInstalling ? (
        <>
          <Loader2 className="mr-2 animate-spin" size={16} />
          Installing...
        </>
      ) : (
        <>
          <Download size={16} className="mr-2" />
          Install Mod
        </>
      )}
    </Button>
  );
}

/**
 * Status indicator for BTD6 Mod Helper
 */
export function ModHelperStatus() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  async function checkStatus() {
    try {
      const installed = await isBTD6ModHelperInstalled();
      setIsInstalled(installed);
    } catch (error) {
      console.error("Error checking status:", error);
      setIsInstalled(false);
    } finally {
      setIsChecking(false);
    }
  }

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <Loader2 className="animate-spin" size={16} />
        Checking...
      </div>
    );
  }

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-green-400">
        <CheckCircle size={16} />
        BTD6 Mod Helper Detected
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-yellow-400">
      <AlertCircle size={16} />
      BTD6 Mod Helper Not Detected
    </div>
  );
}
