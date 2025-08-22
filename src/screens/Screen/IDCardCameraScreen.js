import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useCustomer } from './CustomerContext.js';
import { useLanguage } from './LanguageContext';
import ipAddress from "../../config/ipconfig";
import { styles } from '../../styles/CSS/IDCardCameraScreenStyles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const IDCardCameraScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : insets.top;

  const { customerData } = useCustomer();
  const { t } = useLanguage();

  const [photo, setPhoto] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [firstName, setFirstName] = useState(customerData.Firstname || '');
  const [lastName, setLastName] = useState(customerData.Lastname || '');
  const [idNumber, setIdNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentType, setDocumentType] = useState('ID Card');

  const [existingPassportInfo, setExistingPassportInfo] = useState({
    passport_number: '',
    document_path: '',
    has_passport: false,
    has_document: false,
    last_updated: null
  });
  const [isLoadingPassport, setIsLoadingPassport] = useState(false);
  const [token, setToken] = useState(null);
  const [ocrProgress, setOcrProgress] = useState('');
  const [imageLoadError, setImageLoadError] = useState(false);

  // --- Safe header measuring ---
  const [headerHeight, setHeaderHeight] = useState(0);

  // --- Animations ---
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(-120)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const loadingRotateAnim = useRef(new Animated.Value(0)).current;
  const uploadLoadingRotateAnim = useRef(new Animated.Value(0)).current;
  const saveLoadingRotateAnim = useRef(new Animated.Value(0)).current;

  // Floating particles
  const floatingAnims = useRef(
    [...Array(6)].map(() => ({
      x: new Animated.Value(Math.random() * screenWidth - screenWidth / 2),
      y: new Animated.Value(Math.random() * screenHeight * 0.8),
      opacity: new Animated.Value(0.1),
      scale: new Animated.Value(1),
    }))
  ).current;

  const cardAnims = useRef(
    [...Array(4)].map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30),
      scale: new Animated.Value(0.9),
    }))
  ).current;

  // Entrance + loops
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(headerAnim, { toValue: 0, duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    floatingAnims.forEach((anim, index) => {
      const animateParticle = () => {
        Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(anim.y, { toValue: -50, duration: 4000 + index * 400, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
              Animated.timing(anim.y, { toValue: screenHeight * 0.8, duration: 0, useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.timing(anim.opacity, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
              Animated.timing(anim.opacity, { toValue: 0.1, duration: 2000, useNativeDriver: true }),
            ]),
            Animated.loop(
              Animated.sequence([
                Animated.timing(anim.scale, { toValue: 1.2, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(anim.scale, { toValue: 0.8, duration: 2500, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
              ])
            ),
          ])
        ).start();
      };
      setTimeout(() => animateParticle(), index * 500);
    });

    cardAnims.forEach((anim, index) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(anim.opacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(anim.translateY, { toValue: 0, duration: 900, easing: Easing.bezier(0.175, 0.885, 0.32, 1.275), useNativeDriver: true }),
          Animated.timing(anim.scale, { toValue: 1, duration: 800, easing: Easing.bezier(0.68, -0.55, 0.265, 1.55), useNativeDriver: true }),
        ]).start();
      }, index * 200 + 800);
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(Animated.timing(rotateAnim, { toValue: 1, duration: 20000, easing: Easing.linear, useNativeDriver: true })).start();
    Animated.loop(Animated.timing(loadingRotateAnim, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })).start();
    Animated.loop(Animated.timing(uploadLoadingRotateAnim, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })).start();
    Animated.loop(Animated.timing(saveLoadingRotateAnim, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })).start();
  }, []);

  const spin = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const loadingSpin = loadingRotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const uploadLoadingSpin = uploadLoadingRotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const saveLoadingSpin = saveLoadingRotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // Safety timeout
  useEffect(() => {
    let to;
    if (isProcessing) {
      to = setTimeout(() => {
        setIsProcessing(false);
        setOcrProgress('');
        Alert.alert(
          t('processingTooLong') || 'Processing Taking Too Long ⏱️',
          t('processingTooLongMessage') ||
            'Document scanning is taking longer than expected.\n\nTry retaking a smaller/clearer photo or enter details manually.',
          [{ text: t('tryAgain') || 'Try Again', onPress: () => pickImage() }, { text: t('enterManually') || 'Enter Manually' }]
        );
      }, 120000);
    }
    return () => to && clearTimeout(to);
  }, [isProcessing]);

  // ---------- Image picking ----------
  const pickImage = async () => {
    Alert.alert(
      t('selectIdCardImage') || 'Select ID Card/Passport Image',
      t('selectImageInstructions') ||
        'For best results: good lighting, keep document flat, show full document.\nChoose a source:',
      [
        { text: t('takePhoto') || 'Take Photo', onPress: () => openCamera() },
        { text: t('chooseFromGallery') || 'Choose from Gallery', onPress: () => openGallery() },
        { text: t('cancel') || 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const openCamera = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          t('cameraPermissionRequired') || 'Camera Permission Required',
          t('cameraPermissionMessage') || 'Please allow camera access to scan your document.',
          [{ text: t('cancel') || 'Cancel', style: 'cancel' }, { text: t('openSettings') || 'Open Settings', onPress: () => Linking.openSettings() }]
        );
        return;
      }
      setIsProcessing(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [85.6, 54],
        quality: 1,
        exif: false,
      });
      if (!result.canceled) {
        const cropped = await cropIDCard(result.assets[0].uri);
        setPhoto(cropped);
        await checkNetworkAndProcess(cropped);
      } else {
        setIsProcessing(false);
      }
    } catch (e) {
      console.error('openCamera error:', e);
      setIsProcessing(false);
      Alert.alert('Error', 'Unable to open camera. Please try again.');
    }
  };

  const openGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          t('galleryPermissionRequired') || 'Gallery Permission Required',
          t('galleryPermissionMessage') || 'Please allow photo library access.',
          [{ text: t('cancel') || 'Cancel', style: 'cancel' }, { text: t('openSettings') || 'Open Settings', onPress: () => Linking.openSettings() }]
        );
        return;
      }
      setIsProcessing(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [85.6, 54],
        quality: 1,
        exif: false,
      });
      if (!result.canceled) {
        const cropped = await cropIDCard(result.assets[0].uri);
        setPhoto(cropped);
        await checkNetworkAndProcess(cropped);
      } else {
        setIsProcessing(false);
      }
    } catch (e) {
      console.error('openGallery error:', e);
      setIsProcessing(false);
      Alert.alert('Error', 'Unable to access gallery. Please try again.');
    }
  };

  // ---------- Image processing / OCR ----------
  const cropIDCard = async (uri) => {
    try {
      const info = await ImageManipulator.manipulateAsync(uri, [], { format: ImageManipulator.SaveFormat.JPEG });
      const { width, height } = info;
      const aspect = 85.6 / 54;
      let cropWidth, cropHeight, originX, originY;

      if (width / height > aspect) {
        cropHeight = height * 0.8;
        cropWidth = cropHeight * aspect;
        originX = (width - cropWidth) / 2;
        originY = height * 0.1;
      } else {
        cropWidth = width * 0.9;
        cropHeight = cropWidth / aspect;
        originX = width * 0.05;
        originY = (height - cropHeight) / 2;
      }

      cropWidth = Math.min(cropWidth, width * 0.95);
      cropHeight = Math.min(cropHeight, height * 0.95);
      originX = Math.max(0, Math.min(originX, width - cropWidth));
      originY = Math.max(0, Math.min(originY, height - cropHeight));

      const cropped = await ImageManipulator.manipulateAsync(
        uri,
        [{ crop: { originX: Math.round(originX), originY: Math.round(originY), width: Math.round(cropWidth), height: Math.round(cropHeight) } }, { resize: { width: 1200 } }],
        { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
      );
      return cropped.uri;
    } catch (e) {
      console.error('cropIDCard error:', e);
      return uri;
    }
  };

  const recognizeText = async (uri) => {
    try {
      setOcrProgress('Processing document...');
      const originalInfo = await FileSystem.getInfoAsync(uri);
      const processed = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: documentType === 'ID Card' ? 600 : 550 } }],
        { compress: (originalInfo.size && originalInfo.size > 5_000_000) ? 0.95 : 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setOcrProgress('Converting file...');
      const base64Image = await FileSystem.readAsStringAsync(processed.uri, { encoding: FileSystem.EncodingType.Base64 });

      let ocrResult = null;
      const engines = [1, 1, 2];
      for (let i = 0; i < engines.length && !ocrResult; i++) {
        try {
          if (i > 0) setOcrProgress(i < 2 ? `Quick scan attempt (${i}/3)...` : `Thorough scan attempt (${i}/3)...`);
          ocrResult = await tryOCRSpace(base64Image, engines[i], documentType);
        } catch {
          await new Promise(r => setTimeout(r, i < 2 ? 1500 : 3000));
        }
      }

      if (!ocrResult) throw new Error('No text detected from document');

      setOcrText(ocrResult);
      parseIDText(ocrResult);
      setOcrProgress('');
      Alert.alert('Document Scanned Successfully! 🎉', 'Please verify the extracted number.', [{ text: 'OK' }]);
    } catch (e) {
      let msg = 'Your document photo was captured but we could not scan it automatically. Try a clearer photo or enter manually.';
      if (e.message?.includes('timeout') || e.message?.includes('network')) {
        msg = 'Slow connection detected. Try a smaller/clearer photo or check your internet.';
      }
      Alert.alert('Unable to Scan Document 📷', msg, [
        { text: 'Retake Photo', onPress: () => pickImage() },
        { text: 'Enter Manually', style: 'default' },
      ]);
    } finally {
      setIsProcessing(false);
      setOcrProgress('');
    }
  };

  const checkNetworkAndProcess = async (imageUri) => {
    try {
      const start = Date.now();
      await Promise.race([
        fetch('https://api.ocr.space', { method: 'HEAD' }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('Network test timeout')), 5000)),
      ]);
      const latency = Date.now() - start;
      if (latency > 3000) {
        Alert.alert('Slow Network Detected 🐌', 'Scanning may take longer than usual.', [
          { text: 'Continue Anyway', onPress: () => recognizeText(imageUri) },
          { text: 'Enter Manually', style: 'cancel' },
        ]);
      } else {
        await recognizeText(imageUri);
      }
    } catch {
      await recognizeText(imageUri);
    }
  };

  const tryOCRSpace = async (base64Image, engineNumber = 1, selectedDocumentType = 'ID Card') => {
    const OCR_SPACE_API_KEY = 'K87899142388957';
    const sizeKB = Math.round((base64Image.length * 3) / 4 / 1024);
    const baseTimeout = engineNumber === 1 ? 30000 : 45000;
    const adaptiveTimeout = Math.max(baseTimeout, Math.min(60000, sizeKB * 80));

    const formData = new FormData();
    formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('OCREngine', String(engineNumber));
    formData.append('isTable', 'false');
    formData.append('scale', selectedDocumentType === 'ID Card' ? 'true' : 'false');
    formData.append('detectOrientation', selectedDocumentType === 'ID Card' ? 'true' : 'false');

    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('OCR request timeout - network too slow')), adaptiveTimeout));
    const fetchPromise = fetch('https://api.ocr.space/parse/image', { method: 'POST', headers: { apikey: OCR_SPACE_API_KEY }, body: formData });
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (!response.ok) throw new Error(`OCR.space API error: ${response.status}`);
    const result = await response.json();
    if (result.OCRExitCode !== 1) {
      const err = Array.isArray(result.ErrorMessage) ? result.ErrorMessage.join(', ') : result.ErrorMessage;
      throw new Error(`OCR processing failed: ${err || 'Unknown error'}`);
    }
    const text = result?.ParsedResults?.[0]?.ParsedText;
    if (!text) throw new Error('No text detected from document image');
    return text;
  };

  const parseIDText = (text) => {
    const lines = text.split('\n').filter(l => l.trim());
    let foundId = '';

    const patterns = [
      /เลขประจำตัว[\s:]*(\d{1}[\s-]?\d{4}[\s-]?\d{5}[\s-]?\d{2}[\s-]?\d{1})/i,
      /บัตรประจำตัว[\s\S]*?(\d{1}[\s-]?\d{4}[\s-]?\d{5}[\s-]?\d{2}[\s-]?\d{1})/i,
      /(\d{1}[\s-]?\d{4}[\s-]?\d{5}[\s-]?\d{2}[\s-]?\d{1})\b/,
      /\b(\d{13})\b/,
      /(\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d)/,
      /(\d-\d{4}-\d{5}-\d{2}-\d)/,
      /[Pp]assport[\s:]*([A-Z]{1,2}\d{6,8})/i,
      /\b([A-Z]{1,2}\d{6,8})\b/,
      /\b([A-Z]\d{7,8})\b/,
      /\b([A-Z]{2}\d{6,7})\b/,
    ];

    for (const raw of lines) {
      const line = raw.trim();
      for (const p of patterns) {
        const m = line.match(p);
        if (m && m[1]) {
          const clean = m[1].replace(/[\s-]/g, '');
          const isThai = clean.length === 13 && /^\d{13}$/.test(clean) && clean !== '0000000000000';
          const isPassport = clean.length >= 6 && clean.length <= 9 && /^[A-Z0-9]+$/i.test(clean);
          if (isThai || isPassport) {
            foundId = clean;
            break;
          }
        }
      }
      if (foundId) break;
    }

    if (foundId) {
      setIdNumber(foundId);
      Alert.alert('🎉 Document Scan Successful!', `${documentType} Number found: ${foundId}`, [{ text: 'OK' }]);
    } else {
      Alert.alert(
        '⚠️ No Document Number Found',
        'Try a clearer photo with better lighting or enter the number manually.',
        [{ text: 'Retake Photo', onPress: () => pickImage() }, { text: 'Manual Entry', style: 'default' }]
      );
    }
  };

  // ---------- Save / Upload ----------
  const handleSave = async () => {
    if (!idNumber) {
      Alert.alert('Missing Information', `Please enter your ${documentType} number.`);
      return;
    }
    if (!photo) {
      Alert.alert('Missing Document', `Please upload your ${documentType.toLowerCase()} photo.`);
      return;
    }
    if (!token) {
      Alert.alert('Authentication Error', 'Please login again.');
      return;
    }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('passport_number', idNumber);

      const imageUri = photo;
      const filename = `${documentType.toLowerCase().replace(' ', '_')}_${Date.now()}.jpg`;

      if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
        formData.append('passport_document', { uri: imageUri, type: 'image/jpeg', name: filename });
      } else if (imageUri.startsWith('http')) {
        // update number only
        const updateForm = new FormData();
        updateForm.append('passport_number', idNumber.trim());
        updateForm.append('update_existing', 'true');
        updateForm.append('document_exists', 'true');

        const res = await fetch(`${ipAddress}/upload-passport`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: updateForm });
        const txt = await res.text();

        if (res.ok) {
          setIsProcessing(false);
          Alert.alert('Success! 🎉', 'Your ID number has been updated.', [{ text: 'OK', onPress: () => navigation.navigate('ProfileScreen') }]);
        } else {
          setIsProcessing(false);
          Alert.alert(
            'Update Not Supported',
            'Server requires a new document upload. Please take a new photo.',
            [{ text: 'Take New Photo', onPress: () => pickImage() }, { text: 'Cancel', style: 'cancel' }]
          );
        }
        return;
      } else {
        throw new Error('Invalid image format');
      }

      const uploadResponse = await fetch(`${ipAddress}/upload-passport`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }, // let fetch set multipart boundary
        body: formData,
      });

      const text = await uploadResponse.text();
      let json = null;
      try { json = JSON.parse(text); } catch { /* non-JSON */ }

      if (uploadResponse.ok && json?.status === 'success') {
        setIsProcessing(false);
        Alert.alert('Success! 🎉', 'Your verification has been submitted.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      } else {
        throw new Error(json?.message || `Upload failed (${uploadResponse.status})`);
      }
    } catch (e) {
      setIsProcessing(false);
      let msg = 'Unable to save your information. Please try again.';
      if (e.message?.includes('network') || e.message?.includes('fetch')) msg = 'Network error. Please check your internet connection and try again.';
      else if (e.message?.includes('token')) msg = 'Authentication error. Please login again.';
      else if (e.message?.includes('Only .png, .jpg, .jpeg')) msg = 'Invalid file format. Please use JPG, JPEG, or PNG.';
      else if (e.message) msg = e.message;

      Alert.alert('Upload Failed', msg, [{ text: 'OK' }]);
    }
  };

  // ---------- Fetch existing ----------
  const fetchPassportInfo = async () => {
    const storedToken = await SecureStore.getItemAsync('userToken');
    if (!storedToken) return;
    setToken(storedToken);
    setIsLoadingPassport(true);
    try {
      const response = await fetch(`${ipAddress}/passport-info`, { method: 'GET', headers: { Authorization: `Bearer ${storedToken}`, 'Content-Type': 'application/json' } });
      if (!response.ok) throw new Error('Failed to fetch passport info');
      const data = await response.json();
      if (data.status === 'success' && data.data) {
        const info = data.data;
        setExistingPassportInfo({
          passport_number: info.passport_number || '',
          document_path: info.document_path || '',
          has_passport: info.has_passport || false,
          has_document: info.has_document || false,
          last_updated: info.last_updated || null,
        });
        if (info.passport_number) setIdNumber(info.passport_number);
        if (info.document_path) {
          let url = info.document_path;
          if (!url.startsWith('http')) url = (url.startsWith('/') ? url.slice(1) : url), (url = `https://thetrago.com/${url}`);
          setPhoto(url);
        }
      }
    } catch (e) {
      console.error('fetchPassportInfo error:', e);
    } finally {
      setIsLoadingPassport(false);
    }
  };

  useEffect(() => {
    if (customerData.Firstname) setFirstName(customerData.Firstname);
    if (customerData.Lastname) setLastName(customerData.Lastname);
  }, [customerData]);

  useEffect(() => {
    fetchPassportInfo();
  }, []);

  useEffect(() => {
    const ensureToken = async () => {
      if (!token) {
        const tk = await SecureStore.getItemAsync('userToken');
        if (tk) setToken(tk);
      }
    };
    ensureToken();
  }, [token]);

  return (
    <View style={styles.containerPremium}>
      <StatusBar barStyle="light-content" backgroundColor="#FD501E" />

      {/* Particles behind all content */}
      <View pointerEvents="none" style={styles.particlesContainer}>
        {floatingAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.floatingParticle,
              { transform: [{ translateX: anim.x }, { translateY: anim.y }, { scale: anim.scale }], opacity: anim.opacity }
            ]}
          />
        ))}
      </View>

      {/* Header (measured height) */}
      <Animated.View
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
        style={[styles.headerContainer, { opacity: fadeAnim, transform: [{ translateY: headerAnim }] }]}
      >
        <LinearGradient colors={['#FD501E', '#FF6B40', '#FD501E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
          <SafeAreaView edges={['top']} style={[styles.safeAreaHeader, { paddingTop: topPad }]}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity
                style={[styles.backButton, { top: topPad + 12 }]}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{t('documentScanner') || 'Document Scanner'}</Text>
              <Text style={styles.headerSubtitle}>{t('idCardPassportOCR') || 'ID Card/Passport OCR'}</Text>

              <Animated.View style={[styles.floatingDecor, { transform: [{ rotate: spin }] }]}>
                <MaterialCommunityIcons name="shield-check" size={20} color="rgba(255,255,255,0.3)" />
              </Animated.View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      {/* Content */}
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ marginTop: headerHeight }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
          showsVerticalScrollIndicator={false}
          bounces
          contentInsetAdjustmentBehavior="never"
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.contentContainer}>

            {/* Personal info (read-only) */}
            <Animated.View
              style={[
                styles.formCardPremium,
                { opacity: cardAnims[0].opacity, transform: [{ translateY: cardAnims[0].translateY }, { scale: cardAnims[0].scale }] }
              ]}
            >
              <View style={styles.sectionHeaderPremium}>
                <MaterialCommunityIcons name="card-account-details" size={24} color="#FD501E" />
                <Text style={styles.sectionTitlePremium}>{t('personalInformation') || 'Personal Information'}</Text>
              </View>

              <View style={styles.infoNotePremium}>
                <MaterialCommunityIcons name="information" size={16} color="#3B82F6" />
                <Text style={styles.infoNoteText}>{t('nameFieldsReadonly') || 'Name and surname are loaded from your profile.'}</Text>
              </View>

              <View style={styles.inputWrapperPremium}>
                <Text style={styles.inputLabelPremium}>{t('name') || 'Name'}*</Text>
                <TextInput
                  style={[styles.inputPremium, { backgroundColor: '#F3F4F6', color: '#6B7280' }]}
                  placeholder={t('loadedFromProfile') || 'Loaded from your profile'}
                  value={firstName}
                  editable={false}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputWrapperPremium}>
                <Text style={styles.inputLabelPremium}>{t('surname') || 'Surname'}*</Text>
                <TextInput
                  style={[styles.inputPremium, { backgroundColor: '#F3F4F6', color: '#6B7280' }]}
                  placeholder={t('loadedFromProfile') || 'Loaded from your profile'}
                  value={lastName}
                  editable={false}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.inputWrapperPremium}>
                <Text style={styles.inputLabelPremium}>
                  {documentType === 'ID Card' ? (t('idCardNumber') || 'ID Card Number') : (t('passportNumber') || 'Passport Number')}*
                </Text>
                <TextInput
                  style={styles.inputPremium}
                  placeholder={documentType === 'ID Card' ? (t('enterIdNumber') || 'Enter your ID card number') : (t('enterPassportNumber') || 'Enter your passport number')}
                  value={idNumber}
                  onChangeText={setIdNumber}
                  placeholderTextColor="#9CA3AF"
                  maxLength={documentType === 'ID Card' ? 13 : 20}
                  keyboardType={documentType === 'ID Card' ? 'numeric' : 'default'}
                />
                {existingPassportInfo.has_passport && (
                  <View style={styles.existingDataBadge}>
                    <MaterialCommunityIcons name="check-circle" size={16} color="#22C55E" />
                    <Text style={styles.existingDataText}>{t('previouslySavedData') || 'Previously saved data loaded'}</Text>
                  </View>
                )}
              </View>
            </Animated.View>

            {/* Document type */}
            <Animated.View
              style={[
                styles.formCardPremium,
                { opacity: cardAnims[1].opacity, transform: [{ translateY: cardAnims[1].translateY }, { scale: cardAnims[1].scale }] }
              ]}
            >
              <View style={styles.sectionHeaderPremium}>
                <MaterialCommunityIcons name="card-multiple" size={24} color="#FD501E" />
                <Text style={styles.sectionTitlePremium}>{t('documentType') || 'Document Type'}</Text>
              </View>

              <View style={styles.documentTypeContainer}>
                <TouchableOpacity
                  style={[styles.documentTypeButton, documentType === 'ID Card' && styles.documentTypeButtonActive]}
                  onPress={() => setDocumentType('ID Card')}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="card-account-details" size={20} color={documentType === 'ID Card' ? '#FFFFFF' : '#FD501E'} />
                  <Text style={[styles.documentTypeText, documentType === 'ID Card' && styles.documentTypeTextActive]}>
                    {t('idCard') || 'ID Card'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.documentTypeButton, documentType === 'Passport' && styles.documentTypeButtonActive]}
                  onPress={() => setDocumentType('Passport')}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="passport" size={20} color={documentType === 'Passport' ? '#FFFFFF' : '#FD501E'} />
                  <Text style={[styles.documentTypeText, documentType === 'Passport' && styles.documentTypeTextActive]}>
                    {t('passport') || 'Passport'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Upload */}
            <Animated.View
              style={[
                styles.formCardPremium,
                { opacity: cardAnims[2].opacity, transform: [{ translateY: cardAnims[2].translateY }, { scale: cardAnims[2].scale }] }
              ]}
            >
              <View style={styles.sectionHeaderPremium}>
                <MaterialCommunityIcons name="camera-plus" size={24} color="#FD501E" />
                <Text style={styles.sectionTitlePremium}>{t('uploadDocument') || `Upload your ${documentType}`}*</Text>
                <View style={styles.realOcrBadge}>
                  <MaterialCommunityIcons name="check-circle" size={12} color="#22C55E" />
                  <Text style={styles.realOcrText}>{t('realOCR') || 'REAL OCR'}</Text>
                </View>
              </View>

              {existingPassportInfo.has_document && existingPassportInfo.last_updated && (
                <View style={styles.existingDocumentInfo}>
                  <View style={styles.existingDocumentHeader}>
                    <MaterialCommunityIcons name="file-document" size={20} color="#22C55E" />
                    <Text style={styles.existingDocumentTitle}>{t('previouslyUploadedDocument') || 'Previously Uploaded Document'}</Text>
                  </View>
                  <Text style={styles.existingDocumentDate}>
                    {(t('lastUpdated') || 'Last updated')}: {new Date(existingPassportInfo.last_updated).toLocaleDateString('en-US')}
                  </Text>
                  <Text style={styles.existingDocumentNote}>You can upload a new document to replace the existing one</Text>
                </View>
              )}

              <TouchableOpacity style={styles.uploadButtonPremium} onPress={pickImage} activeOpacity={0.8} disabled={isProcessing}>
                <LinearGradient colors={photo ? ['#22C55E', '#16A34A'] : ['rgba(253, 80, 30, 0.1)', 'rgba(255, 107, 64, 0.1)']} style={styles.uploadGradient}>
                  {isProcessing ? (
                    <>
                      <Animated.View style={{ transform: [{ rotate: uploadLoadingSpin }] }}>
                        <MaterialCommunityIcons name="loading" size={24} color="#FFFFFF" />
                      </Animated.View>
                      <Text style={styles.uploadTextProcessing}>{ocrProgress || 'Processing...'}</Text>
                    </>
                  ) : photo ? (
                    <>
                      <MaterialIcons name="check-circle" size={24} color="#FFFFFF" />
                      <Text style={styles.uploadTextSuccess}>Document Uploaded</Text>
                    </>
                  ) : (
                    <>
                      <MaterialCommunityIcons name="camera" size={24} color="#FD501E" />
                      <Text style={styles.uploadText}>Upload {documentType}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {photo && (
                <Animated.View
                  style={[
                    styles.documentPreview,
                    { opacity: cardAnims[2].opacity, transform: [{ translateY: cardAnims[2].translateY }, { scale: cardAnims[2].scale }] }
                  ]}
                >
                  <View style={styles.documentContainer}>
                    {imageLoadError ? (
                      <View style={styles.imageErrorContainer}>
                        <MaterialCommunityIcons name="image-broken-variant" size={48} color="#9CA3AF" />
                        <Text style={styles.imageErrorText}>Image failed to load</Text>
                        <Text style={styles.imageErrorSubtext}>The document image could not be displayed</Text>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: photo }}
                        style={styles.documentImage}
                        onError={() => setImageLoadError(true)}
                        onLoadStart={() => setImageLoadError(false)}
                        onLoad={() => setImageLoadError(false)}
                      />
                    )}
                    <LinearGradient colors={['transparent', 'rgba(0,0,0,0.3)']} style={styles.documentOverlay}>
                      <View style={styles.documentInfo}>
                        <MaterialCommunityIcons name="shield-check" size={16} color="#22C55E" />
                        <Text style={styles.documentStatus}>
                          {existingPassportInfo.has_document && String(photo).includes('thetrago.com') ? 'Previously Uploaded Document' : 'Verified Document'}
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>
                </Animated.View>
              )}

              {isLoadingPassport && (
                <View style={styles.loadingContainer}>
                  <Animated.View style={{ transform: [{ rotate: loadingSpin }] }}>
                    <MaterialCommunityIcons name="loading" size={20} color="#FD501E" />
                  </Animated.View>
                  <Text style={styles.loadingText}>Loading existing data...</Text>
                </View>
              )}
            </Animated.View>

            {/* Actions */}
            <Animated.View
              style={[
                styles.actionContainer,
                { opacity: cardAnims[3].opacity, transform: [{ translateY: cardAnims[3].translateY }, { scale: cardAnims[3].scale }] }
              ]}
            >
              <TouchableOpacity
                style={styles.saveButtonPremiumFull}
                onPress={handleSave}
                activeOpacity={0.8}
                disabled={isProcessing || !idNumber || !photo}
              >
                <LinearGradient colors={['#FD501E', '#FF6B40']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveGradient}>
                  {isProcessing ? (
                    <>
                      <Animated.View style={{ transform: [{ rotate: saveLoadingSpin }] }}>
                        <MaterialCommunityIcons name="loading" size={20} color="#FFFFFF" />
                      </Animated.View>
                      <Text style={styles.saveButtonTextPremium}>Processing...</Text>
                    </>
                  ) : (
                    <>
                      <MaterialIcons name="save" size={20} color="#FFFFFF" />
                      <Text style={styles.saveButtonTextPremium}>Save</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default IDCardCameraScreen;
