# TheTrago - Ferry Booking App

🚢 แอปจองตั้วเรือข้ามฟากสำหรับการเดินทางในประเทศไทย

## 📁 Project Structure

```
TheTrago/
├── src/                          # Source code หลัก
│   ├── components/               # React Components
│   │   └── component/           # UI Components
│   ├── screens/                 # App Screens
│   │   ├── Screen/              # Additional screens
│   │   ├── HomeScreen.js        # หน้าหลัก
│   │   ├── SearchFerry.js       # ค้นหาเรือ
│   │   ├── TripDetail.js        # รายละเอียดการเดินทาง
│   │   └── ...                  # หน้าจออื่นๆ
│   ├── styles/                  # Stylesheets
│   │   └── CSS/                 # CSS files
│   ├── contexts/                # React Contexts
│   │   ├── AuthContext.js       # Authentication
│   │   └── PromotionProvider.js # Promotions
│   └── config/                  # Configuration files
│       ├── ipconfig.js          # IP configuration
│       ├── socialConfig.js      # Social media config
│       └── navigationRef.js     # Navigation reference
├── assets/                      # Static assets (images, fonts)
├── android/                     # Android native code
├── scripts/                     # Build and utility scripts
│   ├── build-android-15-16kb.bat    # Android 15 16KB build
│   ├── facebook-keyhash-generator.sh # Facebook key hash
│   └── android-15-16kb-config.sh    # Android 15 config
├── docs/                        # Documentation
├── backend-example/             # Backend API examples
├── patches/                     # Package patches
└── plugins/                     # Expo plugins
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI
- Android Studio (for Android development)
- EAS CLI

### Installation

1. Clone the repository
```bash
git clone https://github.com/chayanin5678/TheTrago.git
cd TheTrago
```

2. Install dependencies
```bash
npm install
npx expo install --fix
```

3. Start the development server
```bash
npm start
```

## 🔧 Build Commands

### Development
```bash
npm run start          # Start Expo dev server
npm run android        # Run on Android device/emulator
npm run ios           # Run on iOS device/simulator
```

### Android 15 16KB Page Size Build
```bash
npm run build:android-16kb    # Build with 16KB page size support
npm run build:android-15      # Prebuild for Android 15
```

### Maintenance
```bash
npm run clean:cache    # Clear Expo cache
npm run clean:android  # Clean Android build
npm run clean:all      # Clean everything and reinstall
```

## 📱 Android 15 Compatibility

แอปนี้ได้รับการปรับปรุงให้รองรับ Android 15 และ 16KB page size:

- ✅ Edge-to-Edge Display
- ✅ 16KB Page Size Support
- ✅ SafeAreaInsets Implementation
- ✅ Adaptive Layouts for Android 16
- ✅ Hermes Engine Optimization

## 🛠️ Tech Stack

- **Framework:** React Native + Expo
- **Navigation:** React Navigation
- **State Management:** Context API
- **Styling:** StyleSheet + Responsive Screen
- **Build:** EAS Build
- **Backend:** Custom API

## 📄 Features

- 🚢 Ferry route search
- 📅 Date and time selection
- 👥 Passenger management
- 💳 Payment integration
- 📱 QR code scanning
- 🔐 User authentication
- 🌐 Multi-language support

## 🎯 Performance Optimizations

- Hermes JavaScript engine
- Bundle splitting for memory efficiency
- Image optimization
- Native library optimization for 16KB pages
- Lazy loading implementation

## 📞 Support

For issues and questions, please contact:
- Developer: chayanin5678
- Repository: https://github.com/chayanin5678/TheTrago

---
Made with ❤️ for Thai ferry travelers
