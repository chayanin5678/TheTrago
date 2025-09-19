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
