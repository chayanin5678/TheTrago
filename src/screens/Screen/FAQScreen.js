import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, SafeAreaView, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from './LanguageContext';
import axios from 'axios';

const FAQItem = ({ item, expanded, onToggle }) => {
  const { selectedLanguage } = useLanguage();
  const title = selectedLanguage === 'th' ? (item.md_faq_namethai || item.md_faq_nameeng) : (item.md_faq_nameeng || item.md_faq_namethai);
  const bodyHtml = selectedLanguage === 'th' ? (item.md_faq_textthai || item.md_faq_texteng || item.md_faq_text) : (item.md_faq_texteng || item.md_faq_textthai || item.md_faq_text);

  return (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={onToggle} style={styles.itemHeader} activeOpacity={0.8}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSign}>{expanded ? '-' : '+'}</Text>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.itemBody}>
          <Text style={styles.itemBodyText}>{stripHtml(bodyHtml)}</Text>
        </View>
      )}
    </View>
  );
};

function stripHtml(html) {
  if (!html) return '';
  let s = String(html);
  // Normalize line breaks
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<p[^>]*>/gi, '\n');
  s = s.replace(/<\/p>/gi, '\n');
  // Convert list items to bullets
  s = s.replace(/<li[^>]*>/gi, '\n• ');
  s = s.replace(/<\/li>/gi, '');
  // Remove any remaining tags
  s = s.replace(/<[^>]+>/g, '');
  // Decode common entities
  s = s.replace(/&nbsp;/g, ' ');
  s = s.replace(/&amp;/g, '&');
  s = s.replace(/&lt;/g, '<');
  s = s.replace(/&gt;/g, '>');
  // Collapse multiple newlines
  s = s.replace(/\n{3,}/g, '\n\n');
  return s.trim();
}

const FAQScreen = ({ navigation }) => {
  const { selectedLanguage, t } = useLanguage();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get('https://thetrago.com/AppApi/faq');
        if (!mounted) return;
        if (res?.data?.data) {
          setFaqs(res.data.data);
        } else {
          setFaqs([]);
        }
      } catch (e) {
        console.warn('Failed to fetch faqs', e);
        setFaqs([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}><ActivityIndicator size="large" color="#FD501E" /></View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FD501E" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={["#FD501E", "#FF6B40", "#FD501E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <SafeAreaView style={styles.safeAreaHeader}>
            <View style={styles.headerContent}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.8}>
                <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>{t('faq') || "FAQ's"}</Text>
              <Text style={styles.headerSubtitle}>{t('faqDesc') || "have questions? We're here to help you"}</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView style={[styles.scrollContainer, styles.scrollViewWithMargin]} contentContainerStyle={styles.contentContainer}>
        {faqs.map((item, idx) => (
          <FAQItem
            key={item.md_faq_id || idx}
            item={item}
            expanded={expandedIndex === idx}
            onToggle={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // layout
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 60 },
  scrollViewWithMargin: { marginTop: 160, flex: 1 },

  // header (copied from AffiliateScreen style)
  headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2 },
  headerGradient: {
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  safeAreaHeader: { paddingTop: Platform.OS === 'android' ? 40 : 0 },
  headerContent: { alignItems: 'center', position: 'relative', zIndex: 3 },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.95)', textAlign: 'center', fontWeight: '500', letterSpacing: 0.3 },
  itemContainer: { marginBottom: 12 },
  itemHeader: { backgroundColor: '#FEF1EF', padding: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemTitle: { fontSize: 16, color: '#111', fontWeight: '600', flex: 1 },
  itemSign: { marginLeft: 12, fontSize: 20, color: '#111' },
  itemBody: { padding: 16, paddingTop: 12 },
  itemBodyText: { color: '#6B7280', lineHeight: 22 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});

export default FAQScreen;
