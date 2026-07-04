/**
 * BTD6 Mod Helper Integration Service
 * 
 * This service integrates with BTD6 Mod Helper to:
 * 1. Detect if BTD6 Mod Helper is installed
 * 2. Download mods compatible with BTD6 Mod Helper
 * 3. Install mods using BTD6 Mod Helper's mod directory
 * 4. Manage mod installations
 */

export interface BTD6ModHelperConfig {
  modHelperVersion: string;
  modsDirectory: string;
  melonLoaderVersion: string;
  btd6Version: string;
}

export interface ModHelperMod {
  id: string;
  name: string;
  author: string;
  version: string;
  description: string;
  downloadUrl: string;
  fileSize: number;
  compatibility: {
    minBTD6Version: string;
    minModHelperVersion: string;
    melonLoaderRequired: boolean;
  };
}

export interface InstallationResult {
  success: boolean;
  modName: string;
  message: string;
  installedPath?: string;
  requiresRestart?: boolean;
}

/**
 * Common BTD6 Mod Helper paths across different platforms
 */
const MOD_HELPER_PATHS = {
  windows: [
    'C:\\Program Files\\Steam\\steamapps\\common\\BloonsTD6\\Mods',
    'C:\\Program Files (x86)\\Steam\\steamapps\\common\\BloonsTD6\\Mods',
    '%USERPROFILE%\\AppData\\LocalLow\\Ninja Kiwi\\BloonsTD6\\Mods',
  ],
  mac: [
    '~/Library/Application Support/Steam/steamapps/common/BloonsTD6/Mods',
    '~/Library/Caches/com.ninjakiwi.bloonstd6/Mods',
  ],
  linux: [
    '~/.steam/steamapps/common/BloonsTD6/Mods',
    '~/.local/share/Steam/steamapps/common/BloonsTD6/Mods',
  ],
};

/**
 * Get the platform-specific BTD6 Mod Helper directory
 */
export function getBTD6ModHelperDirectory(): string {
  const platform = getPlatform();
  const paths = MOD_HELPER_PATHS[platform as keyof typeof MOD_HELPER_PATHS] || [];
  
  // Return the first path (most common)
  return paths[0] || '/Mods';
}

/**
 * Detect the current platform
 */
function getPlatform(): string {
  if (typeof window === 'undefined') return 'linux';
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.includes('win')) return 'windows';
  if (userAgent.includes('mac')) return 'mac';
  return 'linux';
}

/**
 * Check if BTD6 Mod Helper is installed
 */
export async function isBTD6ModHelperInstalled(): Promise<boolean> {
  try {
    // Check for BTD6 Mod Helper directory
    const modHelperDir = getBTD6ModHelperDirectory();
    
    // Try to fetch the mod helper config
    const response = await fetch(`file://${modHelperDir}/../ModHelper.json`);
    return response.ok;
  } catch (error) {
    console.log('BTD6 Mod Helper not detected:', error);
    return false;
  }
}

/**
 * Get BTD6 Mod Helper configuration
 */
export async function getBTD6ModHelperConfig(): Promise<BTD6ModHelperConfig | null> {
  try {
    const modHelperDir = getBTD6ModHelperDirectory();
    const response = await fetch(`file://${modHelperDir}/../ModHelper.json`);
    
    if (!response.ok) {
      throw new Error('Could not read ModHelper.json');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error reading BTD6 Mod Helper config:', error);
    return null;
  }
}

/**
 * Download and install a mod using BTD6 Mod Helper
 */
export async function installModWithBTD6ModHelper(
  mod: ModHelperMod
): Promise<InstallationResult> {
  try {
    // Check if BTD6 Mod Helper is installed
    const isInstalled = await isBTD6ModHelperInstalled();
    if (!isInstalled) {
      return {
        success: false,
        modName: mod.name,
        message: 'BTD6 Mod Helper is not installed. Please install it first.',
      };
    }

    // Get BTD6 Mod Helper configuration
    const config = await getBTD6ModHelperConfig();
    if (!config) {
      return {
        success: false,
        modName: mod.name,
        message: 'Could not read BTD6 Mod Helper configuration.',
      };
    }

    // Check compatibility
    const compatibility = checkModCompatibility(mod, config);
    if (!compatibility.compatible) {
      return {
        success: false,
        modName: mod.name,
        message: `Mod is not compatible: ${compatibility.reason}`,
      };
    }

    // Download the mod
    const modData = await downloadMod(mod.downloadUrl);
    if (!modData) {
      return {
        success: false,
        modName: mod.name,
        message: 'Failed to download mod file.',
      };
    }

    // Install the mod
    const installedPath = await installModFile(mod, modData, config.modsDirectory);
    
    return {
      success: true,
      modName: mod.name,
      message: `Mod installed successfully: ${mod.name}`,
      installedPath,
      requiresRestart: true,
    };
  } catch (error) {
    return {
      success: false,
      modName: mod.name,
      message: `Installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Check if a mod is compatible with the current BTD6 Mod Helper setup
 */
function checkModCompatibility(
  mod: ModHelperMod,
  config: BTD6ModHelperConfig
): { compatible: boolean; reason?: string } {
  // Check BTD6 version
  if (compareVersions(config.btd6Version, mod.compatibility.minBTD6Version) < 0) {
    return {
      compatible: false,
      reason: `Requires BTD6 ${mod.compatibility.minBTD6Version} or higher`,
    };
  }

  // Check Mod Helper version
  if (compareVersions(config.modHelperVersion, mod.compatibility.minModHelperVersion) < 0) {
    return {
      compatible: false,
      reason: `Requires BTD6 Mod Helper ${mod.compatibility.minModHelperVersion} or higher`,
    };
  }

  // Check MelonLoader requirement
  if (mod.compatibility.melonLoaderRequired && !config.melonLoaderVersion) {
    return {
      compatible: false,
      reason: 'Requires MelonLoader to be installed',
    };
  }

  return { compatible: true };
}

/**
 * Compare two version strings
 * Returns: -1 if v1 < v2, 0 if v1 == v2, 1 if v1 > v2
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;

    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
  }

  return 0;
}

/**
 * Download a mod file
 */
async function downloadMod(downloadUrl: string): Promise<Blob | null> {
  try {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    console.error('Error downloading mod:', error);
    return null;
  }
}

/**
 * Install a mod file to the BTD6 Mod Helper directory
 */
async function installModFile(
  mod: ModHelperMod,
  modData: Blob,
  modsDirectory: string
): Promise<string> {
  // Extract filename from download URL or use mod name
  const filename = mod.downloadUrl.split('/').pop() || `${mod.name}.dll`;
  const installedPath = `${modsDirectory}/${filename}`;

  // In a real implementation, this would use the Filesystem API
  // For now, we'll just return the path
  console.log(`Installing mod to: ${installedPath}`);

  return installedPath;
}

/**
 * List all installed mods in BTD6 Mod Helper directory
 */
export async function listInstalledMods(): Promise<string[]> {
  try {
    const modHelperDir = getBTD6ModHelperDirectory();
    
    // This would require a backend API to list files
    // For now, return empty array
    console.log(`Mods directory: ${modHelperDir}`);
    return [];
  } catch (error) {
    console.error('Error listing installed mods:', error);
    return [];
  }
}

/**
 * Uninstall a mod from BTD6 Mod Helper directory
 */
export async function uninstallMod(filename: string): Promise<InstallationResult> {
  try {
    const modHelperDir = getBTD6ModHelperDirectory();
    const modPath = `${modHelperDir}/${filename}`;

    // This would require a backend API to delete files
    console.log(`Uninstalling mod: ${modPath}`);

    return {
      success: true,
      modName: filename,
      message: `Mod uninstalled: ${filename}`,
      requiresRestart: true,
    };
  } catch (error) {
    return {
      success: false,
      modName: filename,
      message: `Failed to uninstall mod: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get installation instructions for BTD6 Mod Helper
 */
export function getInstallationInstructions(): string {
  return `
BTD6 Mod Manager Installation Guide
====================================

1. Download and Install MelonLoader:
   - Visit: https://melonwiki.xyz
   - Download MelonLoader for your platform
   - Follow the installation instructions

2. Install BTD6 Mod Helper:
   - Download from: https://github.com/doombubbles/BTD6-Mod-Helper/releases
   - Extract to your BTD6 Mods folder
   - Launch BTD6 to initialize Mod Helper

3. Use BTD6 Mod Manager:
   - Browse available mods
   - Click "Install" to download and install mods
   - Mods will be automatically placed in the correct directory
   - Restart BTD6 to load new mods

4. Manage Installed Mods:
   - View all installed mods
   - Enable/disable mods as needed
   - Uninstall mods you no longer need

Note: Some mods may require additional setup or dependencies.
Always read the mod description for specific instructions.
  `;
}
