import { StyleSheet, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// Ultra Premium Styles for HomeScreen
const HomeScreenPremiumStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent', // CrossPlatformStatusBar handles the orange background
    // Ensure consistent behavior across platforms
    paddingTop: 0, // CrossPlatformStatusBar will handle the padding
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  geometricShapes: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  shape1: {
    position: 'absolute',
    top: hp('15%'),
    right: wp('10%'),
  },
  shape2: {
    position: 'absolute',
    bottom: hp('25%'),
    left: wp('8%'),
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBlur: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    padding: wp('10%'),
  },
  loadingSpinner: {
    width: wp('20%'),
    height: wp('20%'),
    borderRadius: wp('10%'),
    marginBottom: hp('2.5%'),
    overflow: 'hidden',
  },
  loadingGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: hp('1%'),
  },
  loadingSubtext: {
    fontSize: wp('3.5%'),
    color: 'rgba(255,255,255,0.7)',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: hp('12.5%'),
  },
  headerSection: {
    marginTop: hp('2%'),
    marginHorizontal: wp('3%'),
    borderRadius: wp('6%'),
    overflow: 'hidden',
    // Unified shadow system for both platforms
    shadowColor: Platform.OS === 'android' ? 'transparent' : '#000',
    shadowOffset: Platform.OS === 'android' ? { width: 0, height: 0 } : { width: 0, height: 6 },
    shadowOpacity: Platform.OS === 'android' ? 0 : 0.2,
    shadowRadius: Platform.OS === 'android' ? 0 : 12,
    elevation: Platform.OS === 'android' ? 0 : 8,
    // Additional Android compatibility
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  },
  headerBlur: {
    borderRadius: wp('6%'),
    overflow: 'hidden',
  },
  headerGradient: {
    paddingVertical: hp('2.5%'),
    paddingHorizontal: wp('4%'),
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  headerActionsLeft: {
    width: wp('12%'),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerActionsRight: {
    width: wp('12%'),
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    top: -hp('0.8%'),
    right: -wp('6%'),
    borderRadius: wp('2.5%'),
    overflow: 'hidden',
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('1.5%'),
    paddingVertical: hp('0.4%'),
    borderRadius: wp('2.5%'),
  },
  badgeText: {
    fontSize: wp('2.2%'),
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: wp('0.8%'),
  },
  notificationButton: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  profileButton: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  actionButtonBlur: {
    padding: 8,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF4444',
  },
  searchSection: {
    marginTop: hp('0.5%'),
  },
  searchSkeleton: {
    height: 50,
    borderRadius: 25,
  backgroundColor: 'rgba(255,255,255,0.98)',
    overflow: 'hidden',
  },
  searchContainer: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  searchGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  searchIconContainer: {
    marginRight: 12,
  },
  searchInputContainer: {
    flex: 1,
    position: 'relative',
    height: 26,
    justifyContent: 'center',
  },
  searchPlaceholder: {
    position: 'absolute',
    width: '100%',
    fontSize: wp('3.5%'),
  },
  placeholderText: {
    fontWeight: '500',
  },
  searchInput: {
    height: 26,
    fontSize: wp('3.5%'),
    color: '#333',
    paddingVertical: 0,
  },
  filterButton: {
    marginLeft: 12,
    padding: 4,
  },
  headerDecorations: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  headerDecor1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(253,80,30,0.1)',
  },
  headerDecor2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,107,53,0.08)',
  },
  shimmerEffect: {
    width: 200,
    height: '100%',
  },
  shimmerGradient: {
    width: '100%',
    height: '100%',
  },
  servicesSection: {
    marginTop: hp('1.5%'),
    marginHorizontal: wp('3%'),
  },
  servicesContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    // Unified shadow system for both platforms
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  },
  servicesBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  servicesGradient: {
    paddingVertical: hp('2.5%'),
    paddingHorizontal: wp('4%'),
  },
  servicesTitleContainer: {
    alignItems: 'center',
    marginBottom: hp('1.5%'),
  },
  servicesTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: hp('0.8%'),
  },
  servicesSubtitle: {
    fontSize: wp('3.5%'),
    color: '#718096',
    fontStyle: 'italic',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItemContainer: {
    width: '23.5%',
    marginBottom: hp('1.5%'),
  },
  serviceSkeleton: {
    alignItems: 'center',
  },
  serviceSkeletonIcon: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7%'),
  backgroundColor: 'rgba(255,255,255,0.98)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  serviceSkeletonText: {
    height: 12,
    width: 40,
    borderRadius: 6,
  backgroundColor: 'rgba(255,255,255,0.98)',
    overflow: 'hidden',
  },
  serviceItem: {
    borderRadius: 16,
    overflow: 'hidden',
    // Unified shadow system for both platforms
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: 'rgba(253,80,30,0.06)', // subtle light orange
  },
  serviceItemBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  serviceItemGradient: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    position: 'relative',
  },
  serviceBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    borderRadius: 8,
    overflow: 'hidden',
    zIndex: 10,
  },
  serviceIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
  backgroundColor: 'rgba(253,80,30,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceItemText: {
    fontSize: wp('2.8%'),
    fontWeight: '600',
    color: '#2d3748',
    textAlign: 'center',
  },
  hoverIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#FD501E',
    borderRadius: 1,
  },
  hotDealsSection: {
    marginTop: hp('1.5%'),
    marginHorizontal: wp('3%'),
  },
  hotDealsContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    // Unified shadow system for both platforms
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    backgroundColor: 'rgba(253, 80, 30, 0.95)',
  },
  hotDealsSkeleton: {
    height: 50,
    borderRadius: 20,
  backgroundColor: 'rgba(255,255,255,0.98)',
    overflow: 'hidden',
  },
  hotDealsBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  hotDealsGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    position: 'relative',
  },
  hotDealsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  hotDealsTextContainer: {
    marginLeft: wp('2.5%'),
    flex: 1,
  },
  hotDealsTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: wp('0.5%'),
  },
  hotDealsAccent: {
    color: 'rgba(255,255,255,0.85)',
    fontStyle: 'italic',
  },
  hotDealsSubtitle: {
    fontSize: wp('2.8%'),
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  floatingElement1: {
    position: 'absolute',
    top: 6,
    right: 50,
  },
  floatingElement2: {
    position: 'absolute',
    bottom: 8,
    left: 80,
  },
  bannerSection: {
    marginTop: hp('1.5%'),
    marginHorizontal: wp('3%'),
  },
  bannerSkeleton: {
    height: hp('20%'),
    borderRadius: wp('4.5%'),
    backgroundColor: 'rgba(253,80,30,0.1)',
    overflow: 'hidden',
  },
  bannerContainer: {
    borderRadius: wp('4.5%'),
    overflow: 'hidden',
    // Unified shadow system for both platforms
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  backgroundColor: 'rgba(255,255,255,0.98)',
  },
  bannerBlur: {
    borderRadius: wp('4.5%'),
    overflow: 'hidden',
  },
  bannerGradient: {
    position: 'relative',
  },
  bannerContentWrapper: {
    paddingHorizontal: wp('5%'),
    paddingVertical: wp('3%'),
  },
  bannerOverlay: {
    position: 'absolute',
    top: wp('3%'),
    right: wp('3%'),
  },
  bannerBadge: {
    borderRadius: wp('3%'),
    overflow: 'hidden',
    // Unified shadow system for both platforms
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: hp('0.4%') },
    shadowOpacity: 0.25,
    shadowRadius: wp('1.5%'),
    elevation: 6,
    backgroundColor: 'rgba(255, 215, 0, 0.95)',
  },
  bannerBadgeText: {
    fontSize: wp('2.8%'),
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: wp('1.25%'),
  },
  
  // Section Title Styles
  sectionTitleContainer: {
    marginTop: hp('1.5%'),
    marginBottom: hp('1.5%'),
    marginHorizontal: wp('2.5%'),
  },
  sectionTitleBlur: {
    borderRadius: wp('4%'),
    overflow: 'hidden',
  },
  sectionTitleGradient: {
    paddingHorizontal: wp('5%'),
    paddingVertical: wp('3%'),
  },
  sectionTitle: {
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'left',
    marginBottom: hp('0.5%'),
  },
  sectionTitleAccent: {
    color: '#FD501E',
  },
  sectionSubtitle: {
    fontSize: wp('3.5%'),
    color: '#666',
    fontWeight: '500',
    textAlign: 'left',
  },
  
  // Destination Cards Styles
  destinationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: wp('2.5%'),
    marginTop: hp('1%'),
  },
  destinationCard: {
    width: wp('30%'), // Using responsive width
    marginBottom: hp('2%'),
  },
  destinationTouchable: {
    width: '100%',
  },
  destinationBlur: {
    borderRadius: wp('3%'), // More responsive border radius
    overflow: 'hidden',
    // Unified shadow system for both platforms
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp('0.3%') },
    shadowOpacity: 0.1,
    shadowRadius: wp('1.5%'),
    elevation: 4,
  backgroundColor: 'rgba(255,255,255,0.98)',
  },
  destinationGradient: {
    position: 'relative',
  },
  destinationImageContainer: {
    width: '100%',
    height: wp('25%'), // Using width-based responsive height for better aspect ratio
    position: 'relative',
    borderTopLeftRadius: wp('3%'),
    borderTopRightRadius: wp('3%'),
    overflow: 'hidden',
  },
  destinationImageSkeleton: {
    ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopLeftRadius: wp('3%'),
    borderTopRightRadius: wp('3%'),
    overflow: 'hidden',
  },
  destinationImage: {
    width: '100%',
    height: '100%',
  },
  destinationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  destinationContent: {
    padding: wp('2.5%'), // More responsive padding
    paddingTop: wp('2%'),
    paddingBottom: wp('2.5%'),
    minHeight: wp('12%'), // Using width-based min height for consistency
  },
  destinationTextSkeleton: {
    height: wp('4%'), // Width-based height
    borderRadius: wp('1%'),
  backgroundColor: 'rgba(255,255,255,0.98)',
    overflow: 'hidden',
  },
  destinationName: {
    fontSize: wp('3.2%'), // Slightly smaller font for better fit
    fontWeight: 'bold',
    color: '#333',
    marginBottom: wp('1%'),
    textAlign: 'center', // Center align for better look
  },
  destinationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the explore button
    marginTop: wp('0.5%'),
  },
  destinationMetaText: {
    fontSize: wp('2.8%'), // Smaller font for better fit
    color: '#FD501E',
    fontWeight: '600',
    marginLeft: wp('1%'),
  },
  destinationIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -wp('1%') }],
    width: wp('2%'),
    height: wp('0.5%'), // Width-based height for consistency
    backgroundColor: '#FD501E',
    borderTopLeftRadius: wp('1%'),
    borderTopRightRadius: wp('1%'),
  },

  // Routes Grid Styles
  routesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start', // Align cards to the left
    paddingHorizontal: wp('1%'),
    marginTop: hp('1%'),
  },
  routeCard: {
    width: '31%', // 3 columns layout
    height: hp('22%'), // Fixed height for consistent appearance
    marginBottom: hp('2%'),
    marginRight: wp('2%'), // Add margin between cards
  },
  routeTouchable: {
    width: '100%',
  },
  routeBlur: {
    height: '100%', // Take full height of parent container
    borderRadius: wp('3%'),
    overflow: 'hidden',
    // Unified shadow system for both platforms
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp('0.3%') },
    shadowOpacity: 0.1,
    shadowRadius: wp('1.5%'),
    elevation: 4,
  backgroundColor: 'rgba(255,255,255,0.98)',
  },
  routeGradient: {
    position: 'relative',
    height: '100%', // Full height
    justifyContent: 'space-between', // Distribute content evenly
  },
  routeImageContainer: {
    width: '100%',
    height: hp('12%'), // Reduced height for better proportions
    position: 'relative',
    borderTopLeftRadius: wp('3%'),
    borderTopRightRadius: wp('3%'),
    overflow: 'hidden',
  },
  routeImageSkeleton: {
    ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(255,255,255,0.98)',
    borderTopLeftRadius: wp('3%'),
    borderTopRightRadius: wp('3%'),
    overflow: 'hidden',
  },
  routeImage: {
    width: '100%',
    height: '100%',
  },
  routeImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  hotRouteBadge: {
    position: 'absolute',
    top: wp('2%'),
    left: wp('2%'),
    borderRadius: wp('3%'),
    overflow: 'hidden',
  },
  hotRouteBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('2%'),
    paddingVertical: wp('1%'),
  },
  hotRouteBadgeText: {
    color: '#fff',
    fontSize: wp('2.5%'),
    fontWeight: 'bold',
    marginLeft: wp('1%'),
  },
  routeContent: {
    padding: wp('2.5%'),
    paddingTop: wp('2%'),
    paddingBottom: wp('2.5%'),
    flex: 1, // Take remaining space
    justifyContent: 'space-between', // Distribute content evenly
  },
  routeTextSkeleton: {
    height: wp('4%'),
    borderRadius: wp('1%'),
  backgroundColor: 'rgba(255,255,255,0.98)',
    overflow: 'hidden',
    marginTop: wp('1%'),
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: wp('1%'),
  },
  routeFromText: {
    fontSize: wp('3%'),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 0,
    numberOfLines: 1, // Prevent text wrapping
  },
  routeArrowContainer: {
    marginHorizontal: wp('1%'),
  },
  routeToText: {
    fontSize: wp('3%'),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 0,
    numberOfLines: 1, // Prevent text wrapping
  },
  routeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto', // Push to bottom
    paddingTop: wp('1%'), // Add some spacing
  },
  routePierText: {
    fontSize: wp('2.8%'),
    color: '#999',
    fontWeight: '500',
    marginLeft: wp('1%'),
    textAlign: 'center',
    numberOfLines: 1, // Prevent text wrapping
    ellipsizeMode: 'tail', // Add ellipsis if text is too long
  },
  routeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -wp('1%') }],
    width: wp('2%'),
    height: wp('0.5%'),
    backgroundColor: '#FD501E',
    borderTopLeftRadius: wp('1%'),
    borderTopRightRadius: wp('1%'),
  },

  // Enhanced Top Trending Carousel Styles
  trendingCarouselContainer: {
    marginTop: hp('1%'),
    marginBottom: hp('2%'),
  },
  trendingCarouselSkeleton: {
    width: wp('90%'),
    height: hp('35%'),
    borderRadius: wp('6%'),
  backgroundColor: 'rgba(255,255,255,0.98)',
    marginHorizontal: wp('5%'),
    overflow: 'hidden',
    alignSelf: 'center',
  },
  trendingScrollView: {
    width: '100%',
  },
  trendingScrollContent: {
    paddingHorizontal: wp('2.5%'),
  },
  trendingCarouselCard: {
    width: wp('90%'),
    height: hp('35%'),
    marginHorizontal: wp('2.5%'),
    borderRadius: wp('6%'),
    overflow: 'hidden',
    // Unified shadow system for both platforms
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp('1%') },
    shadowOpacity: 0.25,
    shadowRadius: wp('3%'),
  backgroundColor: 'rgba(255,255,255,0.98)',
  },
  trendingCarouselBlur: {
    flex: 1,
    borderRadius: wp('6%'),
    overflow: 'hidden',
  },
  trendingCarouselImageContainer: {
    flex: 1,
    position: 'relative',
  },
  trendingCarouselImage: {
    width: '100%',
    height: '100%',
  },
  trendingCarouselOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  trendingCarouselBadge: {
    position: 'absolute',
    top: wp('4%'),
    left: wp('4%'),
    borderRadius: wp('6%'),
    overflow: 'hidden',
  },
  trendingCarouselBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('3%'),
    paddingVertical: wp('2%'),
  },
  trendingCarouselBadgeText: {
    color: '#fff',
    fontSize: wp('3.2%'),
    fontWeight: 'bold',
    marginLeft: wp('1.5%'),
  },
  trendingCarouselRating: {
    position: 'absolute',
    top: wp('4%'),
    right: wp('4%'),
    borderRadius: wp('5%'),
    overflow: 'hidden',
  },
  ratingBlurContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('2.5%'),
    paddingVertical: wp('1.5%'),
  },
  trendingCarouselRatingText: {
    color: '#fff',
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
    marginLeft: wp('1%'),
  },
  trendingCarouselContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: wp('5%'),
    paddingTop: wp('8%'),
  },
  trendingCarouselTextContainer: {
    alignItems: 'flex-start',
  },
  trendingCarouselCountry: {
    fontSize: wp('6%'),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: wp('1%'),
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  trendingCarouselLocation: {
    fontSize: wp('4.2%'),
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
    marginBottom: wp('3%'),
    lineHeight: wp('5%'),
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  trendingCarouselMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingCarouselMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(253,80,30,0.9)',
    paddingHorizontal: wp('3%'),
    paddingVertical: wp('2%'),
    borderRadius: wp('5%'),
  },
  trendingCarouselMetaText: {
    fontSize: wp('3.5%'),
    color: '#fff',
    fontWeight: '600',
    marginLeft: wp('1.5%'),
  },
  
  // Carousel Indicators
  carouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp('2%'),
    marginBottom: hp('1%'),
  },
  carouselIndicator: {
    width: wp('2.5%'),
    height: wp('2.5%'),
    borderRadius: wp('1.25%'),
    backgroundColor: '#fff',
    marginHorizontal: wp('1%'),
    // Unified shadow system for both platforms
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },

  // Remove old grid styles (keep for backward compatibility but won't be used)
  trendingPlacesGrid: {
    display: 'none', // Hide grid layout
  },

  // Premium Popular Attraction Styles
  attractionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('1.5%'),
    paddingBottom: hp('3%'),
  },
  attractionCard: {
    width: '32%',
    marginBottom: hp('1.5%'),
    borderRadius: wp('4%'),
    overflow: 'hidden',
    // Unified shadow system for both platforms
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp('0.8%') },
    shadowOpacity: 0.25,
    shadowRadius: wp('3%'),
    backgroundColor: 'rgba(255,255,255,0.98)',
  },
  attractionTouchable: {
    flex: 1,
  },
  attractionBlur: {
    flex: 1,
    borderRadius: wp('4%'),
    overflow: 'hidden',
  },
  attractionGradient: {
    flex: 1,
    borderRadius: wp('4%'),
    overflow: 'hidden',
  },
  attractionImageContainer: {
    height: hp('12%'),
    position: 'relative',
  },
  attractionImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: wp('4%'),
    borderTopRightRadius: wp('4%'),
  },
  attractionImageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  attractionRatingBadge: {
    position: 'absolute',
    top: wp('2%'),
    right: wp('2%'),
    borderRadius: wp('3%'),
    overflow: 'hidden',
    // Unified shadow system for both platforms
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    backgroundColor: 'rgba(253, 80, 30, 0.95)',
  },
  attractionRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('2%'),
    paddingVertical: wp('1%'),
  },
  attractionRatingText: {
    color: '#fff',
    fontSize: wp('2.8%'),
    fontWeight: 'bold',
    marginLeft: wp('0.5%'),
  },
  attractionPopularBadge: {
    position: 'absolute',
    top: wp('2%'),
    left: wp('2%'),
    borderRadius: wp('3%'),
    overflow: 'hidden',
    // Unified shadow system for both platforms
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    backgroundColor: 'rgba(255, 215, 0, 0.95)',
  },
  attractionPopularBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('2%'),
    paddingVertical: wp('1%'),
  },
  attractionPopularBadgeText: {
    color: '#fff',
    fontSize: wp('2.5%'),
    fontWeight: 'bold',
    marginLeft: wp('1%'),
  },
  attractionRankBadge: {
    position: 'absolute',
    bottom: wp('2%'),
    left: wp('2%'),
    width: wp('5%'),
    height: wp('5%'),
    borderRadius: wp('2.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    // Unified shadow system for both platforms
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    backgroundColor: 'rgba(253, 80, 30, 0.95)',
  },
  attractionRankText: {
    color: '#fff',
    fontSize: wp('2.2%'),
    fontWeight: 'bold',
  },
  attractionContent: {
    padding: wp('3%'),
    paddingTop: wp('2.5%'),
    minHeight: hp('8%'),
  },
  attractionName: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: wp('1.5%'),
    lineHeight: wp('4.5%'),
    minHeight: wp('9%'), // 2 lines minimum
  },
  attractionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp('2%'),
  },
  attractionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attractionMetaText: {
    fontSize: wp('3%'),
    color: '#666',
    marginLeft: wp('1%'),
    fontWeight: '500',
  },
  attractionPriceContainer: {
    alignItems: 'flex-start',
  },
  attractionPriceLabel: {
    fontSize: wp('2.8%'),
    color: '#888',
    marginBottom: wp('0.5%'),
  },
  attractionPrice: {
    fontSize: wp('4.2%'),
    fontWeight: 'bold',
    color: '#FD501E',
  },
  attractionIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: [{ translateX: -wp('1%') }],
    width: wp('2%'),
    height: wp('0.5%'),
    backgroundColor: '#FD501E',
    borderTopLeftRadius: wp('1%'),
    borderTopRightRadius: wp('1%'),
  },
  
  // Skeleton styles for attractions
  attractionImageSkeleton: {
    height: hp('12%'),
  backgroundColor: 'rgba(255,255,255,0.98)',
    overflow: 'hidden',
    borderTopLeftRadius: wp('4%'),
    borderTopRightRadius: wp('4%'),
  },
  attractionTextSkeleton: {
    height: hp('3%'),
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: wp('1%'),
    overflow: 'hidden',
  },
  
  // Show More Button Styles
  showMoreContainer: {
    alignItems: 'center',
    marginTop: hp('2.5%'),
    marginBottom: hp('3%'),
    paddingHorizontal: wp('5%'),
  },
  showMoreButton: {
    borderRadius: wp('10%'),
    overflow: 'hidden',
    // Unified shadow system for both platforms
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: hp('0.8%') },
    shadowOpacity: 0.3,
    shadowRadius: wp('3%'),
    backgroundColor: 'rgba(253, 80, 30, 0.95)',
  },
  showMoreBlur: {
    borderRadius: wp('10%'),
    overflow: 'hidden',
  },
  showMoreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wp('10%'),
    paddingVertical: hp('2%'),
    borderRadius: wp('10%'),
  },
  showMoreText: {
    color: '#fff',
    fontSize: wp('4.2%'),
    fontWeight: 'bold',
    marginLeft: wp('2.5%'),
  },
  
  // Common shimmer styles
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerGradient: {
    flex: 1,
    width: '200%',
  },

  // Search Results Styles
  searchResultsContainer: {
    position: 'absolute',
    top: hp('25%'),
    left: wp('5%'),
    right: wp('5%'),
    zIndex: 1000,
    maxHeight: hp('40%'),
  },
  searchResultsBlur: {
    borderRadius: wp('4%'),
    overflow: 'hidden',
    padding: wp('4%'),
  },
  searchResultsTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: wp('3%'),
  },
  searchLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: wp('4%'),
  },
  searchLoadingText: {
    marginLeft: wp('2%'),
    fontSize: wp('3.5%'),
    color: '#666',
  },
  searchResultsList: {
    maxHeight: hp('30%'),
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: wp('3%'),
    paddingHorizontal: wp('2%'),
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchResultText: {
    marginLeft: wp('3%'),
    fontSize: wp('4%'),
    color: '#333',
    fontWeight: '500',
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: wp('3.5%'),
    color: '#999',
    paddingVertical: wp('4%'),
  },
});

export default HomeScreenPremiumStyles;
