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
import { Linking } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import ipAddress from "../ipconfig";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BankVerificationScreen = ({ navigation }) => {
  const { customerData } = useCustomer();
  const [photo, setPhoto] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [selectedBank, setSelectedBank] = useState('Select Bank Name');
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
        console.log('⚠️ Auto-clearing stuck loading state after timeout');
        setIsProcessing(false);
        setOcrProgress('');
        Alert.alert(
          'Processing Taking Too Long ⏱️',
          'Bank document scanning is taking longer than expected.\n\n🚀 This usually means:\n• Slow internet connection\n• Large image file\n• Network congestion\n\n💡 Try:\n• Check WiFi/4G signal\n• Take a clearer, smaller photo\n• Or enter details manually',
          [
            { text: 'Try Again', onPress: () => pickImage() },
            { text: 'Enter Manually', style: 'default' }
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
      "Select Bank Book Image",
      "📖 For best bank book scanning results:\n\n✅ Good Practices:\n• Use bright, even lighting\n• Place bank book on flat surface\n• Ensure all text is clearly visible\n• Keep camera parallel to the page\n• Include the bank name and account details\n\n❌ Avoid:\n• Shadows or glare on the page\n• Blurry or tilted images\n• Cut-off text or numbers\n\n💡 Note: OCR may not work perfectly. You can always enter information manually.\n\nChoose how you'd like to upload your bank book:",
      [
        {
          text: "📷 Take Photo",
          onPress: () => openCamera(),
          style: "default"
        },
        {
          text: "🖼️ Choose from Gallery",
          onPress: () => openGallery(),
          style: "default"
        },
        {
          text: "✍️ Manual Entry Only",
          onPress: () => {
            Alert.alert(
              'Manual Entry Mode 📝',
              'You can enter your bank information manually without uploading a document.\n\n📋 Please fill in the form fields below.',
              [{ text: 'OK' }]
            );
          },
          style: "default"
        },
        {
          text: "Cancel",
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
          "Camera Permission Required",
          "Permission to access camera is required to scan your bank document!",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() }
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
          'No Photo Taken',
          'You can enter your bank information manually',
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      console.error('Error in openCamera:', error);
      setIsProcessing(false);
      Alert.alert(
        'Error',
        'Unable to open camera. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Open gallery function
  const openGallery = async () => {
    try {
      let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert(
          "Gallery Permission Required",
          "Permission to access photo library is required to select images!",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() }
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
          'No Image Selected',
          'You can enter your bank information manually',
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      console.error('Error in openGallery:', error);
      setIsProcessing(false);
      Alert.alert(
        'Error',
        'Unable to access gallery. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Auto-crop bank document from image
  const cropBankDocument = async (uri) => {
    try {
      console.log('🔍 Auto-cropping and enhancing bank document from image...');

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

      console.log('✅ Bank document cropped and enhanced successfully');
      return enhancedImage.uri;

    } catch (error) {
      console.error('❌ Bank document auto-crop failed, using original image:', error);
      return uri;
    }
  };

  // Check network and process image
  const checkNetworkAndProcess = async (imageUri) => {
    try {
      console.log('🌐 Checking network connection for bank document processing...');
      setOcrProgress('Checking connection...');

      await recognizeText(imageUri);

    } catch (error) {
      console.error('❌ Network check or processing failed:', error);
      setIsProcessing(false);
      setOcrProgress('');
      
      Alert.alert(
        'Processing Failed',
        'Unable to process the bank document. Please check your internet connection and try again, or enter the information manually.',
        [
          { text: 'Retry', onPress: () => checkNetworkAndProcess(imageUri) },
          { text: 'Enter Manually', style: 'default' }
        ]
      );
    }
  };

  // OCR function for bank documents
  const recognizeText = async (uri) => {
    try {
      console.log('🔍 Starting OCR processing for bank document:', uri);
      setOcrProgress('Processing bank document...');

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

      console.log('📷 Bank document image optimized, starting OCR...');
      
      // Log file size for debugging
      const fileInfo = await FileSystem.getInfoAsync(processedImage.uri);
      console.log(`📊 Processed image size: ${(fileInfo.size / 1024 / 1024).toFixed(2)} MB`);
      
      setOcrProgress('Reading bank information...');

      const base64Image = await FileSystem.readAsStringAsync(processedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send to OCR API service
      setOcrProgress('Analyzing bank data...');
      
      try {
        // Try multiple free OCR services
        const ocrResult = await tryOCRServices(base64Image);
        
        if (ocrResult && ocrResult.status === 'success') {
          const extractedData = ocrResult.data || ocrResult;
          console.log('✅ OCR extracted data:', extractedData);
          
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
            'Bank Document Scanned Successfully! 🎉',
            `${serviceName} has successfully extracted information from your bank book:\n\n• Bank: ${extractedData.bank_name || 'Not detected'}\n• Account Number: ${extractedData.account_number || 'Not detected'}\n• Account Name: ${extractedData.account_name || 'Not detected'}\n\nPlease verify the information for accuracy.`,
            [{ text: 'OK' }]
          );
          
        } else {
          throw new Error('All OCR services failed to extract data');
        }
        
      } catch (ocrError) {
        console.log('⚠️ All OCR services failed:', ocrError.message);
        
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
      console.error('❌ Bank document OCR failed:', error);
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
        console.log(`🔍 Trying ${service.name}...`);
        setOcrProgress(`Trying ${service.name}...`);
        
        const result = await service.apiCall();
        if (result && result.status === 'success') {
          console.log(`✅ ${service.name} succeeded`);
          return result;
        }
      } catch (error) {
        console.log(`❌ ${service.name} failed:`, error.message);
        continue; // Try next service
      }
    }
    
    throw new Error('All OCR services failed');
  };

  // OCR.Space Free API (25,000 requests/month)
  const tryOCRSpace = async (base64Image) => {
    try {
      console.log('🌐 Attempting OCR.Space API...');
      
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: {
          'apikey': 'helloworld', // Free API key (limited)
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `base64Image=data:image/jpeg;base64,${base64Image}&language=tha&OCREngine=2&isTable=true&isOverlayRequired=false`,
      });

      if (!response.ok) {
        throw new Error(`OCR.Space HTTP error: ${response.status}`);
      }

      const result = await response.json();
      console.log('📄 OCR.Space full response:', result);
      
      if (result.OCRExitCode === 1 && result.ParsedResults?.length > 0) {
        const extractedText = result.ParsedResults[0].ParsedText;
        console.log('📄 OCR.Space extracted text:', extractedText);
        
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
        const errorMsg = result.ErrorMessage?.join(', ') || 'Unknown OCR.Space error';
        throw new Error(`OCR.Space parsing failed: ${errorMsg}`);
      }
    } catch (error) {
      console.error('❌ OCR.Space detailed error:', error);
      throw new Error(`OCR.Space API failed: ${error.message}`);
    }
  };

  // Custom server OCR (your existing API)
  const tryCustomServer = async (base64Image) => {
    try {
      console.log('🌐 Attempting custom server OCR...');
      console.log(`📡 Server endpoint: ${ipAddress}/ocr/bank-book`);
      
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

      console.log(`📊 Custom server response status: ${ocrResponse.status}`);

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
      console.log('📄 Custom server response:', responseText);
      
      const ocrResult = JSON.parse(responseText);
      
      if (ocrResult.status === 'success' && ocrResult.data) {
        return ocrResult;
      } else {
        throw new Error(ocrResult.message || 'Custom server OCR processing failed');
      }
    } catch (error) {
      console.error('❌ Custom server detailed error:', error);
      throw new Error(`Custom server failed: ${error.message}`);
    }
  };

  // Alternative Google Vision API (Free tier available)
  const tryGoogleVisionAlternative = async (base64Image) => {
    try {
      console.log('🌐 Attempting Google Vision API alternative...');
      
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
        console.log('📄 Google Vision extracted text:', extractedText);
        
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
      console.error('❌ Google Vision detailed error:', error);
      throw new Error(`Google Vision API failed: ${error.message}`);
    }
  };

  // Parse bank book text using patterns
  const parseBankBookText = (text) => {
    console.log('🔍 Parsing bank book text...');
    
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

    console.log('📊 Parsed bank data:', extractedData);
    return extractedData;
  };

  // Save bank verification data
  const saveBankVerification = async () => {
    if (!selectedBank || selectedBank === 'Select Bank Name' || !bankAccount || !bankNumber) {
      Alert.alert(
        'Missing Information',
        'Please fill in all required bank information fields.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsLoadingBank(true);
      const token = await SecureStore.getItemAsync('userToken');

      if (!token) {
        Alert.alert('Error', 'User token not found');
        return;
      }

      // Simulate API call to save bank verification
      const response = await fetch(`${ipAddress}/bank-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bank_id: selectedBankId,
          bank_name: selectedBank,
          bank_account: bankAccount,
          bank_number: bankNumber,
          branch: bankBranch,
          document_path: photo || '',
        }),
      });

      const json = await response.json();

      if (json.status === 'success') {
        Alert.alert(
          '✅ Bank Verification Submitted',
          'Your bank information has been submitted for verification. You will be notified once the verification is complete.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('❌ Submission Failed', json.message || 'Unable to submit bank verification');
      }

    } catch (error) {
      console.error('Error saving bank verification:', error);
      Alert.alert('⚠️ Error', 'An error occurred while submitting bank verification');
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

  // Fetch bank list from API
  useEffect(() => {
    fetchBankList();
  }, []);

  const fetchBankList = async () => {
    setIsLoadingBankList(true);
    setBankListError(null);
    
    try {
      console.log('🏦 Fetching bank list from API...');
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
      console.log('📊 Bank API Response:', data);
      console.log('📊 Total banks received:', data.data?.length || 0);
      
      if (data.status === 'success') {
        // Map the API response to the expected format
        const mappedBanks = data.data.map(bank => ({
          id: bank.md_bankname_id,
          bankname: bank.md_bankname_name,
          status: bank.md_bankname_status,
          bank_code: bank.md_bankname_masterkey || '',
        }));
        setBankList(mappedBanks);
        console.log('✅ Bank list loaded successfully:', mappedBanks.length, 'banks');
        console.log('📋 First few banks:', mappedBanks.slice(0, 3));
      } else {
        throw new Error(data.message || 'Failed to fetch bank list');
      }
    } catch (error) {
      console.error('Error fetching bank list:', error);
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

  // Fallback function - no demo data, just return empty result
  const extractBankInfoFallback = async () => {
    console.log('📝 No OCR services available - user must enter data manually');
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
              <Text style={styles.headerTitle}>Bank Verification</Text>
              <Text style={styles.headerSubtitle}>Verify your bank account</Text>
              
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
              <Text style={styles.sectionTitlePremium}>Bank Information</Text>
            </View>
            
            <View style={styles.inputWrapperPremium}>
              <Text style={styles.inputLabelPremium}>Bank Name *</Text>
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
              <Text style={styles.inputLabelPremium}>Bank Account *</Text>
              <TextInput 
                style={styles.inputPremium} 
                placeholder="Bank Account" 
                value={bankAccount}
                onChangeText={setBankAccount}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputWrapperPremium}>
              <Text style={styles.inputLabelPremium}>Bank Number *</Text>
              <TextInput 
                style={styles.inputPremium} 
                placeholder="Bank Account Number" 
                value={bankNumber}
                onChangeText={setBankNumber}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputWrapperPremium}>
              <Text style={styles.inputLabelPremium}>Upload your book bank document *</Text>
              
              {/* OCR Status Banner */}
              <View style={styles.ocrStatusBanner}>
                <MaterialCommunityIcons name="information-outline" size={16} color="#3B82F6" />
                <Text style={styles.ocrStatusText}>
                  📱 App works perfectly! OCR is optional - manual entry is always available
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
                        {ocrProgress || 'Processing...'}
                      </Text>
                    </>
                  ) : photo ? (
                    <>
                      <MaterialIcons name="check-circle" size={24} color="#FFFFFF" />
                      <Text style={styles.uploadTextSuccess}>Bank Document Uploaded</Text>
                    </>
                  ) : (
                    <>
                      <MaterialCommunityIcons name="camera" size={24} color="#FD501E" />
                      <Text style={styles.uploadText}>Upload Bank Document</Text>
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
                      onError={() => setImageLoadError(true)}
                    />
                    <View style={styles.documentOverlay}>
                      <TouchableOpacity
                        style={styles.retakeButton}
                        onPress={pickImage}
                        activeOpacity={0.8}
                      >
                        <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
                        <Text style={styles.retakeButtonText}>Retake</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              )}
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={[styles.saveButtonPremium, styles.closeButton]} 
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <View style={[styles.saveGradient, styles.closeGradient]}>
                  <Text style={[styles.saveButtonTextPremium, styles.closeButtonText]}>
                    Close
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.saveButtonPremium, styles.saveButtonFlex]} 
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
                    {isLoadingBank ? 'Submitting...' : 'Save'}
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
              <Text style={styles.infoTitle}>Verification Information</Text>
            </View>
            
            <Text style={styles.infoText}>
              • Bank verification is required for secure transactions{'\n'}
              • Your information will be verified within 1-3 business days{'\n'}
              • Ensure all details match your bank account exactly{'\n'}
              • Supported document types: Bank book, Bank statement
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
                <Text style={styles.modalTitlePremium}>Select Bank</Text>
                <TouchableOpacity onPress={toggleBankModal} style={styles.closeButtonPremium}>
                  <MaterialIcons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>
              
              <TextInput
                placeholder="Search bank"
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
                  <Text style={styles.modalLoadingText}>Loading banks...</Text>
                </View>
              ) : bankListError ? (
                <View style={styles.modalErrorContainer}>
                  <MaterialIcons name="error-outline" size={24} color="#EF4444" />
                  <Text style={styles.modalErrorText}>{bankListError}</Text>
                  <TouchableOpacity onPress={fetchBankList} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Retry</Text>
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
                      <Text style={styles.emptyText}>No banks found</Text>
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

const styles = StyleSheet.create({
  // Ultra Premium Container
  containerPremium: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Floating Particles
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 20,
    zIndex: 0,
    pointerEvents: 'none',
  },
  floatingParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#FD501E',
    borderRadius: 4,
    opacity: 0.1,
  },

  // Premium Header
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  headerGradient: {
    paddingTop: 0,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  safeAreaHeader: {
    paddingTop: 0,
  },
  headerTopRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingTop: 0,
    position: 'relative',
    marginTop: Platform.OS === 'android' ? -20 : -50,
    height: 56,
  },
  headerContent: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 3,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: Platform.OS === 'android' ? 60 : 60,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  floatingDecor: {
    position: 'absolute',
    top: -10,
    right: 20,
    opacity: 0.4,
  },
  floatingDecor2: {
    position: 'absolute',
    bottom: -5,
    left: 30,
    opacity: 0.3,
  },

  // Premium Content
  scrollViewPremium: {
    flex: 1,
    zIndex: 1,
  },
  scrollViewWithMargin: {
    marginTop: 140,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },

  // Form Card Premium
  formCardPremium: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 25,
    padding: 25,
    marginBottom: 25,
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(253, 80, 30, 0.1)',
  },
  sectionHeaderPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  sectionTitlePremium: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginLeft: 12,
    letterSpacing: 0.3,
  },

  // Upload Button Premium
  uploadButtonPremium: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    marginBottom: 20,
  },
  ocrStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  ocrStatusText: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  uploadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 25,
    gap: 10,
  },
  uploadText: {
    color: '#FD501E',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  uploadTextSuccess: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  uploadTextProcessing: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // Document Preview Premium
  documentPreview: {
    marginTop: 10,
  },
  documentContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    position: 'relative',
  },
  documentImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  documentOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 5,
  },
  retakeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Input Premium
  inputWrapperPremium: {
    marginBottom: 20,
  },
  inputLabelPremium: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputPremium: {
    borderWidth: 1,
    borderColor: 'rgba(209, 213, 219, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 15,
    borderRadius: 15,
    fontSize: 16,
    color: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    fontWeight: '500',
  },

  // Button Premium
  buttonPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(209, 213, 219, 0.8)',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  buttonTextPremium: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },

  // Save Button Premium
  saveButtonPremium: {
    marginTop: 10,
    borderRadius: 18,
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 25,
  },
  saveButtonTextPremium: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.5,
  },

  // Button Row
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
  },
  closeButton: {
    flex: 1,
  },
  saveButtonFlex: {
    flex: 2,
  },
  closeGradient: {
    backgroundColor: '#6B7280',
  },
  closeButtonText: {
    color: '#FFFFFF',
    marginLeft: 0,
  },

  // Info Card Premium
  infoCardPremium: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 25,
    padding: 25,
    marginBottom: 25,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
    marginLeft: 12,
    letterSpacing: 0.3,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    fontWeight: '500',
  },

  // Modal Premium
  modalOverlayPremium: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContentPremium: {
    width: '100%',
    height: 500,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
  },
  modalGradient: {
    flex: 1,
    padding: 0,
  },
  modalHeaderPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.5)',
  },
  modalTitlePremium: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.3,
  },
  closeButtonPremium: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputPremium: {
    margin: 20,
    marginTop: 15,
    marginBottom: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(209, 213, 219, 0.8)',
    borderRadius: 15,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  optionItemPremium: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTextPremium: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
  bankCodeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
    marginLeft: 10,
  },
  modalLoadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLoadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalErrorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalErrorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FD501E',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  bankListContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bankListContent: {
    paddingBottom: 20,
  },
});

export default BankVerificationScreen;
