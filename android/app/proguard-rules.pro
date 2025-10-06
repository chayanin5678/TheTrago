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

# R8 / ProGuard rules added to address missing classes during minification
# Referenced from build output: build/outputs/mapping/release/missing_rules.txt
# Keep Omise UI classes used in layouts
-keep class co.omise.android.ui.CreditCardActivity { <init>(); }
-keep class co.omise.android.ui.CreditCardEditText { <init>(android.content.Context, android.util.AttributeSet); }

# Suppress warnings for optional Card.IO and joda-convert classes that
# are referenced at runtime in some libraries but not packaged here.
-dontwarn io.card.payment.**
-dontwarn org.joda.convert.**

# Expo modules
-keep class expo.modules.** { *; }
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# React Native
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
}

# React Native New Architecture
-keep class com.facebook.react.fabric.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.bridge.** { *; }

# Hermes
-keep class com.facebook.hermes.** { *; }

# Google Sign-In
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# Apple Authentication (even if unused, prevent R8 from breaking stubs)
-keep class com.invertase.** { *; }
-dontwarn com.invertase.**

# Reanimated worklets
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.common.** { *; }

# React Native Screens
-keep class com.swmansion.rnscreens.** { *; }

# React Native Gesture Handler
-keep class com.swmansion.gesturehandler.** { *; }

# Lottie
-keep class com.airbnb.lottie.** { *; }

# Network info
-keep class com.pusherman.networkinfo.** { *; }

# Omise
-keep class co.omise.** { *; }
-dontwarn co.omise.**

# WebView
-keep class com.reactnativecommunity.webview.** { *; }

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Picker
-keep class com.reactnativecommunity.picker.** { *; }
-keep class com.beefe.picker.** { *; }

# NetInfo
-keep class com.reactnativecommunity.netinfo.** { *; }

# DateTime Picker
-keep class com.reactcommunity.rndatetimepicker.** { *; }

# Facebook SDK
-keep class com.facebook.** { *; }
-dontwarn com.facebook.**

# Remove logging in release
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# Keep source file names and line numbers for better crash reports
-keepattributes SourceFile,LineNumberTable

# Keep crash reporting attributes
-keepattributes *Annotation*,Signature,Exception

# Repackage classes into a single package to reduce APK size
-repackageclasses 'o'

# Allow aggressive optimization
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification

# Keep native methods
-keepclasseswithmembernames,includedescriptorclasses class * {
    native <methods>;
}

# Keep serialization code
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
