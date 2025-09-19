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
    bottom: 20,
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  /* shadow/elevation removed */
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
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 0.5,
  /* textShadow removed */
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
    left: 30,
    opacity: 0.3,
  },

  // Premium Content
  scrollViewPremium: {
    flex: 1,
    zIndex: 1,
  },
  scrollViewWithMargin: {
    marginTop: 140,
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
  /* shadow/elevation removed */
    borderWidth: 1,
    borderColor: 'rgba(253, 80, 30, 0.1)',
  },
  sectionHeaderPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  sectionTitlePremium: {
    fontSize: 20,
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
  existingDataBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  existingDataText: {
    fontSize: 12,
    color: '#22C55E',
    marginLeft: 4,
    fontWeight: '600',
  },

  // Upload Button Premium
  uploadButtonPremium: {
    borderRadius: 18,
    overflow: 'hidden',
  /* shadow/elevation removed */
    marginBottom: 20,
  },
  ocrStatusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  ocrStatusText: {
    fontSize: 12,
    color: '#3B82F6',
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
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
  /* shadow/elevation removed */
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
    /* shadow/elevation removed */
    fontWeight: '500',
  },

  // Button Premium
  buttonPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(209, 213, 219, 0.8)',
    borderRadius: 15,
    /* shadow/elevation removed */
  },
  buttonTextPremium: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },

  // Save Button Premium
  saveButtonPremium: {
    marginTop: 10,
    borderRadius: 18,
    /* shadow/elevation removed */
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 25,
  },
  saveButtonTextPremium: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
    letterSpacing: 0.5,
  },

  // Button Row
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 10,
    marginBottom: 25,
  },
  closeButton: {
    flex: 1,
  },
  saveButtonFlex: {
    flex: 2,
  },
  saveButtonFullWidth: {
    flex: 1,
    width: '100%',
  },
  closeGradient: {
    backgroundColor: '#6B7280',
  },
  closeButtonText: {
    color: '#FFFFFF',
    marginLeft: 0,
  },

  // Info Card Premium
  infoCardPremium: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 25,
    padding: 25,
    marginBottom: 25,
    /* shadow/elevation removed */
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
    marginLeft: 12,
    letterSpacing: 0.3,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    fontWeight: '500',
  },

  // Modal Premium
  modalOverlayPremium: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContentPremium: {
    width: '100%',
    height: 500,
    borderRadius: 25,
    overflow: 'hidden',
  /* shadow/elevation removed */
  },
  modalGradient: {
    flex: 1,
    padding: 0,
  },
  modalHeaderPremium: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.5)',
  },
  modalTitlePremium: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.3,
  },
  closeButtonPremium: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInputPremium: {
    margin: 20,
    marginTop: 15,
    marginBottom: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(209, 213, 219, 0.8)',
    borderRadius: 15,
    fontSize: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  /* shadow/elevation removed */
  },
  optionItemPremium: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTextPremium: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
  bankCodeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
    marginLeft: 10,
  },
  modalLoadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLoadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalErrorContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalErrorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '500',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FD501E',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  bankListContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bankListContent: {
    paddingBottom: 20,
  },

  // Image Error Styles
  imageErrorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  imageErrorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 8,
  },
  imageErrorSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  imageErrorUri: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
