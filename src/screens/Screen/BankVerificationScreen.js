import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
  Alert,
  Platform,
  Modal,
  FlatList,
  InteractionManager,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomer } from './CustomerContext.js';
import { useLanguage } from './LanguageContext';
import { Linking } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import ipAddress from "../../config/ipconfig";
import { styles } from '../../styles/CSS/BankVerificationScreenStyles';

const { height: screenHeight } = Dimensions.get('window');

const BankVerificationScreen = ({ navigation }) => {
  const { customerData } = useCustomer();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  // Prevent header overlap before measurement by using a conservative default
  const DEFAULT_HEADER_HEIGHT = Platform.OS === 'android' ? 160 : 160;
  const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT);
  const [photo, setPhoto] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [selectedBank, setSelectedBank] = useState(t('selectBankName') || 'Select Bank Name');
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [bankAccount, setBankAccount] = useState('');
  const [bankNumber, setBankNumber] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Bank selection states
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);
  const [bankList, setBankList] = useState([]);
  const [isLoadingBankList, setIsLoadingBankList] = useState(false);
  const [bankListError, setBankListError] = useState(null);
  const [searchBankQuery, setSearchBankQuery] = useState('');

  // Existing bank info
  const [existingBankInfo, setExistingBankInfo] = useState({
    bank_name: '',
    account_number: '',
    account_holder: '',
    branch: '',
    document_path: '',
    has_bank_account: false,
    has_document: false,
    last_updated: null
  });
  const [isLoadingBank, setIsLoadingBank] = useState(false);
  const [token, setToken] = useState(null);
  const [ocrProgress, setOcrProgress] = useState('');
  const [imageLoadError, setImageLoadError] = useState(false);

  // ===== Contact-style Animations =====
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(-100)).current; // ชะลอ header ลงมา
  const scaleAnim  = useRef(new Animated.Value(0.98)).current;

  // clocks (ใช้ร่วมกัน ลดงานบน JS thread)
  const particleClock = useRef(new Animated.Value(0)).current;
  const pulseClock    = useRef(new Animated.Value(0)).current;
  const rotateDecor   = useRef(new Animated.Value(0)).current; // ของตกแต่ง
  const spinnerClock  = useRef(new Animated.Value(0)).current; // สำหรับไอคอนหมุนทุกที่

  // cards
  const cardAnims = useRef(
    Array.from({ length: 2 }, () => ({
      opacity:    new Animated.Value(0),
      translateY: new Animated.Value(24),
      scale:      new Animated.Value(0.98),
    }))
  ).current;

  // Floating particles ด้วย clock เดียว
  const PARTICLE_COUNT = 6;
  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const phase = i / PARTICLE_COUNT;
      const t = Animated.modulo(Animated.add(particleClock, phase), 1);

      const x = t.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [-40 + i * 10, 40 - i * 10, -40 + i * 10],
      });
      const y = t.interpolate({
        inputRange: [0, 1],
        outputRange: [screenHeight * 0.8 + i * 28, -60],
      });
      const opacity = t.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.08, 0.22, 0.08],
      });
      const scale = t.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.9, 1.12, 0.9],
      });
      return { x, y, opacity, scale };
    });
  }, [particleClock]);

  const pulseScale = pulseClock.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  const spinDecor  = rotateDecor.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const spinFast   = spinnerClock.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      // entrance
      Animated.parallel([
        Animated.timing(fadeAnim,   { toValue: 1, duration: 700,  easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(headerAnim, { toValue: 0, duration: 1200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(scaleAnim,  { toValue: 1, tension: 80, friction: 12, useNativeDriver: true }),
      ]).start();

      // clocks
      Animated.loop(
        Animated.timing(particleClock, { toValue: 1, duration: 16000, easing: Easing.linear, useNativeDriver: true })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseClock, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(pulseClock, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.timing(rotateDecor, { toValue: 1, duration: 20000, easing: Easing.linear, useNativeDriver: true })
      ).start();

      Animated.loop(
        Animated.timing(spinnerClock, { toValue: 1, duration: 1000, easing: Easing.linear, useNativeDriver: true })
      ).start();

      // cards
      Animated.stagger(
        180,
        cardAnims.map(a =>
          Animated.parallel([
            Animated.timing(a.opacity,    { toValue: 1, duration: 520, useNativeDriver: true }),
            Animated.timing(a.translateY, { toValue: 0, duration: 720, easing: Easing.out(Easing.back(1.25)), useNativeDriver: true }),
            Animated.spring(a.scale,      { toValue: 1, tension: 80, friction: 12, useNativeDriver: true }),
          ])
        )
      ).start();
    });
  }, []);

  // Safety timeout
  useEffect(() => {
    let loadingTimeout;
    if (isProcessing) {
      loadingTimeout = setTimeout(() => {
        setIsProcessing(false);
        setOcrProgress('');
        Alert.alert(
          t('bankProcessingTooLong') || 'Processing Taking Too Long ⏱️',
          t('bankProcessingTooLongMessage') || 'Bank document scanning is taking longer than expected.\n\n• Slow internet\n• Large image\n• Network congestion\n\nTry smaller/clearer photo or enter manually.',
          [
            { text: t('tryAgain') || 'Try Again', onPress: () => pickImage() },
            { text: t('enterManually') || 'Enter Manually', style: 'default' }
          ]
        );
      }, 120000);
    }
    return () => loadingTimeout && clearTimeout(loadingTimeout);
  }, [isProcessing]);

  // ===== Image pickers / OCR (เหมือนเดิม) =====
  const pickImage = async () => {
    Alert.alert(
      t('selectBankBookImage') || "Select Bank Book Image",
      t('bankBookScanningTips') || "Use bright lighting and keep text clear. You can always enter info manually.",
      [
        { text: t('takePhotoEmoji') || "📷 Take Photo", onPress: () => openCamera(), style: "default" },
        { text: t('chooseFromGalleryEmoji') || "🖼️ Choose from Gallery", onPress: () => openGallery(), style: "default" },
        { text: t('cancel') || "Cancel", style: "cancel" }
      ],
      { cancelable: true }
    );
  };

  const openCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          t('cameraPermissionRequiredBank') || "Camera Permission Required",
          t('cameraPermissionMessageBank') || "Permission to access camera is required to scan your bank document!",
          [
            { text: t('cancel') || "Cancel", style: "cancel" },
            { text: t('openSettings') || "Open Settings", onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      setIsProcessing(true);

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 2],
        quality: 0.6,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        exif: false,
        allowsMultipleSelection: false,
        cameraType: ImagePicker.CameraType.back,
      });

      if (!result.canceled) {
        const croppedImage = await cropBankDocument(result.assets[0].uri);
        setPhoto(croppedImage);
        await checkNetworkAndProcess(croppedImage);
      } else {
        setIsProcessing(false);
        Alert.alert(t('noPhotoTaken') || 'No Photo Taken', t('noPhotoTakenMessage') || 'You can enter your bank information manually', [{ text: t('ok') || 'OK' }]);
      }
    } catch (error) {
      setIsProcessing(false);
      Alert.alert(t('error') || 'Error', t('unableToOpenCamera') || 'Unable to open camera. Please try again.', [{ text: t('ok') || 'OK' }]);
    }
  };

  const openGallery = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          t('galleryPermissionRequired') || "Gallery Permission Required",
          t('galleryPermissionMessage') || "Permission to access photo library is required to select images!",
          [
            { text: t('cancel') || "Cancel", style: "cancel" },
            { text: t('openSettings') || "Open Settings", onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      setIsProcessing(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 2],
        quality: 0.6,
        exif: false,
        allowsMultipleSelection: false,
      });

      if (!result.canceled) {
        const croppedImage = await cropBankDocument(result.assets[0].uri);
        setPhoto(croppedImage);
        await checkNetworkAndProcess(croppedImage);
      } else {
        setIsProcessing(false);
        Alert.alert(t('noImageSelected') || 'No Image Selected', t('noImageSelectedMessage') || 'You can enter your bank information manually', [{ text: t('ok') || 'OK' }]);
      }
    } catch (error) {
      setIsProcessing(false);
      Alert.alert(t('error') || 'Error', t('unableToAccessGallery') || 'Unable to access gallery. Please try again.', [{ text: t('ok') || 'OK' }]);
    }
  };

  const cropBankDocument = async (uri) => {
    try {
      const imageInfo = await ImageManipulator.manipulateAsync(uri, [], { format: ImageManipulator.SaveFormat.JPEG });
      const { width, height } = imageInfo;
      const aspectRatio = 3 / 2;

      let cropWidth, cropHeight, originX, originY;

      if (width / height > aspectRatio) {
        cropHeight = height * 0.85;
        cropWidth = cropHeight * aspectRatio;
        originX = (width - cropWidth) / 2;
        originY = height * 0.075;
      } else {
        cropWidth = width * 0.95;
        cropHeight = cropWidth / aspectRatio;
        originX = width * 0.025;
        originY = (height - cropHeight) / 2;
      }

      const croppedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ crop: { originX: Math.round(originX), originY: Math.round(originY), width: Math.round(cropWidth), height: Math.round(cropHeight) } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );

      const enhancedImage = await ImageManipulator.manipulateAsync(
        croppedImage.uri,
        [{ resize: { width: 800 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );

      return enhancedImage.uri;
    } catch {
      return uri;
    }
  };

  const checkNetworkAndProcess = async (imageUri) => {
    try {
      setOcrProgress(t('checkingConnection') || 'Checking connection...');
      await recognizeText(imageUri);
    } catch {
      setIsProcessing(false);
      setOcrProgress('');
      Alert.alert(
        t('processingFailed') || 'Processing Failed',
        t('unableToProcessDocument') || 'Unable to process the bank document. Please check your internet connection and try again, or enter the information manually.',
        [
          { text: t('retry') || 'Retry', onPress: () => checkNetworkAndProcess(imageUri) },
          { text: t('enterManually') || 'Enter Manually', style: 'default' }
        ]
      );
    }
  };

  const recognizeText = async (uri) => {
    try {
      setOcrProgress(t('processingBankDocument') || 'Processing bank document...');

      const processedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 600 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );

      setOcrProgress(t('readingBankInformation') || 'Reading bank information...');

      const base64Image = await FileSystem.readAsStringAsync(processedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setOcrProgress(t('analyzingBankData') || 'Analyzing bank data...');

      try {
        const ocrResult = await tryOCRServices(base64Image);

        if (ocrResult && ocrResult.status === 'success') {
          const extractedData = ocrResult.data || ocrResult;
          if (extractedData.bank_name) {
            setSelectedBank(extractedData.bank_name);
            const matchingBank = bankList.find(bank =>
              bank.bankname.toLowerCase().includes(extractedData.bank_name.toLowerCase()) ||
              extractedData.bank_name.toLowerCase().includes(bank.bankname.toLowerCase())
            );
            if (matchingBank) setSelectedBankId(matchingBank.id);
          }
          if (extractedData.account_number) setBankNumber(extractedData.account_number);
          if (extractedData.account_name) setBankAccount(extractedData.account_name);
          if (extractedData.branch) setBankBranch(extractedData.branch);

          setOcrText(`Bank: ${extractedData.bank_name || 'N/A'}, Account: ${extractedData.account_number || 'N/A'}`);
          setOcrProgress('');
          setIsProcessing(false);

          const serviceName = ocrResult.service || 'OCR Service';
          Alert.alert(
            t('bankDocumentScannedSuccessfully') || 'Bank Document Scanned Successfully! 🎉',
            `${serviceName} ${t('extractedInformationFromBank') || 'has successfully extracted information'}:\n\n• ${t('bankName') || 'Bank'}: ${extractedData.bank_name || (t('notDetected') || 'Not detected')}\n• ${t('bankAccountNumber') || 'Account Number'}: ${extractedData.account_number || (t('notDetected') || 'Not detected')}\n• ${t('accountHolderName') || 'Account Name'}: ${extractedData.account_name || (t('notDetected') || 'Not detected')}`,
            [{ text: t('ok') || 'OK' }]
          );
        } else {
          throw new Error('All OCR services failed to extract data');
        }
      } catch (ocrError) {
        setOcrProgress('');
        setIsProcessing(false);
        let alertTitle = 'OCR Scanning Failed 📄';
        let alertMessage = 'Unable to automatically extract information from your bank book.\n\nPlease enter your bank information manually.';

        if (ocrError.message.includes('404')) {
          alertTitle = 'Server Configuration Issue 🔧';
          alertMessage = 'The OCR service is currently unavailable.\n\nPlease enter your bank information manually.';
        } else if (ocrError.message.includes('timeout')) {
          alertTitle = 'Connection Timeout ⏱️';
          alertMessage = 'The OCR service is taking too long to respond.\n\nPlease enter your bank information manually.';
        }
        Alert.alert(alertTitle, alertMessage, [{ text: 'OK' }]);
      }
    } catch {
      setIsProcessing(false);
      setOcrProgress('');
      Alert.alert('Scanning Failed', 'Unable to extract information from the bank document. You can enter the details manually.', [{ text: 'OK' }]);
    }
  };

  const tryOCRServices = async (base64Image) => {
    const ocrServices = [
      { name: 'OCR.Space (Free)', apiCall: () => tryOCRSpace(base64Image) },
      { name: 'Google Vision API (Alternative)', apiCall: () => tryGoogleVisionAlternative(base64Image) },
      { name: 'Custom Server', apiCall: () => tryCustomServer(base64Image) },
      { name: 'Manual Entry', apiCall: () => extractBankInfoFallback() },
    ];
    for (const s of ocrServices) {
      try {
        setOcrProgress(`Trying ${s.name}...`);
        const result = await s.apiCall();
        if (result && result.status === 'success') return result;
      } catch { /* try next */ }
    }
    throw new Error('All OCR services failed');
  };

  const tryOCRSpace = async (base64Image) => {
    try {
      let response;
      try {
        const formData = new FormData();
        formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
        formData.append('language', 'tha');
        formData.append('OCREngine', '2');
        formData.append('isTable', 'true');
        formData.append('isOverlayRequired', 'false');
        response = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          headers: { 'apikey': 'helloworld' },
          body: formData,
        });
      } catch {
        const params = new URLSearchParams();
        params.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
        params.append('language', 'tha');
        params.append('OCREngine', '2');
        params.append('isTable', 'true');
        params.append('isOverlayRequired', 'false');
        response = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          headers: { 'apikey': 'helloworld', 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });
      }
      if (!response.ok) throw new Error(`OCR.Space HTTP error: ${response.status}`);
      const result = await response.json();

      if (result.OCRExitCode === 1 && result.ParsedResults?.length > 0) {
        const extractedText = result.ParsedResults[0].ParsedText || '';
        if (extractedText.trim().length < 10) throw new Error('OCR.Space extracted text too short');
        const bankData = parseBankBookText(extractedText);
        if (!bankData.bank_name && !bankData.account_number && !bankData.account_name) {
          throw new Error('No meaningful bank data extracted');
        }
        return { status: 'success', data: bankData, service: 'OCR.Space' };
      } else {
        const errorMsg = result.ErrorMessage?.join(', ') || result.ErrorDetails || 'Unknown OCR.Space error';
        throw new Error(errorMsg);
      }
    } catch (error) {
      throw new Error(`OCR.Space API failed: ${error.message}`);
    }
  };

  const tryCustomServer = async (base64Image) => {
    try {
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 15000));
      const fetchPromise = fetch(`${ipAddress}/ocr/bank-book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, document_type: 'bank_book' }),
      });
      const ocrResponse = await Promise.race([fetchPromise, timeoutPromise]);
      if (!ocrResponse.ok) {
        if (ocrResponse.status === 404) throw new Error('OCR endpoint not found on server.');
        if (ocrResponse.status === 413) throw new Error('Image file is too large.');
        if (ocrResponse.status === 500) throw new Error('Server internal error.');
        throw new Error(`Custom server status ${ocrResponse.status}`);
      }
      const contentType = ocrResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) throw new Error('Custom server returned non-JSON response');
      const responseText = await ocrResponse.text();
      const ocrResult = JSON.parse(responseText);
      if (ocrResult.status === 'success' && ocrResult.data) return ocrResult;
      throw new Error(ocrResult.message || 'Custom server OCR processing failed');
    } catch (error) {
      throw new Error(`Custom server failed: ${error.message}`);
    }
  };

  const tryGoogleVisionAlternative = async (base64Image) => {
    try {
      // ต้องใส่ API key จริงก่อนใช้งาน
      throw new Error('Google Vision API key not configured');
    } catch (error) {
      throw new Error(`Google Vision API failed: ${error.message}`);
    }
  };

  const parseBankBookText = (text) => {
    const bankPatterns = [
      { pattern: /(?:ธนาคาร)?กรุงเทพ|bangkok\s*bank|BBL/i, name: 'ธนาคารกรุงเทพ' },
      { pattern: /(?:ธนาคาร)?กสิกร|kasikorn|KBANK|K-?BANK/i, name: 'ธนาคารกสิกรไทย' },
      { pattern: /(?:ธนาคาร)?กรุงไทย|krung\s*thai|KTB/i, name: 'ธนาคารกรุงไทย' },
      { pattern: /(?:ธนาคาร)?ไทยพาณิชย์|siam\s*commercial|SCB/i, name: 'ธนาคารไทยพาณิชย์' },
      { pattern: /(?:ธนาคาร)?กรุงศรี|ayudhya|BAY|กรุงศรีอยุธยา/i, name: 'ธนาคารกรุงศรีอยุธยา' },
      { pattern: /(?:ธนาคาร)?ทีเอ็มบี|TMB|thanachart|TTB|ธนชาต/i, name: 'ธนาคารทีเอ็มบีธนชาต' },
      { pattern: /(?:ธนาคาร)?ออมสิน|GSB|government\s*saving/i, name: 'ธนาคารออมสิน' },
      { pattern: /(?:ธนาคาร)?ซีไอเอ็มบี|CIMB/i, name: 'ธนาคารซีไอเอ็มบีไทย' },
    ];

    const accountPatterns = [
      /(?:เลขที่บัญชี|บัญชีเลขที่|Account\s*No\.?|A\/C\s*No\.?)[:\s]*(\d{3}[-\s]?\d{1}[-\s]?\d{5}[-\s]?\d{1})/i,
      /(?:เลขที่บัญชี|บัญชีเลขที่|Account\s*No\.?|A\/C\s*No\.?)[:\s]*(\d{3}[-\s]?\d{7})/i,
      /(?:เลขที่บัญชี|บัญชีเลขที่|Account\s*No\.?|A\/C\s*No\.?)[:\s]*(\d{10,12})/i,
      /(\d{3}[-\s]?\d{1}[-\s]?\d{5}[-\s]?\d{1})/g,
      /(\d{3}[-\s]?\d{7})/g,
      /(\d{10,12})/g
    ];

    const namePatterns = [
      /(?:ชื่อบัญชี|ชื่อ|Name)[:\s]*([^\n\r]+)/i,
      /(?:Account\s*Name|A\/C\s*Name)[:\s]*([^\n\r]+)/i,
      /(?:นาย|นาง|นางสาว|Mr\.?|Mrs\.?|Miss)[\s]*([^\n\r]+)/i
    ];

    const branchPatterns = [
      /(?:สาขา|Branch)[:\s]*([^\n\r]+)/i,
      /(?:สาขาที่|สาขา)[:\s]*([^\n\r]+)/i
    ];

    const out = { bank_name: '', account_number: '', account_name: '', branch: '' };

    for (const b of bankPatterns) {
      if (b.pattern.test(text)) { out.bank_name = b.name; break; }
    }
    for (const p of accountPatterns) {
      const match = text.match(p);
      if (match?.[1]) { out.account_number = match[1].replace(/[-\s]/g, ''); break; }
      else if (match?.[0]) { out.account_number = match[0].replace(/[-\s]/g, ''); break; }
    }
    for (const p of namePatterns) {
      const m = text.match(p);
      if (m?.[1]) { out.account_name = m[1].trim(); break; }
    }
    for (const p of branchPatterns) {
      const m = text.match(p);
      if (m?.[1]) { out.branch = m[1].trim(); break; }
    }
    return out;
  };

  const saveBankVerification = async () => {
    if (!selectedBank || selectedBank === 'Select Bank Name' || !bankNumber || !bankAccount) {
      Alert.alert('Missing Information', 'Please fill in bank name, account number, and account holder name.', [{ text: 'OK' }]);
      return;
    }
    if (!selectedBankId) {
      Alert.alert('Bank Selection Required', 'Please select a bank from the list.', [{ text: 'OK' }]);
      return;
    }
    if (!photo) {
      Alert.alert('Document Required', 'Please upload your bank book document.', [{ text: 'OK' }]);
      return;
    }

    try {
      setIsLoadingBank(true);
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) { Alert.alert(t('error') || 'Error', t('userTokenNotFound') || 'User token not found'); return; }

      const formData = new FormData();
      formData.append('bank_id', String(selectedBankId));
      formData.append('account_number', bankNumber);
      formData.append('account_name', bankAccount);
      formData.append('bankbook_document', { uri: photo, type: 'image/jpeg', name: 'bankbook_document.jpg' });

      const response = await fetch(`${ipAddress}/upload-bankbook`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        body: formData,
      });

      const contentType = response.headers.get('content-type');
      let json = null; let responseText = '';
      try {
        responseText = await response.text();
        if (contentType && contentType.includes('application/json')) json = JSON.parse(responseText);
      } catch {}

      if (response.ok && json && json.status === 'success') {
        Alert.alert(t('bankVerificationSubmittedSuccessfully') || 'Bank Verification Submitted Successfully!', '', [
          { text: t('ok') || 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        let errorMessage = t('unableToSubmitBankVerification') || 'Unable to submit bank verification';
        if (response.status === 413) errorMessage = t('imageFileTooLarge') || 'Image file is too large.';
        else if (response.status === 400) errorMessage = json?.message || (t('invalidRequestCheckFields') || 'Invalid request.');
        else if (response.status === 404) errorMessage = t('uploadServiceNotAvailable') || 'Upload service not available.';
        else if (response.status === 500) {
          errorMessage = (responseText.includes('<html>') || responseText.includes('<!DOCTYPE'))
            ? (t('serverInternalError') || 'Server internal error.')
            : (json?.message || (t('serverError') || 'Server error.'));
        } else if (json?.message) errorMessage = json.message;
        else if (responseText && !responseText.includes('<html>'))
          errorMessage = responseText.length > 100 ? (t('serverReturnedError') || 'Server returned an error.') : responseText;

        Alert.alert(t('uploadFailed') || '❌ Upload Failed', errorMessage);
      }
    } catch (error) {
      let errorMessage = t('errorOccurredWhileSubmitting') || 'An error occurred while submitting bank verification';
      if (error.message.includes('Network request failed')) errorMessage = t('networkConnectionFailed') || 'Network connection failed.';
      else if (error.message.includes('timeout')) errorMessage = t('uploadTimeout') || 'Upload timeout.';
      else if (error.message.includes('JSON Parse error')) errorMessage = t('serverResponseError') || 'Server response error.';
      else if (error.name === 'SyntaxError') errorMessage = t('invalidServerResponse') || 'Server returned an invalid response.';
      Alert.alert(t('uploadError') || '⚠️ Upload Error', errorMessage);
    } finally {
      setIsLoadingBank(false);
    }
  };

  const toggleBankModal = () => setIsBankModalVisible(v => !v);
  const handleSelectBank = (bank) => {
    setSelectedBank(bank.bankname);
    setSelectedBankId(bank.id);
    toggleBankModal();
    setSearchBankQuery('');
  };

  const filteredBanks = bankList.filter((bank) => bank.bankname?.toLowerCase().includes(searchBankQuery.toLowerCase()));

  useEffect(() => {
    fetchBankList();
    loadExistingBankInfo();
  }, []);

  const fetchBankList = async () => {
    setIsLoadingBankList(true);
    setBankListError(null);
    try {
      const response = await fetch(`${ipAddress}/bankname`, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.status === 'success') {
        const mappedBanks = data.data.map(bank => ({
          id: bank.md_bankname_id,
          bankname: bank.md_bankname_name,
          status: bank.md_bankname_status,
          bank_code: bank.md_bankname_masterkey || '',
        }));
        setBankList(mappedBanks);
      } else {
        throw new Error(data.message || 'Failed to fetch bank list');
      }
    } catch (error) {
      setBankListError('Failed to load bank list. Please try again.');
      setBankList([
        { id: 1, bankname: 'Bangkok Bank', bank_code: 'BBL' },
        { id: 2, bankname: 'Kasikornbank', bank_code: 'KBANK' },
        { id: 3, bankname: 'Krung Thai Bank', bank_code: 'KTB' },
        { id: 4, bankname: 'Siam Commercial Bank', bank_code: 'SCB' },
        { id: 5, bankname: 'Bank of Ayudhya', bank_code: 'BAY' },
        { id: 6, bankname: 'TMBThanachart Bank', bank_code: 'TTB' },
        { id: 7, bankname: 'Government Savings Bank', bank_code: 'GSB' },
        { id: 8, bankname: 'CIMB Thai Bank', bank_code: 'CIMB' },
      ]);
    } finally {
      setIsLoadingBankList(false);
    }
  };

  const loadExistingBankInfo = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (!token) return;

      const response = await fetch(`${ipAddress}/bankbook-info`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) return;

      const json = await response.json();
      if (json.status === 'success' && json.data) {
        const { bank_id, account_name, account_number, document_path, has_bank_id, has_account_name, has_account_number, has_document } = json.data;

        if (has_account_name && account_name) setBankAccount(account_name);
        if (has_account_number && account_number) setBankNumber(account_number);
        if (has_bank_id && bank_id) setSelectedBankId(bank_id);

        if (has_document && document_path) {
          const cleanedPath = document_path.replace('/AppApi/', '/');
          const fullImagePath = `https://thetrago.com/${cleanedPath}`;
          setPhoto(fullImagePath);
        }

        setExistingBankInfo({
          bank_name: '',
          account_number: account_number || '',
          account_holder: account_name || '',
          branch: '',
          document_path: document_path || '',
          has_bank_account: has_account_name && has_account_number,
          has_document: has_document,
          last_updated: json.data.last_updated
        });
      }
    } catch {}
  };

  useEffect(() => {
    if (bankList.length > 0 && selectedBankId) {
      const bank = bankList.find(b => b.id === selectedBankId);
      if (bank && selectedBank === 'Select Bank Name') setSelectedBank(bank.bankname);
    }
  }, [bankList, selectedBankId]);

  const extractBankInfoFallback = async () => ({
    status: 'failed',
    data: { bank_name: '', account_number: '', account_name: '', branch: '' },
    service: 'Manual Entry Required'
  });

  return (
    <View style={styles.containerPremium}>

      {/* Particles */}
      <View style={styles.particlesContainer} pointerEvents="none">
        {particles.map((p, i) => (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={[
              styles.floatingParticle,
              { transform: [{ translateX: p.x }, { translateY: p.y }, { scale: p.scale }], opacity: p.opacity }
            ]}
          />
        ))}
      </View>

      {/* Header */}
      <Animated.View
        renderToHardwareTextureAndroid
        shouldRasterizeIOS
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
        style={[styles.headerContainer, { opacity: fadeAnim, transform: [{ translateY: headerAnim }] }]}
      >
        <LinearGradient colors={['#FD501E', '#FF6B40', '#FD501E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
          <View style={[styles.safeAreaHeader, { paddingTop: insets.top }]}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{t('bankVerification') || 'Bank Verification'}</Text>
              <Text style={styles.headerSubtitle}>{t('verifyBankAccount') || 'Verify your bank account'}</Text>

              <Animated.View style={[styles.floatingDecor,  { transform: [{ rotate: spinDecor }] }]}>
                <MaterialCommunityIcons name="bank" size={20} color="rgba(255,255,255,0.3)" />
              </Animated.View>
              <Animated.View style={[styles.floatingDecor2, { transform: [{ rotate: spinDecor }] }]}>
                <MaterialCommunityIcons name="shield-check" size={16} color="rgba(255,255,255,0.2)" />
              </Animated.View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={[styles.scrollViewPremium, { marginTop: 0 }]}
        // ensure paddingTop is at least the default to prevent header overlap while measuring
        contentContainerStyle={[styles.contentContainer, { paddingTop: Math.max(headerHeight, DEFAULT_HEADER_HEIGHT) }]}
        showsVerticalScrollIndicator={false}
        bounces
      >

          {/* Form Card */}
          <Animated.View
            renderToHardwareTextureAndroid
            shouldRasterizeIOS
            style={[
              styles.formCardPremium,
              { opacity: cardAnims[0].opacity, transform: [{ translateY: cardAnims[0].translateY }, { scale: cardAnims[0].scale }] }
            ]}
          >
            <View style={styles.sectionHeaderPremium}>
              <MaterialCommunityIcons name="bank-outline" size={24} color="#FD501E" />
              <Text style={styles.sectionTitlePremium}>{t('bankInformation') || 'Bank Information'}</Text>
              {existingBankInfo.has_bank_account && (
                <View style={styles.existingDataBadge}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#22C55E" />
                  <Text style={styles.existingDataText}>{t('verified') || 'Verified'}</Text>
                </View>
              )}
            </View>

            <View style={styles.inputWrapperPremium}>
              <Text style={styles.inputLabelPremium}>{t('bankName') || 'Bank Name'} *</Text>
              <TouchableOpacity style={styles.buttonPremium} onPress={toggleBankModal} activeOpacity={0.8}>
                <Text style={styles.buttonTextPremium}>{selectedBank}</Text>
                <MaterialIcons name="expand-more" size={20} color="#FD501E" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapperPremium}>
              <Text style={styles.inputLabelPremium}>{t('accountHolderName') || 'Account Holder Name'} *</Text>
              <TextInput
                style={styles.inputPremium}
                placeholder={t('enterAccountHolderName') || "Enter account holder name"}
                value={bankAccount}
                onChangeText={setBankAccount}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputWrapperPremium}>
              <Text style={styles.inputLabelPremium}>{t('bankAccountNumber') || 'Bank Account Number'} *</Text>
              <TextInput
                style={styles.inputPremium}
                placeholder={t('enterBankAccountNumber') || "Enter your bank account number"}
                value={bankNumber}
                onChangeText={setBankNumber}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </Animated.View>

          {/* Upload Document Section */}
          <Animated.View
            renderToHardwareTextureAndroid
            shouldRasterizeIOS
            style={[
              styles.formCardPremium,
              { opacity: cardAnims[1].opacity, transform: [{ translateY: cardAnims[1].translateY }, { scale: cardAnims[1].scale }] }
            ]}
          >
            <View style={styles.sectionHeaderPremium}>
              <MaterialCommunityIcons name="camera-plus" size={24} color="#FD501E" />
              <Text style={styles.sectionTitlePremium}>{t('uploadBankBookDocument') || 'Upload your book bank document'} *</Text>
              <View style={styles.realOcrBadge}>
                <MaterialCommunityIcons name="check-circle" size={12} color="#22C55E" />
                <Text style={styles.realOcrText}>{t('realOCR') || 'REAL OCR'}</Text>
              </View>
            </View>

              {/* Previously uploaded document section */}
              {existingBankInfo.has_document && existingBankInfo.document_path && (
                <View style={styles.existingDocumentInfo}>
                  <View style={styles.existingDocumentHeader}>
                    <MaterialCommunityIcons name="file-document" size={20} color="#22C55E" />
                    <Text style={styles.existingDocumentTitle}>{t('previouslyUploadedBankDocument') || 'Previously Uploaded Bank Document'}</Text>
                  </View>
                  <Text style={styles.existingDocumentDate}>
                    {(t('lastUpdated') || 'Last updated')}: {new Date(existingBankInfo.last_updated).toLocaleDateString('en-US')}
                  </Text>
                  <Text style={styles.existingDocumentNote}>{t('replaceExistingDocument') || 'You can upload a new document to replace the existing one'}</Text>
                </View>
              )}

              <TouchableOpacity style={styles.uploadButtonPremium} onPress={pickImage} activeOpacity={0.8} disabled={isProcessing}>
                <LinearGradient colors={photo ? ['#22C55E', '#16A34A'] : ['rgba(253, 80, 30, 0.1)', 'rgba(255, 107, 64, 0.1)']} style={styles.uploadGradient}>
                  {isProcessing ? (
                    <>
                      <Animated.View style={{ transform: [{ rotate: spinFast }] }}>
                        <MaterialCommunityIcons name="loading" size={24} color="#FFFFFF" />
                      </Animated.View>
                      <Text style={styles.uploadTextProcessing}>{ocrProgress || t('processing') || 'Processing...'}</Text>
                    </>
                  ) : photo ? (
                    <>
                      <MaterialIcons name="check-circle" size={24} color="#FFFFFF" />
                      <Text style={styles.uploadTextSuccess}>{t('bankDocumentUploaded') || 'Bank Document Uploaded'}</Text>
                    </>
                  ) : (
                    <>
                      <MaterialCommunityIcons name="camera" size={24} color="#FD501E" />
                      <Text style={styles.uploadText}>{t('uploadBankDocument') || 'Upload Bank Document'}</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {photo && (
                <Animated.View
                  renderToHardwareTextureAndroid
                  shouldRasterizeIOS
                  style={[
                    styles.documentPreview,
                    { opacity: cardAnims[1].opacity, transform: [{ translateY: cardAnims[1].translateY }, { scale: cardAnims[1].scale }] }
                  ]}
                >
                  <View style={styles.documentContainer}>
                    {imageLoadError ? (
                      <View style={styles.imageErrorContainer}>
                        <MaterialCommunityIcons name="image-broken-variant" size={48} color="#9CA3AF" />
                        <Text style={styles.imageErrorText}>{t('imageFailedToLoad') || 'Image failed to load'}</Text>
                        <Text style={styles.imageErrorSubtext}>{t('documentImageError') || 'The document image could not be displayed'}</Text>
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
                          {existingBankInfo.has_document && typeof photo === 'string' && photo.includes('thetrago.com')
                            ? (t('previouslyUploadedDocumentShort') || 'Previously Uploaded Document')
                            : (t('verifiedDocument') || 'Verified Document')}
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>
                </Animated.View>
              )}
          </Animated.View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.saveButtonPremium, styles.saveButtonFullWidth]}
              onPress={saveBankVerification}
              activeOpacity={0.8}
              disabled={isLoadingBank}
            >
                <LinearGradient colors={['#FD501E', '#FF6B40']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveGradient}>
                  {isLoadingBank ? (
                    <Animated.View style={{ transform: [{ rotate: spinFast }] }}>
                      <MaterialIcons name="hourglass-empty" size={20} color="#FFFFFF" />
                    </Animated.View>
                  ) : (
                    <MaterialIcons name="save" size={20} color="#FFFFFF" />
                  )}
                  <Text style={styles.saveButtonTextPremium}>
                    {isLoadingBank ? (t('submitting') || 'Submitting...') : (t('save') || 'Save')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

          {/* Info Card */}
          <Animated.View
            renderToHardwareTextureAndroid
            shouldRasterizeIOS
            style={[
              styles.infoCardPremium,
              { opacity: cardAnims[1].opacity, transform: [{ translateY: cardAnims[1].translateY }, { scale: cardAnims[1].scale }] }
            ]}
          >
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons name="information" size={24} color="#3B82F6" />
              <Text style={styles.infoTitle}>{t('verificationInformation') || 'Verification Information'}</Text>
            </View>
            <Text style={styles.infoText}>
              {t('verificationRequiredInfo') || '• Bank verification is required for secure transactions\n• Your information will be verified within 1-3 business days\n• Ensure all details match your bank account exactly\n• Supported document types: Bank book, Bank statement'}
            </Text>
          </Animated.View>
      </ScrollView>

      {/* Bank Selection Modal */}
      <Modal visible={isBankModalVisible} transparent animationType="fade" onRequestClose={toggleBankModal}>
        <View style={styles.modalOverlayPremium}>
          <Animated.View style={[styles.modalContentPremium, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.95)']} style={styles.modalGradient}>
              <View style={styles.modalHeaderPremium}>
                <Text style={styles.modalTitlePremium}>{t('selectBank') || 'Select Bank'}</Text>
                <TouchableOpacity onPress={toggleBankModal} style={styles.closeButtonPremium}>
                  <MaterialIcons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <TextInput
                placeholder={t('searchBank') || "Search bank"}
                value={searchBankQuery}
                onChangeText={setSearchBankQuery}
                style={styles.searchInputPremium}
                placeholderTextColor="#9CA3AF"
              />

              {isLoadingBankList ? (
                <View style={styles.modalLoadingContainer}>
                  <Animated.View style={{ transform: [{ rotate: spinFast }] }}>
                    <MaterialIcons name="autorenew" size={24} color="#FD501E" />
                  </Animated.View>
                  <Text style={styles.modalLoadingText}>{t('loadingBanks') || 'Loading banks...'}</Text>
                </View>
              ) : bankListError ? (
                <View style={styles.modalErrorContainer}>
                  <MaterialIcons name="error-outline" size={24} color="#EF4444" />
                  <Text style={styles.modalErrorText}>{bankListError}</Text>
                  <TouchableOpacity onPress={fetchBankList} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>{t('retry') || 'Retry'}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={filteredBanks}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.optionItemPremium} onPress={() => handleSelectBank(item)} activeOpacity={0.7}>
                      <Text style={styles.optionTextPremium}>{item.bankname}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  showsVerticalScrollIndicator
                  style={styles.bankListContainer}
                  contentContainerStyle={styles.bankListContent}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <MaterialIcons name="search-off" size={32} color="#9CA3AF" />
                      <Text style={styles.emptyText}>{t('noBanksFound') || 'No banks found'}</Text>
                    </View>
                  }
                />
              )}
            </LinearGradient>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default BankVerificationScreen;
