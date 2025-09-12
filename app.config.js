const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  "expo": {
    "owner": "chayanin5678",
    "name": "TheTrago",
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
      "versionCode": 3,
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
        "react-native-fbsdk-next",
        {
          "appID": "1326238592032941",
          "clientToken": "ee3279fa98c503a79f50275c3c6799ca",
          "displayName": "TheTrago"
        }
      ],
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
      "bundleIdentifier": "com.thetrago.ios",
      "buildNumber": "3",
      "supportsTablet": true,
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false,
        "NSCameraUsageDescription": "We need camera access to scan your ID card",
        "NSPhotoLibraryUsageDescription": "This app needs access to your photo library for selecting and uploading images.",
        "NSSpeechRecognitionUsageDescription": "This app may use speech recognition to enhance voice input features.",
        "FacebookAppID": "1326238592032941",
        "FacebookClientToken": "ee3279fa98c503a79f50275c3c6799ca",
        "FacebookDisplayName": "TheTrago",
        "CFBundleURLTypes": [
          {
            "CFBundleURLName": "thetrago",
            "CFBundleURLSchemes": ["thetrago"]
          },
          {
            "CFBundleURLName": "facebook",
            "CFBundleURLSchemes": ["fb1326238592032941"]
          }
        ],
        "LSApplicationQueriesSchemes": ["fbapi", "fb-messenger-share-api", "fbauth2", "fbshareextension"],
        "NSUserTrackingUsageDescription": "This identifier will be used to deliver personalized ads to you.",
        "com.apple.developer.associated-domains": ["applinks:thetrago.com"]
      }
    }
  }
};
