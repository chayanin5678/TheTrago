import React, { useEffect, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useLanguage } from './LanguageContext';
import axios from 'axios';
import ipAddress from '../../config/ipconfig';

const OperatorDetailScreen = ({ route, navigation }) => {
  const { operator } = route.params;
  const { t, selectedLanguage } = useLanguage();
  const [operatorDetail, setOperatorDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // No need to fetch detail since we have all data from API
    setOperatorDetail(operator);
    setIsLoading(false);
  }, []);

  const companyName = selectedLanguage === 'th' 
    ? (operator.md_company_namethai || operator.md_company_nameeng)
    : (operator.md_company_nameeng || operator.md_company_namethai);

  const companyDescription = selectedLanguage === 'th'
    ? (operator.md_company_about?.th || operator.md_company_about?.en)
    : (operator.md_company_about?.en || operator.md_company_about?.th);

  const companyLocation = operator.md_company_countries || t('vietnamLocation');

  const handleBookNow = () => {
    // Navigate to search ferry with operator filter
    navigation.navigate('Home', {
      screen: 'SearchFerry',
      params: {
        operatorId: operator.md_company_id,
        operatorName: selectedLanguage === 'th' 
          ? operator.md_company_namethai 
          : operator.md_company_nameeng,
      }
    });
  };

  const handleContactOperator = () => {
    // Open contact options (phone, email, website)
    if (operatorDetail?.md_company_phone) {
      Linking.openURL(`tel:${operatorDetail.md_company_phone}`);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD501E" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('operatorDetail') || 'Operator'}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Operator Logo Card */}
        <View style={styles.logoCard}>
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: operator.md_company_picname }}
              style={styles.operatorLogo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Operator Name */}
        <View style={styles.nameContainer}>
          <Text style={styles.operatorName}>{companyName}</Text>
          <View style={styles.locationRow}>
            <MaterialIcons name="place" size={18} color="#FD501E" />
            <Text style={styles.locationText}>{companyLocation}</Text>
          </View>
        </View>

        {/* Description Card */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>
            {companyDescription || t('operatorDefaultDescription') || `"${companyName} is one of the leading high-speed ferry operators in Vietnam, providing trans-national routes between Phnom Penh in southern Cambodia and Chau Doc, Vietnam, along the Mekong River. ""Consider as one of the best activities you must try once in life, we provide the service that help you united by cruising through borders between Vietnam and Cambodia on the Mekong"" Check the ferry schedule or book ${companyName} now at FERRY TICKET for an excellent travel experience and great deals await you!"`}
          </Text>
        </View>

        {/* Features/Services (if available) */}
        {operatorDetail?.services && operatorDetail.services.length > 0 && (
          <View style={styles.servicesContainer}>
            <Text style={styles.sectionTitle}>{t('services') || 'Services'}</Text>
            <View style={styles.servicesGrid}>
              {operatorDetail.services.map((service, index) => (
                <View key={index} style={styles.serviceItem}>
                  <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Contact Information */}
        {(operatorDetail?.md_company_phone || operatorDetail?.md_company_email || operatorDetail?.md_company_website) && (
          <View style={styles.contactContainer}>
            <Text style={styles.sectionTitle}>{t('contactInformation') || 'Contact Information'}</Text>
            
            {operatorDetail?.md_company_phone && (
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => Linking.openURL(`tel:${operatorDetail.md_company_phone}`)}
              >
                <View style={styles.contactIconContainer}>
                  <Ionicons name="call" size={20} color="#FD501E" />
                </View>
                <Text style={styles.contactText}>{operatorDetail.md_company_phone}</Text>
              </TouchableOpacity>
            )}

            {operatorDetail?.md_company_email && (
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => Linking.openURL(`mailto:${operatorDetail.md_company_email}`)}
              >
                <View style={styles.contactIconContainer}>
                  <Ionicons name="mail" size={20} color="#FD501E" />
                </View>
                <Text style={styles.contactText}>{operatorDetail.md_company_email}</Text>
              </TouchableOpacity>
            )}

            {operatorDetail?.md_company_website && (
              <TouchableOpacity 
                style={styles.contactItem}
                onPress={() => Linking.openURL(operatorDetail.md_company_website)}
              >
                <View style={styles.contactIconContainer}>
                  <Ionicons name="globe" size={20} color="#FD501E" />
                </View>
                <Text style={styles.contactText}>{operatorDetail.md_company_website}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: hp('12%') }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={handleBookNow}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#FD501E', '#FF6B35']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookButtonGradient}
          >
            <Text style={styles.bookButtonText}>
              {t('bookWithOperator') || `Book with ${companyName}`}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#1F2937',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  logoCard: {
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('6%'),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoContainer: {
    width: wp('50%'),
    height: wp('50%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  operatorLogo: {
    width: '100%',
    height: '100%',
  },
  nameContainer: {
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
    alignItems: 'center',
  },
  operatorName: {
    fontSize: wp('6%'),
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: hp('1%'),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: wp('3.5%'),
    color: '#6B7280',
    marginLeft: wp('1%'),
  },
  descriptionCard: {
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  descriptionText: {
    fontSize: wp('3.5%'),
    color: '#4B5563',
    lineHeight: wp('5.5%'),
    textAlign: 'justify',
  },
  servicesContainer: {
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: hp('1.5%'),
  },
  servicesGrid: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  serviceText: {
    fontSize: wp('3.5%'),
    color: '#4B5563',
    marginLeft: wp('2%'),
  },
  contactContainer: {
    marginHorizontal: wp('4%'),
    marginTop: hp('2%'),
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    marginBottom: hp('1%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp('3%'),
  },
  contactText: {
    fontSize: wp('3.5%'),
    color: '#1F2937',
    flex: 1,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    paddingBottom: Platform.OS === 'ios' ? hp('4%') : hp('2%'),
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  bookButton: {
    borderRadius: wp('3%'),
    overflow: 'hidden',
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('6%'),
  },
  bookButtonText: {
    fontSize: wp('4%'),
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: wp('2%'),
  },
});

export default OperatorDetailScreen;
