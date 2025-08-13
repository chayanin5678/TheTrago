import { StyleSheet, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

export const styles = StyleSheet.create({
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
