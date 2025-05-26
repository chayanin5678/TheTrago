import { StyleSheet, Dimensions } from 'react-native';
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
    backgroundColor: '#F6F6F6',
    borderRadius: 30,
    padding: wp('3.5%'),
    width: '100%',
    marginBottom: 0,
    paddingBottom: 0,
    shadowColor: '#F6F6F6',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  inputBox: {
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
    justifyContent: 'center', // จัดตำแหน่งให้เนื้อหาภายในอยู่ตรงกลาง
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',  // จัดตำแหน่งให้ห่างกันอย่างเหมาะสม
    marginBottom: 15,
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
    alignItems: 'flex-start', // Align content to the left
    backgroundColor: '#FFFFFF',
    padding: 20,
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
    justifyContent: 'flex-start', // จัดตำแหน่งให้เนื้อหาภายในอยู่ตรงกลาง
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
    fontSize: wp('3%'),
    color: '#666',
  },
  inputText: {
    fontSize: wp('3.5%'),
    color: '#333',
    fontWeight: 'bold',
  },
  searchButton: {
    backgroundColor: '#FD501E',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
    marginBottom: 20,
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
    fontWeight: 'bold',
    fontSize: 16,

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
    marginBottom: 15,
    marginTop: 15,
  },
  tripTypeOneWayButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 15,
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginHorizontal: 5,
    flex: 1,
    justifyContent: 'center',
    marginRight: 0,
    width: '100%',
    height: 50,
    alignItems: 'center',

  },
  tripTypeRoundButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 15,
    borderBottomLeftRadius: 0,
    borderTopLeftRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginHorizontal: 5,
    flex: 1,
    justifyContent: 'center',
    marginLeft: 0,
    marginRight: 5,
    width: '100%',
    height: 50,
    alignItems: 'center',

  },
  activeButton: {
    backgroundColor: "#FD501E",

  },
  tripTypeText: {
    fontSize: 16,
    color: "#333",
    fontWeight: 'bold'
  },
  activeText: {
    color: "#FFF",
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
    backgroundColor: 'white',
    borderRadius: 20,
    padding: '4%',
    margin: '1.5%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  shipName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flexWrap: 'wrap',
    maxWidth: wp('30%'),
  },
  tagContainer: {
    flexDirection: 'row',

  },
  tag: {
    backgroundColor: 'rgba(253, 80, 30, 0.1)',
    opacity: 50,
    color: '#FD501E',
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 30,
    marginLeft: 8,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flexWrap: 'wrap',
    maxWidth: 100,
  },
  subtext: {
    fontSize: 12,
    color: '#999',
    flexWrap: 'wrap',
    maxWidth: 100,

  },
  time: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  middleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
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
    fontSize: 12,
    color: '#555',
    marginRight: 15
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
    fontSize: wp('3%'),
    fontWeight: 'bold',
    color: '#333',
  },
  pricebig: {
    fontSize: wp('4%'),
    fontWeight: 'bold',
    color: '#333',
  },
  discount: {
    color: '#FD501E',
  },
  bookNowButton: {
    backgroundColor: '#FD501E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
  },
  bookNowText: {
    color: '#fff',
    fontWeight: 'bold',

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
    backgroundColor: '#E0F7FA',  // สีฟ้าอ่อน
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#00ACC1', // ขีดข้างสีเข้มกว่า
  },
  remarkText: {
    fontSize: 14,
    color: '#004D40',
  },
  remarkLabel: {
    fontWeight: 'bold',
    color: '#004D40',
  },
  gradientBackground: {
    width: '120%',
    padding: 40,
    marginBottom: -20,
  }, coltrip: {
    flexDirection: 'column',
    width: '50%',
  }
});

export default styles;
