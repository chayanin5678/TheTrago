import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useLanguage } from './LanguageContext';
import axios from 'axios';
import ipAddress from '../../config/ipconfig';

const AllOperatorsScreen = ({ navigation }) => {
  const { t, selectedLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [operators, setOperators] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${ipAddress}/operators`, {
        timeout: 10000,
      });

      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Remove duplicates based on md_company_id
        const uniqueOperators = response.data.data.reduce((acc, current) => {
          const exists = acc.find(item => item.md_company_id === current.md_company_id);
          if (!exists) {
            acc.push(current);
          }
          return acc;
        }, []);
        
        setOperators(uniqueOperators);
      } else {
        console.warn('Invalid operators data format');
        setOperators([]);
      }
    } catch (error) {
      console.error('Error fetching operators:', error);
      setOperators([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOperators = operators.filter((operator) => {
    if (!searchQuery) return true;
    
    // API returns flat fields: md_company_nameeng and md_company_namethai
    const nameEng = (operator.md_company_nameeng || '').toLowerCase();
    const nameThai = (operator.md_company_namethai || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return nameEng.includes(query) || nameThai.includes(query);
  });

  // Normalize operator object into the shape expected by OperatorDetail
  const normalizeOperator = (op) => {
    const idRaw = op?.md_company_id ?? op?.id ?? op?.company_id;
    const md_company_id = (idRaw != null && /^\d+$/.test(String(idRaw))) ? parseInt(String(idRaw), 10) : idRaw;
    return {
      md_company_id,
      md_company_nameeng: op?.md_company_nameeng || op?.company_name || op?.name || '',
      md_company_namethai: op?.md_company_namethai || op?.company_name_thai || '',
      md_company_picname: op?.md_company_picname || op?.md_company_pic || op?.logo || '',
      // Countries may come from multiple fields and may be arrays or strings.
      md_company_countries_en: (() => {
        const v = op?.sys_countries_nameeng ?? op?.md_company_countries_en ?? op?.md_company_countries;
        if (Array.isArray(v)) return v.join(', ');
        return v ?? '';
      })(),
      md_company_countries_th: (() => {
        const v = op?.sys_countries_namethai ?? op?.md_company_countries_th;
        if (Array.isArray(v)) return v.join(', ');
        return v ?? '';
      })(),
      md_company_countries: (() => {
        const v = op?.md_company_countries ?? op?.sys_countries_nameeng ?? op?.sys_countries_namethai;
        if (Array.isArray(v)) return v.join(', ');
        return v ?? '';
      })(),
      md_company_about: (op?.md_company_about && typeof op.md_company_about === 'object') ? {
        en: op.md_company_about.en || op.md_company_about.eng || op.md_company_about || '',
        th: op.md_company_about.th || op.md_company_about.thai || ''
      } : { en: (op?.md_company_about || ''), th: '' },
      raw: op,
    };
  };

  const renderOperatorItem = ({ item }) => {
    const op = normalizeOperator(item);
    // Company name selected by language
    const companyName = selectedLanguage === 'th'
      ? (op.md_company_namethai || op.md_company_nameeng || 'Unknown')
      : (op.md_company_nameeng || op.md_company_namethai || 'Unknown');

    // Country chosen from normalized fields
    const companyLocation = (() => {
      // Prefer dedicated language fields, fallback to generic
      if (selectedLanguage === 'th') return op.md_company_countries_th || op.md_company_countries_en || op.md_company_countries || 'Unknown';
      return op.md_company_countries_en || op.md_company_countries_th || op.md_company_countries || 'Unknown';
    })();

    const companyDescription = selectedLanguage === 'th'
      ? (op.md_company_about?.th || op.md_company_about?.en || '')
      : (op.md_company_about?.en || op.md_company_about?.th || '');

    return (
      <TouchableOpacity
        style={styles.operatorCard}
        onPress={() => {
          // navigate with normalized operator object
          // ensure country string matches selected language
          // Ensure we send a plain string for country based on language preference.
          const countryForSend = selectedLanguage === 'th'
            ? (op.md_company_countries_th || op.md_company_countries_en || op.md_company_countries)
            : (op.md_company_countries_en || op.md_company_countries_th || op.md_company_countries);
          op.md_company_countries = countryForSend || '';
          navigation.navigate('OperatorDetail', { operator: op });
        }}
        activeOpacity={0.7}
      >
        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <Image
              source={{ uri: item.md_company_picname }}
              style={styles.operatorLogo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Company Name */}
          <Text style={styles.companyName} numberOfLines={2}>
            {companyName}
          </Text>

          {/* Location */}
          <View style={styles.locationRow}>
            <MaterialIcons name="place" size={16} color="#FD501E" />
            <Text style={styles.locationText} numberOfLines={1}>
              {companyLocation}
            </Text>
          </View>

          {/* Description */}
          {companyDescription && (
            <Text style={styles.description}>
              {companyDescription}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
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
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{t('operatorhome') || 'Operator'}</Text>
            <Text style={styles.headerSubtitle}>0 {t('operatorsAvailable') || 'operators'}</Text>
          </View>
          <View style={styles.spacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD501E" />
          <Text style={styles.loadingText}>{t('loading') || 'Loading...'}</Text>
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
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{t('operatorhome') || 'Operator'}</Text>
          <Text style={styles.headerSubtitle}>
            {filteredOperators.length} {t('operatorsAvailable') || 'operators'}
          </Text>
        </View>
        <View style={styles.spacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchOperator') || 'Search operator...'}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Operators List */}
      <FlatList
        data={filteredOperators}
        renderItem={renderOperatorItem}
        keyExtractor={(item, index) => `${item.md_company_id}-${index}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>
              {t('noOperatorsFound') || 'No operators found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {t('tryDifferentSearch') || 'Try a different search term'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: hp('2%'),
    fontSize: wp('3.5%'),
    color: '#6B7280',
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
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: wp('3%'),
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  spacer: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
  },
  searchInput: {
    flex: 1,
    marginLeft: wp('2%'),
    fontSize: wp('3.5%'),
    color: '#1F2937',
  },
  listContainer: {
    padding: wp('4%'),
  },
  operatorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wp('4%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  logoBackground: {
    width: wp('60%'),
    height: wp('40%'),
    borderRadius: wp('3%'),
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('4%'),
  },
  operatorLogo: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    width: '100%',
  },
  companyName: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: hp('0.8%'),
    textAlign: 'left',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  locationText: {
    fontSize: wp('3.2%'),
    color: '#6B7280',
    marginLeft: wp('1%'),
  },
  description: {
    fontSize: wp('3.2%'),
    color: '#6B7280',
    lineHeight: wp('5%'),
    textAlign: 'left',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('10%'),
  },
  emptyText: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#4B5563',
    marginTop: hp('2%'),
  },
  emptySubtext: {
    fontSize: wp('3.5%'),
    color: '#9CA3AF',
    marginTop: hp('0.5%'),
  },
});

export default AllOperatorsScreen;
