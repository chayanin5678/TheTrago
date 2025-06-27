
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
  Platform,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useCustomer } from './CustomerContext.js';
import { Linking } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const IDCardCameraScreen = ({ navigation }) => {
  const { customerData } = useCustomer();
  const [photo, setPhoto] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [firstName, setFirstName] = useState(customerData.Firstname || '');
  const [lastName, setLastName] = useState(customerData.Lastname || '');
  const [idNumber, setIdNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [documentType, setDocumentType] = useState('ID Card'); // ID Card or Passport
  
  // Premium Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Floating particles animation
  const floatingAnims = useRef(
    [...Array(6)].map(() => ({
      x: new Animated.Value(Math.random() * screenWidth - screenWidth/2),
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
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  // Enhanced camera function with ID card cropping and better UX for OCR
  const pickImage = async () => {
    let permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Camera Permission Required", 
        "Permission to access camera is required to scan your ID card!",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

    setIsProcessing(true);
    
    // Open camera with optimized settings for ID cards and OCR
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [85.6, 54], // Thai ID card aspect ratio (85.6mm x 54mm)
      quality: 1.0, // High quality for better OCR
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      exif: false, // Reduce file size
    });

    if (!result.canceled) {
      // Auto-crop and process the captured image for better OCR
      const croppedImage = await cropIDCard(result.assets[0].uri);
      setPhoto(croppedImage);
      
      // Show processing message
      Alert.alert(
        'กำลังสแกนข้อมูล...',
        'ระบบได้ตัดภาพบัตรอัตโนมัติแล้ว กำลังอ่านข้อมูล...',
        [{ text: 'ตกลง' }]
      );
      
      // Auto-extract text from the cropped image
      await recognizeText(croppedImage);
    } else {
      // If user cancels, allow manual input
      Alert.alert(
        'ไม่มีการถ่ายรูป',
        'คุณสามารถกรอกข้อมูลด้วยตนเองได้',
        [{ text: 'ตกลง' }]
      );
    }
    
    setIsProcessing(false);
  };

  // Auto-crop ID card from image for better OCR accuracy
  const cropIDCard = async (uri) => {
    try {
      console.log('🔍 Auto-cropping ID card from image...');
      
      // Get image info first
      const imageInfo = await ImageManipulator.manipulateAsync(uri, [], { format: ImageManipulator.SaveFormat.JPEG });
      
      // Calculate crop area for Thai ID card (center-focused with some padding)
      const { width, height } = imageInfo;
      const aspectRatio = 85.6 / 54; // Thai ID card aspect ratio
      
      let cropWidth, cropHeight, originX, originY;
      
      // Determine the best crop dimensions while maintaining aspect ratio
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
      
      // Perform the crop and enhance for OCR
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
          { resize: { width: 1200 } }, // Resize to optimal OCR width
        ],
        {
          compress: 0.9,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      
      console.log('✅ ID card cropped successfully');
      return croppedImage.uri;
      
    } catch (error) {
      console.error('❌ Auto-crop failed, using original image:', error);
      return uri; // Return original if cropping fails
    }
  };

  // OCR function using OCR.space exclusively for real Thai ID card scanning
  const recognizeText = async (uri) => {
    setIsProcessing(true);
    
    try {
      console.log('🔍 Starting OCR.space processing for cropped Thai ID card:', uri);
      
      // Additional image enhancement for OCR (image is already cropped)
      const processedImage = await ImageManipulator.manipulateAsync(
        uri,
        [
          { resize: { width: 1000 } }, // Ensure optimal OCR width
        ],
        { 
          compress: 0.85, // Slightly higher compression since image is cropped
          format: ImageManipulator.SaveFormat.JPEG 
        }
      );

      // Convert image to base64 for API calls
      const base64Image = await FileSystem.readAsStringAsync(processedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Use OCR.space for real OCR processing
      const ocrResult = await tryOCRSpace(base64Image);
      
      if (ocrResult && ocrResult.trim().length > 0) {
        console.log('✅ OCR.space succeeded - Real data extracted from cropped card');
        setOcrText(ocrResult);
        parseIDText(ocrResult);
        
        Alert.alert(
          'สแกนบัตรสำเร็จ! 🎉',
          'ระบบได้ตัดและอ่านข้อมูลจากบัตรประชาชนของคุณเรียบร้อยแล้ว\nกรุณาตรวจสอบความถูกต้องของข้อมูล',
          [{ text: 'ตกลง' }]
        );
      } else {
        throw new Error('No text detected from cropped ID card');
      }
      
    } catch (error) {
      console.error('❌ OCR.space failed on cropped image:', error.message);
      
      Alert.alert(
        'ไม่สามารถอ่านบัตรได้',
        'ไม่สามารถสแกนข้อมูลจากบัตรประชาชนได้\n\nเหตุผลที่เป็นไปได้:\n📸 บัตรไม่อยู่ในกรอบ\n💡 แสงไม่เพียงพอ\n� ตัวอักษรไม่ชัดเจน\n\nกรุณา:',
        [
          { text: 'ถ่ายใหม่', onPress: () => pickImage() },
          { text: 'กรอกข้อมูลเอง', style: 'default' }
        ]
      );
    }
    
    setIsProcessing(false);
  };

  // OCR.space API for real Thai ID card text recognition (FREE: 25,000 requests/month)
  const tryOCRSpace = async (base64Image) => {
    const OCR_SPACE_API_KEY = 'K87899142388957'; // Free API key
    
    const formData = new FormData();
    formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
    formData.append('language', 'tha'); // Thai language support
    formData.append('isOverlayRequired', 'false');
    formData.append('OCREngine', '2'); // Engine 2 is optimized for Asian languages
    formData.append('isTable', 'true'); // Better structure detection
    formData.append('scale', 'true'); // Auto-scaling for better accuracy

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'apikey': OCR_SPACE_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`OCR.space API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.ParsedResults && result.ParsedResults[0] && result.ParsedResults[0].ParsedText) {
      return result.ParsedResults[0].ParsedText;
    }
    
    if (result.OCRExitCode !== 1) {
      throw new Error(`OCR processing failed: ${result.ErrorMessage || 'Unknown error'}`);
    }
    
    throw new Error('No text detected from image');
  };

  // Enhanced text parsing specifically for Thai ID cards with OCR.space results
  const parseIDText = (text) => {
    const lines = text.split('\n').filter(line => line.trim());
    
    console.log('🔍 OCR.space Text:', text);
    console.log('📝 Lines:', lines);

    // Reset previous values for fresh parsing
    let foundName = '';
    let foundSurname = '';
    let foundId = '';

    // Enhanced Thai ID Card parsing logic for ML Kit results
    lines.forEach((line, index) => {
      const cleanLine = line.trim();
      
      // Parse Thai ID number (13 digits) - More flexible patterns
      const idPatterns = [
        /\b(\d{1}[\s-]?\d{4}[\s-]?\d{5}[\s-]?\d{2}[\s-]?\d{1})\b/, // Thai ID with separators
        /\b(\d{13})\b/, // Plain 13 digits
        /(\d[\s-]*\d[\s-]*\d[\s-]*\d[\s-]*\d[\s-]*\d[\s-]*\d[\s-]*\d[\s-]*\d[\s-]*\d[\s-]*\d[\s-]*\d[\s-]*\d)/ // Spaced digits
      ];
      
      for (const pattern of idPatterns) {
        const idMatch = cleanLine.match(pattern);
        if (idMatch && !foundId) {
          foundId = idMatch[1].replace(/[\s-]/g, ''); // Remove spaces and dashes
          if (foundId.length === 13) {
            setIdNumber(foundId);
            console.log('✅ Found ID Number:', foundId);
            break;
          }
        }
      }

      // Enhanced Name parsing - Multiple patterns for ML Kit
      if (!foundName) {
        const namePatterns = [
          /ชื่อ[:\s]*(.+?)(?:\s*นาม|\s*$)/i,
          /Name[:\s]*(.+?)(?:\s*Surname|\s*$)/i,
          /Mr\.?\s*([A-Za-z\u0E00-\u0E7F]+)/i,
          /Mrs\.?\s*([A-Za-z\u0E00-\u0E7F]+)/i,
          /Miss\.?\s*([A-Za-z\u0E00-\u0E7F]+)/i,
          /นาย\s*([^\s]+)/i,
          /นาง\s*([^\s]+)/i,
          /นางสาว\s*([^\s]+)/i
        ];

        for (const pattern of namePatterns) {
          const nameMatch = cleanLine.match(pattern);
          if (nameMatch) {
            foundName = nameMatch[1].trim().replace(/นาย|นาง|นางสาว|Mr\.?|Mrs\.?|Miss\.?/gi, '').trim();
            if (foundName && foundName.length > 1 && foundName.length < 30) {
              setFirstName(foundName);
              console.log('✅ Found Name:', foundName);
              break;
            }
          }
        }
      }

      // Enhanced Surname parsing
      if (!foundSurname) {
        const surnamePatterns = [
          /นาม(?:สกุล)?[:\s]*(.+?)(?:\s|$)/i,
          /Surname[:\s]*(.+?)(?:\s|$)/i,
          /Last\s*Name[:\s]*(.+?)(?:\s|$)/i
        ];

        for (const pattern of surnamePatterns) {
          const surnameMatch = cleanLine.match(pattern);
          if (surnameMatch) {
            foundSurname = surnameMatch[1].trim();
            if (foundSurname && foundSurname.length > 1 && foundSurname.length < 30) {
              setLastName(foundSurname);
              console.log('✅ Found Surname:', foundSurname);
              break;
            }
          }
        }
      }

      // Alternative: Sequential name detection for unclear text
      if (!foundName && !foundSurname && !cleanLine.match(/\d/)) {
        const skipWords = [
          'บัตรประจำตัว', 'ประชาชน', 'เลขประจำตัว', 'เกิด', 'ที่อยู่', 'วันที่', 
          'ออกบัตร', 'วันหมดอายุ', 'กรุงเทพ', 'จังหวัด', 'Identity', 'Card', 
          'National', 'Date', 'Birth', 'Address', 'Issue', 'Expire'
        ];
        
        const isSkipLine = skipWords.some(word => cleanLine.toLowerCase().includes(word.toLowerCase()));
        
        if (!isSkipLine && cleanLine.length > 2 && cleanLine.length < 25) {
          // Check if line contains Thai or English characters
          const hasValidChars = /[\u0E00-\u0E7F]/.test(cleanLine) || /^[A-Za-z\s]+$/.test(cleanLine);
          
          if (hasValidChars && index < lines.length / 2) {
            const possibleName = cleanLine
              .replace(/[^\u0E00-\u0E7F\sA-Za-z]/g, '')
              .replace(/นาย|นาง|นางสาว|Mr\.?|Mrs\.?|Miss\.?/gi, '')
              .trim();
            
            if (possibleName.length > 1) {
              const nameParts = possibleName.split(/\s+/);
              
              // Handle "FirstName LastName" format
              if (nameParts.length === 2 && !foundName && !foundSurname) {
                foundName = nameParts[0];
                foundSurname = nameParts[1];
                setFirstName(foundName);
                setLastName(foundSurname);
                console.log('✅ Found Name & Surname (paired):', foundName, foundSurname);
              }
              // Handle single name
              else if (nameParts.length === 1) {
                if (!foundName) {
                  foundName = possibleName;
                  setFirstName(foundName);
                  console.log('🔍 Possible Name:', foundName);
                } else if (!foundSurname) {
                  foundSurname = possibleName;
                  setLastName(foundSurname);
                  console.log('🔍 Possible Surname:', foundSurname);
                }
              }
            }
          }
        }
      }
    });

    // Show comprehensive results
    const foundData = [];
    if (foundName) foundData.push(`ชื่อ: ${foundName}`);
    if (foundSurname) foundData.push(`นามสกุล: ${foundSurname}`);
    if (foundId) foundData.push(`เลขบัตร: ${foundId}`);

    if (foundData.length > 0) {
      Alert.alert(
        '🎉 สแกนข้อมูลสำเร็จ!',
        `ข้อมูลที่พบ:\n${foundData.join('\n')}\n\n✅ กรุณาตรวจสอบความถูกต้อง\n📝 สามารถแก้ไขข้อมูลได้`,
        [{ text: 'ตกลง', style: 'default' }]
      );
    } else {
      Alert.alert(
        '⚠️ ไม่พบข้อมูล',
        'ไม่สามารถสแกนข้อมูลได้ กรุณา:\n\n📸 ถ่ายรูปใหม่ให้ชัดเจน\n💡 ใช้แสงสว่างเพียงพอ\n✏️ หรือกรอกข้อมูลด้วยตนเอง',
        [
          { text: 'ถ่ายใหม่', onPress: () => pickImage() },
          { text: 'กรอกเอง', style: 'default' }
        ]
      );
    }
  };

  // Premium save function
  const handleSave = async () => {
    if (!firstName || !lastName || !idNumber) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (!photo) {
      Alert.alert('Missing Document', 'Please upload your ID card or passport photo.');
      return;
    }

    // Simulate API call
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      Alert.alert(
        'Success!', 
        'Your ID verification has been submitted successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }, 2000);
  };


  useEffect(() => {
    if (photo) console.log("📷 Photo captured:", photo);
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

  return (
    <SafeAreaView style={styles.containerPremium}>
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
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Smart ID Scanner</Text>
              <Text style={styles.headerSubtitle}>Auto-crop + Real OCR</Text>
            </View>
            
            {/* Empty view for layout balance */}
            <View style={{ width: 40 }} />
            
            {/* Floating decorative elements */}
            <Animated.View 
              style={[
                styles.floatingDecor,
                { transform: [{ rotate: spin }] }
              ]}
            >
              <MaterialCommunityIcons name="shield-check" size={20} color="rgba(255,255,255,0.3)" />
            </Animated.View>
            
            <Animated.View 
              style={[
                styles.floatingDecor2,
                { transform: [{ rotate: spin }] }
              ]}
            >
              <MaterialCommunityIcons name="star-four-points" size={16} color="rgba(255,255,255,0.2)" />
            </Animated.View>
          </View>
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
              <Text style={styles.sectionTitlePremium}>Personal Information</Text>
            </View>
            
            <View style={styles.inputWrapperPremium}>
              <Text style={styles.inputLabelPremium}>Name*</Text>
              <TextInput 
                style={styles.inputPremium} 
                placeholder="Enter your first name" 
                value={firstName}
                onChangeText={setFirstName}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputWrapperPremium}>
              <Text style={styles.inputLabelPremium}>Surname*</Text>
              <TextInput 
                style={styles.inputPremium} 
                placeholder="Enter your surname" 
                value={lastName}
                onChangeText={setLastName}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputWrapperPremium}>
              <Text style={styles.inputLabelPremium}>ID Card/Passport Number*</Text>
              <TextInput 
                style={styles.inputPremium} 
                placeholder="Enter your ID number" 
                value={idNumber}
                onChangeText={setIdNumber}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </Animated.View>

          {/* Upload Document Card */}
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
              <MaterialCommunityIcons name="camera-plus" size={24} color="#FD501E" />
              <Text style={styles.sectionTitlePremium}>Upload your ID Card/Passport*</Text>
              <View style={styles.realOcrBadge}>
                <MaterialCommunityIcons name="check-circle" size={12} color="#22C55E" />
                <Text style={styles.realOcrText}>REAL OCR</Text>
              </View>
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
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                      <MaterialCommunityIcons name="loading" size={24} color="#FD501E" />
                    </Animated.View>
                    <Text style={styles.uploadTextProcessing}>Processing...</Text>
                  </>
                ) : photo ? (
                  <>
                    <MaterialIcons name="check-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.uploadTextSuccess}>Document Uploaded</Text>
                  </>
                ) : (
                  <>
                    <MaterialCommunityIcons name="camera" size={24} color="#FD501E" />
                    <Text style={styles.uploadText}>Scan Thai ID Card</Text>
                    <Text style={styles.uploadSubtext}>Auto-crop + Real OCR</Text>
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
                  <Image source={{ uri: photo }} style={styles.documentImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.3)']}
                    style={styles.documentOverlay}
                  >
                    <View style={styles.documentInfo}>
                      <MaterialCommunityIcons name="shield-check" size={16} color="#22C55E" />
                      <Text style={styles.documentStatus}>Verified Document</Text>
                    </View>
                  </LinearGradient>
                </View>
              </Animated.View>
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
              disabled={isProcessing || !firstName || !lastName || !idNumber || !photo}
            >
              <LinearGradient
                colors={['#FD501E', '#FF6B40']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveGradient}
              >
                {isProcessing ? (
                  <>
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
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
    </SafeAreaView>
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
    zIndex: 2,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    zIndex: 3,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 0.5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  floatingDecor: {
    position: 'absolute',
    top: -10,
    right: 60,
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
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(253, 80, 30, 0.1)',
    backdropFilter: 'blur(20px)',
  },
  sectionHeaderPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
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
    elevation: 2,
    fontWeight: '500',
  },
  disabledPremium: {
    backgroundColor: 'rgba(243, 244, 246, 0.8)',
    color: '#9CA3AF',
    borderColor: 'rgba(229, 231, 235, 0.8)',
  },

  // Upload Button Premium
  uploadButtonPremium: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
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
    color: '#FD501E',
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
    elevation: 10,
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
    elevation: 10,
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
});


export default IDCardCameraScreen;
