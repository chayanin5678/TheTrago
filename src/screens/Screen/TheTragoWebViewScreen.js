// TheTragoWebViewScreen.js
import React, { useCallback, useRef, useState, useMemo } from 'react';
import {
  View,
  ActivityIndicator,
  Platform,
  BackHandler,
  Alert,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Linking from 'expo-linking';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

// ✅ อนุญาตเฉพาะ hostname ที่ต้องการ
const ALLOWED_HOSTS = new Set([
  'thailandferrybooking.com',
  'www.thailandferrybooking.com',
  // Payment gateways ที่ให้โหลดใน WebView
  'kpaymentgateway.kasikornbank.com',
  'pay.omise.co',
  '3dsms.omise.co',
  'emvacs.2c2p.com',
  // Alipay web flows
  'mclient.alipay.com',
  'render.alipay.com',
  'openapi.alipay.com',
]);

// ✅ อนุโลมซับโดเมนของรูทโดเมนเหล่านี้
const ALLOWED_ROOTS = new Set(['kasikornbank.com', 'alipay.com']);
const isAllowedByRoot = (h) =>
  Array.from(ALLOWED_ROOTS).some(root => h === root || h.endsWith('.' + root));

const isAlipayHost = (hostname) =>
  (!!hostname && hostname.toLowerCase().endsWith('.alipay.com')) || hostname === 'alipay.com';

const SCHEMES_TO_OPEN_EXTERNALLY = new Set([
  'alipays','alipay','alipayqr','alipaylite',
  'weixin','line','kplus','promptpay',
  'tel','mailto',
]);

const HEADER_H = 56;

// 🔒 ล็อกซูม + กัน iOS auto-zoom
const INJECTED_LOCK_ZOOM_BEFORE = `
  (function(){
    try {
      var old = document.querySelector('meta[name=viewport]');
      if (old && old.parentNode) old.parentNode.removeChild(old);
      var meta = document.createElement('meta');
      meta.setAttribute('name','viewport');
      meta.setAttribute('content','width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no');
      document.head.appendChild(meta);

      var style = document.createElement('style');
      style.innerHTML = \`
        html, body { -webkit-text-size-adjust: 100% !important; text-size-adjust: 100% !important; }
        html, body, * { touch-action: pan-x pan-y; }
        input, textarea, select, button { font-size: 16px !important; line-height: 1.25 !important; }
        ::-webkit-input-placeholder, :-ms-input-placeholder, ::placeholder { font-size: 16px !important; }
        body { will-change: transform; }
      \`;
      document.head.appendChild(style);
    } catch(e){}
  })();
  true;
`;

// ⛔️ กัน target=_blank โดดไปแท็บใหม่: ให้เปิดหน้าเดิมแทน
const INJECTED_FIX_WINDOW_OPEN = `
  (function(){
    try {
      const _open = window.open;
      window.open = function(url){ if (url) window.location.href = url; return null; };
    } catch(e){}
  })();
  true;
`;

/** ⬇️ ดึง-ค้าง (sticky pull-to-refresh) ฝั่งเว็บ */
const INJECTED_PULL_TO_REFRESH = `
  (function () {
    try {
      var startY = 0, pulling = false, dy = 0, threshold = 80, maxPull = 140, locked = false;

      function atTop(){
        var top = (document.scrollingElement || document.documentElement).scrollTop || window.pageYOffset || 0;
        return top <= 0;
      }

      function setBodyOffset(y, withTransition){
        try {
          var b = document.body;
          if (!b) return;
          if (withTransition) { b.style.transition = 'transform 200ms ease'; }
          else { b.style.transition = 'none'; }
          b.style.transform = 'translateY(' + y + 'px)';
        } catch(_){}
      }

      window.addEventListener('touchstart', function (e) {
        if (locked) return;
        pulling = atTop();
        startY = e.touches[0].clientY;
        dy = 0;
      }, { passive: true });

      window.addEventListener('touchmove', function (e) {
        if (locked || !pulling) return;
        var cur = e.touches[0].clientY;
        dy = cur - startY;
        if (dy <= 0) return;
        var eased = Math.min(maxPull, dy * 0.6);
        setBodyOffset(eased, false);
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:'PTR_PULL', y:eased, threshold:threshold}));
        e.preventDefault();
      }, { passive: false });

      window.addEventListener('touchend', function () {
        if (locked) return;
        if (!pulling) return;
        pulling = false;
        if (dy * 0.6 >= threshold) {
          locked = true;
          setBodyOffset(60, true);
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:'PTR_START'}));
        } else {
          setBodyOffset(0, true);
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:'PTR_CANCEL'}));
        }
      }, { passive: true });

      // รับสัญญาณปล่อยตัวจาก RN
      window.addEventListener('message', function(e){
        try{
          var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
          if (data && data.type === 'PTR_FINISH') {
            locked = false;
            setBodyOffset(0, true);
          }
        }catch(_){}
      });
    } catch (_) {}
  })();
  true;
`;

const INJECTED_AFTER = `${INJECTED_FIX_WINDOW_OPEN}\n${INJECTED_PULL_TO_REFRESH}`;

export default function TheTragoWebViewScreen() {
  const initialUrl = 'https://thailandferrybooking.com/';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const webRef = useRef(null);

  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState('Thailand Ferry');
  const [currentUrl, setCurrentUrl] = useState(initialUrl);

  // ดึงลงค้าง (หัวรีเฟรช)
  const [refreshing, setRefreshing] = useState(false);
  const pullY = useRef(new Animated.Value(0)).current; // 0 → 60
  const stickyHeight = 60;

  // 👇 สั่น "ตึ๊กเดียว" ตอนเริ่มโหลด (ต่อหนึ่งรอบโหลด)
  const vibbedThisLoadRef = useRef(false);
  const vibrateOnce = useCallback(() => {
    if (vibbedThisLoadRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    vibbedThisLoadRef.current = true;
  }, []);

  const animatePullTo = useCallback((to, dur = 160) => {
    Animated.timing(pullY, { toValue: to, duration: dur, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [pullY]);

  useFocusEffect(
    useCallback(() => {
      const onBack = () => {
        if (canGoBack && webRef.current) { webRef.current.goBack(); return true; }
        return false;
      };
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub?.remove?.();
    }, [canGoBack])
  );

  // จัดการ intent:// และ deep links
  const handleIntentUrl = (url) => {
    const m = url.match(/intent:\/\/.*#Intent;.*?S\.browser_fallback_url=([^;]+);/);
    if (m && m[1]) {
      const fb = decodeURIComponent(m[1]);
      setTimeout(() => { Linking.openURL(fb).catch(() => Alert.alert('Cannot open link', fb)); }, 0);
      return;
    }
    setTimeout(() => { Linking.openURL(url).catch(() => Alert.alert('Cannot open link', url)); }, 0);
  };

  // ต้อง synchronous เท่านั้น (ห้าม async/await)
  const handleShouldStartLoad = useCallback((req) => {
    const url = req.url;
    try {
      if (url.startsWith('about:') || url.startsWith('data:')) return true;

      if (url.startsWith('intent://')) { handleIntentUrl(url); return false; }

      const scheme = url.split(':')[0].toLowerCase();
      if (SCHEMES_TO_OPEN_EXTERNALLY.has(scheme)) {
        setTimeout(() => { Linking.openURL(url).catch(() => Alert.alert('Cannot open link', url)); }, 0);
        return false;
      }

      const u = new URL(url);
      const { hostname, protocol } = u;
      const isHttp = protocol === 'http:' || protocol === 'https:';
      if (isHttp) {
        if (ALLOWED_HOSTS.has(hostname) || isAllowedByRoot(hostname) || isAlipayHost(hostname)) return true;
        return false;
      }
      return false;
    } catch {
      return true; // ปล่อย resource ภายในบางอย่าง
    }
  }, []);

  const refresh = useCallback(() => {
    if (refreshing) return;
    setRefreshing(true);
    animatePullTo(stickyHeight, 80);
    webRef.current?.reload(); // โหลดใหม่จากบนสุด
  }, [refreshing, animatePullTo]);

  const openInBrowser = () => Linking.openURL(currentUrl).catch(() => {});

  // รับอีเวนต์จากหน้าเว็บ (ดึงลง)
  const onMessage = useCallback((e) => {
    let data = e?.nativeEvent?.data;
    try { data = JSON.parse(data); } catch {}
    if (!data || !data.type) return;

    if (data.type === 'PTR_PULL' && !refreshing) {
      const y = Math.min(stickyHeight, Math.max(0, Number(data.y) || 0));
      pullY.setValue(y);
    } else if (data.type === 'PTR_START') {
      refresh();
    } else if (data.type === 'PTR_CANCEL' && !refreshing) {
      animatePullTo(0);
    }
  }, [refreshing, pullY, animatePullTo, refresh]);

  const onLoadStart = useCallback(() => {
    setLoading(true);
    vibrateOnce(); // 👈 สั่น "ตึ๊กเดียว"
  }, [vibrateOnce]);

  // โหลดเสร็จ → ปลดหัวค้าง + รีเซ็ตให้รอบหน้าสั่นได้อีก
  const onLoadEnd = useCallback(() => {
    setLoading(false);
    vibbedThisLoadRef.current = false;

    if (refreshing) {
      setRefreshing(false);
      animatePullTo(0, 180);
      try {
        // บอกเว็บให้ปล่อย body กลับที่เดิม
        webRef.current?.postMessage(JSON.stringify({ type: 'PTR_FINISH' }));
      } catch {}
    }
  }, [refreshing, animatePullTo]);

  const headerPad = useMemo(
    () => ({ paddingTop: insets.top + HEADER_H }),
    [insets.top]
  );

  const translateContent = pullY.interpolate({
    inputRange: [0, stickyHeight],
    outputRange: [0, stickyHeight],
    extrapolate: 'clamp',
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top, height: insets.top + HEADER_H }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => { if (canGoBack && webRef.current) webRef.current.goBack(); else navigation.goBack?.(); }}
            style={styles.iconBtn}
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>

          <View style={styles.titleBox}>
            <Text numberOfLines={1} style={styles.title}>{pageTitle || 'Thailand Ferry'}</Text>
            <Text numberOfLines={1} style={styles.subtitle}>
              {(() => { try { return new URL(currentUrl).hostname.replace(/^www\./,''); } catch { return ''; } })()}
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

      {/* หัวรีเฟรชค้าง */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.refreshHeader,
          { paddingTop: insets.top,
            height: pullY,
            opacity: pullY.interpolate({ inputRange:[0,10], outputRange:[0,1] }) }
        ]}
      >
        <View style={styles.refreshInner}>
          <ActivityIndicator />
          <Text style={styles.refreshText}>{refreshing ? 'กำลังรีเฟรช...' : 'ดึงเพื่อรีเฟรช'}</Text>
        </View>
      </Animated.View>

      {/* เนื้อหา WebView */}
      <Animated.View style={{ flex: 1, transform: [{ translateY: translateContent }] }}>
        <View style={[{ flex: 1 }, headerPad]}>
          <WebView
            ref={webRef}
            source={{ uri: initialUrl }}
            applicationNameForUserAgent={`ThailandFerryBooking/${Platform.OS}`}
            onLoadStart={onLoadStart}
            onLoadEnd={onLoadEnd}
            onNavigationStateChange={(nav) => {
              setCanGoBack(nav.canGoBack);
              if (nav?.title) setPageTitle(nav.title);
              if (nav?.url) setCurrentUrl(nav.url);
            }}

            // 🔐 anti-zoom + ptr script
            injectedJavaScriptBeforeContentLoaded={INJECTED_LOCK_ZOOM_BEFORE}
            injectedJavaScriptBeforeContentLoadedForMainFrameOnly={false}
            injectedJavaScript={INJECTED_AFTER}
            injectedJavaScriptForMainFrameOnly={false}

            // pull-to-refresh แบบ custom (ปิด native)
            pullToRefreshEnabled={false}
            onMessage={onMessage}

            // WebView options
            javaScriptEnabled
            javaScriptCanOpenWindowsAutomatically={false}
            domStorageEnabled
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            bounces
            setSupportMultipleWindows={false}
            allowFileAccess
            originWhitelist={['http://*', 'https://*', 'about:*', 'data:*']}
            cacheEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled

            // 🔒 ปิดการซูมฝั่ง native
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
      </Animated.View>
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
    zIndex: 30,
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

  refreshHeader: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    zIndex: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  refreshInner: {
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexDirection: 'row',
  },
  refreshText: {
    fontSize: 12,
    color: '#4B5563',
    marginLeft: 8,
  },
});
