const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  "expo": {
    "name": IS_DEV ? "TheTrago (Dev)" : "TheTrago",
    "slug": "TheTrago",
    "scheme": "thetrago",
    "extra": {
      "deeplink": {
        "host": "thetrago",
        "path": "/",
        "subdomain": "thetrago"
      },
      "eas": {
        "projectId": "97592fc7-1001-4618-a8f8-8bd2b28ff78b"
      }
    },
    "version": "1.0.2",
    "orientation": "portrait",
    "icon": "./assets/icontrago.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": false,
    "splash": {
      "image": "./assets/icontrago.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "android": {
      "versionCode": 2,
      "package": "com.chayanin5678.TheTrago",
      "permissions": [
        "CAMERA"
      ]
    },
    "plugins": [
      "expo-secure-store",
      "expo-mail-composer",
      [
        "expo-build-properties",
        {
          "ios": {
            "newArchEnabled": false,
            "deploymentTarget": "15.1"
          },
          "android": {
            "newArchEnabled": false
          }
        }
      ]
    ],
    "jsEngine": "jsc",
    "ios": {
      "bundleIdentifier": "com.chayanin5678.TheTrago",
      "supportsTablet": true,
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false,
        "NSCameraUsageDescription": "We need camera access to scan your ID card",
        "NSPhotoLibraryUsageDescription": "This app needs access to your photo library for selecting and uploading images.",
        "NSSpeechRecognitionUsageDescription": "This app may use speech recognition to enhance voice input features."
      }
    }
  }
};
