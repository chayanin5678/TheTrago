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

# Keep CardIO classes
-keep class io.card.payment.CardIOActivity { *; }
-keep class io.card.payment.CreditCard { *; }

# Keep Joda Time classes
-keep class org.joda.convert.FromString { *; }
-keep class org.joda.convert.ToString { *; }
-keep class org.joda.time.DateTimeZone { *; }


# Add any project specific keep options here:
