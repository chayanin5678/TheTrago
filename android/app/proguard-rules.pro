# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# react-native-reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# Add any project specific keep options here:

# ========== Missing classes fixes ==========

# Omise SDK - CardIO (optional dependency, not used)
-dontwarn io.card.payment.CardIOActivity
-dontwarn io.card.payment.CreditCard
-dontwarn io.card.payment.**
-dontwarn co.omise.android.**

# Joda Time - optional convert annotations
-dontwarn org.joda.convert.FromString
-dontwarn org.joda.convert.ToString
-dontwarn org.joda.convert.**
-dontwarn org.joda.time.**
-keep class org.joda.time.** { *; }

# Keep Omise classes
-keep class co.omise.android.** { *; }

# ========== React Native ==========
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.react.** { *; }

# Keep native methods
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
}

# Expo modules
-keep class expo.modules.** { *; }
-dontwarn expo.modules.**

# ========== General ==========
# Keep annotations
-keepattributes *Annotation*
-keepattributes SourceFile,LineNumberTable
-keepattributes Signature
-keepattributes Exceptions
