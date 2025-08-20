// TheTragoWebViewScreen.js
import React, { useCallback, useRef, useState } from 'react';
import { View, ActivityIndicator, Platform, BackHandler, Alert, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

// ✅ allow-list เฉพาะ hostname
const ALLOWED_HOSTS = new Set([
  'thailandferrybooking.com',
  'www.thailandferrybooking.com',
  'kpaymentgateway.kasikornbank.com',
  'pay.omise.co',
  '3dsms.omise.co',
  'emvacs.2c2p.com',
  'mclient.alipay.com',
  'render.alipay.com',
  'openapi.alipay.com',
]);

const ALLOWED_ROOTS = new Set(['kasikornbank.com', 'alipay.com']);
const isAllowedByRoot = (h) => Array.from(ALLOWED_ROOTS).some(root => h === root || h.endsWith('.' + root));
const isAlipayHost = (hostname) => (!!hostname && hostname.toLowerCase().endsWith('.alipay.com')) || hostname === 'alipay.com';

const SCHEMES_TO_OPEN_EXTERNALLY = new Set(['alipays','alipay','alipayqr','alipaylite','weixin','line','kplus','promptpay','tel','mailto']);
const HEADER_H = 56;

/* ---------- lock zoom ก่อนโหลด ---------- */
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
      \`;
      document.head.appendChild(style);

      var lastTouchEnd = 0;
      document.addEventListener('touchend', function (e) {
        var now = Date.now();
        if (now - lastTouchEnd <= 300) e.preventDefault();
        lastTouchEnd = now;
      }, { passive:false });

      ['gesturestart','gesturechange','gestureend'].forEach(function(type){
        document.addEventListener(type, function(e){ e.preventDefault(); }, { passive:false });
      });

      document.addEventListener('wheel', function(e){ if (e.ctrlKey) e.preventDefault(); }, { passive:false });

      document.addEventListener('keydown', function(e){
        var k = e.key;
        if ((e.ctrlKey || e.metaKey) && (k === '+' || k === '-' || k === '=' || k === '0')) e.preventDefault();
      });

      if (window.visualViewport) {
        var resetViewport = function(){
          try {
            var m = document.querySelector('meta[name=viewport]');
            if (m) m.setAttribute('content','width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no');
          } catch(_){}
        };
        window.visualViewport.addEventListener('resize', resetViewport);
        window.visualViewport.addEventListener('scroll', resetViewport);
      }
    } catch(e){}
  })();
  true;
`;

/* ---------- กัน window.open โดดออก ---------- */
const INJECTED_JS = `
  (function(){
    try {
      const _open = window.open;
      window.open = function(url){ if (url) window.location.href = url; return null; };
    } catch(e){}
  })();
  true;
`;

/** ===== Pull-down with top icon (ไม่มี loader กลางจอ) ===== */
const ALLOW_PULL_DOWN_REFRESH = Platform.OS === 'ios'; // iOS: JS ยิงรีเฟรชเอง, Android: ใช้ native

const INJECTED_PULL_DOWN_HOLD = `
  (function(){
    try{
      var startY=0,startX=0,pulling=false,exceeded=false,holding=false,startAt=0;
      var THRESHOLD=120, VERT_RATIO=1.2, EDGE_TOL=2, MIN_DUR=200;
      var ALLOW_REFRESH=${ALLOW_PULL_DOWN_REFRESH ? 'true' : 'false'};

      function st(){ return (document.scrollingElement||document.documentElement).scrollTop||0; }

      function ensureHold(state){
        if(state && !holding){
          holding=true;
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage('{"type":"pullDownHoldStart"}');
        }else if(!state && holding){
          holding=false;
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage('{"type":"pullDownHoldCancel"}');
        }
      }

      window.addEventListener('touchstart',function(e){
        exceeded=false; startAt=Date.now();
        startY=e.touches[0].clientY; startX=e.touches[0].clientX;
        pulling = (st()<=EDGE_TOL);
        ensureHold(false);
      },{passive:true});

      window.addEventListener('touchmove',function(e){
        if(!pulling) return;
        var y=e.touches[0].clientY, x=e.touches[0].clientX, dy=y-startY, dx=x-startX;
        if(st()>EDGE_TOL){ pulling=false; exceeded=false; ensureHold(false); return; }
        exceeded=(dy>THRESHOLD)&&(Math.abs(dy)>=VERT_RATIO*Math.abs(dx));
        ensureHold(exceeded);
      },{passive:true});

      ['touchend','touchcancel'].forEach(function(ev){
        window.addEventListener(ev,function(){
          if(pulling && exceeded && st()<=EDGE_TOL && (Date.now()-startAt)>=MIN_DUR){
            if(ALLOW_REFRESH){
              window.ReactNativeWebView && window.ReactNativeWebView.postMessage('{"type":"pullRefresh"}');
            }
          }
          pulling=false; exceeded=false; ensureHold(false);
        },{passive:true});
      });
    }catch(_){}
  })();
  true;
`;

/* ---------- รวมสคริปต์หลังโหลด ---------- */
const injectedAfterLoad = [INJECTED_JS, INJECTED_PULL_DOWN_HOLD].join('\n');

export default function TheTragoWebViewScreen() {
  const initialUrl = 'https://thailandferrybooking.com/';
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const webRef = useRef(null);

  const [canGoBack, setCanGoBack] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState('Thailand Ferry');
  const [currentUrl, setCurrentUrl] = useState(initialUrl);

  // UI: เฉพาะด้านบน
  const [isPullHoldTop, setIsPullHoldTop] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Android: ธงบอกว่า native pull กำลังจะเริ่ม
  const pendingNativeRefresh = useRef(false);

  // คูลดาวน์ไม่ให้รีเฟรชถี่
  const lastRefreshAt = useRef(0);
  const COOL_MS = 1200;

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

  const handleIntentUrl = (url) => {
    const m = url.match(/intent:\/\/.*#Intent;.*?S\.browser_fallback_url=([^;]+);/);
    if (m && m[1]) {
      const fb = decodeURIComponent(m[1]);
      setTimeout(() => { Linking.openURL(fb).catch(() => Alert.alert('Cannot open link', fb)); }, 0);
      return;
    }
    setTimeout(() => { Linking.openURL(url).catch(() => Alert.alert('Cannot open link', url)); }, 0);
  };

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
      // บาง resource ภายใน (blob/data) อาจ parse ไม่ได้ → ปล่อยผ่าน
      return true;
    }
  }, []);

  const refresh = () => {
    const now = Date.now();
    if (loading) return;
    if (now - lastRefreshAt.current < COOL_MS) return;
    lastRefreshAt.current = now;
    setRefreshing(true);
    webRef.current?.reload();
  };

  const openInBrowser = () => Linking.openURL(currentUrl).catch(() => {});

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: insets.top + HEADER_H, marginBottom: insets.bottom + HEADER_H }}>
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

      {/* WEBVIEW */}
      <WebView
        ref={webRef}
        source={{ uri: initialUrl }}
        applicationNameForUserAgent={`ThailandFerryBooking/${Platform.OS}`}

        // ❌ ปิด loader กลางจอของ WebView
        startInLoadingState={false}
        renderLoading={() => null}

        onLoadStart={() => {
          setLoading(true);
          // Android: ถ้าเป็น pull-down native ให้สลับเป็น refreshing + haptic
          if (pendingNativeRefresh.current) {
            pendingNativeRefresh.current = false;
            setIsPullHoldTop(false);
            setRefreshing(true);
            try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
          }
        }}
        onLoadEnd={() => { setLoading(false); setRefreshing(false); }}

        onNavigationStateChange={(nav) => {
          setCanGoBack(nav.canGoBack);
          if (nav?.title) setPageTitle(nav.title);
          if (nav?.url) setCurrentUrl(nav.url);
        }}

        injectedJavaScriptBeforeContentLoaded={INJECTED_LOCK_ZOOM_BEFORE}
        injectedJavaScriptBeforeContentLoadedForMainFrameOnly={false}
        injectedJavaScript={injectedAfterLoad}
        injectedJavaScriptForMainFrameOnly={false}

        javaScriptEnabled
        javaScriptCanOpenWindowsAutomatically={false}
        domStorageEnabled
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        pullToRefreshEnabled={Platform.OS === 'android'} // Android: ใช้ native
        bounces                                          // iOS: ต้องเปิดเพื่อ overscroll ด้านบน
        setSupportMultipleWindows={false}
        allowFileAccess
        originWhitelist={['http://*', 'https://*', 'about:*', 'data:*']}
        cacheEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled

        // ปิดซูมฝั่ง native
        setBuiltInZoomControls={false}
        setDisplayZoomControls={false}
        textZoom={100}
        scalesPageToFit={false}

        // รับสัญญาณจาก JS
        onMessage={async (e) => {
          let type = e.nativeEvent?.data;
          try { const payload = JSON.parse(type || '{}'); type = payload?.type || type; } catch {}

          if (type === 'pullDownHoldStart') {
            setIsPullHoldTop(true);
            if (Platform.OS === 'android') pendingNativeRefresh.current = true; // รอ native เริ่มโหลด
            try { await Haptics.selectionAsync(); } catch {} // สั่นนิดตอนเริ่มค้าง
          }
          else if (type === 'pullDownHoldCancel') {
            setIsPullHoldTop(false);
            if (Platform.OS === 'android') pendingNativeRefresh.current = false;
          }
          else if (type === 'pullRefresh') {
            // iOS: ปล่อยแล้วรีเฟรช
            setIsPullHoldTop(false);
            try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
            refresh();
          }
        }}

        onError={(e) => {
          const msg = e?.nativeEvent?.description || 'Unknown error';
          Alert.alert('Load error', msg);
        }}
        style={{ flex: 1 }}
      />

      {/* ✅ Overlay เฉพาะด้านบน (ไม่มีตัวไหนกลางจออีกแล้ว) */}
      {(isPullHoldTop || refreshing) && (
        <View pointerEvents="none" style={[styles.holdOverlayTop, { top: insets.top + HEADER_H + 8 }]}>
          <View style={styles.holdBox}>
            {refreshing
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="refresh" size={16} color="#fff" />}
            <Text style={styles.holdText}>{refreshing ? 'Refreshing…' : 'Release to refresh'}</Text>
          </View>
        </View>
      )}
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  iconBtn: { padding: 8, borderRadius: 8 },
  titleBox: { flex: 1, marginHorizontal: 6 },
  title: { fontSize: 16, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  rightBox: { flexDirection: 'row', alignItems: 'center' },

  // กล่อง overlay ด้านบนเท่านั้น
  holdBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17,24,39,0.9)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  holdText: { color: '#fff', fontSize: 12, fontWeight: '600', marginLeft: 8 },

  holdOverlayTop: {
    position: 'absolute',
    left: 0, right: 0,
    alignItems: 'center',
  },
});
