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
  Platform
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
import ipAddress from "../ipconfig";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const IDCardCameraScreen = ({ navigation }) => {
  const { customerData } = useCustomer();
  const { language, t } = useLanguage();
  const [photo, setPhoto] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [firstName, setFirstName] = useState(customerData.Firstname || '');
  const [lastName, setLastName] = useState(customerData.Lastname || '');
  const [idNumber, setIdNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentType, setDocumentType] = useState('ID Card'); // ID Card or Passport

  // New states for ID card/passport data from API
  const [existingPassportInfo, setExistingPassportInfo] = useState({
    passport_number: '', // Used for ID number or passport number
    document_path: '',
    has_passport: false, // Used for has_document
    has_document: false,
    last_updated: null
  });
  const [isLoadingPassport, setIsLoadingPassport] = useState(false);
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
    [...Array(4)].map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(30),
      scale: new Animated.Value(0.9),
    }))
  ).current;

  // Safety timeout to prevent stuck loading states - optimized for faster processing
  useEffect(() => {
    let loadingTimeout;

    if (isProcessing) {
      // Shorter timeout since we've optimized for speed
      loadingTimeout = setTimeout(() => {
        console.log('⚠️ Auto-clearing stuck loading state after timeout');
        setIsProcessing(false);
        setOcrProgress('');
        Alert.alert(
          t('processingTooLong') || 'Processing Taking Too Long ⏱️',
          t('processingTooLongMessage') || 'Document scanning is taking longer than expected.\n\n🚀 This usually means:\n• Slow internet connection\n• Large image file\n• Network congestion\n\n💡 Try:\n• Check WiFi/4G signal\n• Take a clearer, smaller photo\n• Or enter details manually',
          [
            { text: t('tryAgain') || 'Try Again', onPress: () => pickImage() },
            { text: t('enterManually') || 'Enter Manually', style: 'default' }
          ]
        );
      }, 120000); // 2 minute safety timeout (optimized for speed)
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

    // Loading icon rotation animation
    Animated.loop(
      Animated.timing(loadingRotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Upload loading rotation animation
    Animated.loop(
      Animated.timing(uploadLoadingRotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Save loading rotation animation
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
    // Show action sheet with options and helpful tips
    Alert.alert(
      t('selectIdCardImage') || "Select ID Card/Passport Image",
      t('selectImageInstructions') || "For best results:\n• Use good lighting\n• Keep document flat and stable\n• Ensure all text is clearly visible\n• Make sure the entire document is in frame\n\nChoose how you'd like to upload your document:",
      [
        {
          text: t('takePhoto') || "Take Photo",
          onPress: () => openCamera(),
          style: "default"
        },
        {
          text: t('chooseFromGallery') || "Choose from Gallery",
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
          t('cameraPermissionRequired') || "Camera Permission Required",
          t('cameraPermissionMessage') || "Permission to access camera is required to scan your ID card or passport!",
          [
            { text: t('cancel') || "Cancel", style: "cancel" },
            { text: t('openSettings') || "Open Settings", onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      setIsProcessing(true);

      // Open camera with optimized settings for documents and OCR
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [85.6, 54], // Standard ID/passport aspect ratio (85.6mm x 54mm)
        quality: 1.0, // High quality for better OCR
        mediaTypes: 'Images', // Changed from ImagePicker.MediaTypeOptions.Images
        exif: false, // Reduce file size
      });

      if (!result.canceled) {
        // Auto-crop and process the captured image for better OCR
        const croppedImage = await cropIDCard(result.assets[0].uri);
        setPhoto(croppedImage);

        // Check network and process with user guidance
        await checkNetworkAndProcess(croppedImage);
      } else {
        // User canceled - clear loading and allow manual input
        setIsProcessing(false);
        Alert.alert(
          'No Photo Taken',
          'You can enter your information manually',
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      console.error('Error in openCamera:', error);
      setIsProcessing(false); // Only clear on error
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
      // Request media library permissions
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
        mediaTypes: 'Images', // Changed from ImagePicker.MediaTypeOptions.Images
        allowsEditing: true,
        aspect: [85.6, 54], // Standard ID/passport aspect ratio
        quality: 1.0, // High quality for better OCR
        exif: false,
      });

      if (!result.canceled) {
        // Auto-crop and process the selected image for better OCR
        const croppedImage = await cropIDCard(result.assets[0].uri);
        setPhoto(croppedImage);

        // Check network and process with user guidance
        await checkNetworkAndProcess(croppedImage);
      } else {
        // User canceled - clear loading and allow manual input
        setIsProcessing(false);
        Alert.alert(
          'No Image Selected',
          'You can enter your information manually',
          [{ text: 'OK' }]
        );
      }

    } catch (error) {
      console.error('Error in openGallery:', error);
      setIsProcessing(false); // Only clear on error
      Alert.alert(
        'Error',
        'Unable to access gallery. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Auto-crop document from image for better OCR accuracy
  const cropIDCard = async (uri) => {
    try {
      console.log('🔍 Auto-cropping document from image...');

      // Get image info first
      const imageInfo = await ImageManipulator.manipulateAsync(uri, [], { format: ImageManipulator.SaveFormat.JPEG });

      // Calculate crop area for document (center-focused with some padding)
      const { width, height } = imageInfo;
      const aspectRatio = 85.6 / 54; // Standard ID/passport aspect ratio (85.6mm x 54mm)

      let cropWidth, cropHeight, originX, originY;

      // Determine the best crop dimensions while maintaining document aspect ratio
      if (width / height > aspectRatio) {
        // Image is wider - crop width
        cropHeight = height * 0.8; // Use 80% of height with padding
        cropWidth = cropHeight * aspectRatio;
        originX = (width - cropWidth) / 2;
        originY = height * 0.1; // Start 10% from top
      } else {
        // Image is taller - crop height  
        cropWidth = width * 0.9; // Use 90% of width with padding
        cropHeight = cropWidth / aspectRatio;
        originX = width * 0.05; // Start 5% from left
        originY = (height - cropHeight) / 2;
      }

      // Ensure crop dimensions don't exceed image bounds
      cropWidth = Math.min(cropWidth, width * 0.95);
      cropHeight = Math.min(cropHeight, height * 0.95);
      originX = Math.max(0, Math.min(originX, width - cropWidth));
      originY = Math.max(0, Math.min(originY, height - cropHeight));

      // Perform the crop and enhance for OCR - optimized for documents
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
          },
          { resize: { width: 1200 } }, // Optimized resolution for document text recognition
        ],
        {
          compress: 0.95, // Higher quality for better text OCR
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      console.log('✅ Document cropped successfully');
      return croppedImage.uri;

    } catch (error) {
      console.error('❌ Document auto-crop failed, using original image:', error);
      return uri; // Return original if cropping fails
    }
  };

  // OCR function using OCR.space for real document scanning
  const recognizeText = async (uri) => {
    try {
      console.log('🔍 Starting optimized OCR.space processing for document:', uri);
      setOcrProgress('Processing document...');

      // Pre-check original image size to prevent oversized uploads
      const originalInfo = await FileSystem.getInfoAsync(uri);
      if (originalInfo.size && originalInfo.size > 5000000) { // 5MB limit
        console.log('⚠️ Original image too large, applying aggressive compression');
        setOcrProgress('Optimizing large image...');
      }

      // Optimized image enhancement for faster OCR with maintained quality
      const processedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: documentType === 'ID Card' ? 600 : 550 } }, // Further reduced resolution for speed
        ],
        {
          compress: originalInfo.size > 5000000 ? 0.95 : 0.9, // Higher compression for large files
          format: ImageManipulator.SaveFormat.JPEG
        }
      );

      console.log('📷 Document image optimized for speed, starting OCR...');
      setOcrProgress('Converting file...');

      // Convert image to base64 for API calls
      const base64Image = await FileSystem.readAsStringAsync(processedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const imageSizeKB = Math.round(base64Image.length / 1024);
      console.log(`📤 Base64 conversion complete, image size: ${imageSizeKB}KB`);

      // Check if image is too large for optimal processing
      if (imageSizeKB > 1000) {
        console.log('⚠️ Large image detected, may cause slower processing');
        setOcrProgress('Large file - processing may take longer...');
        Alert.alert(
          'Large Image Detected',
          'The image is quite large and may take longer to process. Consider retaking with better lighting for faster results.',
          [{ text: 'Continue', style: 'default' }]
        );
      } else {
        setOcrProgress('Reading data from document...');
      }

      // Use OCR.space for real document processing with retry mechanism and multiple engines
      let ocrResult = null;
      let retryCount = 0;
      const maxRetries = 3; // Fast to thorough approach
      const ocrEngines = [1, 1, 2]; // Engine 1 (fast) twice, then Engine 2 (thorough) as last resort

      while (retryCount <= maxRetries && !ocrResult) {
        try {
          const currentEngine = ocrEngines[retryCount] || 1; // Default to Engine 1 for speed

          if (retryCount > 0) {
            console.log(`🔄 Document OCR retry attempt ${retryCount}/${maxRetries} with Engine ${currentEngine}...`);
            setOcrProgress(currentEngine === 1 ?
              `Quick scan attempt (${retryCount}/${maxRetries})...` :
              `Thorough scan attempt (${retryCount}/${maxRetries})...`);
          }

          ocrResult = await tryOCRSpace(base64Image, currentEngine, documentType);

          if (ocrResult && ocrResult.trim().length > 0) {
            break; // Success, exit retry loop
          } else {
            throw new Error('No text detected from document');
          }
        } catch (error) {
          retryCount++;
          console.log(`❌ Document OCR attempt ${retryCount} failed:`, error.message);

          if (retryCount <= maxRetries) {
            // Shorter delay for faster attempts
            const delayTime = retryCount <= 2 ? 1500 : 3000; // 1.5s for fast attempts, 3s for thorough
            console.log(`⏳ Waiting ${delayTime / 1000}s before retry...`);
            await new Promise(resolve => setTimeout(resolve, delayTime));
          } else {
            // All retries failed
            throw error;
          }
        }
      }

      if (ocrResult && ocrResult.trim().length > 0) {
        console.log('✅ OCR.space succeeded - Real document data extracted');
        setOcrProgress('Analyzing document data...');
        setOcrText(ocrResult);
        parseIDText(ocrResult);

        // Clear progress after successful OCR
        setOcrProgress('');
        Alert.alert(
          'Document Scanned Successfully! 🎉',
          'The system has successfully scanned and extracted data from your document.\nPlease verify the information for accuracy.',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('No text detected from document');
      }

    } catch (error) {
      console.error('❌ Document OCR processing failed:', error.message);

      // Handle different types of errors with more specific guidance for documents
      let errorTitle = 'Unable to Scan Document 📷';
      let errorMessage = 'Your document photo was captured but we couldn\'t automatically scan the data.\n\nTips for better document scanning:\n• Use good lighting\n• Hold document flat and steady\n• Ensure all text is visible\n• Try cleaning the document surface\n• Make sure the entire document is in frame\n\nYou can also enter your information manually.';

      if (error.message.includes('timeout') || error.message.includes('network') || error.message.includes('fetch')) {
        errorTitle = 'Slow Connection Detected ⏱️';
        errorMessage = 'Document scanning is taking longer than usual due to slow internet.\n\n🚀 Quick fixes:\n• Check WiFi/4G signal strength\n• Move closer to WiFi router\n• Restart your internet connection\n• Try a smaller/clearer photo\n\n💡 Meanwhile, you can enter your details manually!';
      } else if (error.message.includes('API error') || error.message.includes('OCR.space')) {
        errorTitle = 'Scanner Service Busy 🛠️';
        errorMessage = 'The document scanning service is currently busy.\n\n⏰ Please try:\n• Wait 30 seconds and try again\n• Check your internet connection\n• Take a clearer photo with better lighting\n• Or enter your information manually';
      } else if (error.message.includes('No text detected')) {
        errorTitle = 'Document Not Clear Enough 🔍';
        errorMessage = 'We couldn\'t read the text from your document photo.\n\n📸 For better results:\n• Use bright, even lighting\n• Hold phone steady\n• Ensure document is flat\n• Make sure all text is visible\n• Avoid shadows and glare\n\n✍️ You can also enter details manually.';
      }

      // Show message when document OCR fails - offer options to retake or enter manually
      Alert.alert(
        errorTitle,
        errorMessage,
        [
          { text: 'Retake Photo', onPress: () => pickImage() },
          { text: 'Enter Manually', style: 'default' }
        ]
      );
    } finally {
      // Always ensure processing is stopped and progress is cleared - CRITICAL for preventing stuck loading
      console.log('🔄 Document OCR processing completed - clearing all loading states');
      setIsProcessing(false);
      setOcrProgress('');
    }
  };

  // Network quality check before OCR processing
  const checkNetworkAndProcess = async (imageUri) => {
    try {
      // Simple network test with timeout
      const startTime = Date.now();
      const testResponse = await Promise.race([
        fetch('https://api.ocr.space', { method: 'HEAD' }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Network test timeout')), 5000))
      ]);
      const networkLatency = Date.now() - startTime;

      console.log(`📡 Network latency: ${networkLatency}ms`);

      if (networkLatency > 3000) {
        Alert.alert(
          'Slow Network Detected 🐌',
          'Your internet connection seems slow. Document scanning may take longer than usual.\n\n💡 For faster results:\n• Try moving closer to WiFi\n• Use 4G if WiFi is slow\n• Or enter details manually',
          [
            { text: 'Continue Anyway', onPress: () => recognizeText(imageUri) },
            { text: 'Enter Manually', style: 'cancel' }
          ]
        );
      } else {
        await recognizeText(imageUri);
      }
    } catch (error) {
      console.log('⚠️ Network test failed, proceeding with OCR anyway');
      await recognizeText(imageUri);
    }
  };

  // OCR.space API for real document text recognition (FREE: 25,000 requests/month)
  const tryOCRSpace = async (base64Image, engineNumber = 1, selectedDocumentType = 'ID Card') => {
    const OCR_SPACE_API_KEY = 'K87899142388957'; // Free API key

    console.log(`🌐 Preparing optimized document OCR request with Engine ${engineNumber}...`);

    // Calculate approximate base64 size for timeout optimization
    const base64SizeKB = Math.round((base64Image.length * 3) / 4 / 1024);
    console.log(`📏 Base64 image size: ${base64SizeKB}KB`);

    const formData = new FormData();
    formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
    // Use supported language codes for OCR.space API
    // For Thai documents, we'll use 'eng' as OCR.space handles mixed Thai-English text well with English setting
    // Alternative: could try 'ara' (Arabic) which sometimes works better for non-Latin scripts
    formData.append('language', selectedDocumentType === 'ID Card' ? 'eng' : 'eng');
    formData.append('isOverlayRequired', 'false'); // Disabled for speed
    formData.append('OCREngine', engineNumber.toString()); // Engine 1 for speed, 2 for accuracy
    formData.append('isTable', 'false'); // Disabled for speed
    // Enable scale and orientation for better Thai text recognition
    formData.append('scale', selectedDocumentType === 'ID Card' ? 'true' : 'false'); // Enable for Thai ID cards
    formData.append('detectOrientation', selectedDocumentType === 'ID Card' ? 'true' : 'false'); // Enable for Thai ID cards

    console.log('📡 Sending optimized document request to OCR.space...');
    console.log(`🔧 OCR Settings: Engine ${engineNumber}, Language: ${selectedDocumentType === 'ID Card' ? 'eng (Thai ID)' : 'eng (Passport)'}`);

    // Create adaptive timeout based on image size and engine type
    const baseTimeout = engineNumber === 1 ? 30000 : 45000; // Engine 1 faster, Engine 2 more thorough
    const adaptiveTimeout = Math.max(baseTimeout, Math.min(60000, base64SizeKB * 80));
    console.log(`⏱️ Using adaptive timeout: ${adaptiveTimeout / 1000}s for Engine ${engineNumber}`);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('OCR request timeout - network too slow')), adaptiveTimeout)
    );

    const fetchPromise = fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': OCR_SPACE_API_KEY,
      },
      body: formData,
    });

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    console.log('📨 OCR.space response received, status:', response.status);

    if (!response.ok) {
      throw new Error(`OCR.space API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('🔍 OCR.space result:', result);

    // Check for API errors first
    if (result.OCRExitCode !== 1) {
      console.error('❌ OCR processing failed:', result.ErrorMessage);
      const errorDetails = Array.isArray(result.ErrorMessage) ? result.ErrorMessage.join(', ') : result.ErrorMessage;
      throw new Error(`OCR processing failed: ${errorDetails || 'Unknown error'}`);
    }

    if (result.ParsedResults && result.ParsedResults[0] && result.ParsedResults[0].ParsedText) {
      console.log('✅ Text extracted successfully');
      return result.ParsedResults[0].ParsedText;
    }

    throw new Error('No text detected from document image');
  };

  // Enhanced text parsing specifically for Thai ID cards with OCR.space results
  const parseIDText = (text) => {
    const lines = text.split('\n').filter(line => line.trim());

    console.log('🔍 OCR.space Document Text:', text);
    console.log('📝 Lines:', lines);
    console.log('📄 Document Type:', documentType);

    // Reset previous values for fresh parsing
    let foundId = '';

    // Enhanced document parsing logic for both ID cards and passports - Only extract document number
    lines.forEach((line, index) => {
      const cleanLine = line.trim();

      // Parse document number - Enhanced patterns for both Thai ID and passport numbers
      const documentPatterns = [
        // Thai ID patterns (13 digits) - Enhanced for better detection
        /เลขประจำตัว[\s:]*(\d{1}[\s-]?\d{4}[\s-]?\d{5}[\s-]?\d{2}[\s-]?\d{1})/i, // Thai ID with label
        /บัตรประจำตัว[\s\S]*?(\d{1}[\s-]?\d{4}[\s-]?\d{5}[\s-]?\d{2}[\s-]?\d{1})/i, // After card label
        /(\d{1}[\s-]?\d{4}[\s-]?\d{5}[\s-]?\d{2}[\s-]?\d{1})\b/, // Thai ID with separators
        /\b(\d{13})\b/, // Plain 13 digits
        // More flexible Thai ID patterns
        /(\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d)/, // Spaced 13 digits
        /(\d-\d{4}-\d{5}-\d{2}-\d)/, // Standard Thai ID format
        // Passport patterns (various formats)
        /[Pp]assport[\s:]*([A-Z]{1,2}\d{6,8})/i, // Passport with label
        /\b([A-Z]{1,2}\d{6,8})\b/, // Common passport format (e.g., A1234567, AA1234567)
        /\b([A-Z]\d{7,8})\b/, // Single letter + digits
        /\b([A-Z]{2}\d{6,7})\b/, // Two letters + digits
      ];

      for (const pattern of documentPatterns) {
        const idMatch = cleanLine.match(pattern);
        if (idMatch && !foundId) {
          console.log('🔍 Potential ID match:', idMatch[1], 'from line:', cleanLine);
          foundId = idMatch[1].replace(/[\s-]/g, ''); // Remove spaces and dashes

          // Validate document number based on type and length
          const isValidThaiId = foundId.length === 13 && /^\d{13}$/.test(foundId) && foundId !== '0000000000000';
          const isValidPassport = foundId.length >= 6 && foundId.length <= 9 && /^[A-Z0-9]+$/i.test(foundId);

          console.log('🧪 Validation:', foundId, 'Length:', foundId.length, 'Thai ID valid:', isValidThaiId, 'Passport valid:', isValidPassport);

          if (isValidThaiId || isValidPassport) {
            setIdNumber(foundId);
            console.log('✅ Found Document Number:', foundId, isValidThaiId ? '(Thai ID)' : '(Passport)');
            break;
          }
        }
      }

      // Skip name and surname parsing - only extract document number
      // Names will be manually entered by user or loaded from existing customer data
      // This ensures faster processing and prevents incorrect name extraction
    });

    // Show results for document - only document number
    if (foundId) {
      Alert.alert(
        '🎉 Document Scan Successful!',
        `${documentType} Number found: ${foundId}\n\n✅ Please verify the document number is correct\n📝 You can edit the number if needed\n\n💡 Note: Name and surname will be taken from your profile or entered manually`,
        [{ text: 'OK', style: 'default' }]
      );
    } else {
      Alert.alert(
        '⚠️ No Document Number Found',
        'Unable to scan document number from the image. Please:\n\n📸 Take a clearer photo\n💡 Use adequate lighting\n📏 Ensure entire document is in frame\n✏️ Or enter the number manually',
        [
          { text: 'Retake Photo', onPress: () => pickImage() },
          { text: 'Manual Entry', style: 'default' }
        ]
      );
    }
  };

  // Premium save function - Update only document number
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
      console.log(`🚀 Starting ${documentType} upload process...`);
      console.log('📋 Data to upload:', { document_number: idNumber, photo: photo ? 'Available' : 'Missing', token: token ? 'Available' : 'Missing' });

      // Create FormData for multipart upload
      const formData = new FormData();

      // Add only document number to form data (no name/surname)
      formData.append('passport_number', idNumber);

      // Prepare image file for upload
      const imageUri = photo;
      const filename = `${documentType.toLowerCase().replace(' ', '_')}_${Date.now()}.jpg`;

      // Check if photo is a local file or remote URL
      if (imageUri.startsWith('file://') || imageUri.startsWith('content://')) {
        // Local file - append as blob (only document number will be updated)
        formData.append('passport_document', {
          uri: imageUri,
          type: 'image/jpeg',
          name: filename,
        });
      } else if (imageUri.startsWith('http')) {
        // Remote file - for existing photos, just update the document number
        console.log('📸 Using existing photo from server:', imageUri);

        // For existing photos, we'll update the document number only
        Alert.alert(
          `Update ${documentType} Number`,
          `Your ${documentType.toLowerCase()} document is already uploaded. Do you want to update just the ${documentType.toLowerCase()} number?\n\nNote: To upload a completely new document, please take a new photo.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => setIsProcessing(false)
            },
            {
              text: 'Update ID Number Only',
              onPress: async () => {
                try {
                  console.log('� Updating passport number for existing document...');

                  // Since this is an existing remote document, we'll create a minimal update
                  // The backend should handle this case where we're updating just the number
                  const updateFormData = new FormData();
                  updateFormData.append('passport_number', idNumber.trim());
                  updateFormData.append('update_existing', 'true'); // Flag to indicate this is an update
                  updateFormData.append('document_exists', 'true'); // Flag to indicate document already exists

                  console.log('📤 Sending Thai ID number update...');

                  // Try to update with just the passport number
                  const updateResponse = await fetch(`${ipAddress}/upload-passport`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                    body: updateFormData,
                  });

                  console.log('📨 Update response status:', updateResponse.status);
                  const responseText = await updateResponse.text();
                  console.log('📨 Update response:', responseText);

                  // Handle the response
                  if (updateResponse.ok) {
                    try {
                      const updateResult = JSON.parse(responseText);
                      console.log('✅ Update successful:', updateResult);

                      setIsProcessing(false);
                      Alert.alert(
                        'Success! 🎉',
                        'Your Thai ID number has been updated successfully.',
                        [{ text: 'OK', onPress: () => navigation.navigate('ProfileScreen') }]
                      );
                    } catch (parseError) {
                      // If response is not JSON but request was successful
                      setIsProcessing(false);
                      Alert.alert(
                        'Success! 🎉',
                        'Your Thai ID number has been updated successfully.',
                        [{ text: 'OK', onPress: () => navigation.navigate('ProfileScreen') }]
                      );
                    }
                  } else {
                    // If the backend doesn't support updating existing documents
                    setIsProcessing(false);
                    Alert.alert(
                      'Update Not Supported',
                      'The server requires a new Thai ID document upload to update information.\n\nPlease take a new photo to update your Thai ID number.',
                      [
                        {
                          text: 'Take New Photo',
                          onPress: () => pickImage()
                        },
                        {
                          text: 'Cancel',
                          style: 'cancel'
                        }
                      ]
                    );
                  }
                } catch (error) {
                  console.error('❌ Update failed:', error);
                  setIsProcessing(false);
                  Alert.alert(
                    'Update Failed',
                    'Unable to update Thai ID number for existing document.\n\nPlease take a new photo to update your information.',
                    [
                      {
                        text: 'Take New Photo',
                        onPress: () => pickImage()
                      },
                      {
                        text: 'Cancel',
                        style: 'cancel'
                      }
                    ]
                  );
                }
              }
            }
          ]
        );
        return;
      } else {
        throw new Error('Invalid image format');
      }

      console.log('📤 Uploading passport data to API...');

      // Upload to the new passport upload endpoint
      const uploadResponse = await fetch(`${ipAddress}/upload-passport`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Remove Content-Type header - let the browser set it automatically for multipart/form-data
        },
        body: formData,
      });

      console.log('📨 API Response Status:', uploadResponse.status);

      let result;
      const responseText = await uploadResponse.text();
      console.log('📨 Raw API Response:', responseText);

      // Try to parse JSON, handle non-JSON responses
      try {
        result = JSON.parse(responseText);
        console.log('📨 Parsed API Response:', result);
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError);

        // Handle non-JSON responses (HTML error pages, etc.)
        if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
          if (uploadResponse.status === 500) {
            throw new Error('Server error occurred. The server is experiencing technical difficulties. Please try again later.');
          } else if (uploadResponse.status === 404) {
            throw new Error('Upload endpoint not found. Please contact support.');
          } else if (uploadResponse.status === 401 || uploadResponse.status === 403) {
            throw new Error('Authentication failed. Please login again.');
          } else {
            throw new Error(`Server error (${uploadResponse.status}). Please check your internet connection and try again.`);
          }
        } else if (responseText.includes('401') || responseText.includes('Unauthorized')) {
          throw new Error('Authentication failed. Please login again.');
        } else if (responseText.includes('404')) {
          throw new Error('API endpoint not found. Please contact support.');
        } else if (responseText.includes('500')) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(`Server response error: ${responseText.substring(0, 100)}...`);
        }
      }

      if (uploadResponse.ok && result && result.status === 'success') {
        setIsProcessing(false);
        Alert.alert(
          'Success! 🎉',
          'Your Thai ID verification has been submitted successfully.\n\nDocument uploaded and saved to your profile.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        throw new Error(result?.message || `Upload failed with status: ${uploadResponse.status}`);
      }

    } catch (error) {
      console.error('❌ Error uploading passport:', error);
      setIsProcessing(false);

      let errorMessage = 'Unable to save your information. Please try again.';

      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('authentication') || error.message.includes('token')) {
        errorMessage = 'Authentication error. Please login again.';
      } else if (error.message.includes('Only .png, .jpg, .jpeg format allowed!')) {
        errorMessage = 'Invalid file format. Please use JPG, JPEG, or PNG images only.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(
        'Upload Failed',
        errorMessage,
        [
          { text: 'Try Again', onPress: () => handleSave() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  // Function to fetch Thai ID card information from API
  const fetchPassportInfo = async () => {
    const storedToken = await SecureStore.getItemAsync('userToken');
    if (!storedToken) {
      console.log('No token found');
      return;
    }

    setToken(storedToken);
    setIsLoadingPassport(true);

    try {
      const response = await fetch(`${ipAddress}/passport-info`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch passport info');
      }

      const data = await response.json();
      console.log('📨 Thai ID API Response:', data);

      if (data.status === 'success' && data.data) {
        const passportInfo = data.data;
        console.log('👤 Thai ID Info Data:', passportInfo);

        setExistingPassportInfo({
          passport_number: passportInfo.passport_number || '', // Thai ID number
          document_path: passportInfo.document_path || '',
          has_passport: passportInfo.has_passport || false, // has_thai_id
          has_document: passportInfo.has_document || false,
          last_updated: passportInfo.last_updated || null
        });

        // Auto-fill Thai ID number if available
        if (passportInfo.passport_number) {
          console.log('🆔 Setting Thai ID number:', passportInfo.passport_number);
          setIdNumber(passportInfo.passport_number);
        }

        // Set existing Thai ID photo if available
        if (passportInfo.document_path) {
          // Handle different URL formats
          let photoUrl = passportInfo.document_path;

          // If it's not already a full URL, construct the full URL
          if (!photoUrl.startsWith('http')) {
            // Remove leading slash if present to avoid double slashes
            photoUrl = photoUrl.startsWith('/') ? photoUrl.substring(1) : photoUrl;
            photoUrl = `https://thetrago.com/${photoUrl}`;
          }

          console.log('📷 Loading existing Thai ID document:', photoUrl);
          setPhoto(photoUrl);
        } else {
          console.log('📷 No existing Thai ID document found');
        }

        console.log('✅ Thai ID info loaded successfully');
      } else {
        console.log('⚠️ No Thai ID data found or invalid response structure');
        console.error('Error in Thai ID response:', data.message || 'Invalid data structure');
      }
    } catch (error) {
      console.error('Error fetching Thai ID info:', error);
    } finally {
      setIsLoadingPassport(false);
    }
  };

  useEffect(() => {
    if (photo) {
      console.log("📷 Photo captured:", photo);
      setImageLoadError(false); // Reset image error when new photo is set
    }
  }, [photo]);

  // Update fields when customer data changes
  useEffect(() => {
    if (customerData.Firstname) {
      setFirstName(customerData.Firstname);
    }
    if (customerData.Lastname) {
      setLastName(customerData.Lastname);
    }
  }, [customerData]);

  // Fetch Thai ID info on component mount
  useEffect(() => {
    fetchPassportInfo();
  }, []);

  // Ensure token is available
  useEffect(() => {
    const getToken = async () => {
      if (!token) {
        const storedToken = await SecureStore.getItemAsync('userToken');
        if (storedToken) {
          setToken(storedToken);
        }
      }
    };
    getToken();
  }, [token]);

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
              <Text style={styles.headerTitle}>{t('documentScanner') || 'Document Scanner'}</Text>
              <Text style={styles.headerSubtitle}>{t('idCardPassportOCR') || 'ID Card/Passport OCR'}</Text>
              
              {/* Floating decorative elements */}
              <Animated.View
                style={[
                  styles.floatingDecor,
                  { transform: [{ rotate: spin }] }
                ]}
              >
                <MaterialCommunityIcons name="shield-check" size={20} color="rgba(255,255,255,0.3)" />
              </Animated.View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.scrollViewPremium}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        <View style={styles.contentContainer}>

          {/* Premium Form Card */}
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
              <MaterialCommunityIcons name="card-account-details" size={24} color="#FD501E" />
              <Text style={styles.sectionTitlePremium}>{t('personalInformation') || 'Personal Information'}</Text>
            </View>

            {/* Info note about name fields being read-only */}
            <View style={styles.infoNotePremium}>
              <MaterialCommunityIcons name="information" size={16} color="#3B82F6" />
              <Text style={styles.infoNoteText}>{t('nameFieldsReadonly') || 'Name and surname are loaded from your profile and cannot be changed here.'}</Text>
            </View>

            <View style={styles.inputWrapperPremium}>
              <Text style={styles.inputLabelPremium}>{t('name') || 'Name'}*</Text>
              <TextInput
                style={[styles.inputPremium, { backgroundColor: '#F3F4F6', color: '#6B7280' }]}
                placeholder={t('loadedFromProfile') || "Loaded from your profile"}
                value={firstName}
                editable={false}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputWrapperPremium}>
              <Text style={styles.inputLabelPremium}>{t('surname') || 'Surname'}*</Text>
              <TextInput
                style={[styles.inputPremium, { backgroundColor: '#F3F4F6', color: '#6B7280' }]}
                placeholder={t('loadedFromProfile') || "Loaded from your profile"}
                value={lastName}
                editable={false}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputWrapperPremium}>
              <Text style={styles.inputLabelPremium}>{documentType === 'ID Card' ? (t('idCardNumber') || 'ID Card Number') : (t('passportNumber') || 'Passport Number')}*</Text>
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

          {/* Document Type Selector Card */}
          <Animated.View
            style={[
              styles.formCardPremium,
              {
                opacity: cardAnims[1]?.opacity || 1,
                transform: [
                  { translateY: cardAnims[1]?.translateY || 0 },
                  { scale: cardAnims[1]?.scale || 1 },
                ],
              },
            ]}
          >
            <View style={styles.sectionHeaderPremium}>
              <MaterialCommunityIcons name="card-multiple" size={24} color="#FD501E" />
              <Text style={styles.sectionTitlePremium}>{t('documentType') || 'Document Type'}</Text>
            </View>

            <View style={styles.documentTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.documentTypeButton,
                  documentType === 'ID Card' && styles.documentTypeButtonActive
                ]}
                onPress={() => setDocumentType('ID Card')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="card-account-details"
                  size={20}
                  color={documentType === 'ID Card' ? '#FFFFFF' : '#FD501E'}
                />
                <Text style={[
                  styles.documentTypeText,
                  documentType === 'ID Card' && styles.documentTypeTextActive
                ]}>
                  {t('idCard') || 'ID Card'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.documentTypeButton,
                  documentType === 'Passport' && styles.documentTypeButtonActive
                ]}
                onPress={() => setDocumentType('Passport')}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons
                  name="passport"
                  size={20}
                  color={documentType === 'Passport' ? '#FFFFFF' : '#FD501E'}
                />
                <Text style={[
                  styles.documentTypeText,
                  documentType === 'Passport' && styles.documentTypeTextActive
                ]}>
                  {t('passport') || 'Passport'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Upload Document Card */}
          <Animated.View
            style={[
              styles.formCardPremium,
              {
                opacity: cardAnims[2]?.opacity || 1,
                transform: [
                  { translateY: cardAnims[2]?.translateY || 0 },
                  { scale: cardAnims[2]?.scale || 1 },
                ],
              },
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

            {/* Display existing document info if available */}
            {existingPassportInfo.has_document && existingPassportInfo.last_updated && (
              <View style={styles.existingDocumentInfo}>
                <View style={styles.existingDocumentHeader}>
                  <MaterialCommunityIcons name="file-document" size={20} color="#22C55E" />
                  <Text style={styles.existingDocumentTitle}>{t('previouslyUploadedDocument') || 'Previously Uploaded Document'}</Text>
                </View>
                <Text style={styles.existingDocumentDate}>
                  {t('lastUpdated') || 'Last updated'}: {new Date(existingPassportInfo.last_updated).toLocaleDateString('en-US')}
                </Text>
                <Text style={styles.existingDocumentNote}>
                  You can upload a new document to replace the existing one
                </Text>
              </View>
            )}

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

            {/* Document Preview */}
            {photo && (
              <Animated.View
                style={[
                  styles.documentPreview,
                  {
                    opacity: cardAnims[2]?.opacity || 1,
                    transform: [
                      { translateY: cardAnims[2]?.translateY || 0 },
                      { scale: cardAnims[2]?.scale || 1 },
                    ],
                  },
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
                      onError={(error) => {
                        console.error('❌ Image loading error:', error);
                        console.log('🔍 Failed photo URL:', photo);
                        setImageLoadError(true);
                      }}
                      onLoadStart={() => {
                        console.log('📷 Starting to load image:', photo);
                        setImageLoadError(false);
                      }}
                      onLoad={() => {
                        console.log('✅ Image loaded successfully');
                        setImageLoadError(false);
                      }}
                    />
                  )}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)']}
                    style={styles.documentOverlay}
                  >
                    <View style={styles.documentInfo}>
                      <MaterialCommunityIcons name="shield-check" size={16} color="#22C55E" />
                      <Text style={styles.documentStatus}>
                        {existingPassportInfo.has_document && photo.includes('thetrago.com')
                          ? 'Previously Uploaded Document'
                          : 'Verified Document'}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
              </Animated.View>
            )}

            {/* Loading state for passport info */}
            {isLoadingPassport && (
              <View style={styles.loadingContainer}>
                <Animated.View style={{
                  transform: [
                    { rotate: loadingSpin }
                  ]
                }}>
                  <MaterialCommunityIcons name="loading" size={20} color="#FD501E" />
                </Animated.View>
                <Text style={styles.loadingText}>Loading existing data...</Text>
              </View>
            )}
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            style={[
              styles.actionContainer,
              {
                opacity: cardAnims[3]?.opacity || 1,
                transform: [
                  { translateY: cardAnims[3]?.translateY || 0 },
                  { scale: cardAnims[3]?.scale || 1 },
                ],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.saveButtonPremiumFull}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={isProcessing || !idNumber || !photo}
            >
              <LinearGradient
                colors={['#FD501E', '#FF6B40']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveGradient}
              >
                {isProcessing ? (
                  <>
                    <Animated.View style={{
                      transform: [
                        { rotate: saveLoadingSpin }
                      ]
                    }}>
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
    bottom: 0,
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
    paddingBottom: 15,
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
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
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
    fontSize: Platform.OS === 'android' ? 24 : 28,
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
    left: 60,
    opacity: 0.3,
  },

  // Premium Content
  scrollViewPremium: {
    flex: 1,
    zIndex: 1,
    marginTop: 120,
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
    backdropFilter: 'blur(20px)',
  },
  sectionHeaderPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  infoNotePremium: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  infoNoteText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '500',
    flex: 1,
  },
  sectionTitlePremium: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginLeft: 12,
    letterSpacing: 0.3,
    flex: 1,
  },
  realOcrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  realOcrText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#22C55E',
    letterSpacing: 0.2,
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
  disabledPremium: {
    backgroundColor: 'rgba(243, 244, 246, 0.8)',
    color: '#9CA3AF',
    borderColor: 'rgba(229, 231, 235, 0.8)',
  },
  existingDataBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
    gap: 6,
  },
  existingDataText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22C55E',
    letterSpacing: 0.2,
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
  uploadSubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
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
    height: 60,
    justifyContent: 'flex-end',
    padding: 15,
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  documentStatus: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Action Container Premium
  actionContainer: {
    marginTop: 10,
  },

  // Save Button Premium (Full Width)
  saveButtonPremiumFull: {
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
    gap: 10,
  },
  saveButtonTextPremium: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Existing Document Info
  existingDocumentInfo: {
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  existingDocumentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  existingDocumentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#22C55E',
    letterSpacing: 0.2,
  },
  existingDocumentDate: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  existingDocumentNote: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },

  // Loading State
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: 'rgba(253, 80, 30, 0.05)',
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#FD501E',
    fontWeight: '500',
  },

  // Image Error Container
  imageErrorContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  imageErrorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  imageErrorSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },

  // Document Type Selector
  documentTypeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 15,
  },
  documentTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FD501E',
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  documentTypeButtonActive: {
    backgroundColor: '#FD501E',
    borderColor: '#FD501E',
  },
  documentTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FD501E',
  },
  documentTypeTextActive: {
    color: '#FFFFFF',
  },
});


export default IDCardCameraScreen;
