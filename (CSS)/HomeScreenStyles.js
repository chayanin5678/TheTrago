import { StyleSheet, Dimensions, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {
    fontFamily: 'Domestos',
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#002348',
    marginBottom: 20,

  },
    itemContainer: {
    marginBottom: 15,
    alignItems: 'flex-start',
  },

  locationName: {
    marginLeft: 25,
    marginTop: 8,
    fontSize: wp('4%'),
    fontWeight: '600',
  },
  bookingSection: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: wp('8%'),
    padding: wp('4.5%'),
    width: '100%',
    marginBottom: hp('2%'),
    paddingBottom: hp('3%'),
    // Ultra premium glass morphism with enhanced shadows
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: hp('1%') },
    shadowOpacity: 0.2,
    shadowRadius: wp('4%'),
    elevation: 12,
    borderWidth: wp('0.3%'),
    borderColor: 'rgba(253, 80, 30, 0.1)',
    backdropFilter: 'blur(20px)',
    // Premium gradient border effect
    backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(248,250,252,0.9))',
    // Responsive sizing - smaller and more balanced
    minHeight: hp('28%'),
    maxWidth: wp('94%'),
    alignSelf: 'center',
    // Premium layered shadows
    overflow: 'visible',
    position: 'relative',
    // Secondary shadow for depth
    ...(Platform.OS === 'ios' && {
      shadowColor: 'rgba(30, 41, 59, 0.08)',
      shadowOffset: { width: 0, height: hp('1.2%') },
      shadowOpacity: 0.12,
      shadowRadius: wp('5%'),
    }),
    // Responsive breakpoints
    ...(Dimensions.get('window').width > 768 && {
      maxWidth: wp('85%'),
      padding: wp('4%'),
      borderRadius: wp('6%'),
      minHeight: hp('26%'),
    }),
    ...(Dimensions.get('window').width <= 480 && {
      padding: wp('4%'),
      minHeight: hp('30%'),
      borderRadius: wp('7%'),
    }),
  },

  inputBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    padding: wp('4%'),
    borderRadius: wp('5%'),
    shadowColor: 'rgba(253, 80, 30, 0.2)',
    shadowOffset: { width: 0, height: hp('0.8%') },
    shadowOpacity: 0.15,
    shadowRadius: wp('3%'),
    elevation: 8,
    marginHorizontal: wp('1%'),
    flex: 1,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(253, 80, 30, 0.08)',
    minHeight: hp('7%'),
    // Premium glass effect
    backdropFilter: 'blur(10px)',
    // Responsive adjustments
    ...(Dimensions.get('window').width <= 480 && {
      padding: wp('3.5%'),
      borderRadius: wp('4%'),
    }),
    ...(Dimensions.get('window').width > 768 && {
      padding: wp('3%'),
      minHeight: hp('6%'),
    }),
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('2%'),
    width: '100%',
    // Responsive flex wrap for smaller screens
    ...(Dimensions.get('window').width <= 480 && {
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: hp('2.2%'),
    }),
    // Tablet adjustments
    ...(Dimensions.get('window').width > 768 && {
      marginBottom: hp('2.5%'),
      paddingHorizontal: wp('2%'),
    }),
  },
  inputBoxCol: {
    flexDirection: 'column',
  },
  dotContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#FD501E',
  },
  dotInactive: {
    backgroundColor: '#CCC',
  },
  texcol: {
    flexDirection: 'column',
    fontSize: wp('7%'),
    fontWeight: 'bold',

  },

  profileImage: {
    marginTop: 20,
    width: 50,
    height: 50,
    borderRadius: 50,
    marginBottom: 10,
    borderWidth: 2,
    alignSelf: 'center',
    borderColor: '#FD501E',
  },


  cardContainerDes: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 5,

    marginBottom: 25,
    width: (Dimensions.get('window').width - 80) / 3, // ลด margin บนและล่างให้พอดีกับสองคอลัมน์
    height: wp('40%'), // ความสูงของการ์ด
  },

  searchContainer: {
    flexDirection: 'row',           // ให้อยู่ในแถวเดียวกัน
    alignItems: 'center',           // ตั้งตำแหน่งของไอคอนและข้อความ
    backgroundColor: 'rgba(0, 0, 0, 0.3)',       // สีพื้นหลังของ search bar
    borderRadius: wp('6%'),        // โค้งมุม
    paddingLeft: wp('1%'),   // ระยะห่างซ้ายขวา
    // paddingVertical: hp('2%'),     // ระยะห่างบนล่าง
    margin: wp('5%'),
    height: hp('6%'),
    width: wp('80%'),
    alignSelf: 'center'        // ระยะห่างจากขอบ
  },
  searchIconContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',    // สีพื้นหลังของวงกลม
    borderRadius: 50,              // ทำให้ไอคอนเป็นวงกลม
    width: wp('10%'),              // ขนาดของวงกลม (สามารถปรับตามขนาดที่ต้องการ)
    height: wp('10%'),             // ขนาดของวงกลม (ให้สูงเท่ากับกว้าง)
    justifyContent: 'center',      // จัดตำแหน่งไอคอนกลาง
    alignItems: 'center',          // จัดตำแหน่งไอคอนกลาง
    marginRight: wp('3%'),
  },
  searchIcon: {
    marginRight: wp('3%'),  // ระยะห่างจากข้อความ
  },
  searchInput: {
    flex: 1,                       // ให้ข้อความยืดเต็มช่อง
    fontSize: wp('4%'),             // ขนาดตัวอักษรตามขนาดหน้าจอ
    color: 'white',                 // สีข้อความ

  },
    carouselContainerTop: {
    marginTop: -5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '120%',
  },
  bannerImage: {
    height: hp('30%'), // ปรับให้สูงขึ้นเล็กน้อย
    borderRadius: 20,
    resizeMode: 'cover',
    alignSelf: 'center',
    marginHorizontal: wp('5%'), // ให้มีขอบซ้ายขวาเล็กน้อย
    
  },

  cardImage: {
    width: '100%',

    height: '100%',
    borderRadius: 10


  },
  cardContent: {
    padding: 5,
  },
  cardTitle: {
    fontSize: wp('3.5%'),
    fontWeight: 'bold',
    color: '#002348',
    
    marginTop: 5,

  },
  cardLocation: {
    fontSize: wp('3%'),
    color: '#666',
    marginBottom: 5,
  },
  cardDuration: {
    fontSize: wp('3%'),
    color: '#999',
    marginBottom: 10,
  },
  cardPrice: {
    fontSize: wp('3%'),
    fontWeight: 'bold',
  },
  cardPriceColor: {
    fontSize: wp('4%'),
    color: '#FD501E',
  },
  cardList: {
     paddingBottom: 20,
    alignItems: 'flex-start', // ✅ ให้แน่ใจว่าไม่ stretch
   // width: '100%',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    flexDirection: 'row',        // หรือเปลี่ยนเป็น 'auto' หาก container มี width กำหนด
  },
  iconExplo: {
    height: 12,
    width: 12,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // พื้นหลังโปร่งใส
    zIndex: 9999, // ✅ ให้ ActivityIndicator อยู่ด้านบนสุด
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 10,
    alignItems: 'flex-end',
  },

  gridContainer: {
    paddingVertical: 10,
    // paddingTop : 10,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',         // ไอเท็มจะอยู่ในแถวเดียวกัน
    flexWrap: 'wrap',             // เมื่อแถวเต็มจะไปขึ้นแถวใหม่
    justifyContent: 'space-evenly', // จัดให้ไอเท็มห่างกัน
  },
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    //  padding: 20,
    //   backgroundColor: '#f2f2f2',
    borderRadius: 50,
    width: wp('14%'),             // กำหนดขนาดให้เป็น % ของหน้าจอ (เพื่อให้มี 4 คอลัมน์ในแถว)
    height: wp('14%'),
    backgroundColor: 'rgba(253, 80, 30, 0.1)',
    // กำหนดขนาดให้เป็น % ของหน้าจอ
  },
  icon: {
    width: wp('2%'),  // ขนาดของไอคอน
    height: wp('2%'), // ขนาดของไอคอน
    resizeMode: 'contain',
  },
  cardText: {
    marginTop: 5,
    fontSize: wp('2.7%'),         // ขนาดตัวอักษรที่ยืดหยุ่น
    fontWeight: 'bold',
    color: '#FD501E',
    marginTop: -5
  },

  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
    marginBottom: 15,
    maxWidth: '100%',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#FD501E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },


  containerSearch: {
    flexGrow: 1,
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
    minHeight: '100%',
    // Ultra premium gradient background
    backgroundImage: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)',
    // Responsive adjustments
    ...(Dimensions.get('window').width <= 380 && {
      paddingHorizontal: wp('3%'),
      paddingVertical: hp('1.5%'),
    }),
    ...(Dimensions.get('window').width <= 480 && {
      paddingHorizontal: wp('3.5%'),
      paddingVertical: hp('1.8%'),
    }),
    // Tablet adjustments
    ...(Dimensions.get('window').width > 768 && {
      paddingHorizontal: wp('8%'),
      paddingVertical: hp('3%'),
      alignItems: 'center',
    }),
  },
  logoContainer: {
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 20,
    flexDirection: 'row',
  },
  logo: {
    width: 97,
    height: 31,
  },
  logoDate: {
    width: wp('5%'),
    height: hp('5%'),
    height: 27,
    marginRight: 10,
  },
  logoLine: {
    width: 29,
    height: 27,
    marginHorizontal: 10, // เพิ่มระยะห่างระหว่างภาพและกล่องอินพุต
  },
  logoSwap: {
    width: 15,
    height: 17,
    marginHorizontal: 15,
    marginLeft: 5,
    marginRight: 0,
    backgroundColor: '#FFF',
    borderRadius: 30,
  },
  titleSearch: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left', // Ensure left alignment
    color: '#002348',
    marginBottom: 20,
    marginLeft: 0, // Optional: ensure no margin if not needed
  },
  titledeal: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'left', // ชิดซ้าย
    color: '#002348',
    marginBottom: 20,
    marginTop: -50,
    alignSelf: 'flex-start', // ยืนยันให้ข้อความอยู่ชิดซ้าย
    marginLeft: 10, // เพิ่มพื้นที่ห่างจากขอบซ้าย
  },
  highlight: {
    color: '#FD501E',
  },

  tabContainer: {
    flexDirection: 'row', // ให้อยู่ในแถวเดียวกัน
    flexWrap: 'wrap', // ให้แต่ละปุ่มอยู่ในแถวถัดไปเมื่อเต็มแถว
    justifyContent: 'flex-start', // จัดให้ปุ่มห่างกันเท่าๆ กัน
  },
  tab: {
    backgroundColor: '#F2F2F2', // พื้นหลังสีเทา
    paddingVertical: wp('1.5%'),
    paddingHorizontal: wp('1.5%'),
    margin: wp('1%'),
    borderRadius: 25, // ทำให้ขอบปุ่มโค้งมน
  },
  activeTab: {
    backgroundColor: '#FD501E', // เมื่อเลือกจะเป็นสีส้ม
  },
  tabText: {
    fontSize: wp('3.5%'),
    color: '#FD501E',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#FFF', // เมื่อเลือกข้อความจะเป็นสีขาว
  },
  inputBoxSearch: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.98)',
    padding: hp('1.8%'),
    borderRadius: wp('6%'),
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: hp('0.6%') },
    shadowOpacity: 0.18,
    shadowRadius: wp('3%'),
    elevation: 8,
    marginHorizontal: wp('1%'),
    flex: 1,
    justifyContent: 'flex-start',
    borderWidth: wp('0.3%'),
    borderColor: 'rgba(253, 80, 30, 0.12)',
    // Ultra premium glass effect with enhanced blur
    backdropFilter: 'blur(15px)',
    minHeight: hp('7%'),
    alignItems: 'center',
    // Premium gradient overlay
    overflow: 'hidden',
    position: 'relative',
    // Responsive sizing
    maxWidth: '48%',
    // Additional premium effects
    ...(Platform.OS === 'ios' && {
      shadowColor: 'rgba(30, 41, 59, 0.08)',
      shadowOffset: { width: 0, height: hp('0.8%') },
      shadowOpacity: 0.1,
      shadowRadius: wp('4%'),
    }),
    // For very small screens
    ...(Dimensions.get('window').width <= 380 && {
      maxWidth: '100%',
      marginHorizontal: wp('0.5%'),
      marginBottom: hp('1.5%'),
      padding: hp('1.5%'),
      minHeight: hp('7%'),
    }),
    // For medium screens
    ...(Dimensions.get('window').width <= 480 && {
      maxWidth: '47%',
      marginHorizontal: wp('1.5%'),
    }),
    // For larger screens/tablets
    ...(Dimensions.get('window').width > 768 && {
      padding: hp('2.2%'),
      borderRadius: wp('4%'),
      minHeight: hp('8%'),
      maxWidth: '48%',
    }),
  },
  inputBoxDrop: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginHorizontal: 5,
    flex: 1,
    justifyContent: 'space-between',
  },
  rowdepart: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    // Responsive adjustments
    ...(Dimensions.get('window').width <= 480 && {
      paddingVertical: hp('0.5%'),
    }),
  },
  rowDrop: {
    flexDirection: 'row',

  },
  inputBoxlocation: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginHorizontal: 5,
    flex: 1,
    justifyContent: 'center',
    marginRight: 0,
  },
  inputLabel: {
    fontSize: wp('3.4%'),
    color: '#64748B',
    fontWeight: '700',
    marginBottom: hp('0.4%'),
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    // Responsive text sizing
    ...(Dimensions.get('window').width <= 380 && {
      fontSize: wp('3.2%'),
    }),
    ...(Dimensions.get('window').width <= 480 && {
      fontSize: wp('3.3%'),
    }),
    // Tablet adjustments
    ...(Dimensions.get('window').width > 768 && {
      fontSize: wp('2.9%'),
    }),
  },
  inputText: {
    fontSize: wp('4%'),
    color: '#1E293B',
    fontWeight: '800',
    lineHeight: wp('4.8%'),
    letterSpacing: -0.2,
    // Responsive text sizing
    ...(Dimensions.get('window').width <= 380 && {
      fontSize: wp('3.7%'),
      lineHeight: wp('4.5%'),
    }),
    ...(Dimensions.get('window').width <= 480 && {
      fontSize: wp('3.8%'),
      lineHeight: wp('4.6%'),
    }),
    // Tablet adjustments
    ...(Dimensions.get('window').width > 768 && {
      fontSize: wp('3.2%'),
      lineHeight: wp('4%'),
    }),
  },
  searchButton: {
    backgroundColor: '#FD501E',
    paddingVertical: hp('2.2%'),
    borderRadius: wp('5%'),
    alignItems: 'center',
    marginTop: hp('2%'),
    width: '100%',
    marginBottom: hp('3%'),
    // Ultra premium responsive button styling
    shadowColor: '#FD501E',
    shadowOpacity: 0.4,
    shadowRadius: wp('4%'),
    shadowOffset: { width: 0, height: hp('1%') },
    elevation: 10,
    borderWidth: wp('0.5%'),
    borderColor: 'rgba(255,255,255,0.4)',
    position: 'relative',
    overflow: 'hidden',
    minHeight: hp('7%'),
  },
  PxploreButton: {
    backgroundColor: '#FD501E',
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  searchButtonText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: wp('4.5%'),
    letterSpacing: wp('0.25%'),
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: hp('0.1%') },
    textShadowRadius: wp('0.5%'),
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselContainer: {
    marginTop: -20,
    alignIaems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  rowtrip: {
    marginTop: 10,
    textAlign: 'left',
    alignSelf: 'center',
    //  alignItems:'center',
    width: wp('90%'),
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 10,

  },
  Detail: {
    fontSize: wp('3.5%'),
    marginTop: 5,
  },

  tripTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp('2%'),
    marginTop: hp('1.5%'),
    width: '100%',
    // Responsive adjustments
    ...(Dimensions.get('window').width <= 480 && {
      marginBottom: hp('2.2%'),
      marginTop: hp('1.2%'),
    }),
    // Tablet adjustments
    ...(Dimensions.get('window').width > 768 && {
      marginBottom: hp('2.5%'),
      marginTop: hp('2%'),
      paddingHorizontal: wp('2%'),
    }),
  },
  tripTypeOneWayButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.98)',
    padding: hp('1.8%'),
    borderRadius: wp('6%'),
    borderBottomRightRadius: wp('1%'),
    borderTopRightRadius: wp('1%'),
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: hp('0.5%') },
    shadowOpacity: 0.15,
    shadowRadius: wp('2%'),
    elevation: 6,
    marginHorizontal: wp('0.5%'),
    flex: 1,
    justifyContent: 'center',
    marginRight: wp('0.5%'),
    width: '100%',
    minHeight: hp('6.5%'),
    alignItems: 'center',
    borderWidth: wp('0.3%'),
    borderColor: 'rgba(253, 80, 30, 0.12)',
    // Responsive adjustments
    ...(Dimensions.get('window').width <= 480 && {
      padding: hp('1.6%'),
      minHeight: hp('6%'),
      borderRadius: wp('7%'),
      borderBottomRightRadius: wp('2%'),
      borderTopRightRadius: wp('2%'),
    }),
    // Tablet adjustments
    ...(Dimensions.get('window').width > 768 && {
      padding: hp('2%'),
      minHeight: hp('7%'),
      borderRadius: wp('4%'),
      borderBottomRightRadius: wp('1%'),
      borderTopRightRadius: wp('1%'),
    }),
  },
  tripTypeRoundButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.98)',
    padding: hp('2%'),
    borderRadius: wp('6%'),
    borderBottomLeftRadius: wp('1%'),
    borderTopLeftRadius: wp('1%'),
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: hp('0.5%') },
    shadowOpacity: 0.15,
    shadowRadius: wp('2%'),
    elevation: 6,
    marginHorizontal: wp('0.5%'),
    flex: 1,
    justifyContent: 'center',
    marginLeft: wp('0.5%'),
    marginRight: wp('0.5%'),
    width: '100%',
    minHeight: hp('6.5%'),
    alignItems: 'center',
    borderWidth: wp('0.3%'),
    borderColor: 'rgba(253, 80, 30, 0.12)',
    // Responsive adjustments
    ...(Dimensions.get('window').width <= 480 && {
      padding: hp('1.6%'),
      minHeight: hp('6%'),
      borderRadius: wp('7%'),
      borderBottomLeftRadius: wp('2%'),
      borderTopLeftRadius: wp('2%'),
    }),
    // Tablet adjustments
    ...(Dimensions.get('window').width > 768 && {
      padding: hp('2%'),
      minHeight: hp('7%'),
      borderRadius: wp('4%'),
      borderBottomLeftRadius: wp('1%'),
      borderTopLeftRadius: wp('1%'),
    }),
  },
  activeButton: {
    backgroundColor: "#FD501E",
    shadowOpacity: 0.3,
    shadowRadius: wp('3%'),
    elevation: 10,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  tripTypeText: {
    fontSize: wp('4.2%'),
    color: "#333",
    fontWeight: '800',
    letterSpacing: wp('0.1%'),
    textAlign: 'center',
    // Responsive text sizing
    ...(Dimensions.get('window').width <= 380 && {
      fontSize: wp('3.8%'),
      letterSpacing: wp('0.05%'),
    }),
    ...(Dimensions.get('window').width <= 480 && {
      fontSize: wp('4%'),
    }),
    // Tablet adjustments
    ...(Dimensions.get('window').width > 768 && {
      fontSize: wp('3.5%'),
      letterSpacing: wp('0.12%'),
    }),
  },
  activeText: {
    color: "#FFF",
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: hp('0.1%') },
    textShadowRadius: wp('0.5%'),
  },
  dropdownIcon: {
    color: '#FD501E', // Orange color for the icon
    marginLeft: 10,
  },

  icon: {
    width: wp('10%'),  // กำหนดขนาดรูปภาพ
    height: wp('10%'), // ให้มีขนาดเหมาะสมกับกริด
    resizeMode: 'contain',  // ให้รักษาอัตราส่วนของรูป
  },


  buttonText: {
    fontSize: wp('3.5%'),
    color: '#333',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    width: 200,
    maxHeight: 300,
  },
  modalOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  modalOptionText: {
    fontSize: 18,
    color: '#333',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,

  },
  cardContainer: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: wp('4%'),
    padding: 0,
    marginVertical: hp('1.2%'),
    marginHorizontal: wp('3%'),
    // Ultra premium shadow system
    shadowColor: '#001233',
    shadowOpacity: 0.08,
    shadowRadius: wp('6%'),
    shadowOffset: { width: 0, height: hp('0.8%') },
    elevation: 6,
    // Subtle border for premium look
    borderWidth: wp('0.2%'),
    borderColor: 'rgba(0, 35, 72, 0.05)',
    // Premium glass morphism effect
    backdropFilter: 'blur(25px)',
    // Perfectly balanced sizing
    minHeight: hp('18%'),
    maxWidth: wp('94%'),
    alignSelf: 'center',
    // Smooth curvature and premium spacing
    overflow: 'hidden',
    position: 'relative',
    // Premium transform ready
    transform: [{ scale: 1 }],
    // Enhanced gradient background
    background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,251,255,0.95) 100%)',
    // Responsive design for perfect balance
    ...(Dimensions.get('window').width <= 480 && {
      marginHorizontal: wp('2%'),
      marginVertical: hp('1%'),
      borderRadius: wp('3.5%'),
      minHeight: hp('19%'),
      maxWidth: wp('96%'),
    }),
    ...(Dimensions.get('window').width > 768 && {
      maxWidth: wp('90%'),
      marginHorizontal: wp('5%'),
      borderRadius: wp('3%'),
      minHeight: hp('16%'),
      shadowRadius: wp('8%'),
    }),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('2.5%'),
    paddingHorizontal: wp('1%'),
  },
  shipName: {
    fontSize: wp('4.8%'),
    fontWeight: '900',
    color: '#1a1a1a',
    flexWrap: 'wrap',
    maxWidth: wp('38%'),
    letterSpacing: wp('0.1%'),
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: hp('0.1%') },
    textShadowRadius: wp('0.5%'),
    lineHeight: wp('5.5%'),
  },
  tagContainer: {
    flexDirection: 'row',

  },
  tag: {
    backgroundColor: 'rgba(253, 80, 30, 0.15)',
    color: '#FD501E',
    fontSize: wp('3.2%'),
    fontWeight: '800',
    paddingVertical: hp('0.8%'),
    paddingHorizontal: wp('3%'),
    borderRadius: wp('5%'),
    marginLeft: wp('1.5%'),
    overflow: 'hidden',
    // Ultra premium glass effect for tags with responsive design
    borderWidth: wp('0.2%'),
    borderColor: 'rgba(253, 80, 30, 0.25)',
    shadowColor: '#FD501E',
    shadowOpacity: 0.12,
    shadowRadius: wp('1%'),
    shadowOffset: { width: 0, height: hp('0.2%') },
    elevation: 4,
    // Responsive minimum size
    minWidth: wp('15%'),
    textAlign: 'center',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationContainer: {
    alignItems: 'center',
  },
  location: {
    fontSize: wp('4.2%'),
    fontWeight: '800',
    color: '#1a1a1a',
    flexWrap: 'wrap',
    maxWidth: wp('25%'),
    letterSpacing: wp('0.07%'),
    marginBottom: hp('0.3%'),
    lineHeight: wp('5%'),
  },
  subtext: {
    fontSize: wp('3.3%'),
    color: '#666',
    flexWrap: 'wrap',
    maxWidth: wp('25%'),
    fontWeight: '600',
    opacity: 0.85,
    lineHeight: wp('4%'),
  },
  time: {
    fontSize: wp('4.5%'),
    fontWeight: '900',
    color: '#FD501E',
    marginTop: hp('0.8%'),
    letterSpacing: wp('0.05%'),
    textShadowColor: 'rgba(253, 80, 30, 0.2)',
    textShadowOffset: { width: 0, height: hp('0.1%') },
    textShadowRadius: wp('0.3%'),
  },
  middleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: wp('32%'),
    paddingVertical: hp('2%'),
    paddingHorizontal: wp('3%'),
    // Ultra premium responsive glass container with enhanced effects
    backgroundColor: 'rgba(253, 80, 30, 0.08)',
    borderRadius: wp('8%'),
    borderWidth: wp('0.4%'),
    borderColor: 'rgba(253, 80, 30, 0.18)',
    shadowColor: '#FD501E',
    shadowOpacity: 0.15,
    shadowRadius: wp('2%'),
    shadowOffset: { width: 0, height: hp('0.5%') },
    elevation: 6,
    minHeight: hp('16%'),
    position: 'relative',
    overflow: 'hidden',
  },
  iconLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  circle: {
    width: 8,
    height: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#CCC',
    borderStyle: 'dashed',
    marginRight: 10,
    marginLeft: -10,
  },
  shipIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  shipText: {
    fontSize: 16,
  },
  duration: {
    fontSize: wp('3.3%'),
    color: '#555',
    marginRight: wp('4%'),
    fontWeight: '700',
    letterSpacing: wp('0.05%'),
    lineHeight: wp('4%'),
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  TicketRow: {
    flexDirection: 'row',
    //justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: wp('3.5%'),
    fontWeight: '700',
    color: '#333',
    letterSpacing: wp('0.05%'),
    lineHeight: wp('4.5%'),
  },
  pricebig: {
    fontSize: wp('5.5%'),
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: wp('0.08%'),
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: hp('0.1%') },
    textShadowRadius: wp('0.3%'),
  },
  discount: {
    color: '#FD501E',
  },
  bookNowButton: {
    backgroundColor: '#FD501E',
    paddingVertical: hp('1.8%'),
    paddingHorizontal: wp('6%'),
    borderRadius: wp('7%'),
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: wp('4%'),
    // Ultra premium responsive button styling
    shadowColor: '#FD501E',
    shadowOpacity: 0.4,
    shadowRadius: wp('3%'),
    shadowOffset: { width: 0, height: hp('0.8%') },
    elevation: 12,
    // Responsive gradient effect simulation with border
    borderWidth: wp('0.5%'),
    borderColor: 'rgba(255,255,255,0.4)',
    // Responsive minimum size
    minWidth: wp('25%'),
    minHeight: hp('6%'),
    // Inner shadow effect
    position: 'relative',
    overflow: 'hidden',
  },
  bookNowText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: wp('4%'),
    letterSpacing: wp('0.2%'),
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: hp('0.1%') },
    textShadowRadius: wp('0.5%'),
    textAlign: 'center',
  },
  pointsText: {
    color: '#fff',
    fontSize: 12,
  },

  iconText: {
    fontSize: 20,  // ขนาดของไอคอน
    color: 'white',  // สีของไอคอน
  },
  dashedLineTicket: {
    width: '92.5%',
    height: 1,  // ความหนาของเส้น
    borderWidth: 2,  // ความหนาของเส้น
    borderColor: '#EAEAEA',  // สีของเส้นประ
    borderStyle: 'dashed',  // ทำให้เส้นเป็นประ
    marginVertical: 10,  // ระยะห่างระหว่างเส้นประกับเนื้อหาภายใน
    marginLeft: 10,
    marginRight: 10,
  },
  circleContainerLeft: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'flex-start',// จัดตำแหน่งไอคอนให้อยู่ตรงกลาง
    alignItems: 'flex-start',  // จัดตำแหน่งไอคอนให้อยู่ตรงกลาง
    marginBottom: 10,  // ระยะห่างจากด้านล่าง
    marginLeft: -40,
    marginRight: 1,
  },
  circleLeft1: {
    position: 'absolute',
    top: 0,
    left: wp('1%'),
    width: 40,
    height: 40,
    backgroundColor: '#EAEAEA',
    borderRadius: 40, // ให้เป็นวงกลม
  },
  circleLeft2: {
    position: 'absolute',
    top: 0,
    left: wp('-0.1%'),
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 30, // ให้เป็นวงกลม
  },
  circleContainerRight: {
    position: 'relative',
    width: 40,
    height: 40,
    marginLeft: -3,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: 10,
    marginRight: -40,

  },
  circleRight1: {
    position: 'absolute',
    top: 0,
    left: wp('-0.1%'),
    width: 40,
    height: 40,
    backgroundColor: '#EAEAEA',
    borderRadius: 40, // ให้เป็นวงกลม
  },
  circleRight2: {
    position: 'absolute',
    top: 0,
    left: wp('1%'),
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 30, // ให้เป็นวงกลม
  },
  ImageBoat: {
    width: 20,
    height: 20,
    marginRight: 20,

  },
  searcContain: {
    flexDirection: 'row',
    marginRight: 35,
  },
  pagination: {
    flexDirection: 'row', // เรียงปุ่มในแนวนอน
    width: '100%',
    alignItems: 'center', // จัดตำแหน่งแนวตั้งให้ตรงกลาง
    paddingVertical: 10, // เพิ่มระยะห่างด้านบนและด้านล่าง

    justifyContent: 'center',

  },
  paginationText: {
    fontSize: 16, // ขนาดตัวอักษร
    color: '#FD501E', // สีข้อความ (อาจเป็นสีน้ำเงินเพื่อให้ดูโดดเด่น)
    marginHorizontal: 10, // ระยะห่างด้านข้างระหว่างปุ่มและตัวเลข
  },
  disabledText: {
    color: '#ccc', // สีข้อความเมื่อปุ่มถูก disable
  },
  BackButton: {
    backgroundColor: '#EAEAEA',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
    marginBottom: 20,
    justifyContent: 'flex-end',
  },
  BackButtonText: {
    color: '#666666',
    fontWeight: 'bold',
    fontSize: 16,

  },
  rowButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  background: {
    width: '100%'
  },
  remarkContainer: {
    backgroundColor: 'rgba(224, 247, 250, 0.7)',  // สีฟ้าอ่อนแบบ glass
    padding: 14,
    borderRadius: 16,
    marginVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00ACC1',
    borderWidth: 1,
    borderColor: 'rgba(0, 172, 193, 0.15)',
    // Premium glass effect
    shadowColor: '#00ACC1',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  remarkText: {
    fontSize: 14,
    color: '#004D40',
    lineHeight: 20,
    fontWeight: '500',
  },
  remarkLabel: {
    fontWeight: '700',
    color: '#004D40',
    letterSpacing: 0.3,
  },
  gradientBackground: {
    width: '120%',
    padding: 40,
    marginBottom: -20,
  }, 
  coltrip: {
    flexDirection: 'column',
    width: '50%',
  },
  // Ultra Premium Responsive Styles
  premiumCardHeader: {
    background: 'linear-gradient(135deg, #FD501E 0%, #FF6B35 100%)',
    borderTopLeftRadius: wp('8%'),
    borderTopRightRadius: wp('8%'),
    paddingVertical: hp('2.5%'),
    paddingHorizontal: wp('6%'),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
    minHeight: hp('12%'),
    // Advanced shadow effects
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: wp('2%'),
    shadowOffset: { width: 0, height: hp('0.5%') },
    elevation: 8,
  },
  premiumCompanyLogo: {
    width: wp('14%'),
    height: hp('7%'),
    borderRadius: wp('4%'),
    backgroundColor: '#fff',
    borderWidth: wp('0.5%'),
    borderColor: 'rgba(255,255,255,0.4)',
    marginRight: wp('3%'),
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: wp('1%'),
    shadowOffset: { width: 0, height: hp('0.3%') },
    elevation: 4,
    maxWidth: wp('16%'),
    maxHeight: hp('8%'),
  },
  premiumCardBody: {
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('2.8%'),
    backgroundColor: 'rgba(255,255,255,0.99)',
    minHeight: hp('20%'),
  },
  premiumLocationDot: {
    width: wp('3%'),
    height: wp('3%'),
    backgroundColor: '#FD501E',
    borderRadius: wp('1.5%'),
    borderWidth: wp('0.5%'),
    borderColor: '#fff',
    shadowColor: '#FD501E',
    shadowOpacity: 0.6,
    shadowRadius: wp('1.2%'),
    shadowOffset: { width: 0, height: hp('0.3%') },
    elevation: 6,
    minWidth: wp('3%'),
    minHeight: wp('3%'),
  },
  premiumDashedLine: {
    flex: 1,
    height: wp('0.6%'),
    borderWidth: wp('0.3%'),
    borderColor: 'rgba(253, 80, 30, 0.5)',
    borderStyle: 'dashed',
    marginHorizontal: wp('2%'),
    minHeight: wp('0.6%'),
  },
  premiumBoatIcon: {
    backgroundColor: 'rgba(253, 80, 30, 0.2)',
    borderRadius: wp('6%'),
    padding: wp('2.5%'),
    borderWidth: wp('0.3%'),
    borderColor: 'rgba(253, 80, 30, 0.35)',
    shadowColor: '#FD501E',
    shadowOpacity: 0.25,
    shadowRadius: wp('1.5%'),
    shadowOffset: { width: 0, height: hp('0.3%') },
    elevation: 5,
    minWidth: wp('12%'),
    minHeight: wp('12%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Responsive breakpoints
  responsiveContainer: {
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('2%'),
  },
  responsiveText: {
    fontSize: wp('4%'),
    lineHeight: wp('5%'),
  },
  responsiveButton: {
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('5%'),
    borderRadius: wp('6%'),
    minHeight: hp('6%'),
  },
  // Device-specific adjustments
  tabletStyles: {
    // For tablets (wider screens)
    cardContainer: {
      maxWidth: wp('85%'),
      marginHorizontal: wp('7.5%'),
    },
    fontSize: {
      small: wp('3%'),
      medium: wp('3.5%'),
      large: wp('4.5%'),
      xlarge: wp('5.5%'),
    },
  },
  phoneStyles: {
    // For phones (smaller screens)
    cardContainer: {
      maxWidth: wp('94%'),
      marginHorizontal: wp('3%'),
    },
    fontSize: {
      small: wp('3.2%'),
      medium: wp('3.8%'),
      large: wp('4.8%'),
      xlarge: wp('6%'),
    },
  },
  glassContainer: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    backdropFilter: 'blur(10px)',
  },
  premiumGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(253,80,30,0.1) 0%, rgba(255,107,53,0.05) 100%)',
    borderRadius: 32,
  },
});

export default styles;
