#!/bin/bash
# สคริปต์สร้าง Development Build สำหรับ TheTrago

echo "🚀 Creating TheTrago Development Build..."

# 1. ติดตั้ง EAS CLI
echo "📦 Installing EAS CLI..."
npm install -g @expo/eas-cli

# 2. Login to Expo
echo "🔐 Login to Expo..."
eas login

# 3. Configure EAS
echo "⚙️ Configuring EAS..."
eas build:configure

# 4. Build Development APK
echo "🏗️ Building Development APK..."
eas build --platform android --profile development

echo "✅ Development Build completed!"
echo "📱 Download APK from Expo dashboard and install on device"
