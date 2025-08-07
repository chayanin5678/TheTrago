const { withBuildProperties } = require('expo-build-properties');

module.exports = function withAndroid15Support(config) {
  return withBuildProperties(config, {
    android: {
      compileSdkVersion: 35,
      targetSdkVersion: 35,
      minSdkVersion: 24,
      buildToolsVersion: "35.0.0",
      ndkVersion: "27.0.12077973",
      proguardMinifyEnabled: true,
      shrinkResources: true,
      enableProguardInReleaseBuilds: true,
      enableHermes: true,
      newArchEnabled: true,
      packagingOptions: {
        pickFirst: [
          "**/libc++_shared.so",
          "**/libjsc.so",
          "**/libhermes.so"
        ]
      }
    },
    ios: {
      deploymentTarget: "13.0"
    }
  });
};
