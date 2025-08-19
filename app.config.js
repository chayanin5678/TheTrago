const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  "expo": {
    "owner": "chayanin0937",
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
        "projectId": "65688437-f30d-4cab-a314-1be4eeaf847c"
      }
    },
    "version": "1.0.3",
    
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
      "package": "com.thetrago.android",
      "permissions": [
        "CAMERA"
      ]
    },
    "plugins": [
      "expo-secure-store",
      "expo-mail-composer",
      "expo-apple-authentication",
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
      "bundleIdentifier": "com.thetrago.android",
      "buildNumber": "3",
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
