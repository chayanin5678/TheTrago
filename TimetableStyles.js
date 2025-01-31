import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      alignItems: 'center',
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
     backgroundColor:'#FFF',
     borderRadius:30,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#002348',
      marginBottom: 20,
    },
    titledeal: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'left', // ชิดซ้าย
      color: '#002348',
      marginBottom: 20,
      marginTop: 20,
      alignSelf: 'flex-start', // ยืนยันให้ข้อความอยู่ชิดซ้าย
      marginLeft: 20, // เพิ่มพื้นที่ห่างจากขอบซ้าย
  },
    highlight: {
      color: '#FD501E',
    },
    tabContainer: {
      flexDirection: 'row',
      marginLeft: 20,
      marginRight: 20,
      marginBottom: 0,  
      paddingBottom: 0, 
      overflow: 'visible', 
    },
    bookingSection: {
      backgroundColor: '#F6F6F6',
      borderRadius: 30,
      padding: 20,
      width: '100%',
      marginBottom: 0,
      paddingBottom: 0,
      shadowColor: '#F6F6F6',
      shadowOffset: { width: 0, height: 15 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      backgroundColor: '#FEE8E1',
      borderRadius: 25,
    },
    tabOuter: {
      flex: 1,
      alignItems: 'center',
      
    },
    tabActiveOuter: {
      backgroundColor: '#F6F6F6',
      shadowColor: '#F6F6F6',
      shadowOffset: { width: 0, height: -15 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
      borderRadius: 25,
      borderBottomLeftRadius:0,
      borderBottomRightRadius:0,
    },
    tabInactiveOuter: {
      backgroundColor: 'transparent',
    },
    tabActive: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      backgroundColor: '#FD501E',
      borderRadius: 25,
      width: '90%',
      margin: 5,
      height: 10,
    },
    tabInactive: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      backgroundColor: 'rgba(253, 80, 30, 0.4)',
      borderRadius: 25,
      width: '90%',
      margin:5,
      opacity: 40,
    },
    tabTextActive: {
      color: '#FFFFFF',
      fontWeight: 'bold',
    },
    tabTextInactive: {
      color: '#FFFFFF',
      fontWeight: 'bold',
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
    rowdepart:{
      flexDirection: 'row',
    },
    inputBoxlocation:{
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
      fontSize: 12,
      color: '#666',
    },
    inputText: {
      fontSize: 14,
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
    },
    PxploreButton: {
      backgroundColor: '#FD501E',
      paddingVertical: 15,
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
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    bannerImage: {
      width: Dimensions.get('window').width * 0.9,
      height: 200,
      borderRadius: 10,
      resizeMode: 'contain',
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
    texcol:{
      flexDirection: 'column',
      fontSize: 30,
      fontWeight: 'bold',
      
    },
    rowtrip: {
      textAlign: 'left',
      marginLeft:5,
      alignSelf: 'flex-start',
      width:180,
      flexDirection:'row',
      marginBottom: 20,
    },
    Detail:{
      color: '#666666',
      marginTop: 5,
    },
    cardContainer: {
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      margin: 10,
      width: (Dimensions.get('window').width - 80) / 2, // ลด margin บนและล่างให้พอดีกับสองคอลัมน์
    },
    
  
    cardImage: {
      width: '100%',
      height: 150,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
    },
    cardContent: {
      padding: 10,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#002348',
      marginBottom: 5,
    },
    cardLocation: {
      fontSize: 14,
      color: '#666',
      marginBottom: 5,
    },
    cardDuration: {
      fontSize: 12,
      color: '#999',
      marginBottom: 10,
    },
    cardPrice: {
      fontSize: 11,
      fontWeight: 'bold',
    },
    cardPriceColor: {
      fontSize: 14,
      color: '#FD501E',
    },
    cardList: {
      paddingHorizontal: 2,  // ใช้ padding ที่น้อยลง
      justifyContent: 'space-between',
    },
    
    screen: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconExplo:{
       height: 12,
       width:12,
    },
  });
  export default styles;