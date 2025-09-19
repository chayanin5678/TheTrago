import { StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: wp('1%'),
    paddingTop: hp('1%'),
    paddingBottom: hp('3%'),
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
    width: 29,
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
  title: {
    fontSize: wp('6%'),
    fontWeight: '800',
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: hp('2%'),
    marginTop: hp('2%'),
    letterSpacing: -0.5,
    /* textShadow removed */
  },

  bookingSection: {
    backgroundColor: '#F6F6F6',
    borderRadius: 30,
    padding: '5%',
    margin: '1%',
    width: '100%',
    marginBottom: 0,
    paddingBottom: 0,
    /* shadow/elevation removed */
  },

  inputBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    flex: 1,
    justifyContent: 'flex-start', // จัดตำแหน่งให้เนื้อหาภายในอยู่ตรงกลาง
    /* shadow/elevation removed */
  },
  inputBoxDrop: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
    flex: 1,
    justifyContent: 'space-between',
    /* shadow/elevation removed */
  },
  rowdepart: {
    flexDirection: 'row',
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
  inputLabel: {
    fontSize: wp('3.5%'),
    color: '#64748B',
    marginTop: hp('1%'),
    marginBottom: hp('0.5%'),
    marginLeft: wp('3%'),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  inputText: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },

  PxploreButton: {
    backgroundColor: '#FD501E',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  redText: {
    color: 'red'
  },
  margin: {
    marginTop: 5,
    marginBottom: 5,
    fontSize: 16
  },

  Detail: {
    color: '#666666',
    marginTop: 5,
  },

  tripTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  tripTypeOneWayButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 15,
    borderBottomRightRadius: 0,
    borderTopRightRadius: 0,
    marginHorizontal: 5,
    flex: 1,
    justifyContent: 'center',
    marginRight: 0,
    width: '100%',
    height: 50,
    alignItems: 'center',
    /* shadow/elevation removed */
  },
  tripTypeRoundButton: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 10,
    borderRadius: 15,
    borderBottomLeftRadius: 0,
    borderTopLeftRadius: 0,
    marginHorizontal: 5,
    flex: 1,
    justifyContent: 'center',
    marginLeft: 0,
    marginRight: 5,
    width: '100%',
    height: 50,
    alignItems: 'center',
    /* shadow/elevation removed */
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
  },

  buttonText: {
    fontSize: 16,
    color: '#333',
    flexWrap: 'wrap',
    maxWidth: '80%',
  },
  dropdownIcon: {
    marginLeft: 40,
  },
  ArriveText: {
    fontSize: 16,
    color: '#333',
    // marginRight: wp('10%'),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 18, 51, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp('2%'),
    backdropFilter: 'blur(15px)',
  },
  modalContent: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    width: '90%',
    maxWidth: wp('85%'),
    borderRadius: wp('6%'),
    padding: wp('5%'),
    maxHeight: hp('70%'),
    position: 'relative',
    overflow: 'hidden',
    // Unified cross-platform shadow
    /* shadow/elevation removed */
    borderWidth: wp('0.2%'),
    borderColor: 'rgba(253, 80, 30, 0.12)',
  },
  modalOption: {
    paddingVertical: hp('1.8%'),
  paddingHorizontal: wp('2%'),
  borderBottomWidth: wp('0.1%'),
    borderBottomColor: 'rgba(148, 163, 184, 0.2)',
    marginHorizontal: wp('1%'),
    borderRadius: wp('2%'),
    marginVertical: hp('0.3%'),
    backgroundColor: 'rgba(255,255,255,0.6)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.2s ease-in-out',
  },
  modalOptionText: {
    fontSize: wp('4.2%'),
    color: '#1E293B',
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  button: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    // padding: wp('1%'),
    width: '50%',
    marginRight: wp('1%'),
  },
  cardContainer: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: wp('6%'),
    marginHorizontal: wp('1%'),
    marginTop: hp('2%'),
    marginBottom: hp('2%'),
    minHeight: hp('35%'),
    maxWidth: wp('98%'),
    alignSelf: 'center',
    overflow: 'visible',
    position: 'relative',
    // Unified cross-platform shadow
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: hp('0.8%') },
    shadowOpacity: 0.15,
    shadowRadius: wp('3%'),
    borderWidth: wp('0.2%'),
    borderColor: 'rgba(253, 80, 30, 0.08)',
  },
  promo: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: wp('4%'),
    width: '100%',
  padding: wp('2%'),
    marginVertical: hp('1%'),
    marginHorizontal: wp('0%'),
    // Unified cross-platform shadow
    /* shadow/elevation removed */
    borderWidth: wp('0.1%'),
    borderColor: 'rgba(253, 80, 30, 0.06)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  shipName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flexWrap: 'wrap',
    maxWidth: '100',
  },
  tagContainer: {
    flexDirection: 'row',
  },

  location: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#002348',
    flexWrap: 'wrap',
    maxWidth: 150,
  },

  time: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#002348',
    marginTop: 4,
  },

  TicketRow: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
  },

  dashedLineTicket: {
    width: '100%',
    height: 1,  // ความหนาของเส้น
    borderWidth: 2,  // ความหนาของเส้น
    borderColor: '#EAEAEA',  // สีของเส้นประ
    borderStyle: 'dashed',  // ทำให้เส้นเป็นประ
    marginVertical: 10,  // ระยะห่างระหว่าง element
  },
  circleContainerLeft: {
    position: 'relative', // ทำให้สามารถจัดตำแหน่งภายใน container ได้
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
    left: 0,
    width: 40,
    height: 40,
    backgroundColor: '#EAEAEA',
    borderRadius: 40, // ให้เป็นวงกลม
  },
  circleLeft2: {
    position: 'absolute',
    top: 0,
    left: -3,
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 30, // ให้เป็นวงกลม
  },
  circleContainerRight: {
    position: 'relative', // ทำให้สามารถจัดตำแหน่งภายใน container ได้
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
    left: 0,
    width: 40,
    height: 40,
    backgroundColor: '#EAEAEA',
    borderRadius: 40, // ให้เป็นวงกลม
  },
  circleRight2: {
    position: 'absolute',
    top: 0,
    left: 3,
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 30, // ให้เป็นวงกลม
  },

  ImageLogo: {
    marginRight: 10
  },

  tagContainer: {
    flexDirection: 'row',
    marginTop: 5
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
    marginLeft: 1,
    paddingRight: wp('2%'),
  },
  tripInfo: {
    alignItems: 'flex-start',
    marginBottom: 0,
    justifyContent: 'center',
    flexDirection: 'row',
    marginLeft: wp('5%'),
    marginRight: wp('5%'),
  },
  date: {
    fontSize: 12,
    color: '#666'
  },
  section: {
    marginBottom: 0,
    padding: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {
    fontSize: 16,
    marginLeft: 10
  },

  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 15,
    marginTop: 5,
    backgroundColor: 'white'
  },
  input: {
    borderWidth: wp('0.2%'),
    borderColor: 'rgba(148, 163, 184, 0.45)',
    borderRadius: wp('3%'),
    padding: wp('2.5%'),
    fontSize: wp('4%'),
    backgroundColor: '#FFFFFF',
    marginBottom: hp('1%'),
    marginHorizontal: wp('1%'),
    paddingVertical: hp('1%'),
    color: '#0F172A',
    fontWeight: '500',
    letterSpacing: 0.3,
    // Unified cross-platform shadow
    /* shadow/elevation removed */
  },
  inputSolid: {
    borderWidth: wp('0.2%'),
    borderColor: 'rgba(148, 163, 184, 0.45)',
    borderRadius: wp('3%'),
    padding: wp('2.5%'),
    fontSize: wp('4%'),
    backgroundColor: '#FFFFFF',
    marginBottom: hp('1%'),
    marginHorizontal: wp('1%'),
    paddingVertical: hp('1%'),
    color: '#0F172A',
    fontWeight: '500',
    letterSpacing: 0.3,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: hp('0.15%') },
    shadowOpacity: 0.05,
    shadowRadius: wp('1%'),
  },
  timetable: {
    fontSize: 12,
  },
  col: {
    flexDirection: 'column',
    margin: wp('1%'),
    width: 110,
    // alignItems: 'center',
    padding: wp('3%'),
    alignItems: 'center',
  },
  ship: {
    fontSize: 12,
    color: '#666'
  },
  circle: {
    top: 20,
    left: 0,
    width: 15,
    height: 15,
    backgroundColor: '#EAEAEA',
    borderRadius: 40,
  },
  line: {
    alignItems: 'center',
    margin: 5,
    marginTop: 30,
    marginBottom: 0
  },
  orangetext: {
    color: '#FD501E'
  },
  titlehead: {
    fontSize: 16,
    fontWeight: 'bold',
    flexWrap: 'wrap',
    width: 100
  },
  TextInput: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 5
  },
  totaltext: {
    fontSize: 18,
    color: '#FD501E',
  },
  rowpromo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pricetotal: {
    fontSize: 16,
  },

  pricperson: {
    fontSize: 25
  },
  background: {
    width: '100%',
  },
  divider: {
    height: 1, // ความหนาของเส้น
    width: '100%', // ทำให้ยาวเต็มจอ
    backgroundColor: '#CCCCCC', // สีของเส้น
    marginVertical: 10, // ระยะห่างระหว่าง element
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  tooltip: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    width: 200,
    alignItems: 'center',
  },
  tooltipText: {
    fontSize: 14,
    color: 'black',
  },
  rowButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  BackButton: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    paddingVertical: hp('2%'),
    borderRadius: wp('3%'),
    alignItems: 'center',
    marginTop: hp('1%'),
    width: '45%',
    marginBottom: hp('2%'),
    justifyContent: 'center',
    borderWidth: wp('0.1%'),
    borderColor: 'rgba(148, 163, 184, 0.2)',
    // Unified cross-platform shadow
    /* shadow/elevation removed */
  },
  BackButtonText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: wp('4%'),
    letterSpacing: 0.3,
  },
  ActionButton: {
    backgroundColor: '#FD501E',
    paddingVertical: hp('2%'),
    borderRadius: wp('3%'),
    alignItems: 'center',
    marginTop: hp('1%'),
    width: '45%',
    marginBottom: hp('4%'),
    justifyContent: 'center',
    borderWidth: wp('0.1%'),
    borderColor: 'rgba(255, 255, 255, 0.2)',
    // Unified cross-platform shadow
    /* shadow/elevation removed */
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: wp('4%'),
    letterSpacing: 0.5,
    /* textShadow removed */
  },
  errorInput: {
    borderColor: 'red', // เปลี่ยนกรอบเป็นสีแดงเมื่อมีข้อผิดพลาด
  },
  loaderContainer: {
    flex: 1, // ทำให้ View ครอบคลุมพื้นที่ทั้งหมด
    justifyContent: 'center', // จัดตำแหน่งแนวตั้งให้อยู่ตรงกลาง
    alignItems: 'center', // จัดตำแหน่งแนวนอนให้อยู่ตรงกลาง
  },
  modalContentPre: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    width: '85%',
    borderRadius: wp('5%'),
    padding: wp('4%'),
    position: 'relative',
    overflow: 'hidden',
    borderWidth: wp('0.1%'),
    borderColor: 'rgba(253, 80, 30, 0.1)',
    // Unified cross-platform shadow
    shadowColor: '#FD501E',
    shadowOffset: { width: 0, height: hp('1%') },
    shadowOpacity: 0.15,
    shadowRadius: wp('4%'),
  },
  icon: {
    marginLeft: 10,
  },
  buttonSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('2%'),
    borderWidth: wp('0.2%'),
    borderColor: 'rgba(148, 163, 184, 0.45)',
    borderRadius: wp('3%'),
    width: '95%',
    justifyContent: 'space-between',
    marginHorizontal: wp('1%'),
    marginVertical: hp('0.5%'),
    // Unified cross-platform shadow
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: hp('0.15%') },
    shadowOpacity: 0.05,
    shadowRadius: wp('1%'),
  },
  optionItem: {
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('2%'),
    borderBottomWidth: wp('0.1%'),
    borderBottomColor: 'rgba(148, 163, 184, 0.15)',
    marginHorizontal: wp('0.5%'),
    borderRadius: wp('2%'),
    marginVertical: hp('0.2%'),
    backgroundColor: 'rgba(255,255,255,0.7)',
    // Unified cross-platform shadow
    /* shadow/elevation removed */
  },
  optionText: {
    fontSize: wp('4%'),
    color: '#334155',
    fontWeight: '500',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  orangeCircleIcon: {
    backgroundColor: '#FD501E',
    borderRadius: 50,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
