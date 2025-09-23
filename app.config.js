const APP_VERSION = "1.0.5";
const IOS_BUILD_NUMBER = "1";

module.exports = {
  expo: {
    owner: "chayanin4534",
    name: "TheTrago",
    slug: "TheTrago",
    scheme: "thetrago",
    description:
      "Book ferry tickets easily with TheTrago. Find the best ferry routes, compare prices, and make reservations for your island hopping adventures in Thailand.",
    keywords: ["ferry","booking","travel","thailand","island","transportation","tickets"],
    privacy: "public",
    extra: {
      deeplink: { host: "thetrago", path: "/", subdomain: "thetrago" },
      eas: { projectId: "74ac187e-236a-48db-8ae4-5aaa93e55f9a" }
    },
  version: APP_VERSION,
    android: {
      package: "com.chayanin5678.TheTrago"
    },
    orientation: "default",
    icon: "./assets/icontrago.png",
    userInterfaceStyle: "light",
  newArchEnabled: true,

    plugins: [
      "expo-secure-store",
      "expo-mail-composer",
      "expo-apple-authentication",
      ["react-native-fbsdk-next", {
        appID: "1326238592032941",
        clientToken: "ee3279fa98c503a79f50275c3c6799ca",
        displayName: "TheTrago"
      }],
      ["expo-build-properties", {
        android: {
          compileSdkVersion: 35, targetSdkVersion: 35, minSdkVersion: 24,
          buildToolsVersion: "35.0.0", newArchEnabled: true, enableHermes: true,
          manifestPlaceholders: { android16AdaptiveLayouts: true },
          packagingOptions: {
            pickFirst: ["**/libc++_shared.so","**/libjsc.so"],
            exclude: ["META-INF/DEPENDENCIES","META-INF/LICENSE","META-INF/LICENSE.txt","META-INF/license.txt","META-INF/NOTICE","META-INF/notice.txt","META-INF/ASL2.0","META-INF/LICENSE.md","META-INF/NOTICE.md"]
          },
          proguardVersion: "7.4.0",
          enableProguardInReleaseBuilds: true,
          useLegacyPackaging: false,
          enableSeparateBuildPerCPUArchitecture: false,
          enableR8: true
        },
        ios: { deploymentTarget: "15.1" }
      }],
      ["expo-camera", {
        cameraPermission: "Allow TheTrago to access your camera to scan QR codes and capture ID documents."
      }],
      ["expo-location", {
        locationAlwaysAndWhenInUsePermission: "Allow TheTrago to use your location to find nearby ferry terminals.",
        locationAlwaysPermission: "Allow TheTrago to use your location to find nearby ferry terminals.",
        locationWhenInUsePermission: "Allow TheTrago to use your location to find nearby ferry terminals."
      }]
    ],

    jsEngine: "hermes",

    ios: {
      bundleIdentifier: "com.thetrago.ios",
      buildNumber: IOS_BUILD_NUMBER,
      supportsTablet: true,
      requireFullScreen: false,
      userInterfaceStyle: "automatic",

      // ✅ ย้าย Associated Domains มาไว้ที่นี่ (Expo จะสร้าง entitlement ให้)
      associatedDomains: ["applinks:thetrago.com"],

      // ✅ ใส่ entitlements ให้ตรงกับความสามารถที่ใช้จริง
      entitlements: {
        "com.apple.developer.applesignin": ["Default"], // ใช้ Sign in with Apple
        "aps-environment": "production"                 // ใช้ Push (สำหรับ App Store/TestFlight)
      },

      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription: "We need camera access to scan your ID card",
        NSPhotoLibraryUsageDescription: "This app needs access to your photo library for selecting and uploading images.",
        NSSpeechRecognitionUsageDescription: "This app may use speech recognition to enhance voice input features.",
        FacebookAppID: "1326238592032941",
        FacebookClientToken: "ee3279fa98c503a79f50275c3c6799ca",
        FacebookDisplayName: "TheTrago",
        // URL schemes and query schemes are handled by top-level `scheme` and plugins
        LSApplicationQueriesSchemes: ["fbapi","fb-messenger-share-api","fbauth2","fbshareextension"],

        // ❌ ลบ com.apple.developer.associated-domains ออกจาก infoPlist (เราใส่ไว้ที่ entitlements/associatedDomains แล้ว)

        NSLocationWhenInUseUsageDescription: "TheTrago needs location access to show nearby ferry terminals and provide location-based services.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "TheTrago needs location access to show nearby ferry terminals and provide location-based services.",

  // Use background fetch as 'fetch' (App Store requires the correct key value)
  UIBackgroundModes: ["fetch","remote-notification"],

  // Standard version keys so Info.plist contains both values explicitly
  CFBundleShortVersionString: APP_VERSION,
  CFBundleVersion: IOS_BUILD_NUMBER,

  // Combined version+build string expected by some integrations
  "CFBundleShortVersionString+CFundleVersion": `${APP_VERSION}+${IOS_BUILD_NUMBER}`,

        // App display name, bundle name and supported orientations are managed
        // by top-level `name` and `orientation` in the Expo config.
      }
    },

    experiments: { tsconfigPaths: true, typedRoutes: false },
    runtimeVersion: { policy: "sdkVersion" }
  }
};
