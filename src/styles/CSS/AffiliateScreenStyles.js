import { StyleSheet, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  qrModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1F2937',
    textAlign: 'center',
  },
  qrModalImage: {
    width: 200,
    height: 200,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  qrModalLink: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 8,
    textAlign: 'center',
  },
  qrModalButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  qrModalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: hp('10%'),
  },
  scrollViewWithMargin: {
    marginTop: 140,
    flex: 1,
  },
  
  // Premium Header Styles
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
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
  safeAreaHeader: {
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  headerContent: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 3,
  },
  backButton: {
    position: 'absolute',
    top: 15,
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  // Content Styles
  content: {
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('5%'),
    minHeight: '100%',
  },
  sectionTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: hp('2%'),
  },

  // Status Card Styles
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: wp('4%'),
    borderRadius: wp('3%'),
    marginBottom: hp('1.5%'),
  },
  statusContent: {
    flex: 1,
  },
  statusCount: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusTitle: {
    fontSize: wp('4%'),
    color: '#6B7280',
    fontWeight: '500',
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Metric Card Styles
  metricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: wp('4%'),
    borderRadius: wp('3%'),
    marginBottom: hp('1.5%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  metricContent: {
    flex: 1,
  },
  metricValue: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: wp('3.5%'),
    color: '#6B7280',
    fontWeight: '500',
  },

  // Link Card Styles
  linkCard: {
    backgroundColor: '#FFFFFF',
    padding: wp('4%'),
    borderRadius: wp('3%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  linkTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#1F2937',
    marginTop: hp('1%'),
    marginBottom: hp('0.5%'),
  },
  linkSubtitle: {
    fontSize: wp('3.5%'),
    color: '#6B7280',
    marginBottom: hp('2%'),
    lineHeight: wp('5%'),
  },
  linkContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: wp('2%'),
    padding: wp('3%'),
    marginBottom: hp('1.5%'),
    alignItems: 'center',
  },
  linkText: {
    flex: 1,
    fontSize: wp('3.5%'),
    color: '#4B5563',
    marginRight: wp('2%'),
  },
  copyButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: wp('4%'),
    paddingVertical: wp('2%'),
    borderRadius: wp('2%'),
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: wp('3.5%'),
    fontWeight: '600',
  },
  qrButton: {
    backgroundColor: '#0891B2',
    paddingVertical: wp('3%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    marginTop: wp('1%'),
  },
  qrButtonText: {
    color: '#FFFFFF',
    fontSize: wp('3.5%'),
    fontWeight: '600',
    letterSpacing: 1,
  },
  
  // Loading States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp('10%'),
  },
  loadingText: {
    fontSize: wp('4%'),
    color: '#6B7280',
    marginTop: hp('2%'),
  },
  
  // Error States
  errorContainer: {
    padding: wp('4%'),
    backgroundColor: '#FEF2F2',
    borderRadius: wp('2%'),
    marginBottom: hp('2%'),
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: wp('3.5%'),
    color: '#DC2626',
    textAlign: 'center',
  },
  
  // Refresh Button
  refreshButton: {
    backgroundColor: '#FD501E',
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('6%'),
    borderRadius: wp('2%'),
    alignItems: 'center',
    marginTop: hp('2%'),
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: wp('4%'),
    fontWeight: '600',
  },
});

export default styles;
