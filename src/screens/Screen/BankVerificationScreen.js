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
  Modal,
  FlatList,
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
import ipAddress from '../../config/ipconfig';
import { styles } from '../../styles/CSS/BankVerificationScreenStyles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BankVerificationScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : insets.top;

  const { customerData } = useCustomer();
  const { t } = useLanguage();

  const [photo, setPhoto] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [selectedBank, setSelectedBank] = useState(t('selectBankName') || 'Select Bank Name');
  const [selectedBankId, setSelectedBankId] = useState(null);
  const [bankAccount, setBankAccount] = useState('');
  const [bankNumber, setBankNumber] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Bank modal
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);
  const [bankList, setBankList] = useState([]);
  const [isLoadingBankList, setIsLoadingBankList] = useState(false);
  const [bankListError, setBankListError] = useState(null);
  const [searchBankQuery, setSearchBankQuery] = useState('');

  // Existing info
  const [existingBankInfo, setExistingBankInfo] = useState({
    bank_name: '',
    account_number: '',
    account_holder: '',
    branch: '',
    document_path: '',
    has_bank_account: false,
    has_document: false,
    last_updated: null,
  });
  const [isLoadingBank, setIsLoadingBank] = useState(false);
  const [token, setToken] = useState(null);
  const [ocrProgress, setOcrProgress] = useState('');
  const [imageLoadError, setImageLoadError] = useState(false);

  // ---------- Header measure/animation ----------
  const [headerHeight, setHeaderHeight] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // ให้เหมือน IDCardCameraScreen: เริ่มเลื่อนจาก -120 ลงมา 0
  const headerY = useRef(new Animated.Value(-120)).current;

  const onHeaderLayout = (e) => {
    setHeaderHeight(e.nativeEvent.layout.height);
  };

  // ---------- Other animations ----------
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const loadingRotateAnim = useRef(new Animated.Value(0)).current;
  const uploadLoadingRotateAnim = useRef(new Animated.Value(0)).current;
  const saveLoadingRotateAnim = useRef(new Animated.Value(0)).current;

  const floatingAnims = useRef(
    [...Array(6)].map(() => ({
      x: new Animated.Value(Math.random() * screenWidth - screenWidth / 2),
      y: new Animated.Value(Math.random() * screenHeight * 0.8),
      opacity: new Animated.Value(0.1),
      scale: new Animated.Value(1),
    }))
  ).current;

  const cardAnims = useRef(
    [...Array(2)].map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30),
      scale: new Animated.Value(0.9),
    }))
  ).current;

  useEffect(() => {
    // ทำ fade และ header slide พร้อมกัน เพื่อให้ฟีลเหมือนหน้า IDCard
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(headerY, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // floating particles
    floatingAnims.forEach((anim, index) => {
      const animate = () => {
        Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(anim.y, {
                toValue: -50,
                duration: 4000 + index * 400,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
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
      setTimeout(animate, index * 500);
    });

    // cards
    cardAnims.forEach((anim, i) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(anim.opacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(anim.translateY, { toValue: 0, duration: 900, easing: Easing.bezier(0.175, 0.885, 0.32, 1.275), useNativeDriver: true }),
          Animated.timing(anim.scale, { toValue: 1, duration: 800, easing: Easing.bezier(0.68, -0.55, 0.265, 1.55), useNativeDriver: true }),
        ]).start();
      }, i * 200 + 800);
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

  // ---------- Safety timeout ----------
  useEffect(() => {
    let to;
    if (isProcessing) {
      to = setTimeout(() => {
        setIsProcessing(false);
        setOcrProgress('');
        Alert.alert(
          t('bankProcessingTooLong') || 'Processing Taking Too Long ⏱️',
          t('bankProcessingTooLongMessage') ||
            'Bank document scanning is taking longer than expected.\n\nTry smaller/clearer photo or enter details manually.',
          [
            { text: t('tryAgain') || 'Try Again', onPress: () => pickImage() },
            { text: t('enterManually') || 'Enter Manually', style: 'default' },
          ]
        );
      }, 120000);
    }
    return () => to && clearTimeout(to);
  }, [isProcessing]);

  // ---------- Pickers ----------
  const pickImage = async () => {
    Alert.alert(
      t('selectBankBookImage') || 'Select Bank Book Image',
      t('bankBookScanningTips') ||
        'For best results: bright lighting, flat surface, parallel camera.\nChoose a source:',
      [
        { text: t('takePhotoEmoji') || '📷 Take Photo', onPress: () => openCamera() },
        { text: t('chooseFromGalleryEmoji') || '🖼️ Choose from Gallery', onPress: () => openGallery() },
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
          t('cameraPermissionRequiredBank') || 'Camera Permission Required',
          t('cameraPermissionMessageBank') || 'Please allow camera access to scan your bank document!',
          [{ text: t('cancel') || 'Cancel', style: 'cancel' }, { text: t('openSettings') || 'Open Settings', onPress: () => Linking.openSettings() }]
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
        const cropped = await cropBankDocument(result.assets[0].uri);
        setPhoto(cropped);
        await checkNetworkAndProcess(cropped);
      } else {
        setIsProcessing(false);
      }
    } catch {
      setIsProcessing(false);
      Alert.alert(t('error') || 'Error', t('unableToOpenCamera') || 'Unable to open camera. Please try again.');
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
        aspect: [3, 2],
        quality: 0.6,
        exif: false,
        allowsMultipleSelection: false,
      });
      if (!result.canceled) {
        const cropped = await cropBankDocument(result.assets[0].uri);
        setPhoto(cropped);
        await checkNetworkAndProcess(cropped);
      } else {
        setIsProcessing(false);
      }
    } catch {
      setIsProcessing(false);
      Alert.alert(t('error') || 'Error', t('unableToAccessGallery') || 'Unable to access gallery. Please try again.');
    }
  };

  // ---------- Image processing / OCR ----------
  const cropBankDocument = async (uri) => {
    try {
      const info = await ImageManipulator.manipulateAsync(uri, [], { format: ImageManipulator.SaveFormat.JPEG });
      const { width, height } = info;
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

      cropWidth = Math.min(cropWidth, width * 0.98);
      cropHeight = Math.min(cropHeight, height * 0.98);
      originX = Math.max(0, Math.min(originX, width - cropWidth));
      originY = Math.max(0, Math.min(originY, height - cropHeight));

      const cropped = await ImageManipulator.manipulateAsync(
        uri,
        [{ crop: { originX: Math.round(originX), originY: Math.round(originY), width: Math.round(cropWidth), height: Math.round(cropHeight) } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );

      const enhanced = await ImageManipulator.manipulateAsync(
        cropped.uri,
        [{ resize: { width: 800 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );

      return enhanced.uri;
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
        t('unableToProcessDocument') || 'Unable to process the bank document. Please try again or enter manually.',
        [{ text: t('retry') || 'Retry', onPress: () => checkNetworkAndProcess(imageUri) }, { text: t('enterManually') || 'Enter Manually' }]
      );
    }
  };

  const recognizeText = async (uri) => {
    try {
      setOcrProgress(t('processingBankDocument') || 'Processing bank document...');
      const processed = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 600 } }],
        { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
      );

      setOcrProgress(t('readingBankInformation') || 'Reading bank information...');
      const base64Image = await FileSystem.readAsStringAsync(processed.uri, { encoding: FileSystem.EncodingType.Base64 });

      setOcrProgress(t('analyzingBankData') || 'Analyzing bank data...');
      try {
        const ocrResult = await tryOCRServices(base64Image);
        if (ocrResult && ocrResult.status === 'success') {
          const data = ocrResult.data || ocrResult;
          if (data.bank_name) {
            setSelectedBank(data.bank_name);
            const match = bankList.find(
              (b) =>
                b.bankname.toLowerCase().includes(data.bank_name.toLowerCase()) ||
                data.bank_name.toLowerCase().includes(b.bankname.toLowerCase())
            );
            if (match) setSelectedBankId(match.id);
          }
          if (data.account_number) setBankNumber(data.account_number);
          if (data.account_name) setBankAccount(data.account_name);
          if (data.branch) setBankBranch(data.branch);

          setOcrText(`Bank: ${data.bank_name || 'N/A'}, Account: ${data.account_number || 'N/A'}`);
          setOcrProgress('');
          setIsProcessing(false);

          const serviceName = ocrResult.service || 'OCR Service';
          Alert.alert(
            t('bankDocumentScannedSuccessfully') || 'Bank Document Scanned Successfully! 🎉',
            `${serviceName} ${t('extractedInformationFromBank') || 'has extracted:'}\n\n• ${t('bankName') || 'Bank'}: ${data.bank_name || (t('notDetected') || 'Not detected')}\n• ${t('bankAccountNumber') || 'Account Number'}: ${data.account_number || (t('notDetected') || 'Not detected')}\n• ${t('accountHolderName') || 'Account Name'}: ${data.account_name || (t('notDetected') || 'Not detected')}`,
            [{ text: t('ok') || 'OK' }]
          );
        } else {
          throw new Error('All OCR services failed to extract data');
        }
      } catch (ocrError) {
        setOcrProgress('');
        setIsProcessing(false);
        let title = 'OCR Scanning Failed 📄';
        let msg = 'Unable to extract information. Please enter details manually.';
        if (ocrError.message.includes('404')) {
          title = 'Server Configuration Issue 🔧';
          msg = 'OCR endpoint is unavailable. Enter details manually.';
        }
        if (ocrError.message.includes('timeout')) {
          title = 'Connection Timeout ⏱️';
          msg = 'OCR timed out. Enter details manually or try again later.';
        }
        Alert.alert(title, msg, [{ text: 'OK' }]);
      }
    } catch {
      setIsProcessing(false);
      setOcrProgress('');
      Alert.alert('Scanning Failed', 'Unable to extract information from the document. You can enter details manually.', [{ text: 'OK' }]);
    }
  };

  const tryOCRServices = async (base64Image) => {
    const services = [
      { name: 'OCR.Space (Free)', apiCall: () => tryOCRSpace(base64Image) },
      { name: 'Google Vision API (Alternative)', apiCall: () => tryGoogleVisionAlternative(base64Image) },
      { name: 'Custom Server', apiCall: () => tryCustomServer(base64Image) },
      { name: 'Manual Entry', apiCall: () => extractBankInfoFallback() },
    ];
    for (const s of services) {
      try {
        setOcrProgress(`Trying ${s.name}...`);
        const res = await s.apiCall();
        if (res && res.status === 'success') return res;
      } catch {
        // continue
      }
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
          headers: { apikey: 'helloworld' },
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
          headers: { apikey: 'helloworld', 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        });
      }
      if (!response.ok) throw new Error(`OCR.Space HTTP error: ${response.status}`);
      const result = await response.json();
      if (result.OCRExitCode === 1 && result.ParsedResults?.length > 0) {
        const txt = result.ParsedResults[0].ParsedText;
        if (!txt || txt.trim().length < 10) throw new Error('OCR.Space extracted text is too short');
        const data = parseBankBookText(txt);
        if (!data.bank_name && !data.account_number && !data.account_name) throw new Error('No meaningful bank data extracted');
        return { status: 'success', data, service: 'OCR.Space' };
      }
      const err = result.ErrorMessage?.join(', ') || result.ErrorDetails || 'Unknown OCR.Space error';
      throw new Error(err);
    } catch (e) {
      throw new Error(`OCR.Space API failed: ${e.message}`);
    }
  };

  const tryCustomServer = async (base64Image) => {
    try {
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('Request timeout')), 15000));
      const res = await Promise.race([
        fetch(`${ipAddress}/ocr/bank-book`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image, document_type: 'bank_book' }),
        }),
        timeout,
      ]);
      if (!res.ok) {
        if (res.status === 404) throw new Error('OCR endpoint not found');
        if (res.status === 413) throw new Error('Image file is too large');
        if (res.status === 500) throw new Error('Server internal error');
        throw new Error(`Custom server status ${res.status}`);
      }
      const type = res.headers.get('content-type');
      if (!type || !type.includes('application/json')) throw new Error('Non-JSON response');
      const text = await res.text();
      const json = JSON.parse(text);
      if (json.status === 'success' && json.data) return json;
      throw new Error(json.message || 'Custom server OCR failed');
    } catch (e) {
      throw new Error(`Custom server failed: ${e.message}`);
    }
  };

  const tryGoogleVisionAlternative = async (base64Image) => {
    try {
      await fetch('https://vision.googleapis.com/v1/images:annotate?key=YOUR_API_KEY', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{ image: { content: base64Image }, features: [{ type: 'TEXT_DETECTION', maxResults: 1 }] }],
        }),
      });
      throw new Error('Google Vision API key not configured');
    } catch (e) {
      throw new Error(`Google Vision API failed: ${e.message}`);
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
      /(\d{10,12})/g,
    ];
    const namePatterns = [
      /(?:ชื่อบัญชี|ชื่อ|Name)[:\s]*([^\n\r]+)/i,
      /(?:Account\s*Name|A\/C\s*Name)[:\s]*([^\n\r]+)/i,
      /(?:นาย|นาง|นางสาว|Mr\.?|Mrs\.?|Miss)[\s]*([^\n\r]+)/i,
    ];
    const branchPatterns = [/(\bสาขา\b|Branch)[:\s]*([^\n\r]+)/i, /(?:สาขาที่|สาขา)[:\s]*([^\n\r]+)/i];

    let extracted = { bank_name: '', account_number: '', account_name: '', branch: '' };

    for (const p of bankPatterns) if (p.pattern.test(text)) { extracted.bank_name = p.name; break; }
    for (const p of accountPatterns) {
      const m = text.match(p);
      if (m && m[1]) { extracted.account_number = m[1].replace(/[-\s]/g, ''); break; }
      else if (m && m[0] && !m[1]) { extracted.account_number = m[0].replace(/[-\s]/g, ''); break; }
    }
    for (const p of namePatterns) { const m = text.match(p); if (m && m[1]) { extracted.account_name = m[1].trim(); break; } }
    for (const p of branchPatterns) { const m = text.match(p); if (m && (m[1] || m[2])) { extracted.branch = (m[2] || m[1]).replace(/^(สาขา|Branch)[:\s]*/i,'').trim(); break; } }

    return extracted;
  };

  const extractBankInfoFallback = async () => ({
    status: 'failed',
    data: { bank_name: '', account_number: '', account_name: '', branch: '' },
    service: 'Manual Entry Required',
  });

  // ---------- Submit ----------
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
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const contentType = response.headers.get('content-type');
      let json = null; let text = '';
      try {
        text = await response.text();
        if (contentType && contentType.includes('application/json')) json = JSON.parse(text);
      } catch { /* ignore */ }

      if (response.ok && json && json.status === 'success') {
        Alert.alert(t('bankVerificationSubmittedSuccessfully') || 'Bank Verification Submitted Successfully!', '', [
          { text: t('ok') || 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        let message = t('unableToSubmitBankVerification') || 'Unable to submit bank verification';
        if (response.status === 413) message = t('imageFileTooLarge') || 'Image file is too large. Try a smaller photo.';
        else if (response.status === 400) message = json?.message || (t('invalidRequestCheckFields') || 'Invalid request. Check required fields.');
        else if (response.status === 404) message = t('uploadServiceNotAvailable') || 'Upload service not available.';
        else if (response.status === 500) {
          message = (text.includes('<html>') || text.includes('<!DOCTYPE')) ? (t('serverInternalError') || 'Server internal error. Try later.') : (json?.message || t('serverError') || 'Server error.');
        } else if (json?.message) message = json.message;
        else if (text && !text.includes('<html>')) message = text.length > 100 ? (t('serverReturnedError') || 'Server returned an error.') : text;
        Alert.alert(t('uploadFailed') || '❌ Upload Failed', message);
      }
    } catch (error) {
      let msg = t('errorOccurredWhileSubmitting') || 'An error occurred while submitting bank verification';
      if (error.message?.includes('Network request failed')) msg = t('networkConnectionFailed') || 'Network connection failed. Please try again.';
      else if (error.message?.includes('timeout')) msg = t('uploadTimeout') || 'Upload timeout. Try a smaller image.';
      else if (error.name === 'SyntaxError') msg = t('invalidServerResponse') || 'Server returned an invalid response.';
      Alert.alert(t('uploadError') || '⚠️ Upload Error', msg);
    } finally {
      setIsLoadingBank(false);
    }
  };

  // ---------- Bank list + existing ----------
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
        const mapped = data.data.map(b => ({
          id: b.md_bankname_id,
          bankname: b.md_bankname_name,
          status: b.md_bankname_status,
          bank_code: b.md_bankname_masterkey || '',
        }));
        setBankList(mapped);
      } else {
        throw new Error(data.message || 'Failed to fetch bank list');
      }
    } catch {
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

      const response = await fetch(`${ipAddress}/bankbook-info`, { method: 'GET', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (!response.ok) return;

      const json = await response.json();
      if (json.status === 'success' && json.data) {
        const { bank_id, account_name, account_number, document_path, has_bank_id, has_account_name, has_account_number, has_document } = json.data;

        if (has_account_name && account_name) setBankAccount(account_name);
        if (has_account_number && account_number) setBankNumber(account_number);
        if (has_bank_id && bank_id) setSelectedBankId(bank_id);
        if (has_document && document_path) {
          const cleanedPath = document_path.replace('/AppApi/', '/');
          const full = `https://thetrago.com/${cleanedPath}`;
          setPhoto(full);
        }

        setExistingBankInfo({
          bank_name: '',
          account_number: account_number || '',
          account_holder: account_name || '',
          branch: '',
          document_path: document_path || '',
          has_bank_account: has_account_name && has_account_number,
          has_document: has_document,
          last_updated: json.data.last_updated,
        });
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    if (bankList.length > 0 && selectedBankId) {
      const bank = bankList.find(b => b.id === selectedBankId);
      if (bank && selectedBank === 'Select Bank Name') setSelectedBank(bank.bankname);
    }
  }, [bankList, selectedBankId]);

  // ---------- Modal handlers ----------
  const toggleBankModal = () => setIsBankModalVisible(!isBankModalVisible);
  const handleSelectBank = (bank) => {
    setSelectedBank(bank.bankname);
    setSelectedBankId(bank.id);
    toggleBankModal();
    setSearchBankQuery('');
  };
  const filteredBanks = bankList.filter(b => b.bankname?.toLowerCase().includes(searchBankQuery.toLowerCase()));

  // ---------- UI ----------
  return (
    <View style={styles.containerPremium}>
      <StatusBar barStyle="light-content" backgroundColor="#FD501E" />

      {/* Particles */}
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

      {/* Header with measured animation */}
      <Animated.View
        onLayout={onHeaderLayout}
        style={[styles.headerContainer, { opacity: fadeAnim, transform: [{ translateY: headerY }] }]}
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
              <Text style={styles.headerTitle}>{t('bankVerification') || 'Bank Verification'}</Text>
              <Text style={styles.headerSubtitle}>{t('verifyBankAccount') || 'Verify your bank account'}</Text>

              <Animated.View style={[styles.floatingDecor, { transform: [{ rotate: spin }] }]}>
                <MaterialCommunityIcons name="bank" size={20} color="rgba(255,255,255,0.3)" />
              </Animated.View>
              <Animated.View style={[styles.floatingDecor2, { transform: [{ rotate: spin }] }]}>
                <MaterialCommunityIcons name="shield-check" size={16} color="rgba(255,255,255,0.2)" />
              </Animated.View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      {/* Content */}
      <ScrollView
        style={{ marginTop: headerHeight }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
        showsVerticalScrollIndicator={false}
        bounces
        contentInsetAdjustmentBehavior="never"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.contentContainer}>
          {/* Form */}
          <Animated.View
            style={[
              styles.formCardPremium,
              { opacity: cardAnims[0].opacity, transform: [{ translateY: cardAnims[0].translateY }, { scale: cardAnims[0].scale }] },
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
                placeholder={t('enterAccountHolderName') || 'Enter account holder name'}
                value={bankAccount}
                onChangeText={setBankAccount}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputWrapperPremium}>
              <Text style={styles.inputLabelPremium}>{t('bankAccountNumber') || 'Bank Account Number'} *</Text>
              <TextInput
                style={styles.inputPremium}
                placeholder={t('enterBankAccountNumber') || 'Enter your bank account number'}
                value={bankNumber}
                onChangeText={setBankNumber}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputWrapperPremium}>
              <Text style={styles.inputLabelPremium}>{t('uploadBankBookDocument') || 'Upload your book bank document'} *</Text>

              <View style={styles.ocrStatusBanner}>
                <MaterialCommunityIcons name="information-outline" size={16} color="#3B82F6" />
                <Text style={styles.ocrStatusText}>
                  {t('appWorksOCROptional') || '📱 App works perfectly! OCR is optional - manual entry is always available'}
                </Text>
              </View>

              <TouchableOpacity style={styles.uploadButtonPremium} onPress={pickImage} activeOpacity={0.8} disabled={isProcessing}>
                <LinearGradient
                  colors={photo ? ['#22C55E', '#16A34A'] : ['rgba(253, 80, 30, 0.1)', 'rgba(255, 107, 64, 0.1)']}
                  style={styles.uploadGradient}
                >
                  {isProcessing ? (
                    <>
                      <Animated.View style={{ transform: [{ rotate: uploadLoadingSpin }] }}>
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
                  style={[
                    styles.documentPreview,
                    { opacity: cardAnims[1].opacity, transform: [{ translateY: cardAnims[1].translateY }, { scale: cardAnims[1].scale }] },
                  ]}
                >
                  <View style={styles.documentContainer}>
                    <Image
                      source={{ uri: photo }}
                      style={styles.documentImage}
                      onError={() => setImageLoadError(true)}
                      onLoad={() => setImageLoadError(false)}
                    />
                    {imageLoadError && (
                      <View style={styles.imageErrorContainer}>
                        <MaterialIcons name="error" size={32} color="#EF4444" />
                        <Text style={styles.imageErrorText}>{t('failedToLoadImage') || 'Failed to load image'}</Text>
                        <Text style={styles.imageErrorUri}>{photo}</Text>
                      </View>
                    )}
                    <View style={styles.documentOverlay}>
                      <TouchableOpacity style={styles.retakeButton} onPress={pickImage} activeOpacity={0.8}>
                        <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
                        <Text style={styles.retakeButtonText}>{t('retake') || 'Retake'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              )}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.saveButtonPremium, styles.saveButtonFullWidth]}
                onPress={saveBankVerification}
                activeOpacity={0.8}
                disabled={isLoadingBank}
              >
                <LinearGradient colors={['#FD501E', '#FF6B40']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveGradient}>
                  {isLoadingBank ? (
                    <Animated.View style={{ transform: [{ rotate: saveLoadingSpin }] }}>
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
          </Animated.View>

          {/* Info */}
          <Animated.View
            style={[
              styles.infoCardPremium,
              { opacity: cardAnims[1].opacity, transform: [{ translateY: cardAnims[1].translateY }, { scale: cardAnims[1].scale }] },
            ]}
          >
            <View style={styles.infoHeader}>
              <MaterialCommunityIcons name="information" size={24} color="#3B82F6" />
              <Text style={styles.infoTitle}>{t('verificationInformation') || 'Verification Information'}</Text>
            </View>

            <Text style={styles.infoText}>
              {t('verificationRequiredInfo') ||
                '• Bank verification is required for secure transactions\n• Your information will be verified within 1-3 business days\n• Ensure all details match your bank account exactly\n• Supported document types: Bank book, Bank statement'}
            </Text>
          </Animated.View>
        </View>
      </ScrollView>

      {/* Bank modal */}
      <Modal visible={isBankModalVisible} transparent animationType="fade" onRequestClose={toggleBankModal}>
        <View style={styles.modalOverlayPremium}>
          <Animated.View style={[styles.modalContentPremium, { transform: [{ scale: 1 }] }]}>
            <LinearGradient colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.95)']} style={styles.modalGradient}>
              <View style={styles.modalHeaderPremium}>
                <Text style={styles.modalTitlePremium}>{t('selectBank') || 'Select Bank'}</Text>
                <TouchableOpacity onPress={toggleBankModal} style={styles.closeButtonPremium}>
                  <MaterialIcons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <TextInput
                placeholder={t('searchBank') || 'Search bank'}
                value={searchBankQuery}
                onChangeText={setSearchBankQuery}
                style={styles.searchInputPremium}
                placeholderTextColor="#9CA3AF"
              />

              {isLoadingBankList ? (
                <View style={styles.modalLoadingContainer}>
                  <Animated.View style={{ transform: [{ rotate: loadingSpin }] }}>
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
