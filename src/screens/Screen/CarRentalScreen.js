import React from 'react';
import { View, Text, SafeAreaView, StatusBar, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from './LanguageContext';
import { styles } from '../../styles/CSS/CarRentalScreenStyles';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

const CarRentalScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerLeft} onPress={() => navigation.goBack?.()}>
          <MaterialIcons name="arrow-back" size={24} color="#18304b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('carRentalSearchTitle') || 'ค้นหารถเช่า'}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 20) }}>
        <View style={styles.searchCard}>
          <Text style={styles.formTitle}>{t('carRentalSearchTitle') || 'ค้นหารถเช่า'}</Text>

          <View style={styles.formRow}>
            <MaterialCommunityIcons name="map-marker" size={22} color="#264a63" style={styles.icon} />
            <Text style={styles.formText}>{t('ท่าอากาศยานนานาชาติเชียงใหม่, เชียงใหม่') || 'ท่าอากาศยานนานาชาติเชียงใหม่ เชียงใหม่'}</Text>
          </View>

          <View style={styles.formRow}>
            <MaterialCommunityIcons name="calendar" size={22} color="#264a63" style={styles.icon} />
            <Text style={styles.formText}>21 พ.ย. 10:00 น. - 24 พ.ย. 10:00 น. 3 วัน</Text>
          </View>

          <View style={styles.formRow}>
            <MaterialCommunityIcons name="account" size={22} color="#264a63" style={styles.icon} />
            <Text style={styles.formText}>อายุผู้ขับรถ 30~60</Text>
          </View>

          <TouchableOpacity style={styles.searchButton} onPress={() => { /* Search action */ }}>
            <Text style={styles.searchButtonText}>{t('ค้นหา') || 'ค้นหา'}</Text>
          </TouchableOpacity>

          <View style={styles.smallNoteRow}>
            <MaterialCommunityIcons name="shield-check" size={22} color="#06b6d4" style={styles.smallNoteIcon} />
            <Text style={styles.smallNoteText}>{t('travelBookingGuarantee') || 'รับประกันการจองการเดินทาง'}</Text>
          </View>
        </View>

        <View style={styles.promoCard}>
          <Text style={styles.promoTitle}>{t('promoCode') || 'รหัสโปรโมชั่น'}</Text>
          <View style={styles.promoBanner}>
            <Text style={styles.promoLabel}>{t('promoMaxDiscount') || 'รับส่วนลดสูงสุด 8%'}</Text>
            <TouchableOpacity style={styles.promoBtn}><Text style={styles.promoBtnText}>{t('claim') || 'รับ'}</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.brandsCard}>
          <Text style={styles.sectionTitle}>{t('popularBrands') || 'บริการจากแบรนด์ดัง'}</Text>
          <View style={styles.brandGrid}>
            {new Array(8).fill(0).map((_, i) => (
              <View key={i} style={styles.brandCell}>
                <Image source={require('../../assets/logoicon.png')} style={styles.brandIcon} />
              </View>
            ))}
          </View>

          <Text style={styles.brandDesc}>{t('brandsCoverageDesc') || 'เดินทางได้ทั่วโลกกว่า 190 ประเทศ ด้วยซัพพลายเออร์ที่เชื่อถือได้กว่า 1,000 ราย'}</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('ทำไมถึงควรจองกับ Trip.com?') || 'ทำไมถึงควรจองกับ Trip.com?'}</Text>

          <View style={styles.reasonRow}>
            <MaterialIcons name="local-offer" size={26} color="#f59e0b" style={styles.reasonIcon} />
            <View style={styles.reasonTextWrap}><Text style={styles.reasonTitle}>{t('discountAfterFlightHotelBooking') || 'ส่วนลดผู้จองตั๋วเครื่องบิน/โรงแรม'}</Text>
              <Text style={styles.reasonDesc}>{t('ปลดล็อกราคาพิเศษสำหรับเช่ารถ หลังจากจองเที่ยวบินหรือโรงแรม') || 'ปลดล็อกราคาพิเศษสำหรับเช่ารถ หลังจากจองเที่ยวบินหรือโรงแรม'}</Text>
            </View>
          </View>

          <View style={styles.reasonRow}>
            <MaterialIcons name="schedule" size={26} color="#06b6d4" style={styles.reasonIcon} />
            <View style={styles.reasonTextWrap}><Text style={styles.reasonTitle}>{t('flexibleRentalPolicy') || 'บริการเช่าแบบยืดหยุ่น'}</Text>
              <Text style={styles.reasonDesc}>{t('นโยบายการยกเลิกยืดหยุ่น วางแผนการเดินทางได้ง่ายดาย') || 'นโยบายการยกเลิกยืดหยุ่น วางแผนการเดินทางได้ง่ายดาย'}</Text>
            </View>
          </View>

          <View style={styles.reasonRow}>
            <MaterialCommunityIcons name="shield-check" size={26} color="#06b6d4" style={styles.reasonIcon} />
            <View style={styles.reasonTextWrap}><Text style={styles.reasonTitle}>{t('travelBookingGuarantee') || 'รับประกันการจองการเดินทาง'}</Text>
              <Text style={styles.reasonDesc}>{t('หากเที่ยวบิน รถไฟ หรือรถบัสของคุณล่าช้าหรือถูกยกเลิก') || 'หากเที่ยวบิน รถไฟ หรือรถบัสของคุณล่าช้าหรือถูกยกเลิก'}</Text>
            </View>
          </View>

          <View style={styles.reasonRow}>
            <MaterialCommunityIcons name="lightning-bolt" size={26} color="#06b6d4" style={styles.reasonIcon} />
            <View style={styles.reasonTextWrap}><Text style={styles.reasonTitle}>{t('fastCustomerService') || 'ฝ่ายบริการลูกค้ารวดเร็วทันใจ'}</Text>
              <Text style={styles.reasonDesc}>{t('ติดต่อฝ่ายบริการลูกค้ารวดเร็วทันใจภายใน 30 วินาที') || 'ติดต่อฝ่ายบริการลูกค้ารวดเร็วทันใจภายใน 30 วินาที'}</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default CarRentalScreen;
