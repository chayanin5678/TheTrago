// TheTragoWebViewScreen.js
import React, { useCallback, useRef, useState } from 'react';
import { View, ActivityIndicator, Platform, BackHandler, Alert, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Linking from 'expo-linking';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ALLOWED_HOSTS = new Set([
  'thailandferrybooking.com', 'www.thailandferrybooking.com',
  // Alipay
  'mclient.alipay.com', 'render.alipay.com', 'openapi.alipay.com'
]);

const isAlipayHost = (host) => !!host && host.toLowerCase().endsWith('.alipay.com');

const SCHEMES_TO_OPEN_EXTERNALLY = new Set([
  'alipays','alipay','alipayqr','alipaylite', // Alipay
  'weixin','line','kplus','promptpay'
]);

const HEADER_H = 56;

// ล็อกซูม (โหลดก่อนเนื้อหา)
const INJECTED_LOCK_ZOOM_BEFORE = `
  (function(){
    try {
      var old = document.querySelector('meta[name=viewport]');
      if (old && old.parentNode) old.parentNode.removeChild(old);
      var meta = document.createElement('meta');
      meta.setAttribute('name','viewport');
      meta.setAttribute('content','width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
      document.head.appendChild(meta);

      var lastTouchEnd = 0;
      document.addEventListener('touchend', function (e) {
        var now = Date.now();
        if (now - lastTouchEnd <= 300) e.preventDefault();
        lastTouchEnd = now;
      }, { passive:false });

      document.addEventListener('gesturestart', function (e) { e.preventDefault(); }, { passive:false });
    } catch(e){}
  })();
  true;
`;

// ให้ window.open เปิดนอกแอป
const INJECTED_JS = `
  (function(){ const _open = window.open; window.open = function(url){ window.location.href = url; return null; }; })(); true;
`;

export default function TheTragoWebViewScreen() {
  const initialUrl = 'https://thailandferrybooking.com/';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const webRef = useRef(null);

  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState('Thailand Ferry');
  const [currentUrl, setCurrentUrl] = useState(initialUrl);

  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        if (canGoBack && webRef.current) {
          webRef.current.goBack();
          return true;
        }
        return false;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub?.remove?.();
    }, [canGoBack])
  );

  const handleIntentUrl = async (url) => {
    const m = url.match(/intent:\/\/.*#Intent;.*?S\.browser_fallback_url=([^;]+);/);
    if (m && m[1]) {
      const fb = decodeURIComponent(m[1]);
      if (await Linking.canOpenURL(fb)) return Linking.openURL(fb);
    }
    return Linking.openURL(url);
  };

  // ✅ เหลือเพียงตัวเดียว และรวม logic ครบ
  const handleShouldStartLoad = useCallback(async (req) => {
    const url = req.url;

    try {
      // intent:// (Android)
      if (url.startsWith('intent://')) {
        await handleIntentUrl(url);
        return false;
      }

      // deep-link schemes ที่ต้องเปิดนอกแอป
      const scheme = url.split(':')[0].toLowerCase();
      if (SCHEMES_TO_OPEN_EXTERNALLY.has(scheme)) {
        const ok = await Linking.canOpenURL(url);
        if (ok) await Linking.openURL(url);
        else Alert.alert('Cannot open link', url);
        return false;
      }

      const { host, protocol } = new URL(url);
      const isHttp = protocol === 'http:' || protocol === 'https:';

      // อนุญาตโหลดใน WebView
      if (isHttp && (ALLOWED_HOSTS.has(host) || isAlipayHost(host))) {
        return true;
      }

      // นอกเหนือจากนี้ เปิดภายนอก
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Cannot open link', url);
      return false;
    } catch {
      return true; // ถ้า parse URL ไม่ได้ ปล่อยโหลดไป
    }
  }, []);

  const refresh = () => webRef.current?.reload();
  const openInBrowser = () => Linking.openURL(currentUrl).catch(() => {});

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: insets.top + HEADER_H,
        marginBottom: insets.bottom + HEADER_H
      }}
    >
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top, height: insets.top + HEADER_H }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => {
              if (canGoBack && webRef.current) webRef.current.goBack();
              else navigation.goBack?.();
            }}
            style={styles.iconBtn}
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>

          <View style={styles.titleBox}>
            <Text numberOfLines={1} style={styles.title}>{pageTitle || 'Thailand Ferry'}</Text>
            <Text numberOfLines={1} style={styles.subtitle}>
              {(() => { try { return new URL(currentUrl).host.replace(/^www\./,''); } catch { return ''; } })()}
            </Text>
          </View>

          <View style={styles.rightBox}>
            {loading ? <ActivityIndicator size="small" /> : null}
            <TouchableOpacity onPress={refresh} style={styles.iconBtn} accessibilityRole="button">
              <Ionicons name="refresh" size={20} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity onPress={openInBrowser} style={styles.iconBtn} accessibilityRole="button">
              <Ionicons name="open-outline" size={22} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* WEBVIEW */}
      <WebView
        ref={webRef}
        source={{ uri: initialUrl }}
        applicationNameForUserAgent={`ThailandFerryBooking/${Platform.OS}`}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(nav) => {
          setCanGoBack(nav.canGoBack);
          if (nav?.title) setPageTitle(nav.title);
          if (nav?.url) setCurrentUrl(nav.url);
        }}
        injectedJavaScriptBeforeContentLoaded={INJECTED_LOCK_ZOOM_BEFORE}
        injectedJavaScript={INJECTED_JS}
        javaScriptEnabled
        domStorageEnabled
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        pullToRefreshEnabled={Platform.OS === 'android'}
        bounces
        setSupportMultipleWindows={false}
        allowFileAccess
        originWhitelist={['*']}
        cacheEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        // 🔒 ปิดการซูม
        setBuiltInZoomControls={false}
        setDisplayZoomControls={false}
        textZoom={100}
        scalesPageToFit={false}
        onError={(e) => {
          const msg = e?.nativeEvent?.description || 'Unknown error';
          Alert.alert('Load error', msg);
        }}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    zIndex: 10,
    elevation: 10,
  },
  headerRow: {
    height: HEADER_H,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  iconBtn: { padding: 8, borderRadius: 8 },
  titleBox: { flex: 1, marginHorizontal: 6 },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  rightBox: { flexDirection: 'row', alignItems: 'center' },
});
