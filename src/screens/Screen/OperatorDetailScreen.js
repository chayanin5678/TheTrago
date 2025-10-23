import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { Modal } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useLanguage } from './LanguageContext';
import { useCustomer } from './CustomerContext';
import { normalizeImageUri } from '../../utils/imageUri';
import ipAddress from '../../config/ipconfig';
import { TextInput } from 'react-native-gesture-handler';
import * as SecureStore from 'expo-secure-store';

const OperatorDetailScreen = ({ route, navigation }) => {
  const { operator } = route.params;
  const { t, selectedLanguage } = useLanguage();
  const { customerData, updateCustomerData } = useCustomer();
  const [operatorDetail, setOperatorDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timetables, setTimetables] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [currentMemberId, setCurrentMemberId] = useState(null);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewImages, setNewReviewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [userTokenState, setUserTokenState] = useState(null);
  const scrollViewRef = useRef(null);
  const reviewsLayoutY = useRef(0);


  useEffect(() => {
    setOperatorDetail(operator);
    // fetch reviews will run after operatorDetail/company id resolved
    const fetchTimetables = async () => {
      try {
        let companyId = operator.md_company_id;
        if (!companyId || !/^\d+$/.test(String(companyId))) {
          if (operator.raw?.md_company_id && /^\d+$/.test(String(operator.raw.md_company_id))) companyId = operator.raw.md_company_id;
          else if (operator.id && /^\d+$/.test(String(operator.id))) companyId = operator.id;
        }
        const res = await fetch(`${ipAddress}/companydetail/${companyId}`);
        if (!res.ok) { setTimetables([]); setIsLoading(false); return; }
        const txt = (await res.text()).trim();
        if (txt.startsWith('<')) { setTimetables([]); setIsLoading(false); return; }
        let data; try { data = JSON.parse(txt); } catch { setTimetables([]); setIsLoading(false); return; }
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        setTimetables(list || []);
        if (list?.[0]) {
          const first = list[0];
          setOperatorDetail(prev => ({
            ...prev,
            md_company_id: first.md_company_id || prev?.md_company_id || operator.md_company_id,
            md_company_nameeng: first.md_company_nameeng || prev?.md_company_nameeng || operator.md_company_nameeng,
            md_company_namethai: first.md_company_namethai || prev?.md_company_namethai || operator.md_company_namethai,
            md_company_picname: first.md_company_picname || prev?.md_company_picname || operator.md_company_picname,
            md_company_about: first.md_company_about || prev?.md_company_about || operator.md_company_about,
          }));
        }
      } catch { setTimetables([]); }
      finally { setIsLoading(false); }
    };
    fetchTimetables();
    // call fetchReviews once (defined below)
    fetchReviews();
  }, []);

  // fetch reviews helper (moved out so it can be called after submitting a review)
  const fetchReviews = async (companyIdParam) => {
    try {
      const companyId = companyIdParam || operatorDetail?.md_company_id || operator?.md_company_id || operator?.id || (operator?.raw && operator.raw.md_company_id) || null;
      if (!companyId) return;
      const res = await fetch(`${ipAddress}/reviews/${companyId}`);
      if (!res.ok) return;
      const txt = await res.text().catch(() => null);
      if (!txt) return;
      if (txt.trim().startsWith('<')) return; // HTML error
      let j = null;
      try { j = JSON.parse(txt); } catch (e) { j = null; }
      const list = Array.isArray(j) ? j : (Array.isArray(j?.data) ? j.data : []);
      // Normalize each review: build avatar and full image URLs
      const normalized = (list || []).map(r => {
        const avatarSrc = r.member_photo || r.md_review_photo || r.avatar || null;
        const avatar = normalizeImageUri(avatarSrc);
        // md_review_images may be array of filenames or JSON-string
        let imgs = [];
        if (Array.isArray(r.md_review_images)) imgs = r.md_review_images;
        else if (typeof r.md_review_images === 'string') {
          try { const p = JSON.parse(r.md_review_images); if (Array.isArray(p)) imgs = p; else imgs = [r.md_review_images]; } catch { imgs = r.md_review_images ? [r.md_review_images] : []; }
        }
        const images = (imgs || []).map(u => normalizeImageUri(u) || u).filter(Boolean);
        // Normalize likes: prefer server-provided likesArray / likesCount / liked when available
        let likesArray = [];
        // server may already return likesArray
        if (Array.isArray(r.likesArray) && r.likesArray.length) likesArray = r.likesArray.map(String);
        // older fields: likes (array) or md_review_likes (array)
        else if (Array.isArray(r.likes) && r.likes.length) likesArray = r.likes.map(String);
        else if (Array.isArray(r.md_review_likes) && r.md_review_likes.length) likesArray = r.md_review_likes.map(String);
        // singular md_review_like string (e.g. '["1715"]') or json/string
        else if (typeof r.md_review_like === 'string' && r.md_review_like.trim()) {
          try { const p = JSON.parse(r.md_review_like); if (Array.isArray(p)) likesArray = p.map(String); else likesArray = [String(r.md_review_like)]; } catch { likesArray = String(r.md_review_like).split(',').map(s=>s.trim()).filter(Boolean); }
        } else if (typeof r.md_review_likes === 'string' && r.md_review_likes.trim()) {
          try { const p = JSON.parse(r.md_review_likes); if (Array.isArray(p)) likesArray = p.map(String); else likesArray = String(r.md_review_likes).split(',').map(s=>s.trim()).filter(Boolean); } catch { likesArray = String(r.md_review_likes).split(',').map(s=>s.trim()).filter(Boolean); }
        } else if (typeof r.likes === 'string' && r.likes.trim()) {
          try { const p = JSON.parse(r.likes); if (Array.isArray(p)) likesArray = p.map(String); else likesArray = String(r.likes).split(',').map(s=>s.trim()).filter(Boolean); } catch { likesArray = String(r.likes).split(',').map(s=>s.trim()).filter(Boolean); }
        }

        // If server explicitly reported liked flag, respect it; otherwise compute from likesArray
        const liked = (typeof r.liked === 'boolean') ? r.liked : (currentMemberId ? likesArray.includes(String(currentMemberId)) : false);

        return {
          ...r,
          author: r.md_review_name || r.member_name || r.member_fname || r.author || (r.md_review_memberid ? String(r.md_review_memberid) : null),
          rating: Number(r.md_review_rating || r.md_review_star || r.md_review_star || r.md_review_stars || r.md_review_point || r.md_review_score || 0),
          text: r.md_review_comment || r.md_review_text || r.md_review || r.md_review_body || r.md_review_note || r.md_review_text || '',
          avatar,
          images,
          likesArray,
          liked,
        };
      });
      setReviews(normalized);
    } catch (e) {
      // ignore
    }
  };

  const formatDuration = (timeStr) => {
    if (!timeStr) return '';
    const [hStr, mStr] = String(timeStr).split(':');
    const h = parseInt(hStr || '0', 10), m = parseInt(mStr || '0', 10);
    if (h > 0 && m > 0) return `${h} hr ${m} min`;
    if (h > 0) return `${h} hr${h > 1 ? 's' : ''}`;
    return `${m} min`;
  };

  const companyName = selectedLanguage === 'th'
    ? (operatorDetail?.md_company_namethai || operatorDetail?.md_company_nameeng || operator.md_company_namethai || operator.md_company_nameeng)
    : (operatorDetail?.md_company_nameeng || operatorDetail?.md_company_namethai || operator.md_company_nameeng || operator.md_company_namethai);

  // Compute a display rating for the company from reviews or operator fields
  const companyDisplayRating = React.useMemo(() => {
    try {
      const vals = (reviews || []).map(r => Number(r.rating || r.stars || 0)).filter(v => !isNaN(v) && v > 0);
      let avg = null;
      if (vals.length > 0) avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      if (avg === null) {
        const opVal = Number(operatorDetail?.md_company_rating || operator?.md_company_rating || operator?.md_company_stars || 0);
        if (!isNaN(opVal) && opVal > 0) avg = opVal;
      }
      return avg !== null ? (Math.round(avg * 10) / 10) : null;
    } catch (e) { return null; }
  }, [reviews, operatorDetail, operator]);

  // Small star component that supports fractional fill (0..1)
  const FractionalStar = ({ fraction = 1, size = 16, color = '#FFD700' }) => {
    const f = Math.max(0, Math.min(1, Number(fraction) || 0));
    // full
    if (f >= 1) return <Ionicons name="star" size={size} color={color} style={{ marginLeft: 4 }} />;
    // empty
    if (f <= 0) return <Ionicons name="star-outline" size={size} color={color} style={{ marginLeft: 4 }} />;
    // partial: render clipped filled star beneath an outline
    return (
      <View style={{ width: size, height: size, marginLeft: 4 }}>
        {/* clipped filled star */}
        <View style={{ position: 'absolute', left: 0, top: 0, overflow: 'hidden', width: Math.round(size * f), height: size }} pointerEvents="none">
          <Ionicons name="star" size={size} color={color} />
        </View>
        {/* outline on top so edges remain visible */}
        <Ionicons name="star-outline" size={size} color={color} style={{ position: 'absolute', left: 0, top: 0 }} />
      </View>
    );
  };

  // Prefer the detailed (fetched) operatorDetail values where available, otherwise fall back to the route operator param
  const companyLocation = operatorDetail?.md_company_countries || operator.md_company_countries || t('vietnamLocation');

  const groupedTimetables = React.useMemo(() => {
    if (!Array.isArray(timetables) || timetables.length === 0) return {};
    const groups = {};
    timetables.forEach(tt => {
      const locationName = selectedLanguage === 'th'
        ? (tt.start_locationthai || tt.start_locationeng || tt.md_timetable_startid)
        : (tt.start_locationeng || tt.start_locationthai || tt.md_timetable_startid);
      const key = locationName || tt.md_location_id || tt.md_timetable_startid;
      if (!groups[key]) groups[key] = { meta: tt, items: [] };
      groups[key].items.push(tt);
      groups[key].meta.displayName = locationName;
    });
    return groups;
  }, [timetables, selectedLanguage]);

  useEffect(() => {
    const keys = Object.keys(groupedTimetables || {});
    if (keys.length && Object.keys(expandedGroups).length === 0) {
      const init = {}; keys.forEach(k => (init[k] = true)); setExpandedGroups(init);
    }
  }, [groupedTimetables]);

  const toggleGroup = (key) => setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));

  const getDest = (item, lang) => {
    const nameTh = item.end_locationthai || item.to_locationthai || item.arrive_locationthai || item.destination_thai;
    const nameEn = item.end_locationeng || item.to_locationeng || item.arrive_locationeng || item.destination_eng;
    const countryTh = item.end_countriesthai || item.to_countriesthai || item.arrive_countriesthai;
    const countryEn = item.end_countrieseng || item.to_countrieseng || item.arrive_countrieseng;
    return {
      name: lang === 'th' ? (nameTh || nameEn) : (nameEn || nameTh),
      country: lang === 'th' ? (countryTh || countryEn || 'ประเทศไทย') : (countryEn || countryTh || 'Thailand'),
    };
  };

  const getStart = (item, lang) => {
    const nameTh = item.start_locationthai || item.from_locationthai || item.depart_locationthai || item.origin_thai;
    const nameEn = item.start_locationeng || item.from_locationeng || item.depart_locationeng || item.origin_eng;
    const countryTh = item.start_countriesthai || item.from_countriesthai || item.depart_countriesthai;
    const countryEn = item.start_countrieseng || item.from_countrieseng || item.depart_countrieseng;
    return {
      name: lang === 'th' ? (nameTh || nameEn) : (nameEn || nameTh),
      country: lang === 'th' ? (countryTh || countryEn || 'ประเทศไทย') : (countryEn || countryTh || 'Thailand'),
    };
  };

  // Format review text for display: show localized 'no comment' when empty or whitespace
  const formatReviewText = (r) => {
    try {
      const raw = r?.text ?? r?.comment ?? r?.md_review_text ?? r?.md_review_comment ?? '';
      const str = String(raw ?? '').trim();
      if (!str || str.length === 0) return (t('noComment') || (selectedLanguage === 'th' ? 'ไม่มีความคิดเห็น' : 'No comment'));
      return str;
    } catch (e) {
      return (t('noComment') || (selectedLanguage === 'th' ? 'ไม่มีความคิดเห็น' : 'No comment'));
    }
  };

  // Normalize company 'about' field which can be either:
  // - an object with language keys { th: '...', en: '...' }
  // - or a string that may contain escaped JSON (with \" etc)
  const getCompanyAboutText = (detailOrAbout) => {
    if (!detailOrAbout && detailOrAbout !== '') return null;

    // Accept either a detail object ({ md_company_about: ... }) or a direct about string
    let about = null;
    if (typeof detailOrAbout === 'string') {
      about = detailOrAbout;
    } else if (typeof detailOrAbout === 'object') {
      // If object contains the field directly
      if (detailOrAbout.md_company_about !== undefined && detailOrAbout.md_company_about !== null) {
        about = detailOrAbout.md_company_about;
      } else {
        // Maybe the passed object is itself the language object
        about = detailOrAbout[selectedLanguage] || detailOrAbout.en || detailOrAbout.th || Object.values(detailOrAbout)[0] || null;
      }
    }

    if (about === null || about === undefined) return null;

    // If it's an object with language keys (case where about is an object)
    if (typeof about === 'object') {
      about = about[selectedLanguage] || about.en || about.th || Object.values(about)[0] || null;
    }

    if (about === null || about === undefined) return null;

    // Coerce to string
    about = String(about);

    // If the string looks like escaped JSON (double-encoded), attempt iterative parsing
    const tryParseString = (s) => {
      try {
        const parsed = JSON.parse(s);
        return parsed;
      } catch (e) {
        return null;
      }
    };

    // Try one-level parse
    let parsed = tryParseString(about);
    if (parsed !== null) {
      if (typeof parsed === 'string') about = parsed;
      else if (typeof parsed === 'object') about = parsed[selectedLanguage] || parsed.en || parsed.th || Object.values(parsed)[0] || JSON.stringify(parsed);
    }

    // Unescape common sequences left from server encoding
    about = about.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');

    // If still wrapped in quotes, try parse once more
    if (about.startsWith('"') && about.endsWith('"')) {
      const p = tryParseString(about);
      if (typeof p === 'string') about = p;
    }

    // Final trim
    return about.trim();
  };

  // Try to get 'about' from the detailed fetch first, otherwise fallback to the initial operator param
  const companyAbout = getCompanyAboutText(operatorDetail) || getCompanyAboutText(operator) || null;

  // Request permission for ImagePicker on mount (best-effort)
  useEffect(() => {
    (async () => {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        // ignore result; if denied, picker will fail gracefully
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  // check auth token on mount and when screen gains focus
  useEffect(() => {
    let mounted = true;
    const checkToken = async () => {
      try {
        const t = await SecureStore.getItemAsync('userToken');
        if (mounted) setUserTokenState(t);
      } catch (e) { if (mounted) setUserTokenState(null); }
    };
    checkToken();
    const unsub = navigation.addListener && navigation.addListener('focus', checkToken);
    return () => { mounted = false; if (unsub && typeof unsub === 'function') unsub(); };
  }, [navigation]);

  // load current member id if available (so we can detect liked reviews)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) return;
        const resp = await fetch(`${ipAddress}/profile`, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } });
        if (!resp.ok) return;
        const j = await resp.json().catch(() => null);
        if (j && Array.isArray(j.data) && j.data[0]) {
          const u = j.data[0];
          if (mounted) setCurrentMemberId(u.md_member_id || u.id || null);
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  // If currentMemberId becomes available after reviews were loaded, recompute liked flags
  useEffect(() => {
    if (!currentMemberId) return;
    setReviews(prev => (prev || []).map(r => {
      try {
        const likes = Array.isArray(r.likesArray) ? r.likesArray : [];
        const isLiked = likes.includes(String(currentMemberId));
        return { ...r, liked: isLiked };
      } catch (e) { return r; }
    }));
  }, [currentMemberId]);

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') return;
      const res = await ImagePicker.launchCameraAsync({ quality: 0.6, allowsEditing: true });
      // support both legacy and new result shapes
      const canceled = res?.canceled ?? res?.cancelled ?? false;
      const uri = res?.assets?.[0]?.uri ?? res?.uri ?? null;
      if (!canceled && uri) setNewReviewImages(prev => [...prev, uri]);
    } catch (e) { /* ignore */ }
  };

  const pickImageFromLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo library access in your device settings');
        return;
      }
  // call without mediaTypes for broader compatibility across SDK versions
  // Note: allowsEditing is not supported when allowsMultipleSelection is true — disable editing to avoid warning
  const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.6, allowsEditing: false, allowsMultipleSelection: true });
      const canceled = res?.canceled ?? res?.cancelled ?? false;
      if (!canceled) {
        const assets = res?.assets ?? (res?.uri ? [{ uri: res.uri }] : []);
        const uris = assets.map(a => a.uri).filter(Boolean);
        if (uris.length) setNewReviewImages(prev => [...prev, ...uris]);
      }
    } catch (e) { /* ignore */ }
  };

  // Toggle like state for a review at given index (optimistic + persist)
  const toggleLike = async (index) => {
    try {
      // Ensure user logged in
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) { navigation.navigate('Login'); return; }

      const target = reviews[index];
      if (!target) return;

      const reviewId = target.md_review_id || target.id || target.review_id || null;
      const memberId = currentMemberId || null;

      // compute optimistic new likesArray and liked flag
      const prevLikes = Array.isArray(target.likesArray) ? [...target.likesArray] : [];
      const isLiked = !!target.liked;
      let newLikes = [];
      if (isLiked) {
        newLikes = prevLikes.filter(x => String(x) !== String(memberId));
      } else {
        newLikes = [...prevLikes, String(memberId)];
      }

      // optimistic UI update
      setReviews(prev => prev.map((r, i) => {
        if (i !== index) return r;
        return { ...r, liked: !isLiked, likesArray: newLikes };
      }));

      // Attempt to persist to backend. We'll try two paths depending on API support:
      // - POST `${ipAddress}/review-like` with { review_id, member_id, action: 'add'|'remove' }
      // - If reviewId missing, fall back to toggling via `${ipAddress}/review/${reviewId}/like`
      const action = isLiked ? 'remove' : 'add';
      // Call the canonical API: /AppApi/review-like (expects { action, member_id, review_id })
      try {
        const body = { action, member_id: String(memberId), review_id: String(reviewId) };
        const r = await fetch(`${ipAddress}/review-like`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const j = await (r ? r.json().catch(() => null) : null);
        if (r && r.ok && j && (j.status === 'success' || j.success)) {
          // server returned likesArray or likesCount
          const serverLikes = Array.isArray(j.likesArray) ? j.likesArray.map(String) : (Array.isArray(j.likes) ? j.likes.map(String) : []);
          const finalLikes = serverLikes.length ? serverLikes : (Array.isArray(j.likesArray) ? j.likesArray.map(String) : []);
          const newLiked = String(memberId) ? finalLikes.includes(String(memberId)) : false;
          setReviews(prev => prev.map((it, idx) => (idx === index ? ({ ...it, likesArray: finalLikes, liked: newLiked }) : it)));
        } else {
          // revert optimistic update on failure
          setReviews(prev => prev.map((r, i) => {
            if (i !== index) return r;
            return { ...r, liked: isLiked, likesArray: prevLikes };
          }));
        }
      } catch (e) {
        // network/error -> revert optimistic update
        setReviews(prev => prev.map((r, i) => {
          if (i !== index) return r;
          return { ...r, liked: isLiked, likesArray: prevLikes };
        }));
      }
    } catch (e) {
      // ignore
    }
  };

  // Submit review handler: fetch current member (like Dashboard/HomeScreen) then include member data
  const handleSubmitReview = async () => {
    const trimmed = (newReviewText || '').trim();
    if (!trimmed && (!newReviewImages || newReviewImages.length === 0) && (!newRating || Number(newRating) <= 0)) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Default member info
    let memberId = 0;
    let memberName = t('you') || 'You';
    let memberEmail = '';
    let memberAvatar = null;
    let token = null;

    try {
      token = await SecureStore.getItemAsync('userToken');
      if (token) {
        const resp = await fetch(`${ipAddress}/profile`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data && Array.isArray(data.data) && data.data[0]) {
            const u = data.data[0];
            memberId = u.md_member_id || memberId;
            memberName = (u.md_member_fname && u.md_member_lname) ? `${u.md_member_fname} ${u.md_member_lname}` : (u.md_member_fname || u.md_member_lname || memberName);
            memberEmail = u.md_member_email || memberEmail;
            // member photo: try to build a public URL like other screens use
            if (u.md_member_photo) {
              const p = u.md_member_photo;
              // follow AccountScreen behavior: prefer absolute URL, otherwise build full URL
              if (p && p.startsWith && p.startsWith('http')) memberAvatar = p;
              else if (p) memberAvatar = p.startsWith('/') ? `https://www.thetrago.com${p}` : (`https://www.thetrago.com/${p}`);
            }
          }
        }
      }
    } catch (e) {
      // ignore and proceed with defaults
    }

    // create temp id so we can replace images after upload
    const tempId = `temp-${Date.now()}`;
    const nr = {
      tempId,
      author: memberName,
      rating: newRating || 0,
      text: trimmed,
      images: newReviewImages && newReviewImages.length ? newReviewImages : [],
      likes: 0,
      liked: false,
      md_review_memberid: memberId,
      md_review_name: memberName,
      md_review_email: memberEmail,
      avatar: memberAvatar,
    };

    // local preview immediately
    setReviews(prev => [nr, ...prev]);
    setNewReviewText('');
    setNewRating(5);
    setNewReviewImages([]);

    // If there are images, upload them to server and then update the preview item with returned URLs
    let uploadedUrls = [];
    let uploadedFilenames = [];
    if (nr.images && nr.images.length > 0) {
      try {
        for (const uri of nr.images) {
          try {
            const localFilename = uri.split('/').pop();
            const match = /\.([0-9a-z]+)(?:[?#]|$)/i.exec(localFilename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';
            const form = new FormData();
            form.append('file', { uri, name: localFilename, type });

            // Use the review upload endpoint (server provides /upload-review)
            const resp = await fetch(`${ipAddress}/upload-review`, {
              method: 'POST',
              headers: {
                // Let fetch set Content-Type with boundary
              },
              body: form,
            });

            // collect response text for better debug information
            const respText = await resp.text().catch(() => null);
            if (!resp.ok) {
              console.warn('Image upload failed for', uri, resp.status, respText);
              // fallback to local uri and local filename
              uploadedUrls.push(uri);
              uploadedFilenames.push(localFilename);
              continue;
            }

            // Try to parse JSON response
            let j = null;
            try { j = respText ? JSON.parse(respText) : null; } catch (e) { j = null; }
            // log successful upload response for debugging
            console.log('Upload response for', localFilename, resp.status, j || respText);
            let publicUrl = null;
            let filenameFromResponse = null;
            if (j) {
              if (j.data && Array.isArray(j.data) && j.data[0]) {
                const f = j.data[0];
                publicUrl = f.url || f.path || f.name || f.filename || null;
                filenameFromResponse = f.filename || f.name || f.file || null;
                if (!filenameFromResponse && f.path) filenameFromResponse = String(f.path).split('/').pop();
              } else if (j.url) {
                publicUrl = j.url;
              } else if (j.path) {
                publicUrl = j.path;
                filenameFromResponse = String(j.path).split('/').pop();
              } else if (j.filename) {
                filenameFromResponse = j.filename;
                publicUrl = `${ipAddress}/Api/uploads/${j.filename}`;
              }
            }
            if (!publicUrl) publicUrl = uri; // fallback to local uri
            // normalize public URL for display (map filename/path to public host URL)
            try { publicUrl = normalizeImageUri(publicUrl) || publicUrl; } catch (e) { /* ignore */ }
            if (!filenameFromResponse) filenameFromResponse = localFilename;

            uploadedUrls.push(publicUrl);
            uploadedFilenames.push(filenameFromResponse);
          } catch (e) {
            console.warn('Upload error for image', e);
            const lf = uri.split('/').pop();
            uploadedUrls.push(uri);
            uploadedFilenames.push(lf);
          }
        }
        // replace temp review images with uploadedUrls (these are public urls used by the UI)
        setReviews(prev => prev.map(r => (r.tempId === tempId ? ({ ...r, images: uploadedUrls, tempId: undefined }) : r)));
      } catch (e) {
        console.warn('Error uploading review images', e);
      }
    }

    // After image upload (or if no images), send review to backend so it persists
    try {
      const companyId = operatorDetail?.md_company_id || operator?.md_company_id || operator?.id || null;
      const payload = {
        md_company_id: companyId,
        md_review_memberid: memberId,
        md_review_name: memberName,
        md_review_email: memberEmail,
        // server expects md_review_text to be non-null; send a single space when empty
        md_review_comment: (trimmed && trimmed.length) ? trimmed : ' ',
        md_review_rating: Number(newRating) || 0,
        // send only filenames to backend (prefer server-returned filenames, fallback to local filenames)
        md_review_images: (uploadedFilenames && uploadedFilenames.length) ? uploadedFilenames : ((nr.images || []).map(u => String(u).split('/').pop())),
      };

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // NOTE: backend endpoint for creating reviews is not present elsewhere in the codebase.
      // We'll attempt a reasonable path: `${ipAddress}/review` (POST). If your backend uses a
      // different path, replace it with the correct endpoint.
      // debug: log payload and uploads
      console.log('About to POST review. uploadedFilenames:', uploadedFilenames, 'uploadedUrls:', uploadedUrls);
      // debug: log payload
      console.log('Posting review payload', payload);
      const resp = await fetch(`${ipAddress}/review`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        // keep local preview but notify user
        let txt = '';
        try { txt = await resp.text(); } catch {}
        console.warn('Review POST failed', resp.status, txt);
        Alert.alert(t('submitReview') || 'Submit', t('reviewSubmitFailed') || `Failed to submit review (${resp.status})` + (txt ? `: ${txt}` : ''));
      } else {
        // success: you may want to replace the temp entry with server-side data
        try {
          const j = await resp.json().catch(() => null);
          if (j) {
            // If server returns the saved review, normalize images and avatar then merge it into local list
            try {
              const serverImagesRaw = j.md_review_images || j.images || j.md_review_image || [];
              let serverImages = [];
              if (Array.isArray(serverImagesRaw)) serverImages = serverImagesRaw;
              else if (typeof serverImagesRaw === 'string') {
                try { const p = JSON.parse(serverImagesRaw); if (Array.isArray(p)) serverImages = p; else serverImages = [serverImagesRaw]; } catch { serverImages = serverImagesRaw ? [serverImagesRaw] : []; }
              }
              const normalizedServerImages = (serverImages || []).map(u => normalizeImageUri(u) || u).filter(Boolean);
              const avatarSrc = j.member_photo || j.md_review_photo || j.avatar || null;
              const normalizedAvatar = normalizeImageUri(avatarSrc) || avatarSrc || null;
              // If server returned no images, keep uploadedUrls (fallback) so UI doesn't lose images
              // Verify which normalizedServerImages are actually accessible (quick HEAD with timeout).
              const checkImageAccessible = async (url) => {
                if (!url) return false;
                try {
                  const controller = new AbortController();
                  const timeout = setTimeout(() => controller.abort(), 3000);
                  const r = await fetch(url, { method: 'HEAD', signal: controller.signal }).catch(() => null);
                  clearTimeout(timeout);
                  return !!(r && r.ok);
                } catch (e) { return false; }
              };

              let finalImages = [];
              if (normalizedServerImages && normalizedServerImages.length) {
                // check accessibility in parallel (limit to first 8 to avoid heavy checks)
                const toCheck = normalizedServerImages.slice(0, 8);
                const checks = await Promise.all(toCheck.map(u => checkImageAccessible(u)));
                const accessible = toCheck.filter((u, idx) => checks[idx]);
                if (accessible && accessible.length) finalImages = accessible;
              }
              // If none of server images are accessible, fallback to uploadedUrls
              if (!finalImages || finalImages.length === 0) {
                finalImages = (uploadedUrls && uploadedUrls.length) ? uploadedUrls : [];
              }
              const serverReview = { ...j, images: finalImages, avatar: normalizedAvatar };
              console.log('Merging server review for tempId', tempId, { finalImages, normalizedServerImages, uploadedUrls });
              setReviews(prev => prev.map(r => (r.tempId === tempId ? ({ ...r, ...serverReview, tempId: undefined }) : r)));
            } catch (e) {
              // fallback merge
              setReviews(prev => prev.map(r => (r.tempId === tempId ? ({ ...r, ...j, tempId: undefined }) : r)));
            }
            }
            // Refresh reviews from server to ensure we have server-side persisted images
            try { fetchReviews(); } catch (e) { /* ignore */ }
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      console.warn('Error posting review', e);
      Alert.alert(t('submitReview') || 'Submit', t('reviewSubmitFailed') || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD501E" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">{t('operatorDetail') || 'Operator'}</Text>
      </View>

  <ScrollView ref={scrollViewRef} style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Top */}
        <View style={styles.topCardWrapper}>
          <View style={styles.logoCardNew}>
            {(() => {
              const uri = normalizeImageUri(operatorDetail?.md_company_picname || operator.md_company_picname);
              if (uri) return <Image source={{ uri }} style={styles.operatorLogoNew} resizeMode="contain" />;
              return <View style={[styles.operatorLogoNew, { alignItems: 'center', justifyContent: 'center' }]}><MaterialIcons name="business" size={36} color="#D1D5DB" /></View>;
            })()}
          </View>
          <View style={styles.titleGroup}>
            <Text style={styles.operatorNameNew}>{companyName}</Text>
            <View style={styles.companyStarsRow}>
              {(() => {
                const v = companyDisplayRating !== null ? Number(companyDisplayRating) : 0;
                // show 5 stars, each may be full/partial/empty
                return [0,1,2,3,4].map(i => {
                  const starIndex = i + 1;
                  const remaining = Math.max(0, Math.min(1, v - i)); // 0..1 how much fill for this star
                  return <FractionalStar key={`cstar-${starIndex}`} fraction={remaining} size={16} color="#FFD700" />;
                });
              })()}
              <Text style={styles.companyRatingText}>{companyDisplayRating !== null ? String(companyDisplayRating) : (t('noReviews') || (selectedLanguage === 'th' ? 'ยังไม่มีรีวิว' : 'No reviews'))}</Text>
            </View>

            {/* View reviews CTA */}
            <TouchableOpacity style={styles.viewReviewsButton} onPress={() => {
              try {
                if (scrollViewRef.current && reviewsLayoutY.current) {
                  scrollViewRef.current.scrollTo({ y: reviewsLayoutY.current - hp('3%'), animated: true });
                }
              } catch (e) { /* ignore */ }
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.viewReviewsText}>{t('viewReviews') || (selectedLanguage === 'th' ? 'ดูรีวิว' : 'View reviews')}</Text>
                <Ionicons name="chevron-down" size={16} color="#FD501E" style={{ marginLeft: 6 }} />
              </View>
            </TouchableOpacity>
            <View style={styles.locationSelector} accessible accessibilityRole="text">
              <MaterialIcons name="place" size={18} color="#FD501E" />
              <Text style={styles.locationTextNew}>{companyLocation}</Text>
            </View>
          </View>
        </View>

        {/* Company description only */}
        {companyAbout && (
          <View style={styles.companyDescriptionBlock}>
            <Text style={styles.companyDescriptionText}>{companyAbout}</Text>
          </View>
        )}

        {/* Reviews block moved to bottom */}

        {/* กลุ่มเส้นทาง */}
        <View style={styles.routesContainer}>
          <Text style={styles.sectionTitle}>{t('routes') || 'routes'}</Text>

          {timetables && timetables.length > 0 ? (
            Object.keys(groupedTimetables).map((gk, idx) => {
              const group = groupedTimetables[gk];
              const expanded = expandedGroups[gk] ?? true;
              return (
                <View key={`group-${gk}-${idx}`} style={styles.routeGroupCard}>
                  <View style={styles.routeGroupInner}>
                    <TouchableOpacity style={styles.locationHeader} onPress={() => toggleGroup(gk)} activeOpacity={0.8}>
                      <MaterialIcons name="place" size={20} color="#FD501E" />
                      <Text style={styles.locationHeaderText}>{group.meta.displayName}</Text>
                      <Text style={styles.groupToggleText}>{expanded ? '−' : '+'}</Text>
                    </TouchableOpacity>

                    {expanded && group.items.map((item, itemIdx) => {
                      const showGetPrice = !!item.md_timetable_id;
                      const dest = getDest(item, selectedLanguage);
                      const start = getStart(item, selectedLanguage);
                      const startName = start.name;
                      const startCountry = start.country;

                      return (
                        <View key={item.md_timetable_id || `${gk}-${itemIdx}`} style={styles.routeCardDual}>
                          {/* แถว: ซ้าย / เรือ / ขวา */}
                          <View style={styles.routeRowDual}>
                            <View style={styles.dualLeft}>
                              <View>
                                <Text style={styles.routeLocationTextSingle} numberOfLines={1} ellipsizeMode="tail">{startName}</Text>
                                <Text style={styles.routeCountryText} numberOfLines={1} ellipsizeMode="tail">{startCountry}</Text>
                              </View>
                            </View>
                            <View style={styles.dualCenter}>
                              <View style={styles.boatIconCircle}><Ionicons name="boat" size={18} color="#FFFFFF" /></View>
                            </View>
                            <View style={styles.dualRight}>
                              <View>
                                <Text style={[styles.routeLocationTextSingle, { textAlign: 'right' }]} numberOfLines={1} ellipsizeMode="tail">{dest.name}</Text>
                                <Text style={[styles.routeCountryText, { textAlign: 'right' }]} numberOfLines={1} ellipsizeMode="tail">{dest.country}</Text>
                              </View>
                            </View>
                          </View>

                          {/* เส้นคั่น */}
                          <View style={styles.centerDivider} />

                          {/* ปุ่ม Get Price เต็มแถว ใต้เส้น (ตามภาพ) */}
                          {showGetPrice && (
                            <TouchableOpacity
                              style={styles.getPriceBottom}
                              onPress={() => {
                                try {
                                  // Populate customer search data with this timetable's start/end info
                                  updateCustomerData({
                                    startingPointId: item.md_timetable_startid || item.md_timetable_startid || '0',
                                    startingpoint_name: selectedLanguage === 'th' ? (item.start_locationthai || item.start_location_namethai || item.start_location_nameeng || item.start_location || '') : (item.start_locationeng || item.start_location_nameeng || item.start_locationthai || item.start_location || ''),
                                    endPointId: item.md_timetable_endid || item.md_timetable_endid || '0',
                                    endpoint_name: selectedLanguage === 'th' ? (item.end_locationthai || item.end_location_namethai || item.end_location_nameeng || item.end_location || '') : (item.end_locationeng || item.end_location_nameeng || item.end_locationthai || item.end_location || ''),
                                  });
                                } catch (e) {
                                  // ignore errors and still navigate
                                }
                                navigation.navigate('SearchFerry');
                              }}
                              activeOpacity={0.9}
                            >
                              <Text style={styles.getPriceBottomText}>{t('getPrice') || 'getPrice'}</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}

                    {/* FOOTER: จัดให้ "ชิดซ้าย" จริง ๆ (เอาโลโก้ออก ไม่จองพื้นที่) */}
                    {expanded && (
                      <View style={styles.groupFooterNew}>
                        <View style={styles.footerInfoRow}>
                          <View style={styles.footerInfoItem}>
                            <Ionicons name="boat" size={14} color="#6B7280" />
                            <Text style={styles.footerInfoText} numberOfLines={1} ellipsizeMode="tail">{companyName}</Text>
                          </View>
                          <View style={styles.footerInfoItem}>
                            <Ionicons name="calendar" size={14} color="#6B7280" />
                            <Text style={styles.footerInfoText}>{group.items.length} {t('sailingsDaily') || 'sailingsDaily'}</Text>
                          </View>
                          <View style={styles.footerInfoItem}>
                            <MaterialIcons name="schedule" size={14} color="#6B7280" />
                            <Text style={styles.footerInfoText}>{formatDuration(group.items[0]?.md_timetable_time) || '1 hr'}</Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.noRoutesCard}>
              <MaterialIcons name="info-outline" size={48} color="#D1D5DB" />
              <Text style={styles.noRoutesText}>{t('noRoutesAvailable') || 'No routes available for this operator.'}</Text>
            </View>
          )}
        </View>

        

  {/* --- Reviews block (moved here so it appears after routes) --- */}
  <View style={styles.reviewsContainer} onLayout={(e) => { try { reviewsLayoutY.current = e.nativeEvent.layout.y; } catch (err) {} }}>

           {/* Write-review form (moved above reviews list) */}
          {userTokenState ? (
            <View style={styles.writeReviewContainer}>
              <Text style={styles.writeReviewLabel}>{t('writeReview') || 'Write a review'}</Text>

              {/* Star picker */}
              <View style={styles.starPickerRow}>
                {[1,2,3,4,5].map(n => (
                  <TouchableOpacity key={`star-${n}`} onPress={() => setNewRating(n)} activeOpacity={0.7}>
                    <Ionicons name={ n <= newRating ? 'star' : 'star-outline' } size={26} color="#FFD700" style={{ marginHorizontal: 4 }} />
                  </TouchableOpacity>
                ))}
              </View>
              {/* Image picker preview + button */}
              <View style={styles.imagePickerRow}>
                {newReviewImages && newReviewImages.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginRight: wp('3%') }}>
                    {newReviewImages.map((u, idx) => (
                      <Image key={`p-${idx}`} source={{ uri: u }} style={styles.newReviewPreview} />
                    ))}
                  </ScrollView>
                ) : (
                  <View style={styles.newReviewPreviewPlaceholder}><MaterialIcons name="photo" size={20} color="#9CA3AF" /></View>
                )}
                <TouchableOpacity style={styles.pickImageButton} onPress={() => {
                  Alert.alert('', '', [
                    { text: 'Take photo', onPress: takePhoto },
                    { text: 'Choose from library', onPress: pickImageFromLibrary },
                    { text: 'Cancel', style: 'cancel' },
                  ]);
                }}>
                  <MaterialIcons name="photo-camera" size={20} color="#374151" />
                </TouchableOpacity>
                {newReviewImages && newReviewImages.length > 0 && (
                  <TouchableOpacity style={styles.removeImageButton} onPress={() => setNewReviewImages([])}>
                    <Text style={styles.removeImageText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={[styles.reviewInput, { color: '#0F172A' }]}
                placeholder={t('writeReviewPlaceholder') || 'Share your experience...'}
                placeholderTextColor={'#6B7280'}
                value={newReviewText}
                onChangeText={setNewReviewText}
                multiline
                numberOfLines={4}
              />

              <View style={styles.writeReviewActions}>
                <TouchableOpacity style={styles.submitReviewButton} onPress={handleSubmitReview}>
                  <Text style={styles.submitReviewText}>{t('submitReview') || 'Submit'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[styles.writeReviewContainer, { alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ marginBottom: hp('1%'), color: '#6B7280' }}>{t('loginToWriteReview') || 'กรุณาเข้าสู่ระบบเพื่อเขียนรีวิว'}</Text>
              <TouchableOpacity style={styles.loginToReviewButton} onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginToReviewText}>{t('login') || 'เข้าสู่ระบบ'}</Text>
              </TouchableOpacity>
            </View>
          )}
          {/* Compute aggregate display value */}
          {(() => {
            const vals = (reviews || []).map(r => Number(r.rating || r.stars || 0)).filter(v => !isNaN(v) && v > 0);
            let avg = null;
            if (vals.length > 0) avg = vals.reduce((a,b) => a+b, 0) / vals.length;
            if (avg === null) {
              const opVal = Number(operator?.md_company_rating || operator?.md_company_stars || 0);
              if (!isNaN(opVal) && opVal > 0) avg = opVal;
            }
            const display = avg !== null ? (Math.round(avg * 10) / 10) : null;
            return (
              <Text style={styles.sectionTitle}>
                {t('reviews') || 'Reviews'}{display !== null ? ` (${String(display)} ` : ''}
                {display !== null && <Ionicons name="star" size={14} color="#FFD700" style={{ marginLeft: 4 }} />}
                {display !== null ? ')' : ''}
              </Text>
            );
          })()}

         

          {reviews && reviews.length > 0 ? (
            reviews.map((r, i) => (
              <View key={`rev-${i}`} style={styles.reviewCard}>
                <View style={styles.reviewHeaderRow}>
                  <View style={styles.reviewAuthorRow}>
                    {(() => {
                      const u = r.avatar || r.md_review_photo;
                      const uri = normalizeImageUri(u);
                      if (uri) return <Image source={{ uri }} style={styles.reviewAvatar} />;
                      return <MaterialIcons name="person" size={20} color="#6B7280" />;
                    })()}
                    <Text style={styles.reviewAuthor}>{r.author || t('anonymous') || 'Anonymous'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.reviewStarsRow}>
                      {[1,2,3,4,5].map(s => (
                        <Ionicons key={`rstar-${i}-${s}`} name={s <= (r.rating || r.stars || 0) ? 'star' : 'star-outline'} size={16} color="#FFD700" style={{ marginLeft: 2 }} />
                      ))}
                    </View>
                    <TouchableOpacity
                      style={styles.likeButton}
                      onPress={async () => {
                        const token = await SecureStore.getItemAsync('userToken');
                        if (!token) { navigation.navigate('Login'); return; }
                        toggleLike(i);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={r.liked ? 'heart' : 'heart-outline'} size={18} color={r.liked ? '#EF4444' : '#9CA3AF'} />
                      <Text style={styles.likeCountText}>{String((Array.isArray(r.likesArray) ? r.likesArray.length : (Number(r.likes ?? r.likeCount ?? 0))))}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.reviewText}>{formatReviewText(r)}</Text>
                {r.images && r.images.length > 0 ? (
                  <View style={{ marginTop: hp('1%') }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {r.images.map((u, iIdx) => (
                        <TouchableOpacity key={`ri-${iIdx}`} onPress={() => { setPreviewImageUri(u); setIsPreviewVisible(true); }} style={{ marginRight: wp('2%') }}>
                          <Image source={{ uri: u }} style={styles.reviewThumb} resizeMode="cover" />
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ) : (r.image && (
                  <TouchableOpacity onPress={() => { setPreviewImageUri(r.image); setIsPreviewVisible(true); }}>
                    <Image source={{ uri: r.image }} style={styles.reviewThumb} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </View>
            ))
          ) : (
            <View style={styles.noReviewsCard}>
              <Text style={styles.noReviewsText}>{t('noReviews') || 'No reviews yet.'}</Text>
            </View>
          )}


        </View>

        <View style={{ height: hp('10%') }} />
        {/* Fullscreen image preview modal */}
        <Modal visible={isPreviewVisible} transparent={true} onRequestClose={() => setIsPreviewVisible(false)}>
          <View style={styles.previewModalBackdrop}>
            <TouchableOpacity style={styles.previewClose} onPress={() => setIsPreviewVisible(false)}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Image source={{ uri: previewImageUri }} style={styles.previewImage} resizeMode="contain" />
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: hp('2%'), paddingBottom: hp('2%') },

  header: {
    flexDirection: 'row', alignItems: 'center', position: 'relative',
    paddingHorizontal: wp('4%'), paddingVertical: hp('2%'),
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: wp('4.5%'), fontWeight: '700', color: '#1F2937', position: 'absolute', left: 0, right: 0, textAlign: 'center' },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1 },

  // Top
  topCardWrapper: { marginHorizontal: wp('4%'), marginTop: hp('2%'), alignItems: 'center' },
  logoCardNew: {
    width: wp('28%'), height: wp('28%'), borderRadius: wp('14%'), backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  operatorLogoNew: { width: '70%', height: '70%' },
  titleGroup: { marginTop: hp('2%'), alignItems: 'center' },
  operatorNameNew: { fontSize: wp('6%'), fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  locationSelector: { marginTop: hp('1%'), flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3ED', paddingHorizontal: wp('3%'), paddingVertical: hp('0.8%'), borderRadius: wp('2%') },
  locationTextNew: { color: '#FD501E', marginLeft: wp('1%'), fontWeight: '600' },

  // Company rating stars under name
  companyStarsRow: { flexDirection: 'row', alignItems: 'center', marginTop: hp('0.6%') },
  companyRatingText: { marginLeft: wp('2%'), color: '#374151', fontWeight: '700' },
  viewReviewsButton: { marginTop: hp('1%'), paddingVertical: hp('0.6%'), paddingHorizontal: wp('3%'), backgroundColor: 'transparent' },
  viewReviewsText: { color: '#FD501E', fontWeight: '700' },

  // Company description block (replaces top summary)
  companyDescriptionBlock: { backgroundColor: '#FFF7F3', borderRadius: wp('2.5%'), padding: wp('3%'), marginHorizontal: wp('4%'), marginTop: hp('1%'), borderWidth: 1, borderColor: '#FDE3D7' },
  companyDescriptionText: { color: '#6B7280', fontSize: wp('3.2%'), lineHeight: Math.round(hp('2%') + wp('3.2%')) },

  // Groups
  routesContainer: { marginHorizontal: wp('4%'), marginTop: hp('2%') },
  sectionTitle: { fontSize: wp('4.5%'), fontWeight: '700', color: '#1F2937', marginBottom: hp('1.5%') },
  routeGroupCard: {
    backgroundColor: '#FFFFFF', borderRadius: wp('4%'), marginBottom: hp('2%'),
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  routeGroupInner: { padding: wp('4%'), borderRadius: wp('4%'), overflow: 'hidden', backgroundColor: 'transparent' },
  locationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: hp('1.5%'), paddingBottom: hp('1%'), borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  locationHeaderText: { fontSize: wp('4%'), fontWeight: '700', color: '#1F2937', marginLeft: wp('2%') },

  // แถวซ้าย-กลาง-ขวา
  routeCardDual: { backgroundColor: 'transparent', paddingVertical: hp('1%') },
  routeRowDual: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dualLeft: { flex: 1, paddingRight: wp('2%') },
  dualCenter: { width: 48, alignItems: 'center', justifyContent: 'center' },
  dualRight: { flex: 1, paddingLeft: wp('2%'), alignItems: 'flex-end' },

  routeLocationTextSingle: { fontSize: wp('4%'), fontWeight: '700', color: '#0F172A' },
  routeCountryText: { fontSize: wp('3%'), color: '#9CA3AF', marginTop: hp('0.3%') },
  boatIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FD501E', alignItems: 'center', justifyContent: 'center' },

  // เส้นคั่น
  centerDivider: { height: 1, backgroundColor: '#E5E7EB', width: '100%', marginTop: hp('0.8%'), marginBottom: hp('0.8%') },

  // ปุ่ม getPrice เต็มแถว (ใต้เส้น)
  getPriceBottom: {
    backgroundColor: '#FD501E',
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('4%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  getPriceBottomText: { color: '#FFFFFF', fontWeight: '800', fontSize: wp('3.8%') },

  // FOOTER: ชิดซ้ายจริง ๆ (ไม่มีโลโก้จองพื้นที่)
  groupFooterNew: {
    marginTop: hp('1%'),
    paddingTop: hp('1.2%'),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // สำคัญ: ให้เริ่มที่ซ้าย
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  footerInfoItem: { flexDirection: 'row', alignItems: 'center', marginRight: wp('4%'), marginBottom: hp('0.4%') },
  footerInfoText: { fontSize: wp('3%'), color: '#6B7280', marginLeft: wp('1.2%') },

  groupToggleText: { color: '#FD501E', fontSize: wp('4%'), fontWeight: '700', marginLeft: 'auto' },

  // Empty
  noRoutesCard: { backgroundColor: '#F9FAFB', padding: wp('8%'), borderRadius: wp('4%'), alignItems: 'center', justifyContent: 'center' },
  noRoutesText: { color: '#6B7280', fontSize: wp('3.5%'), marginTop: hp('1%'), textAlign: 'center' },
  
  /* Reviews */
  reviewsContainer: { marginHorizontal: wp('4%'), marginTop: hp('2%'), marginBottom: hp('2%') },
  reviewCard: { backgroundColor: '#FFFFFF', padding: wp('3%'), borderRadius: wp('3%'), marginBottom: hp('1%'), shadowColor: '#000', shadowOffset: { width:0, height:1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  reviewHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hp('0.6%') },
  reviewAuthorRow: { flexDirection: 'row', alignItems: 'center' },
  reviewAuthor: { marginLeft: wp('2%'), color: '#111827', fontWeight: '700' },
  reviewAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F3F4F6' },
  reviewStarsRow: { flexDirection: 'row', alignItems: 'center' },
  reviewRating: { marginLeft: wp('1%'), color: '#374151', fontWeight: '700' },
  reviewText: { color: '#374151', marginTop: hp('0.4%'), fontSize: wp('3.2%') },
  noReviewsCard: { backgroundColor: '#FFF7F3', padding: wp('3%'), borderRadius: wp('3%') },
  noReviewsText: { color: '#9CA3AF' },

  writeReviewContainer: {  marginBottom: hp('3%'), marginTop: hp('1.2%'), backgroundColor: '#FFFFFF', padding: wp('3%'), borderRadius: wp('3%'), shadowColor: '#000', shadowOffset: { width:0, height:1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  writeReviewLabel: { fontWeight: '700', marginBottom: hp('0.6%'), color: '#111827' },
  starPickerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: hp('1%') },
  reviewInput: { borderWidth: 1, borderColor: '#EEF2F6', borderRadius: wp('2%'), padding: wp('2%'), minHeight: hp('8%'), textAlignVertical: 'top', backgroundColor: '#FBFDFF' },
  writeReviewActions: { marginTop: hp('1%'), alignItems: 'flex-end' },
  submitReviewButton: { backgroundColor: '#FD501E', paddingVertical: hp('1%'), paddingHorizontal: wp('4%'), borderRadius: wp('2%') },
  submitReviewText: { color: '#FFFFFF', fontWeight: '800' },
  loginToReviewButton: { backgroundColor: '#FD501E', paddingVertical: hp('1%'), paddingHorizontal: wp('5%'), borderRadius: wp('2%'), alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width:0, height:2 }, elevation: 3 },
  loginToReviewText: { color: '#FFFFFF', fontWeight: '800' },
  aggregateRow: { flexDirection: 'row', alignItems: 'center', marginTop: hp('0.6%'), marginBottom: hp('0.6%') },
  aggregateNumber: { fontSize: wp('4%'), fontWeight: '800', color: '#111827' },
  aggregateLabel: { marginLeft: wp('2%'), color: '#6B7280' },
  reviewImage: { width: '100%', height: hp('18%'), borderRadius: wp('2%'), marginTop: hp('1%') },
  reviewThumb: { width: wp('24%'), height: wp('24%'), borderRadius: wp('2%') },
  likeButton: { flexDirection: 'row', alignItems: 'center', marginLeft: wp('3%') },
  likeCountText: { marginLeft: wp('1%'), color: '#6B7280' },
  imagePickerRow: { flexDirection: 'row', alignItems: 'center', marginTop: hp('1%'), marginBottom: hp('1%') },
  newReviewPreview: { width: wp('18%'), height: wp('18%'), borderRadius: wp('2%'), marginRight: wp('3%') },
  newReviewPreviewPlaceholder: { width: wp('18%'), height: wp('18%'), borderRadius: wp('2%'), backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: wp('3%') },
  pickImageButton: { width: wp('11%'), height: wp('11%'), borderRadius: wp('6%'), backgroundColor: '#EEF2F6', alignItems: 'center', justifyContent: 'center' },
  removeImageButton: { marginLeft: wp('2%') },
  removeImageText: { color: '#EF4444' },
  previewModalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', alignItems: 'center', justifyContent: 'center' },
  previewImage: { width: '100%', height: '100%' },
  previewClose: { position: 'absolute', top: hp('6%'), right: wp('6%'), zIndex: 10 },
});

export default OperatorDetailScreen;
