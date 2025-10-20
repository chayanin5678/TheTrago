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
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useLanguage } from './LanguageContext';
import ipAddress from '../../config/ipconfig';

const OperatorDetailScreen = ({ route, navigation }) => {
  const { operator } = route.params;
  const { t, selectedLanguage } = useLanguage();
  const [operatorDetail, setOperatorDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timetables, setTimetables] = useState([]);
  const [expandedGroups, setExpandedGroups] = useState({});

  // ---------- FLAGS ----------
  const normalizeFlagValue = (flag) => {
    if (!flag && flag !== 0) return null;
    let v = String(flag).trim();
    if (v.charCodeAt(0) === 0xFEFF) v = v.slice(1);
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1).trim();
    if ((v.startsWith('{') || v.startsWith('[')) && (v.includes('<svg') || v.includes('&lt;svg'))) {
      try { const parsed = JSON.parse(v); if (typeof parsed === 'string') v = parsed.trim(); } catch {}
    }
    if (v.indexOf('&lt;') !== -1 || v.indexOf('&gt;') !== -1 || v.indexOf('&amp;') !== -1) {
      v = v.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    }
    const imgMatch = v.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) v = imgMatch[1].trim();
    const hrefImgMatch = v.match(/<a[^>]+href=["']([^"']+\.(?:png|jpg|jpeg|svg))["']/i);
    if (hrefImgMatch && hrefImgMatch[1]) v = hrefImgMatch[1].trim();
    if (v.startsWith('<') || v.startsWith('<?xml')) {
      try { return `data:image/svg+xml;utf8,${encodeURIComponent(v)}`; } catch { return null; }
    }
    if (/^data:image\/[a-zA-Z+.-]+,/.test(v) || /^https?:\/\//i.test(v)) return v;
    return null;
  };

  const countryNameToEmoji = (name) => {
    if (!name) return null;
    const n = String(name).toLowerCase();
    const map = { thailand:'🇹🇭', thai:'🇹🇭', vietnam:'🇻🇳', 'viet nam':'🇻🇳', cambodia:'🇰🇭', laos:'🇱🇦', myanmar:'🇲🇲', malaysia:'🇲🇾', indonesia:'🇮🇩', philippines:'🇵🇭' };
    for (const k of Object.keys(map)) { if (n === k || n.includes(k)) return map[k]; }
    return null;
  };

  const renderFlagImage = (flagValue, imageStyle, countryName) => {
    const uri = normalizeFlagValue(flagValue);
    let uriToUse = uri;
    try {
      if (Platform.OS === 'android' && uriToUse) {
        const isDataSvg = /^data:image\/svg\+xml/.test(uriToUse);
        const isSvgUrl = /\.svg(\?|$)/i.test(uriToUse);
        if (isDataSvg || isSvgUrl) uriToUse = null;
      }
    } catch {}
    if (!uriToUse) {
      const emoji = countryNameToEmoji(countryName);
      return emoji
        ? <View style={{ width: imageStyle?.width || 24, height: imageStyle?.height || 16, alignItems:'center', justifyContent:'center', marginRight: wp('2%') }}>
            <Text style={{ fontSize: Math.min(imageStyle?.height || 16, 18) }}>{emoji}</Text>
          </View>
        : <View style={[{ width: imageStyle?.width || 24, height: imageStyle?.height || 16, backgroundColor: '#E5E7EB', borderRadius: 2, marginRight: wp('2%') }]} />;
    }
    return <Image source={{ uri: uriToUse }} style={[{ width: imageStyle?.width || 24, height: imageStyle?.height || 16, marginRight: wp('2%'), resizeMode: 'contain' }, imageStyle]} />;
  };
  // ---------- /FLAGS ----------

  useEffect(() => {
    setOperatorDetail(operator);
    const fetchTimetables = async () => {
      try {
        let companyId = operator.md_company_id;
        if (!companyId || (companyId && !/^\d+$/.test(String(companyId)))) {
          if (operator.raw?.md_company_id && /^\d+$/.test(String(operator.raw.md_company_id))) {
            companyId = operator.raw.md_company_id;
          } else if (operator.id && /^\d+$/.test(String(operator.id))) {
            companyId = operator.id;
          }
        }
        const apiUrl = `${ipAddress}/companydetail/${companyId}`;
        const res = await fetch(apiUrl);
        if (!res.ok) { setTimetables([]); setIsLoading(false); return; }
        const txt = (await res.text()).trim();
        if (txt.startsWith('<')) { setTimetables([]); setIsLoading(false); return; }
        let data; try { data = JSON.parse(txt); } catch { setTimetables([]); setIsLoading(false); return; }
        const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        setTimetables(list || []);
        if (list?.[0]) {
          const first = list[0];
          setOperatorDetail(prev => ({
            ...prev,
            md_company_id: first.md_company_id || prev?.md_company_id || operator.md_company_id,
            md_company_nameeng: first.md_company_nameeng || prev?.md_company_nameeng || operator.md_company_nameeng,
            md_company_namethai: first.md_company_namethai || prev?.md_company_namethai || operator.md_company_namethai,
            md_company_picname: first.md_company_picname || prev?.md_company_picname || operator.md_company_picname,
            md_company_about: first.md_company_about || prev?.md_company_about || operator.md_company_about,
          }));
        }
      } catch { setTimetables([]); }
      finally { setIsLoading(false); }
    };
    fetchTimetables();
  }, []);

  const formatDuration = (timeStr) => {
    if (!timeStr) return '';
    const [hStr, mStr] = timeStr.split(':');
    const h = parseInt(hStr || '0', 10), m = parseInt(mStr || '0', 10);
    if (h > 0 && m > 0) return `${h} hr ${m} min`;
    if (h > 0) return `${h} hr${h > 1 ? 's' : ''}`;
    return `${m} min`;
  };

  const companyName = selectedLanguage === 'th'
    ? (operatorDetail?.md_company_namethai || operatorDetail?.md_company_nameeng || operator.md_company_namethai || operator.md_company_nameeng)
    : (operatorDetail?.md_company_nameeng || operatorDetail?.md_company_namethai || operator.md_company_nameeng || operator.md_company_namethai);

  const companyLocation = operator.md_company_countries || t('vietnamLocation');

  const groupedTimetables = React.useMemo(() => {
    if (!Array.isArray(timetables) || timetables.length === 0) return {};
    const groups = {};
    timetables.forEach(tt => {
      const locationName = selectedLanguage === 'th'
        ? (tt.start_locationthai || tt.start_locationeng || tt.md_timetable_startid)
        : (tt.start_locationeng || tt.start_locationthai || tt.md_timetable_startid);
      const key = locationName || tt.md_location_id || tt.md_timetable_startid;
      if (!groups[key]) groups[key] = { meta: tt, items: [] };
      groups[key].items.push(tt);
      groups[key].meta.displayName = locationName;
    });
    return groups;
  }, [timetables, selectedLanguage]);

  useEffect(() => {
    const keys = Object.keys(groupedTimetables || {});
    if (keys.length && Object.keys(expandedGroups).length === 0) {
      const init = {}; keys.forEach(k => (init[k] = true)); setExpandedGroups(init);
    }
  }, [groupedTimetables]); // init expand all

  const toggleGroup = (key) => setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));

  const getDest = (item, lang) => {
    const nameTh = item.end_locationthai || item.to_locationthai || item.arrive_locationthai || item.destination_thai;
    const nameEn = item.end_locationeng || item.to_locationeng || item.arrive_locationeng || item.destination_eng;
    const countryTh = item.end_countriesthai || item.to_countriesthai || item.arrive_countriesthai;
    const countryEn = item.end_countrieseng || item.to_countrieseng || item.arrive_countrieseng;
    const flag = item.end_countriesflag || item.to_countriesflag || item.arrive_countriesflag;
    return {
      name: lang === 'th' ? (nameTh || nameEn) : (nameEn || nameTh),
      country: lang === 'th' ? (countryTh || countryEn || 'ประเทศไทย') : (countryEn || countryTh || 'Thailand'),
      flag,
    };
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD501E" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} pointerEvents="none">{t('operatorDetail') || 'Operator'}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Top */}
        <View style={styles.topCardWrapper}>
          <View style={styles.logoCardNew}>
            <Image source={{ uri: operator.md_company_picname }} style={styles.operatorLogoNew} resizeMode="contain" />
          </View>
          <View style={styles.titleGroup}>
            <Text style={styles.operatorNameNew}>{companyName}</Text>
            <View style={styles.locationSelector} accessible accessibilityRole="text">
              <MaterialIcons name="place" size={18} color="#FD501E" />
              <Text style={styles.locationTextNew}>{companyLocation}</Text>
            </View>
          </View>
        </View>

        {/* Pills (toggle group) */}
        {timetables?.length > 0 && (
          <View style={styles.pillsContainer}>
            {Object.keys(groupedTimetables).map((gk) => {
              const expanded = expandedGroups[gk] ?? true;
              return (
                <TouchableOpacity key={`pill-${gk}`} style={styles.pill} onPress={() => toggleGroup(gk)} activeOpacity={0.8}>
                  <MaterialIcons name="place" size={16} color="#FD501E" />
                  <Text style={styles.pillText}>{groupedTimetables[gk].meta.displayName}</Text>
                  <Text style={styles.pillPlus}>{expanded ? '−' : '+'}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Groups */}
        <View style={styles.routesContainer}>
          <Text style={styles.sectionTitle}>{t('routes') || 'routes'}</Text>

          {timetables && timetables.length > 0 ? (
            Object.keys(groupedTimetables).map((gk, idx) => {
              const group = groupedTimetables[gk];
              const expanded = expandedGroups[gk] ?? true;
              return (
                <View key={`group-${gk}-${idx}`} style={styles.routeGroupCard}>
                  <View style={styles.routeGroupInner}>
                    <View style={styles.locationHeader}>
                      <MaterialIcons name="place" size={20} color="#FD501E" />
                      <Text style={styles.locationHeaderText}>{group.meta.displayName}</Text>
                    </View>

                    {expanded && group.items.map((item, itemIdx) => {
                      const showGetPrice = !!item.md_timetable_id;
                      const dest = getDest(item, selectedLanguage);
                      const startName = selectedLanguage === 'th' ? (item.start_locationthai || item.start_locationeng) : (item.start_locationeng || item.start_locationthai);
                      const startCountry = selectedLanguage === 'th' ? (item.start_countriesthai || item.start_countrieseng || 'ประเทศไทย') : (item.start_countrieseng || item.start_countriesthai || 'Thailand');

                      return (
                        <View key={item.md_timetable_id || `${gk}-${itemIdx}`} style={styles.routeCardDual}>
                          {/* row: left / boat / right */}
                          <View style={styles.routeRowDual}>
                            <View style={styles.dualLeft}>
                              <View style={{ flexDirection:'row', alignItems:'center' }}>
                                {renderFlagImage(item.start_countriesflag, { width: 28, height: 18 }, (item.start_countrieseng || item.start_countriesthai))}
                                <View style={{ marginLeft: wp('2%') }}>
                                  <Text style={styles.routeLocationTextSingle}>{startName}</Text>
                                  <Text style={styles.routeCountryText}>{startCountry}</Text>
                                </View>
                              </View>
                            </View>
                            <View style={styles.dualCenter}>
                              <View style={styles.boatIconCircle}><Ionicons name="boat" size={18} color="#FFFFFF" /></View>
                            </View>
                            <View style={styles.dualRight}>
                              <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'flex-end' }}>
                                {renderFlagImage(dest.flag, { width: 28, height: 18 }, dest.country)}
                                <View style={{ marginLeft: wp('2%'), alignItems:'flex-start' }}>
                                  <Text style={styles.routeLocationTextSingle}>{dest.name}</Text>
                                  <Text style={styles.routeCountryText}>{dest.country}</Text>
                                </View>
                              </View>
                            </View>
                          </View>

                          {/* --- divider + floating pill button on the line --- */}
                          <View style={styles.dividerRow}>
                            <View style={styles.centerDivider} />
                            {showGetPrice && (
                              <TouchableOpacity
                                style={styles.getPricePill}
                                onPress={() => navigation.navigate('TripDetail', { timeTableDepartId: item.md_timetable_id })}
                                activeOpacity={0.9}
                              >
                                <Text style={styles.getPriceTextNew}>{t('getPrice') || 'Get Price'}</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      );
                    })}

                    {/* footer */}
                    {expanded && (
                      <View style={styles.groupFooterNew}>
                        <Image source={{ uri: group.items[0]?.md_company_picname || operator.md_company_picname }} style={styles.footerLogoNew} />
                        <View style={{ marginLeft: wp('3%'), flex: 1 }}>
                          <View style={{ flexDirection:'row', alignItems:'center', flexWrap:'wrap', gap: wp('3%') }}>
                            <View style={{ flexDirection:'row', alignItems:'center' }}>
                              <Ionicons name="boat" size={14} color="#6B7280" />
                              <Text style={styles.footerInfoText}>{companyName}</Text>
                            </View>
                            <View style={{ flexDirection:'row', alignItems:'center' }}>
                              <Ionicons name="calendar" size={14} color="#6B7280" />
                              <Text style={styles.footerInfoText}>{group.items.length} {t('sailingsDaily') || 'sailingsDaily'}</Text>
                            </View>
                            <View style={{ flexDirection:'row', alignItems:'center' }}>
                              <MaterialIcons name="schedule" size={14} color="#6B7280" />
                              <Text style={styles.footerInfoText}>{formatDuration(group.items[0]?.md_timetable_time) || '1 hr'}</Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.noRoutesCard}>
              <MaterialIcons name="info-outline" size={48} color="#D1D5DB" />
              <Text style={styles.noRoutesText}>{t('noRoutesAvailable') || 'No routes available for this operator.'}</Text>
            </View>
          )}
        </View>

        <View style={{ height: hp('10%') }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: hp('2%'), paddingBottom: hp('2%') },
  header: {
    flexDirection: 'row', alignItems: 'center', position: 'relative',
    paddingHorizontal: wp('4%'), paddingVertical: hp('2%'),
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: wp('4.5%'), fontWeight: '700', color: '#1F2937', position: 'absolute', left: 0, right: 0, textAlign: 'center' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollView: { flex: 1 },

  // Top
  topCardWrapper: { marginHorizontal: wp('4%'), marginTop: hp('2%'), alignItems: 'center' },
  logoCardNew: {
    width: wp('28%'), height: wp('28%'), borderRadius: wp('14%'), backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  operatorLogoNew: { width: '70%', height: '70%' },
  titleGroup: { marginTop: hp('2%'), alignItems: 'center' },
  operatorNameNew: { fontSize: wp('6%'), fontWeight: '800', color: '#0F172A', textAlign: 'center' },
  locationSelector: { marginTop: hp('1%'), flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3ED', paddingHorizontal: wp('3%'), paddingVertical: hp('0.8%'), borderRadius: wp('2%') },
  locationTextNew: { color: '#FD501E', marginLeft: wp('1%'), fontWeight: '600' },

  // Pills
  pillsContainer: { marginHorizontal: wp('4%'), marginTop: hp('1%') },
  pill: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFF7F3', borderRadius: wp('2.5%'), paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('4%'), marginBottom: hp('1%'), borderWidth: 1, borderColor: '#FDE3D7',
  },
  pillText: { flex: 1, marginLeft: wp('2%'), fontSize: wp('4%'), fontWeight: '700', color: '#1F2937' },
  pillPlus: { fontSize: wp('5%'), color: '#FD501E', marginLeft: wp('2%') },

  // Groups
  routesContainer: { marginHorizontal: wp('4%'), marginTop: hp('2%') },
  sectionTitle: { fontSize: wp('4.5%'), fontWeight: '700', color: '#1F2937', marginBottom: hp('1.5%') },
  routeGroupCard: {
    backgroundColor: '#FFFFFF', borderRadius: wp('4%'), marginBottom: hp('2%'),
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  routeGroupInner: { padding: wp('4%'), borderRadius: wp('4%'), overflow: 'hidden', backgroundColor: 'transparent' },
  locationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: hp('1.5%'), paddingBottom: hp('1%'), borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  locationHeaderText: { fontSize: wp('4%'), fontWeight: '700', color: '#1F2937', marginLeft: wp('2%') },

  // Dual row card
  routeCardDual: { backgroundColor: 'transparent', paddingVertical: hp('1%') },
  routeRowDual: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dualLeft: { flex: 1, paddingRight: wp('2%') },
  dualCenter: { width: 48, alignItems: 'center', justifyContent: 'center' },
  dualRight: { flex: 1, paddingLeft: wp('2%'), alignItems: 'flex-start' },

  routeLocationTextSingle: { fontSize: wp('4%'), fontWeight: '700', color: '#0F172A', marginLeft: wp('2%') },
  routeCountryText: { fontSize: wp('3%'), color: '#9CA3AF', marginTop: hp('0.3%') },
  boatIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FD501E', alignItems: 'center', justifyContent: 'center' },

  // --- NEW: divider + floating Get Price pill ON the line ---
  dividerRow: { position: 'relative', alignItems: 'center', justifyContent: 'center', marginTop: hp('0.8%'), marginBottom: hp('0.8%') },
  centerDivider: { height: 1, backgroundColor: '#E5E7EB', alignSelf: 'stretch', width: '100%' },
  getPricePill: {
    position: 'absolute',
    top: -hp('1.4%'),          // ดันให้ซ้อนบนเส้นพอดี
    alignSelf: 'center',
    paddingVertical: hp('0.9%'),
    paddingHorizontal: wp('4.5%'),
    borderRadius: 999,
    backgroundColor: '#FD501E',
    zIndex: 2,
    // เงาสวย ๆ
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  getPriceTextNew: { color: '#FFFFFF', fontWeight: '700', fontSize: wp('3.5%') },

  // Footer
  groupFooterNew: { marginTop: hp('1%'), paddingTop: hp('1.5%'), borderTopWidth: 1, borderTopColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center' },
  footerLogoNew: { width: 80, height: 50, resizeMode: 'contain' },
  footerInfoText: { fontSize: wp('3%'), color: '#6B7280', marginLeft: wp('1.5%') },

  // Empty
  noRoutesCard: { backgroundColor: '#F9FAFB', padding: wp('8%'), borderRadius: wp('4%'), alignItems: 'center', justifyContent: 'center' },
  noRoutesText: { color: '#6B7280', fontSize: wp('3.5%'), marginTop: hp('1%'), textAlign: 'center' },
});

export default OperatorDetailScreen;
