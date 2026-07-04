# BTD6 Mod Manager - Android APK Build Guide

This guide will help you build the BTD6 Mod Manager as a native Android APK that can install mods directly into Bloons TD 6.

## Prerequisites

Before starting, make sure you have the following installed on your machine:

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **Android Studio** - [Download](https://developer.android.com/studio)
3. **Java Development Kit (JDK)** - Usually comes with Android Studio
4. **Git** - [Download](https://git-scm.com/)

## Step 1: Set Up Android Development Environment

### 1.1 Install Android SDK

1. Open Android Studio
2. Go to **Tools → SDK Manager**
3. Install the following:
   - **SDK Platforms**: Android 12 (API 31) or higher
   - **SDK Tools**: 
     - Android SDK Build-Tools
     - Android Emulator
     - Android SDK Platform-Tools
     - Google Play Services

### 1.2 Set Environment Variables

Add the following to your system environment variables:

**On Windows (Command Prompt as Admin):**
```bash
setx ANDROID_HOME "C:\Users\YourUsername\AppData\Local\Android\Sdk"
setx JAVA_HOME "C:\Program Files\Android\Android Studio\jre"
```

**On macOS/Linux:**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
export JAVA_HOME=/Applications/Android\ Studio.app/Contents/jre/Contents/Home
```

## Step 2: Clone and Prepare the Project

### 2.1 Clone the Repository

```bash
git clone <repository-url> btd6-mod-manager
cd btd6-mod-manager
```

### 2.2 Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2.3 Build the Web App

```bash
npm run build
# or
pnpm build
```

This creates the `dist/` folder that will be packaged into the APK.

## Step 3: Set Up Capacitor for Android

### 3.1 Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/filesystem
# or
pnpm add @capacitor/core @capacitor/cli @capacitor/android @capacitor/filesystem
```

### 3.2 Initialize Capacitor

```bash
npx cap init
```

When prompted, enter:
- **App name**: BTD6 Mod Manager
- **App Package ID**: com.btd6modmanager.app

### 3.3 Add Android Platform

```bash
npx cap add android
```

This creates the `android/` folder with the native Android project.

## Step 4: Configure Android Permissions

### 4.1 Edit AndroidManifest.xml

Open `android/app/src/main/AndroidManifest.xml` and add these permissions:

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.INTERNET" />
```

### 4.2 Update build.gradle

Open `android/app/build.gradle` and ensure:

```gradle
android {
    compileSdkVersion 33
    
    defaultConfig {
        applicationId "com.btd6modmanager.app"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
    }
}
```

## Step 5: Build the APK

### 5.1 Sync Capacitor Files

```bash
npx cap sync android
```

### 5.2 Open in Android Studio

```bash
npx cap open android
```

This opens the Android project in Android Studio.

### 5.3 Build the APK

In Android Studio:

1. Go to **Build → Build Bundle(s)/APK(s) → Build APK(s)**
2. Wait for the build to complete (this may take 5-10 minutes)
3. You'll see a notification when the build is complete

### 5.4 Locate the APK

The APK file will be at:
```
android/app/release/app-release.apk
```

Or for debug builds:
```
android/app/debug/app-debug.apk
```

## Step 6: Install on Device/Emulator

### 6.1 Using Android Studio

1. Connect your Android device via USB or use the emulator
2. In Android Studio, go to **Run → Run 'app'**
3. Select your device and click OK

### 6.2 Using Command Line

```bash
# For debug APK
adb install android/app/debug/app-debug.apk

# For release APK
adb install android/app/release/app-release.apk
```

## Step 7: Test the App

1. Launch the BTD6 Mod Manager app on your device
2. Browse available mods
3. Download a mod - it will be installed to:
   ```
   /storage/emulated/0/Android/data/com.ninjakiwi.bloonstd6/files/Mods/
   ```
4. Launch Bloons TD 6 and verify the mod is loaded

## Troubleshooting

### Build Fails with "SDK not found"

- Ensure `ANDROID_HOME` environment variable is set correctly
- Run `npx cap doctor` to check your setup

### APK Installation Fails

- Enable "Unknown Sources" in Android Settings
- For release APK, you may need to sign it (see below)

### Mod Installation Doesn't Work

- Ensure the device has storage permissions enabled
- Check that BTD6 is installed at the expected path
- Verify the mod file format is correct (.dll)

## Signing the Release APK

For distribution on app stores, you need to sign the APK:

### 7.1 Create a Keystore

```bash
keytool -genkey -v -keystore btd6-mod-manager.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias btd6-key
```

### 7.2 Sign the APK

```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore btd6-mod-manager.keystore android/app/release/app-release.apk btd6-key
```

### 7.3 Verify the Signature

```bash
jarsigner -verify -verbose -certs android/app/release/app-release.apk
```

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Gradle Build System](https://gradle.org/)

## Support

If you encounter issues:

1. Check the Android Studio build logs for detailed error messages
2. Run `npx cap doctor` to diagnose environment issues
3. Ensure all prerequisites are properly installed
4. Check that file paths don't contain spaces or special characters

## Next Steps

Once you have the APK:

1. **Test on Multiple Devices** - Ensure compatibility across different Android versions
2. **Optimize Performance** - Profile the app using Android Studio's profiler
3. **Distribute** - Share the APK or upload to Google Play Store
4. **Gather Feedback** - Collect user feedback and iterate

Good luck building your BTD6 Mod Manager APK!
