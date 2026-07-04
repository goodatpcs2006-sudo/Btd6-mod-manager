#!/bin/bash

# BTD6 Mod Manager - APK Builder Script
# This script packages the web app into an Android APK

set -e

echo "🔨 BTD6 Mod Manager - APK Builder"
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install Cordova globally if not already installed
echo "📦 Installing Cordova..."
npm install -g cordova

# Create Cordova project
echo "📁 Creating Cordova project..."
cordova create btd6-apk com.btd6modmanager.app "BTD6 Mod Manager"

cd btd6-apk

# Add Android platform
echo "🤖 Adding Android platform..."
cordova platform add android

# Copy the built web app to the www folder
echo "📋 Copying web app files..."
rm -rf www/*
cp -r ../dist/public/* www/

# Update config.xml
echo "⚙️ Configuring app..."
cat > config.xml << 'EOF'
<?xml version='1.0' encoding='utf-8'?>
<widget id="com.btd6modmanager.app" version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
    <name>BTD6 Mod Manager</name>
    <description>Browse and install Bloons TD 6 mods</description>
    <author email="dev@btd6modmanager.com" href="https://btd6modmanager.com">BTD6 Mod Manager</author>
    <content src="index.html" />
    <access origin="*" />
    <allow-intent href="http://*/*" />
    <allow-intent href="https://*/*" />
    <allow-intent href="tel:*" />
    <allow-intent href="sms:*" />
    <allow-intent href="mailto:*" />
    <allow-intent href="geo:*" />
    <platform name="android">
        <allow-intent href="market:*" />
        <preference name="Orientation" value="portrait" />
        <preference name="FullScreen" value="false" />
    </platform>
    <plugin name="cordova-plugin-whitelist" spec="1" />
    <plugin name="cordova-plugin-file" spec="6.0.2" />
    <plugin name="cordova-plugin-file-transfer" spec="1.7.1" />
</widget>
EOF

# Build APK
echo "🔨 Building APK (this may take a few minutes)..."
cordova build android --release

# Check if build was successful
if [ -f "platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk" ]; then
    echo "✅ APK built successfully!"
    echo ""
    echo "📱 APK Location:"
    echo "   $(pwd)/platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. Download the APK file to your phone"
    echo "   2. Enable 'Unknown Sources' in Android Settings"
    echo "   3. Open the APK file to install"
    echo ""
else
    echo "❌ APK build failed. Check the error messages above."
    exit 1
fi
