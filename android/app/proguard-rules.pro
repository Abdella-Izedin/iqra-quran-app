# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# Capacitor core - keep all bridge and plugin classes
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitor.annotation.** { *; }
-keepattributes *Annotation*
-keepclassmembers class * {
    @com.getcapacitor.annotation.PluginMethod <methods>;
}

# Capacitor plugins - keep all plugin classes fully (prevents R8 from stripping permission metadata)
-keep class com.capacitorjs.plugins.** { *; }

# Native settings plugin
-keep class de.nicovince.** { *; }

# Geolocation plugin dependencies
-keep class io.ionic.libs.iongeolocationlib.** { *; }

# Google Play Services - location APIs
-keep class com.google.android.gms.location.** { *; }
-dontwarn com.google.android.gms.**

# Kotlin coroutines - keep essential classes
-dontwarn kotlinx.coroutines.**
-keepclassmembers class kotlinx.coroutines.** {
    volatile <fields>;
}

# WebView JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Cordova plugins
-dontwarn org.apache.cordova.**
-keep class org.apache.cordova.CordovaPlugin { *; }
-keepclassmembers class * extends org.apache.cordova.CordovaPlugin {
    public <methods>;
}
