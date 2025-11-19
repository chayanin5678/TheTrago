import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f5f8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8, backgroundColor: 'transparent' },
  headerLeft: { width: 42, alignItems: 'flex-start', marginLeft: 4 },
  headerRight: { width: 42 },
  headerTitle: { fontSize: 18, fontWeight: '600', textAlign: 'center', color: '#18304b', flex: 1 },
  scroll: { paddingHorizontal: 16 },

  searchCard: { marginTop: 6, borderRadius: 12, backgroundColor: '#fff', padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  formTitle: { fontSize: 16, fontWeight: '600', color: '#18304b', marginBottom: 8 },
  formRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eef3f6' },
  icon: { marginRight: 10 },
  formText: { fontSize: 15, color: '#15314a' },
  searchButton: { marginTop: 14, backgroundColor: '#216bd3', paddingVertical: 12, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  searchButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  smallNoteRow: { marginTop: 12, flexDirection: 'row', alignItems: 'center' },
  smallNoteIcon: { width: 18, height: 18, marginRight: 8 },
  smallNoteText: { color: '#2b5365' },

  promoCard: { marginTop: 18, borderRadius: 12, backgroundColor: '#fff', padding: 12 },
  promoTitle: { fontSize: 16, fontWeight: '600', color: '#18304b', marginBottom: 8 },
  promoBanner: { backgroundColor: '#f9e9f1', borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  promoLabel: { color: '#e44d8b', fontSize: 16, fontWeight: '700' },
  promoBtn: { backgroundColor: '#e44d8b', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20 },
  promoBtnText: { color: '#fff', fontWeight: '700' },

  brandsCard: { marginTop: 18, borderRadius: 12, backgroundColor: '#fff', padding: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#18304b', marginBottom: 12 },
  brandGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  brandCell: { width: (width - 56) / 4, height: 62, marginBottom: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#eef3f6', backgroundColor: '#fff' },
  brandIcon: { width: 60, height: 40, resizeMode: 'contain' },
  brandDesc: { color: '#2b5365', marginTop: 12 },

  sectionCard: { marginTop: 18, borderRadius: 12, backgroundColor: '#fff', padding: 12 },
  reasonRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderColor: '#f1f7fb' },
  reasonIcon: { width: 36, height: 36, marginRight: 12, marginTop: 6 },
  reasonTextWrap: { flex: 1 },
  reasonTitle: { fontSize: 16, fontWeight: '600', color: '#18304b' },
  reasonDesc: { color: '#6a7a84', marginTop: 4 },
});
