# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }

# Facebook SDK
-keep class com.facebook.** { *; }
-keep class com.facebook.login.** { *; }
-keep class com.facebook.share.** { *; }
-dontwarn com.facebook.**

# Expo
-keep class expo.modules.** { *; }
-keep class com.facebook.hermes.reactexecutor.** { *; }

# Keep native methods
-keepclassmembers class * {
    native <methods>;
}

# Keep font resources
-keep class **.R$*

# Keep annotation
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**

# React Native Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# Async Storage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# ML Kit
-keep class com.google.mlkit.** { *; }
-dontwarn com.google.mlkit.**

# Camera
-keep class org.opencv.** { *; }
-keep class com.mrousavy.camera.** { *; }

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Suppress warnings for missing CardIO classes
-dontwarn io.card.payment.CardIOActivity
-dontwarn io.card.payment.CreditCard

# Suppress warnings for missing Joda Time classes
-dontwarn org.joda.convert.FromString
-dontwarn org.joda.convert.ToString



# Add any project specific keep options here:
