import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
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
  FlatList
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useCustomer } from './CustomerContext.js';
import { useLanguage } from './LanguageContext';
import { Linking } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import ipAddress from "../../config/ipconfig";
import { styles } from '../../styles/CSS/BankVerificationScreenStyles';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BankVerificationScreen = ({ navigation }) => {
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

  // Bank selection states
  const [isBankModalVisible, setIsBankModalVisible] = useState(false);
  const [bankList, setBankList] = useState([]);
  const [isLoadingBankList, setIsLoadingBankList] = useState(false);
  const [bankListError, setBankListError] = useState(null);
  const [searchBankQuery, setSearchBankQuery] = useState('');

  // New states for bank verification data from API
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

  // Premium Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Loading icon animation - separate refs for different contexts
  const loadingRotateAnim = useRef(new Animated.Value(0)).current;
  const uploadLoadingRotateAnim = useRef(new Animated.Value(0)).current;
  const saveLoadingRotateAnim = useRef(new Animated.Value(0)).current;

  // Floating particles animation
  const floatingAnims = useRef(
    [...Array(6)].map(() => ({
      x: new Animated.Value(Math.random() * screenWidth - screenWidth / 2),
      y: new Animated.Value(Math.random() * screenHeight * 0.8),
      opacity: new Animated.Value(0.1),
      scale: new Animated.Value(1),
    }))
  ).current;

  // Card animations
  const cardAnims = useRef(
    [...Array(2)].map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30),
      scale: new Animated.Value(0.9),
    }))
  ).current;

  // Safety timeout to prevent stuck loading states
  useEffect(() => {
    let loadingTimeout;

    if (isProcessing) {
      loadingTimeout = setTimeout(() => {
        setIsProcessing(false);
        setOcrProgress('');
        Alert.alert(
          t('bankProcessingTooLong') || 'Processing Taking Too Long ⏱️',
          t('bankProcessingTooLongMessage') || 'Bank document scanning is taking longer than expected.\n\n🚀 This usually means:\n• Slow internet connection\n• Large image file\n• Network congestion\n\n💡 Try:\n• Check WiFi/4G signal\n• Take a clearer, smaller photo\n• Or enter details manually',
          [
            { text: t('tryAgain') || 'Try Again', onPress: () => pickImage() },
            { text: t('enterManually') || 'Enter Manually', style: 'default' }
          ]
        );
      }, 120000); // 2 minute safety timeout
    }

    return () => {
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [isProcessing]);

  // Premium animations initialization
  useEffect(() => {
    // Premium entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 300,
        easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        delay: 500,
        easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
        useNativeDriver: true,
      }),
    ]).start();

    // Floating particles animation
    floatingAnims.forEach((anim, index) => {
      const animateParticle = () => {
        Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(anim.y, {
                toValue: -50,
                duration: 4000 + index * 400,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
              Animated.timing(anim.y, {
                toValue: screenHeight * 0.8,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(anim.opacity, {
                toValue: 0.3,
                duration: 2000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.opacity, {
                toValue: 0.1,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]),
            Animated.loop(
              Animated.sequence([
                Animated.timing(anim.scale, {
                  toValue: 1.2,
                  duration: 2500,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
                Animated.timing(anim.scale, {
                  toValue: 0.8,
                  duration: 2500,
                  easing: Easing.inOut(Easing.sin),
                  useNativeDriver: true,
                }),
              ])
            ),
          ])
        ).start();
      };

      setTimeout(() => animateParticle(), index * 500);
    });

    // Card staggered animations
    cardAnims.forEach((anim, index) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(anim.opacity, {
            toValue: 1,
            duration: 700,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim.translateY, {
            toValue: 0,
            duration: 900,
            easing: Easing.bezier(0.175, 0.885, 0.32, 1.275),
            useNativeDriver: true,
          }),
          Animated.timing(anim.scale, {
            toValue: 1,
            duration: 800,
            easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
            useNativeDriver: true,
          }),
        ]).start();
      }, index * 200 + 800);
    });

    // Continuous pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Continuous rotation for decorative elements
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Loading icon rotation animations
    Animated.loop(
      Animated.timing(loadingRotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(uploadLoadingRotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(saveLoadingRotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const loadingSpin = loadingRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const uploadLoadingSpin = uploadLoadingRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const saveLoadingSpin = saveLoadingRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  // Enhanced image picker with options for camera or gallery
  const pickImage = async () => {
    Alert.alert(
      t('selectBankBookImage') || "Select Bank Book Image",
      t('bankBookScanningTips') || "📖 For best bank book scanning results:\n\n✅ Good Practices:\n• Use bright, even lighting\n• Place bank book on flat surface\n• Ensure all text is clearly visible\n• Keep camera parallel to the page\n• Include the bank name and account details\n\n❌ Avoid:\n• Shadows or glare on the page\n• Blurry or tilted images\n• Cut-off text or numbers\n\n💡 Note: OCR may not work perfectly. You can always enter information manually.\n\nChoose how you'd like to upload your bank book:",
      [
        {
          text: t('takePhotoEmoji') || "📷 Take Photo",
          onPress: () => openCamera(),
          style: "default"
        },
        {
          text: t('chooseFromGalleryEmoji') || "🖼️ Choose from Gallery",
          onPress: () => openGallery(),
          style: "default"
        },
        {
          text: t('cancel') || "Cancel",
          style: "cancel"
        }
      ],
      { cancelable: true }
    );
  };

  // Open camera function
  const openCamera = async () => {
    try {
      let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
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

      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 2], // Better aspect ratio for bank books
        quality: 0.6, // Reduced quality to prevent 413 errors
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        exif: false,
        allowsMultipleSelection: false,
        // Optimize for text recognition
        cameraType: ImagePicker.CameraType.back,
      });

      if (!result.canceled) {
        const croppedImage = await cropBankDocument(result.assets[0].uri);
        setPhoto(croppedImage);
        await checkNetworkAndProcess(croppedImage);
      } else {
        setIsProcessing(false);
        Alert.alert(
          t('noPhotoTaken') || 'No Photo Taken',
          t('noPhotoTakenMessage') || 'You can enter your bank information manually',
          [{ text: t('ok') || 'OK' }]
        );
      }

    } catch (error) {
      setIsProcessing(false);
      Alert.alert(
        t('error') || 'Error',
        t('unableToOpenCamera') || 'Unable to open camera. Please try again.',
        [{ text: t('ok') || 'OK' }]
      );
    }
  };

  // Open gallery function
  const openGallery = async () => {
    try {
      let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
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

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 2], // Better aspect ratio for bank books
        quality: 0.6, // Reduced quality to prevent 413 errors
        exif: false,
        allowsMultipleSelection: false,
      });

      if (!result.canceled) {
        const croppedImage = await cropBankDocument(result.assets[0].uri);
        setPhoto(croppedImage);
        await checkNetworkAndProcess(croppedImage);
      } else {
        setIsProcessing(false);
        Alert.alert(
          t('noImageSelected') || 'No Image Selected',
          t('noImageSelectedMessage') || 'You can enter your bank information manually',
          [{ text: t('ok') || 'OK' }]
        );
      }

    } catch (error) {
      setIsProcessing(false);
      Alert.alert(
        t('error') || 'Error',
        t('unableToAccessGallery') || 'Unable to access gallery. Please try again.',
        [{ text: t('ok') || 'OK' }]
      );
    }
  };

  // Auto-crop bank document from image
  const cropBankDocument = async (uri) => {
    try {
      const imageInfo = await ImageManipulator.manipulateAsync(uri, [], { format: ImageManipulator.SaveFormat.JPEG });
      const { width, height } = imageInfo;
      const aspectRatio = 3 / 2; // Better aspect ratio for bank books

      let cropWidth, cropHeight, originX, originY;

      if (width / height > aspectRatio) {
        cropHeight = height * 0.85; // Increased crop area for bank books
        cropWidth = cropHeight * aspectRatio;
        originX = (width - cropWidth) / 2;
        originY = height * 0.075; // Better positioning for bank book text
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

      // Process image in separate steps to avoid transformation conflicts
      const croppedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          {
            crop: {
              originX: Math.round(originX),
              originY: Math.round(originY),
              width: Math.round(cropWidth),
              height: Math.round(cropHeight),
            },
          }
        ],
        {
          compress: 0.6, // Reduced compression to prevent 413 errors
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      // Then resize for better OCR quality
      const enhancedImage = await ImageManipulator.manipulateAsync(
        croppedImage.uri,
        [
          { resize: { width: 800 } } // Reduced resolution to prevent 413 errors while maintaining OCR quality
        ],
        {
          compress: 0.5, // Lower compression for final image
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return enhancedImage.uri;

    } catch (error) {
      return uri;
    }
  };

  // Check network and process image
  const checkNetworkAndProcess = async (imageUri) => {
    try {
      setOcrProgress(t('checkingConnection') || 'Checking connection...');

      await recognizeText(imageUri);

    } catch (error) {
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

  // OCR function for bank documents
  const recognizeText = async (uri) => {
    try {
      setOcrProgress(t('processingBankDocument') || 'Processing bank document...');

      const processedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: 600 } }, // Smaller size to prevent 413 errors while maintaining OCR quality
        ],
        {
          compress: 0.5, // Lower compression to reduce file size significantly
          format: ImageManipulator.SaveFormat.JPEG
        }
      );

      setOcrProgress(t('readingBankInformation') || 'Reading bank information...');

      const base64Image = await FileSystem.readAsStringAsync(processedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send to OCR API service
      setOcrProgress(t('analyzingBankData') || 'Analyzing bank data...');
      
      try {
        // Try multiple free OCR services
        const ocrResult = await tryOCRServices(base64Image);
        
        if (ocrResult && ocrResult.status === 'success') {
          const extractedData = ocrResult.data || ocrResult;
          
          // Map OCR results to form fields
          if (extractedData.bank_name) {
            setSelectedBank(extractedData.bank_name);
            // Try to find matching bank in the list
            const matchingBank = bankList.find(bank => 
              bank.bankname.toLowerCase().includes(extractedData.bank_name.toLowerCase()) ||
              extractedData.bank_name.toLowerCase().includes(bank.bankname.toLowerCase())
            );
            if (matchingBank) {
              setSelectedBankId(matchingBank.id);
            }
          }
          
          if (extractedData.account_number) {
            setBankNumber(extractedData.account_number);
          }
          
          if (extractedData.account_name) {
            setBankAccount(extractedData.account_name);
          }
          
          if (extractedData.branch) {
            setBankBranch(extractedData.branch);
          }
          
          setOcrText(`Bank: ${extractedData.bank_name || 'N/A'}, Account: ${extractedData.account_number || 'N/A'}`);
          
          setOcrProgress('');
          setIsProcessing(false);
          
          const serviceName = ocrResult.service || 'OCR Service';
          Alert.alert(
            t('bankDocumentScannedSuccessfully') || 'Bank Document Scanned Successfully! 🎉',
            `${serviceName} ${t('extractedInformationFromBank') || 'has successfully extracted information from your bank book'}:\n\n• ${t('bankName') || 'Bank'}: ${extractedData.bank_name || (t('notDetected') || 'Not detected')}\n• ${t('bankAccountNumber') || 'Account Number'}: ${extractedData.account_number || (t('notDetected') || 'Not detected')}\n• ${t('accountHolderName') || 'Account Name'}: ${extractedData.account_name || (t('notDetected') || 'Not detected')}\n\n${t('verifyInformationAccuracy') || 'Please verify the information for accuracy.'}`,
            [{ text: t('ok') || 'OK' }]
          );
          
        } else {
          throw new Error('All OCR services failed to extract data');
        }
        
      } catch (ocrError) {
        // No fallback data - user must enter manually
        setOcrProgress('');
        setIsProcessing(false);
        
        // Provide specific feedback based on the failure
        let alertTitle = 'OCR Scanning Failed 📄';
        let alertMessage = 'Unable to automatically extract information from your bank book.\n\n📝 Please enter your bank information manually in the form below.\n\n💡 Tips for better results:\n• Ensure good lighting\n• Keep camera steady\n• Make sure text is clearly visible\n• Try taking photo from directly above';
        
        // Check if it's a specific server issue
        if (ocrError.message.includes('404')) {
          alertTitle = 'Server Configuration Issue 🔧';
          alertMessage = 'The OCR service is currently unavailable.\n\n📝 Please enter your bank information manually.\n\n🔧 Note: The server OCR endpoint needs to be configured at /ocr/bank-book';
        } else if (ocrError.message.includes('timeout')) {
          alertTitle = 'Connection Timeout ⏱️';
          alertMessage = 'The OCR service is taking too long to respond.\n\n📝 Please enter your bank information manually.\n\n🌐 Check your internet connection and try again later.';
        }
        
        Alert.alert(alertTitle, alertMessage, [{ text: 'OK' }]);
      }

    } catch (error) {
      setIsProcessing(false);
      setOcrProgress('');
      
      Alert.alert(
        'Scanning Failed',
        'Unable to extract information from the bank document. You can enter the details manually.',
        [{ text: 'OK' }]
      );
    }
  };

  // Free OCR Services Integration
  const tryOCRServices = async (base64Image) => {
    const ocrServices = [
      {
        name: 'OCR.Space (Free)',
        apiCall: () => tryOCRSpace(base64Image),
        priority: 1
      },
      {
        name: 'Google Vision API (Alternative)',
        apiCall: () => tryGoogleVisionAlternative(base64Image),
        priority: 2
      },
      {
        name: 'Custom Server',
        apiCall: () => tryCustomServer(base64Image),
        priority: 3
      },
      {
        name: 'Manual Entry',
        apiCall: () => extractBankInfoFallback(),
        priority: 4
      }
    ];

    for (const service of ocrServices) {
      try {
        setOcrProgress(`Trying ${service.name}...`);
        
        const result = await service.apiCall();
        if (result && result.status === 'success') {
          return result;
        }
      } catch (error) {
        continue; // Try next service
      }
    }
    
    throw new Error('All OCR services failed');
  };

  // OCR.Space Free API (25,000 requests/month)
  const tryOCRSpace = async (base64Image) => {
    try {
      // Try both FormData and URL-encoded approaches
      let response;
      
      try {
        // Method 1: FormData (preferred)
        const formData = new FormData();
        formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
        formData.append('language', 'tha');
        formData.append('OCREngine', '2');
        formData.append('isTable', 'true');
        formData.append('isOverlayRequired', 'false');
        
        response = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          headers: {
            'apikey': 'helloworld', // Free API key (limited)
          },
          body: formData,
        });
      } catch (formDataError) {
        // Method 2: URL-encoded fallback
        const params = new URLSearchParams();
        params.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
        params.append('language', 'tha');
        params.append('OCREngine', '2');
        params.append('isTable', 'true');
        params.append('isOverlayRequired', 'false');
        
        response = await fetch('https://api.ocr.space/parse/image', {
          method: 'POST',
          headers: {
            'apikey': 'helloworld',
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });
      }

      if (!response.ok) {
        throw new Error(`OCR.Space HTTP error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.OCRExitCode === 1 && result.ParsedResults?.length > 0) {
        const extractedText = result.ParsedResults[0].ParsedText;
        
        if (!extractedText || extractedText.trim().length < 10) {
          throw new Error('OCR.Space extracted text is too short or empty');
        }
        
        // Parse Thai bank book text
        const bankData = parseBankBookText(extractedText);
        
        // Check if we extracted any meaningful data
        if (!bankData.bank_name && !bankData.account_number && !bankData.account_name) {
          throw new Error('No meaningful bank data could be extracted from text');
        }
        
        return {
          status: 'success',
          data: bankData,
          service: 'OCR.Space'
        };
      } else {
        const errorMsg = result.ErrorMessage?.join(', ') || result.ErrorDetails || 'Unknown OCR.Space error';
        throw new Error(`OCR.Space parsing failed: ${errorMsg}`);
      }
    } catch (error) {
      throw new Error(`OCR.Space API failed: ${error.message}`);
    }
  };

  // Custom server OCR (your existing API)
  const tryCustomServer = async (base64Image) => {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 15000) // Increased timeout
      );

      const fetchPromise = fetch(`${ipAddress}/ocr/bank-book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          document_type: 'bank_book'
        }),
      });

      const ocrResponse = await Promise.race([fetchPromise, timeoutPromise]);

      if (!ocrResponse.ok) {
        if (ocrResponse.status === 404) {
          throw new Error('OCR endpoint not found on server. Please check if the server is properly configured.');
        }
        if (ocrResponse.status === 413) {
          throw new Error('Image file is too large. Please try taking a closer, clearer photo.');
        }
        if (ocrResponse.status === 500) {
          throw new Error('Server internal error. Please try again later.');
        }
        throw new Error(`Custom server returned status ${ocrResponse.status}`);
      }

      const contentType = ocrResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Custom server returned non-JSON response');
      }

      const responseText = await ocrResponse.text();
      
      const ocrResult = JSON.parse(responseText);
      
      if (ocrResult.status === 'success' && ocrResult.data) {
        return ocrResult;
      } else {
        throw new Error(ocrResult.message || 'Custom server OCR processing failed');
      }
    } catch (error) {
      throw new Error(`Custom server failed: ${error.message}`);
    }
  };

  // Alternative Google Vision API (Free tier available)
  const tryGoogleVisionAlternative = async (base64Image) => {
    try {
      // Note: This would require a Google Cloud API key
      // For demo purposes, we'll simulate a response or use a proxy service
      // You can replace this with actual Google Vision API call when you have an API key
      
      const response = await fetch('https://vision.googleapis.com/v1/images:annotate?key=YOUR_API_KEY', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 1
                }
              ]
            }
          ]
        }),
      });

      // For now, we'll throw an error since we don't have a real API key
      throw new Error('Google Vision API key not configured');
      
      // Uncomment and modify this when you have a real API key:
      /*
      const result = await response.json();
      
      if (result.responses && result.responses[0] && result.responses[0].textAnnotations) {
        const extractedText = result.responses[0].textAnnotations[0].description;
        
        const bankData = parseBankBookText(extractedText);
        
        return {
          status: 'success',
          data: bankData,
          service: 'Google Vision API'
        };
      } else {
        throw new Error('Google Vision API parsing failed');
      }
      */
      
    } catch (error) {
      throw new Error(`Google Vision API failed: ${error.message}`);
    }
  };

  // Parse bank book text using patterns
  const parseBankBookText = (text) => {
    // Thai bank name patterns with English alternatives
    const bankPatterns = [
      { 
        pattern: /(?:ธนาคาร)?กรุงเทพ|bangkok\s*bank|BBL/i, 
        name: 'ธนาคารกรุงเทพ',
        english: 'Bangkok Bank'
      },
      { 
        pattern: /(?:ธนาคาร)?กสิกร|kasikorn|KBANK|K-?BANK/i, 
        name: 'ธนาคารกสิกรไทย',
        english: 'Kasikornbank'
      },
      { 
        pattern: /(?:ธนาคาร)?กรุงไทย|krung\s*thai|KTB/i, 
        name: 'ธนาคารกรุงไทย',
        english: 'Krung Thai Bank'
      },
      { 
        pattern: /(?:ธนาคาร)?ไทยพาณิชย์|siam\s*commercial|SCB/i, 
        name: 'ธนาคารไทยพาณิชย์',
        english: 'Siam Commercial Bank'
      },
      { 
        pattern: /(?:ธนาคาร)?กรุงศรี|ayudhya|BAY|กรุงศรีอยุธยา/i, 
        name: 'ธนาคารกรุงศรีอยุธยา',
        english: 'Bank of Ayudhya'
      },
      { 
        pattern: /(?:ธนาคาร)?ทีเอ็มบี|TMB|thanachart|TTB|ธนชาต/i, 
        name: 'ธนาคารทีเอ็มบีธนชาต',
        english: 'TMBThanachart Bank'
      },
      { 
        pattern: /(?:ธนาคาร)?ออมสิน|GSB|government\s*saving/i, 
        name: 'ธนาคารออมสิน',
        english: 'Government Savings Bank'
      },
      { 
        pattern: /(?:ธนาคาร)?ซีไอเอ็มบี|CIMB/i, 
        name: 'ธนาคารซีไอเอ็มบีไทย',
        english: 'CIMB Thai Bank'
      }
    ];
    
    // Account number patterns for Thai banks
    const accountPatterns = [
      /(?:เลขที่บัญชี|บัญชีเลขที่|Account\s*No\.?|A\/C\s*No\.?)[:\s]*(\d{3}[-\s]?\d{1}[-\s]?\d{5}[-\s]?\d{1})/i,
      /(?:เลขที่บัญชี|บัญชีเลขที่|Account\s*No\.?|A\/C\s*No\.?)[:\s]*(\d{3}[-\s]?\d{7})/i,
      /(?:เลขที่บัญชี|บัญชีเลขที่|Account\s*No\.?|A\/C\s*No\.?)[:\s]*(\d{10,12})/i,
      /(\d{3}[-\s]?\d{1}[-\s]?\d{5}[-\s]?\d{1})/g,
      /(\d{3}[-\s]?\d{7})/g,
      /(\d{10,12})/g
    ];
    
    // Account name patterns
    const namePatterns = [
      /(?:ชื่อบัญชี|ชื่อ|Name)[:\s]*([^\n\r]+)/i,
      /(?:Account\s*Name|A\/C\s*Name)[:\s]*([^\n\r]+)/i,
      /(?:นาย|นาง|นางสาว|Mr\.?|Mrs\.?|Miss)[\s]*([^\n\r]+)/i
    ];
    
    // Branch patterns
    const branchPatterns = [
      /(?:สาขา|Branch)[:\s]*([^\n\r]+)/i,
      /(?:สาขาที่|สาขา)[:\s]*([^\n\r]+)/i
    ];

    let extractedData = {
      bank_name: '',
      account_number: '',
      account_name: '',
      branch: ''
    };

    // Extract bank name
    for (const bankPattern of bankPatterns) {
      if (bankPattern.pattern.test(text)) {
        extractedData.bank_name = bankPattern.name;
        break;
      }
    }

    // Extract account number
    for (const pattern of accountPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        extractedData.account_number = match[1].replace(/[-\s]/g, '');
        break;
      } else if (match && match[0] && !match[1]) {
        extractedData.account_number = match[0].replace(/[-\s]/g, '');
        break;
      }
    }

    // Extract account name
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        extractedData.account_name = match[1].trim();
        break;
      }
    }

    // Extract branch
    for (const pattern of branchPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        extractedData.branch = match[1].trim();
        break;
      }
    }

    return extractedData;
  };

  // Save bank verification data using the new API
  const saveBankVerification = async () => {
    if (!selectedBank || selectedBank === 'Select Bank Name' || !bankNumber || !bankAccount) {
      Alert.alert(
        'Missing Information',
        'Please fill in bank name, account number, and account holder name.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!selectedBankId) {
      Alert.alert(
        'Bank Selection Required',
        'Please select a bank from the list.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!photo) {
      Alert.alert(
        'Document Required',
        'Please upload your bank book document.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsLoadingBank(true);
      const token = await SecureStore.getItemAsync('userToken');

      if (!token) {
        Alert.alert(t('error') || 'Error', t('userTokenNotFound') || 'User token not found');
        return;
      }

      // Create FormData for file upload - matching server API exactly
      const formData = new FormData();
      formData.append('bank_id', selectedBankId.toString());
      formData.append('account_number', bankNumber);
      formData.append('account_name', bankAccount); // Changed to match server API
      
      // Add the bank document image - matching server field name
      formData.append('bankbook_document', {
        uri: photo,
        type: 'image/jpeg',
        name: 'bankbook_document.jpg',
      });

      const response = await fetch(`${ipAddress}/upload-bankbook`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      // Check if response is JSON or HTML
      const contentType = response.headers.get('content-type');
      let json = null;
      let responseText = '';

      try {
        responseText = await response.text();
        
        if (contentType && contentType.includes('application/json')) {
          json = JSON.parse(responseText);
        }
      } catch (parseError) {
        // Parsing error - continue with error handling
      }

      if (response.ok && json && json.status === 'success') {
        Alert.alert(
          t('bankVerificationSubmittedSuccessfully') || 'Bank Verification Submitted Successfully!',
          '',
          [
            {
              text: t('ok') || 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        let errorMessage = t('unableToSubmitBankVerification') || 'Unable to submit bank verification';
        
        if (response.status === 413) {
          errorMessage = t('imageFileTooLarge') || 'Image file is too large. Please try taking a smaller photo or compress the image.';
        } else if (response.status === 400) {
          errorMessage = json?.message || (t('invalidRequestCheckFields') || 'Invalid request. Please check all required fields.');
        } else if (response.status === 404) {
          errorMessage = t('uploadServiceNotAvailable') || 'Upload service not available. Please try again later.';
        } else if (response.status === 500) {
          if (responseText.includes('<html>') || responseText.includes('<!DOCTYPE')) {
            errorMessage = t('serverInternalError') || 'Server internal error occurred. Please try again later or contact support.';
          } else {
            errorMessage = json?.message || (t('serverError') || 'Server error. Please try again later.');
          }
        } else if (json && json.message) {
          errorMessage = json.message;
        } else if (responseText && !responseText.includes('<html>')) {
          errorMessage = responseText.length > 100 ? (t('serverReturnedError') || 'Server returned an error. Please try again.') : responseText;
        }
        
        Alert.alert(t('uploadFailed') || '❌ Upload Failed', errorMessage);
      }

    } catch (error) {
      let errorMessage = t('errorOccurredWhileSubmitting') || 'An error occurred while submitting bank verification';
      
      if (error.message.includes('Network request failed')) {
        errorMessage = t('networkConnectionFailed') || 'Network connection failed. Please check your internet connection and try again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = t('uploadTimeout') || 'Upload timeout. The file may be too large. Please try again with a smaller image.';
      } else if (error.message.includes('JSON Parse error')) {
        errorMessage = t('serverResponseError') || 'Server response error. The server may be experiencing issues. Please try again later.';
      } else if (error.name === 'SyntaxError') {
        errorMessage = t('invalidServerResponse') || 'Server returned an invalid response. Please try again or contact support if the issue persists.';
      }
      
      Alert.alert(t('uploadError') || '⚠️ Upload Error', errorMessage);
    } finally {
      setIsLoadingBank(false);
    }
  };

  // Bank selection handlers
  const toggleBankModal = () => setIsBankModalVisible(!isBankModalVisible);

  const handleSelectBank = (bank) => {
    setSelectedBank(bank.bankname);
    setSelectedBankId(bank.id); // Store bank ID for submission
    toggleBankModal();
    setSearchBankQuery(''); // Clear search when selecting
  };

  const filteredBanks = bankList.filter((bank) =>
    bank.bankname?.toLowerCase().includes(searchBankQuery.toLowerCase())
  );

  // Fetch bank list and existing bank info from API
  useEffect(() => {
    fetchBankList();
    loadExistingBankInfo();
  }, []);

  const fetchBankList = async () => {
    setIsLoadingBankList(true);
    setBankListError(null);
    
    try {
      const response = await fetch(`${ipAddress}/bankname`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        // Map the API response to the expected format
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
      
      // Fallback to static bank list if API fails
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

  // Load existing bank information if available
  const loadExistingBankInfo = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      
      if (!token) {
        return;
      }

      const response = await fetch(`${ipAddress}/bankbook-info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return;
      }

      const json = await response.json();

      if (json.status === 'success' && json.data) {
        const { 
          bank_id, 
          account_name, 
          account_number, 
          document_path, 
          has_bank_id, 
          has_account_name, 
          has_account_number, 
          has_document 
        } = json.data;
        
        // Update form fields with existing data
        if (has_account_name && account_name) {
          setBankAccount(account_name); // This is the account holder name
        }
        
        if (has_account_number && account_number) {
          setBankNumber(account_number); // This is the bank account number
        }
        
        if (has_bank_id && bank_id) {
          setSelectedBankId(bank_id);
          // Bank name will be set after bank list is loaded
        }
        
        if (has_document && document_path) {
          // Fix: Remove /AppApi/ from the path if it exists
          const cleanedPath = document_path.replace('/AppApi/', '/');
          const fullImagePath = `https://thetrago.com/${cleanedPath}`;
          // Set the photo to show document is uploaded
          setPhoto(fullImagePath);
        }
        
        // Update existing bank info state
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
    } catch (error) {
      // Error loading bank info - continue silently
    }
  };

  // Update bank name when bank list is loaded and we have a bank ID
  useEffect(() => {
    if (bankList.length > 0 && selectedBankId) {
      const bank = bankList.find(b => b.id === selectedBankId);
      if (bank && selectedBank === 'Select Bank Name') {
        setSelectedBank(bank.bankname);
      }
    }
  }, [bankList, selectedBankId]);

  // Fallback function - no demo data, just return empty result
  const extractBankInfoFallback = async () => {
    return {
      status: 'failed',
      data: {
        bank_name: '',
        account_number: '',
        account_name: '',
        branch: ''
      },
      service: 'Manual Entry Required'
    };
  };



  return (
    <View style={styles.containerPremium}>
      <StatusBar barStyle="light-content" backgroundColor="#FD501E" />
      
      {/* Floating Particles Background */}
      <View style={styles.particlesContainer}>
        {floatingAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.floatingParticle,
              {
                transform: [
                  { translateX: anim.x },
                  { translateY: anim.y },
                  { scale: anim.scale },
                ],
                opacity: anim.opacity,
              },
            ]}
          />
        ))}
      </View>

      {/* Premium Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#FD501E', '#FF6B40', '#FD501E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <SafeAreaView style={styles.safeAreaHeader}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{t('bankVerification') || 'Bank Verification'}</Text>
              <Text style={styles.headerSubtitle}>{t('verifyBankAccount') || 'Verify your bank account'}</Text>
              
              {/* Floating decorative elements */}
              <Animated.View 
                style={[
                  styles.floatingDecor,
                  { transform: [{ rotate: spin }] }
                ]}
              >
                <MaterialCommunityIcons name="bank" size={20} color="rgba(255,255,255,0.3)" />
              </Animated.View>
              
              <Animated.View 
                style={[
                  styles.floatingDecor2,
                  { transform: [{ rotate: spin }] }
                ]}
              >
                <MaterialCommunityIcons name="shield-check" size={16} color="rgba(255,255,255,0.2)" />
              </Animated.View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      <ScrollView 
        style={[styles.scrollViewPremium, styles.scrollViewWithMargin]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.contentContainer}>
          
          {/* Bank Information Form */}
          <Animated.View
            style={[
              styles.formCardPremium,
              {
                opacity: cardAnims[0]?.opacity || 1,
                transform: [
                  { translateY: cardAnims[0]?.translateY || 0 },
                  { scale: cardAnims[0]?.scale || 1 },
                ],
              },
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
              <TouchableOpacity
                style={styles.buttonPremium}
                onPress={toggleBankModal}
                activeOpacity={0.8}
              >
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

            <View style={styles.inputWrapperPremium}>
              <Text style={styles.inputLabelPremium}>{t('uploadBankBookDocument') || 'Upload your book bank document'} *</Text>
              
              {/* OCR Status Banner */}
              <View style={styles.ocrStatusBanner}>
                <MaterialCommunityIcons name="information-outline" size={16} color="#3B82F6" />
                <Text style={styles.ocrStatusText}>
                  {t('appWorksOCROptional') || '📱 App works perfectly! OCR is optional - manual entry is always available'}
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.uploadButtonPremium}
                onPress={pickImage}
                activeOpacity={0.8}
                disabled={isProcessing}
              >
                <LinearGradient
                  colors={photo ? ['#22C55E', '#16A34A'] : ['rgba(253, 80, 30, 0.1)', 'rgba(255, 107, 64, 0.1)']}
                  style={styles.uploadGradient}
                >
                  {isProcessing ? (
                    <>
                      <Animated.View style={{
                        transform: [
                          { rotate: uploadLoadingSpin }
                        ]
                      }}>
                        <MaterialCommunityIcons name="loading" size={24} color="#FFFFFF" />
                      </Animated.View>
                      <Text style={styles.uploadTextProcessing}>
                        {ocrProgress || t('processing') || 'Processing...'}
                      </Text>
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
              

              
              {/* Document Preview */}
              {photo && (
                <Animated.View
                  style={[
                    styles.documentPreview,
                    {
                      opacity: cardAnims[1]?.opacity || 1,
                      transform: [
                        { translateY: cardAnims[1]?.translateY || 0 },
                        { scale: cardAnims[1]?.scale || 1 },
                      ],
                    },
                  ]}
                >
                  <View style={styles.documentContainer}>
                    <Image 
                      source={{ uri: photo }} 
                      style={styles.documentImage}
                      onError={(error) => {
                        setImageLoadError(true);
                      }}
                      onLoad={() => {
                        setImageLoadError(false);
                      }}
                    />
                    {imageLoadError && (
                      <View style={styles.imageErrorContainer}>
                        <MaterialIcons name="error" size={32} color="#EF4444" />
                        <Text style={styles.imageErrorText}>{t('failedToLoadImage') || 'Failed to load image'}</Text>
                        <Text style={styles.imageErrorUri}>{photo}</Text>
                      </View>
                    )}
                    <View style={styles.documentOverlay}>
                      <TouchableOpacity
                        style={styles.retakeButton}
                        onPress={pickImage}
                        activeOpacity={0.8}
                      >
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
                <LinearGradient
                  colors={['#FD501E', '#FF6B40']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveGradient}
                >
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

          {/* Information Card */}
          <Animated.View
            style={[
              styles.infoCardPremium,
              {
                opacity: cardAnims[1]?.opacity || 1,
                transform: [
                  { translateY: cardAnims[1]?.translateY || 0 },
                  { scale: cardAnims[1]?.scale || 1 },
                ],
              },
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
        </View>
      </ScrollView>

      {/* Bank Selection Modal */}
      <Modal visible={isBankModalVisible} transparent animationType="fade" onRequestClose={toggleBankModal}>
        <View style={styles.modalOverlayPremium}>
          <Animated.View style={[styles.modalContentPremium, { transform: [{ scale: scaleAnim }] }]}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.95)']}
              style={styles.modalGradient}
            >
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
                    <TouchableOpacity 
                      style={styles.optionItemPremium} 
                      onPress={() => handleSelectBank(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.optionTextPremium}>{item.bankname}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  showsVerticalScrollIndicator={true}
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
