# BTD6 Mod Manager - Generate APK with EAS Build (No PC Required!)

This guide will help you generate an Android APK using **Expo EAS Build** - a cloud-based build service that requires no local setup.

## What You Need

1. **A GitHub Account** (free) - [Sign up here](https://github.com/signup)
2. **An Expo Account** (free) - [Sign up here](https://expo.dev)
3. **A Web Browser** - That's it!

## Step 1: Create an Expo Account

1. Go to [expo.dev](https://expo.dev)
2. Click **Sign Up**
3. Create an account (you can use your GitHub account)
4. Verify your email

## Step 2: Push Code to GitHub

1. Go to [github.com/new](https://github.com/new) to create a new repository
2. Name it `btd6-mod-manager`
3. Click **Create repository**
4. Follow GitHub's instructions to push the code (or download the code from Manus and upload it)

## Step 3: Set Up EAS Build

### 3.1 Install EAS CLI

Open your terminal/command prompt and run:

```bash
npm install -g eas-cli
```

Or if you have the code locally:

```bash
cd btd6-mod-manager
npm install -g eas-cli
```

### 3.2 Login to Expo

```bash
eas login
```

Enter your Expo credentials when prompted.

### 3.3 Initialize EAS

```bash
eas build:configure
```

When asked about the platform, select **Android**.

## Step 4: Build the APK

### 4.1 Start the Build

```bash
eas build --platform android --local
```

Or for a cloud build (recommended):

```bash
eas build --platform android
```

### 4.2 Monitor the Build

The build will start in the cloud. You can:
- Watch the progress in your terminal
- Check the status at [expo.dev/builds](https://expo.dev/builds)
- Receive an email when the build completes

### 4.3 Download the APK

Once the build completes:

1. Go to [expo.dev/builds](https://expo.dev/builds)
2. Find your build in the list
3. Click the download button to get your APK file

## Step 5: Install on Your Android Device

### 5.1 Using a File Manager

1. Download the APK file to your phone
2. Open the file manager on your phone
3. Navigate to the APK file
4. Tap it to install
5. If prompted about unknown sources, enable it in Settings

### 5.2 Using ADB (Advanced)

If you have ADB installed:

```bash
adb install btd6-mod-manager.apk
```

## Step 6: Launch the App

1. Open your phone's app drawer
2. Find **BTD6 Mod Manager**
3. Tap to launch
4. Browse and download mods!

## Troubleshooting

### Build Fails

- Check that `app.json` is in the project root
- Ensure `package.json` has valid JSON syntax
- Check the build logs at [expo.dev/builds](https://expo.dev/builds)

### APK Won't Install

- Ensure you have enough storage space
- Enable "Unknown Sources" in Android Settings
- Try uninstalling any previous version first

### App Crashes on Launch

- Check the Android logcat:
  ```bash
  adb logcat | grep BTD6
  ```
- Ensure internet permission is enabled

## Updating the APK

To build a new version:

1. Make changes to the code
2. Push to GitHub
3. Run `eas build --platform android` again
4. Download the new APK

## Advanced: Custom Branding

To customize the app icon and splash screen:

1. Replace `client/public/favicon.ico` with your custom icon
2. Update `app.json` with your app name and colors
3. Run `eas build --platform android` again

## Free Tier Limits

Expo's free tier includes:

- ✅ 30 free builds per month
- ✅ Unlimited app installs
- ✅ Full access to all features
- ✅ No credit card required

## Next Steps

1. **Test the App** - Install on your device and try downloading mods
2. **Share with Friends** - Send them the APK file
3. **Distribute** - Upload to Google Play Store (requires $25 one-time fee)
4. **Iterate** - Make improvements and rebuild

## Support

- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Expo Discord Community](https://discord.gg/expo)

---

**That's it!** You now have a native Android APK without needing a PC or Android Studio. 🎉
